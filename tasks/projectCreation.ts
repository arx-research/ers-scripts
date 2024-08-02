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

task("createProject", "Create a new project using the ArxProjectEnrollmentManager")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;

    const { developerOwner, projectOwner } = await hre.getNamedAccounts();
    const network = hre.network.name;
    const chainId = BigNumber.from(await hre.getChainId());
    const chipRegistry = getDeployedContractAddress(hre.network.name, "ChipRegistry");

    let params: CreateProject = await getAndValidateParams();

    const ersInstance: ERS = await createERSInstance(hre);
    
    let gate = await instantiateGateway();

    let chipInfo: ChipInfo[];
    let ownershipProofs: string[];

    // Get the amount of chips being enrolled
    const numChips = parseInt(await queryUser(rl, "How many chips are you enrolling? "));
    // Cycle through signing ownership proofs for each chip, getting the chipIDs, and building the chipInfo array
      
    //TODO: replace this function with one that scans chips (getChipPublicKeys) and creates the chipInfo array. We don't care about ownershipProofs anymore.
    [ ownershipProofs, chipInfo ] = await createOwnershipProofsFromScan(numChips)
    
    const { deploy } = await hre.deployments;

    let projectRegistrarDeploy;

    projectRegistrarDeploy = await deploy("PBTSimpleProjectRegistrar", {
      from: projectOwner,
      args: [
        projectOwner,
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
    
    const developerRegistrar = new DeveloperRegistrar__factory(await hre.ethers.getSigner(projectOwner)).attach(params.developerRegistrar);
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

  //   struct ProjectChipAddition {
  //     address chipId;
  //     address chipOwner;
  //     bytes32 nameHash; // A label used to identify the chip; in a PBT imlementation, this might match the tokenId
  //     IChipRegistry.ManufacturerValidation manufacturerValidation;
  //     bytes custodyProof;
  // }

  // export interface ManufacturerValidationInfo {
  //   enrollmentId: string;             // id of manufacturer enrollment the chip belongs to
  //   manufacturerCertificate: string;  // The chip certificate signed by the manufacturer
  //   payload: string;                  // The optional payload used in the ManufacturerCertificate
  // }

    const projectRegistrar = new PBTSimpleProjectRegistrar__factory(await hre.ethers.getSigner(projectOwner)).attach(projectRegistrarDeploy.address);
    await rawTx({
      from: developerOwner,
      to: projectRegistrarDeploy.address,
      data: projectRegistrar.interface.encodeFunctionData(
        "addChips",
        [
          chipInfo.map((chip) => {
            return {
              chipId: chip.chipId,
              chipOwner: projectOwner,
              nameHash: calculateLabelHash(params.name),
              manufacturerValidation: chip.manufacturerValidation,
            } as ProjectChipAddition
          }),
        ]
      )
    });



    // TODO: add chips to project.

    // Here is an extremely roughh example -- this has been lifted from hardhat tests. What we need to do is create another tx to call addChips with chipInfo for each chip.
    //   subjectAdditionData = [
    //     {
    //       chipId: chipIdOne,
    //       chipOwner: developerOne.address,
    //       nameHash: nameHashOne,
    //       manufacturerValidation: manufacturerValidationOne,
    //     } as ProjectChipAddition,
    //     {
    //       chipId: chipIdTwo,
    //       chipOwner: developerOne.address,
    //       nameHash: nameHashTwo,
    //       manufacturerValidation: manufacturerValidationTwo,
    //     } as ProjectChipAddition,
    //   ];
    //   subjectCaller = developerOne;
    // });

    // async function subject(): Promise<any> {
    //   return projectRegistrar.connect(subjectCaller.wallet).addChips(subjectAdditionData);
    // }

    async function getAndValidateParams(): Promise<CreateProject> {
      let params: CreateProject = {} as CreateProject;
      
      params.developerRegistrar = await getUserDeveloperRegistrar(rl);
      params.name = await getProjectName(
        rl,
        await getERSRegistry(hre, projectOwner),
        await getDeveloperRegistrar(hre, params.developerRegistrar, projectOwner)
      );
      params.tokenSymbol = await getProjectSymbol(rl);
      params.tokenUriRoot = await getTokenURIData(rl);
      params.lockinPeriod = await getServiceTimelock(rl);
      params.serviceId = await getServiceId(rl);
  
      return params;
    }

    // Function to fetch ManufacturerValidationInfo from Supabase
    async function getEnrollmentData(chipId: string): Promise<ManufacturerValidationInfo | null> {
      const { data, error } = await supabase
        .from('your_table_name') // Replace with your actual table name
        .select('enrollmentId, manufacturerCertificate, payload')
        .eq('chipId', chipId)
        .single();

      if (error) {
        throw Error(`Error fetching enrollment data for chipId ${chipId}`);
      }

      return data as ManufacturerValidationInfo;
    }

    async function createOwnershipProofsFromScan(numChips: number): Promise<[string[], ChipInfo[]]> {
      const ownershipProofs: string[] = new Array<string>(numChips);
      const chipInfo: ChipInfo[] = new Array<ChipInfo>(numChips);

      // const message = ethers.utils.solidityPack(["address"], [projectPublicKey]);
      const typedSig = {};

      const domain = {
        name: "ERS",
        version: "1.0.0",
        chainId,
        chipRegistry,
      };
    
      const types = {
        DeveloperCustodyProof: [
          { name: "developerRegistrar", type: "address" },
        ],
      };
    
      const domainWithChainId = { ...domain, chainId };
    
      const value = {
        developerRegistrar,
      };

      for (let i = 0; i < numChips; i++) {
        const signResponse = await getChipTypedSigWithGateway(gate, typedSig);
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
