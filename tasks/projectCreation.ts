import { ethers, BigNumber } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { createClient } from '@supabase/supabase-js';
import { libErs as ERS } from '@arx-research/lib-ers';
import {
  Address,
  PBTSimpleProjectRegistrar__factory,
  DeveloperRegistrar__factory,
  calculateLabelHash,
  ProjectChipAddition,
  ManufacturerValidationInfo,
  createDeveloperCustodyProof,
  ADDRESS_ZERO,
} from "@arx-research/ers-contracts/";

import { CreateProject } from "../types/scripts";

import { 
  createERSInstance,
  getChipTypedSigWithGateway,
  getDeveloperRegistrar,
  getERSRegistry,
  instantiateGateway,
  saveFilesLocally,
  queryUser,
  rl,
} from "../utils/scriptHelpers";
import { getDeployedContractAddress } from '../utils/helpers';
import { 
  getUserDeveloperRegistrar,
  getProjectName,
  getProjectSymbol,
  getServiceTimelock,
  getServiceId,
  getTokenURIData,
  getEnrollmentId,
 } from '../utils/prompts/projectCreationPrompts';
import { MAX_BLOCK_WINDOW } from "../deployments/parameters";

interface ChipInfo {
  chipId: string;
  manufacturerValidation: ManufacturerValidationInfo;
}

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

task("createProject", "Create a new project")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;

    const { developerOwner } = await hre.getNamedAccounts();
    const network = hre.network.name;
    const chainId = BigNumber.from(await hre.getChainId());
    const chipRegistry = getDeployedContractAddress(hre.network.name, "ChipRegistry");

    let enrollmentIdLocal: string;
    let params: CreateProject = await getAndValidateParams();

    const ersInstance: ERS = await createERSInstance(hre);
    
    let gate = await instantiateGateway();

    let chipInfo: ChipInfo[];
    let ownershipProofs: string[];

    // Get the amount of chips being enrolled
    const numChips = parseInt(await queryUser(rl, "How many chips are you enrolling? "));

    // Attach the DeveloperRegistrar contract
    const developerRegistrar = new DeveloperRegistrar__factory(await hre.ethers.getSigner(developerOwner)).attach(params.developerRegistrar);
    const developerRegistrarAddress = developerRegistrar.address;

    // Cycle through signing ownership proofs for each chip, getting the chipIDs, and building the chipInfo array     
    [ ownershipProofs, chipInfo ] = await createOwnershipProofsFromScan(numChips)
    
    const { deploy } = await hre.deployments;

    let projectRegistrarDeploy;

    projectRegistrarDeploy = await deploy("PBTSimpleProjectRegistrar", {
      from: developerOwner,
      args: [
        getDeployedContractAddress(hre.network.name, "ChipRegistry"),
        getDeployedContractAddress(hre.network.name, "ERSRegistry"),
        params.developerRegistrar,
        params.name,
        params.tokenSymbol,
        params.tokenUriRoot,
        params.lockinPeriod,
        getDeployedContractAddress(hre.network.name, "OpenTransferPolicy"),
      ],
    });

    console.log(`New ProjectRegistrar deployed at ${projectRegistrarDeploy.address}`);
    
    await rawTx({
      from: developerOwner,
      to: params.developerRegistrar,
      data: developerRegistrar.interface.encodeFunctionData(
        "addProject",
        [
          projectRegistrarDeploy.address,
          calculateLabelHash(params.name),
          params.serviceId,
          params.lockinPeriod,

        ]
      )
    });

    console.log(`Project ${params.name} added to DeveloperRegistrar`);

    const projectRegistrar = new PBTSimpleProjectRegistrar__factory(await hre.ethers.getSigner(developerOwner)).attach(projectRegistrarDeploy.address);
    console.log(`ChipInfo: ${JSON.stringify(chipInfo)}`)
    await rawTx({
      from: developerOwner,
      to: projectRegistrarDeploy.address,
      data: projectRegistrar.interface.encodeFunctionData(
        "addChips",
        [
          chipInfo.map((chip) => {
            return {
              chipId: chip.chipId,
              chipOwner: developerOwner,
              nameHash: calculateLabelHash(params.name),
              manufacturerValidation: chip.manufacturerValidation,
              custodyProof: ownershipProofs.shift(),
            } as ProjectChipAddition
          }),
        ]
      )
    });
    console.log(`Chips added to ProjectRegistrar`);

    async function getAndValidateParams(): Promise<CreateProject> {
      let params: CreateProject = {} as CreateProject;
      
      params.developerRegistrar = await getUserDeveloperRegistrar(rl);
      params.name = await getProjectName(
        rl,
        await getERSRegistry(hre, developerOwner),
        await getDeveloperRegistrar(hre, params.developerRegistrar, developerOwner)
      );
      params.tokenSymbol = await getProjectSymbol(rl);
      params.tokenUriRoot = await getTokenURIData(rl);
      params.lockinPeriod = await getServiceTimelock(rl);
      params.serviceId = await getServiceId(rl);
      
      // In the case of a localhost deployment, we request the enrollmentId which will not be saved in Supabase
      if (chainId.eq(31337)) {
        enrollmentIdLocal = await getEnrollmentId(rl);
      }
  
      return params;
    }

    // Retrieve Arx ManufacturerValidationInfo fro public Supabase
    async function getEnrollmentData(chipId: string): Promise<ManufacturerValidationInfo | null> {
      const { data, error } = await supabase
        .from('certificates')
        .select('enrollmentId, manufacturerCertificate, payload')
        .eq('chipId', chipId)
        .single();

      if (error) {
        throw Error(`Error fetching enrollment data for chipId ${chipId}`);
      }

      if (enrollmentIdLocal) {
        data.enrollmentId = enrollmentIdLocal;
      } else if (!data.enrollmentId) {
        throw Error(`No enrollmentId found for chipId ${chipId}`);
      }

      if (!data.payload) {
        data.payload = "0x00";
      }

      return data as ManufacturerValidationInfo;
    }

    async function createOwnershipProofsFromScan(numChips: number): Promise<[string[], ChipInfo[]]> {
      const ownershipProofs: string[] = new Array<string>(numChips);
      const chipInfo: ChipInfo[] = new Array<ChipInfo>(numChips);

      const chainIdNumber = chainId.toNumber();

      const domain = {
        name: 'ERS',
        version: '2.0.0',
        chainId: chainIdNumber,
        verifyingContract: chipRegistry,
      };
    
      const types = {
        DeveloperCustodyProof: [
          { name: 'developerRegistrar', type: 'address' },
        ],
      };
    
      const value = {
        developerRegistrar: developerRegistrarAddress
      };

      for (let i = 0; i < numChips; i++) {
        const signResponse = await getChipTypedSigWithGateway(gate, { domain, types, value });
        console.log(`Ownership proof created for chipId: ${signResponse.etherAddress} with proof: ${signResponse.signature.ether}`)
        ownershipProofs[i] = signResponse.signature.ether;

        // Fetch enrollment data from Supabase
        const manufacturerValidation = await getEnrollmentData(signResponse.etherAddress);

        chipInfo[i] = {
          chipId: signResponse.etherAddress,
          manufacturerValidation: manufacturerValidation
        } as ChipInfo;
      }

      return [ownershipProofs, chipInfo];
    }
  });
