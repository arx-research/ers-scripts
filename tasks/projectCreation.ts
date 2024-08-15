import { ethers, BigNumber } from "ethers";
import * as fs from 'fs';
import * as path from 'path';
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
  promptProjectRegistrar,
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
    const chainId = BigNumber.from(await hre.getChainId());
    const chipRegistry = getDeployedContractAddress(hre.network.name, "ChipRegistry");

    // Obtain the provider from hre
    const provider = hre.ethers.provider;

    // Call the promptProjectRegistrar function
    const projectChoice = await promptProjectRegistrar(rl, chainId.toString());
    let projectRegistrarAddress: string = projectChoice.id;
    let developerRegistrarAddress: string;

    if (projectChoice.isNew) {
      // If a new project is to be created, get the parameters and deploy it
      let params: CreateProject = await getAndValidateParams();
      [projectRegistrarAddress, developerRegistrarAddress] = await deployNewProject(params, developerOwner, hre);
    } else if (projectChoice.artifactFound) {
      // If artifact found, use the artifact data
      developerRegistrarAddress = await getDeveloperRegistrarAddressFromArtifact(projectRegistrarAddress, chainId.toString());
    } else {
      // If no artifact found, call on-chain to get the developerRegistrar
      developerRegistrarAddress = await getDeveloperRegistrarFromContract(projectRegistrarAddress, provider);
    }
    let enrollmentIdLocal: string;

    // In the case of a localhost deployment, we request the enrollmentId which will not be saved in Supabase
    if (chainId.eq(31337)) {
      enrollmentIdLocal = await getEnrollmentId(rl, chainId.toString());
    }
    
    let gate = await instantiateGateway();

    let chipInfo: ChipInfo[];
    let ownershipProofs: string[];

    // Cycle through signing ownership proofs for each chip, getting the chipIDs, and building the chipInfo array     
    [ ownershipProofs, chipInfo ] = await createOwnershipProofsFromScan()

    const projectRegistrar = new PBTSimpleProjectRegistrar__factory(await hre.ethers.getSigner(developerOwner)).attach(projectRegistrarAddress);
    
    console.log(`ChipInfo: ${JSON.stringify(chipInfo)}`)
    await rawTx({
      from: developerOwner,
      to: projectRegistrarAddress,
      data: projectRegistrar.interface.encodeFunctionData(
        "addChips",
        [
          chipInfo.map((chip) => {
            return {
              chipId: chip.chipId,
              chipOwner: developerOwner,
              nameHash: calculateLabelHash(chip.chipId),
              manufacturerValidation: chip.manufacturerValidation,
              custodyProof: ownershipProofs.shift(),
            } as ProjectChipAddition
          }),
        ]
      )
    });
    console.log(`Chips added to ProjectRegistrar`);

    async function deployNewProject(params: CreateProject, developerOwner: string, hre: HRE): Promise<string[]> {
      const { deploy } = await hre.deployments;
    
      const projectRegistrarDeploy = await deploy("PBTSimpleProjectRegistrar", {
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
    
      // Add the new project to the DeveloperRegistrar
      const developerRegistrar = new DeveloperRegistrar__factory(await hre.ethers.getSigner(developerOwner)).attach(params.developerRegistrar);
      await hre.deployments.rawTx({
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

      // Save the projectRegistrar artifact
      saveProjectRegistrarArtifact(projectRegistrarDeploy.address, developerRegistrar.address, params, hre);
    
      return [projectRegistrarDeploy.address, developerRegistrar.address];
    }

    async function getDeveloperRegistrarFromContract(projectRegistrarAddress: string, provider: ethers.providers.Provider): Promise<string> {
      console.log(`Attempting to connect to projectRegistrar at address: ${projectRegistrarAddress}`);
    
      try {
        const projectRegistrar = PBTSimpleProjectRegistrar__factory.connect(projectRegistrarAddress, provider);
        const developerRegistrar = await projectRegistrar.developerRegistrar();
        console.log(`Found developerRegistrar: ${developerRegistrar}`);
        return developerRegistrar;
      } catch (error) {
        console.error(`Failed to fetch developerRegistrar from projectRegistrar at address: ${projectRegistrarAddress}`);
        console.error(error);
        throw new Error(`Unable to retrieve developerRegistrar for projectRegistrar at address ${projectRegistrarAddress}.`);
      }
    }

    async function getDeveloperRegistrarAddressFromArtifact(projectRegistrarAddress: string, chainId: string): Promise<string> {
      const outputDir = path.join(__dirname, `../../task_outputs/createProject`);
      const artifactPath = path.join(outputDir, `${projectRegistrarAddress}.json`);
    
      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact for projectRegistrarAddress ${projectRegistrarAddress} not found.`);
      }
    
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
      if (artifact.chainId !== chainId) {
        throw new Error(`Chain ID mismatch for artifact ${artifactPath}. Expected ${chainId}, found ${artifact.chainId}`);
      }
    
      return artifact.developerRegistrar;
    }

    async function getAndValidateParams(): Promise<CreateProject> {
      let params: CreateProject = {} as CreateProject;

      params.developerRegistrar = await getUserDeveloperRegistrar(rl, chainId.toString());
      params.name = await getProjectName(
        rl,
        await getERSRegistry(hre, developerOwner),
        await getDeveloperRegistrar(hre, params.developerRegistrar, developerOwner)
      );
      params.tokenSymbol = await getProjectSymbol(rl);
      params.tokenUriRoot = await getTokenURIData(rl);
      params.lockinPeriod = await getServiceTimelock(rl);
      params.serviceId = await getServiceId(rl, chainId.toString());
  
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

    async function createOwnershipProofsFromScan(): Promise<[string[], ChipInfo[]]> {
      let ownershipProofs: string[] = [];
      let chipInfo: ChipInfo[] = [];
      let i = 0;
    
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
    
      while (true) {
        const signResponse = await getChipTypedSigWithGateway(gate, { domain, types, value });
        console.log(`Ownership proof created for chipId: ${signResponse.etherAddress} with proof: ${signResponse.signature.ether}`)
        ownershipProofs.push(signResponse.signature.ether);
    
        // Fetch enrollment data from Supabase
        const manufacturerValidation = await getEnrollmentData(signResponse.etherAddress);
    
        chipInfo.push({
          chipId: signResponse.etherAddress,
          manufacturerValidation: manufacturerValidation
        } as ChipInfo);
    
        const continueScanning = await queryUser(rl, "Do you want to continue scanning chips? (y/n): ");
        if (continueScanning.toLowerCase() !== 'y') {
          break;
        }
    
        i++;
      }
    
      return [ownershipProofs, chipInfo];
    }
    
  });

  function saveProjectRegistrarArtifact(projectRegistrar: string, developerRegistrar: string, params: CreateProject, hre: HRE) {
    const outputDir = path.join(__dirname, `../../task_outputs/createProject`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    const artifact = {
      chainId: hre.network.config.chainId?.toString() || '',
      projectRegistrar: projectRegistrar,
      developerRegistrar: developerRegistrar,
      name: params.name,
      tokenSymbol: params.tokenSymbol,
      tokenUriRoot: params.tokenUriRoot,
      lockinPeriod: params.lockinPeriod.toString(),
      serviceId: params.serviceId,
    };
  
    fs.writeFileSync(path.join(outputDir, `${projectRegistrar}.json`), JSON.stringify(artifact, null, 2));
  }