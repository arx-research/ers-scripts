import { ethers, BigNumber } from "ethers";
import * as fs from 'fs';
import * as path from 'path';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { createClient } from '@supabase/supabase-js';
import {
  PBTSimpleProjectRegistrar__factory,
  DeveloperRegistrar__factory,
  calculateLabelHash,
  ProjectChipAddition,
  ManufacturerValidationInfo,
} from "@arx-research/ers-contracts/";

import { CreateProject } from "../types/scripts";

import { 
  getChipTypedSigWithGateway,
  getDeveloperRegistrar,
  getERSRegistry,
  getChipRegistry,
  instantiateGateway,
  queryUser,
  parseTokenUriDataCSV,
  validateCSVHeaders,
  renderImageInTerminal,
  uploadDirectoryToIPFS,
  uploadFileToIPFS,
  getAllFiles,
  rl,
} from "../utils/scriptHelpers";
import { getDeployedContractAddress } from '../utils/helpers';
import { 
  getUserDeveloperRegistrar,
  getProjectName,
  getProjectSymbol,
  getServiceTimelock,
  getServiceId,
  getTokenUriSource,
  getTokenUriCsv,
  getTokenUriData,
  getEnrollmentId,
  promptProjectRegistrar,
 } from '../utils/prompts/projectCreationPrompts';

interface ChipInfo {
  chipId: string;
  manufacturerValidation: ManufacturerValidationInfo;
}

interface ChipData {
  chipId?: string;
  name: string;
  description: string;
  media_uri: string;
  media_mime_type: string;
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
    let params: CreateProject = {} as CreateProject;
    
    // Set empty tokenUriRoot as default
    params.tokenUriRoot = "ipfs://";

    let chipInfo: ChipInfo[];          // Chip manufacturer validation info
    let chipDataList: ChipData[] = []; // Chip token URI data
    let ownershipProofs: string[];     // Ownership proofs for chips    
    let enrollmentIdLocal: string;     // Enrollment ID for localhost deployment

    // Prompt the user for the token URI root or to scan chips one by one based on a tokenUriData CSV
    let tokenUriDataChoice = await getTokenUriSource(rl);

    if (tokenUriDataChoice === "csv") {
      const tokenUriCsv = await getTokenUriCsv(rl);

      // Validate the CSV headers before proceeding
      try {
        await validateCSVHeaders(tokenUriCsv);
        chipDataList = await parseTokenUriDataCSV(tokenUriCsv);
        console.log("Token URI data parsed from CSV.");
      } catch (error) {
        console.error(`CSV Validation Failed: ${JSON.stringify(error)}`);
        return;
      }

    } else if (tokenUriDataChoice === "uri") {
      params.tokenUriRoot = await getTokenUriData(rl);
      console.log("Token URI data entered.");
    } else {
      console.log("No token URI data entered, skipping.");
    }

    if (projectChoice.isNew) {
      // If a new project is to be created, get the parameters and deploy it
      params = await getAndValidateParams();
      [projectRegistrarAddress, developerRegistrarAddress] = await deployNewProject(params, developerOwner, hre);
    } else if (projectChoice.artifactFound) {
      // If artifact found, use the artifact data
      developerRegistrarAddress = await getDeveloperRegistrarAddressFromArtifact(projectRegistrarAddress, chainId.toString());
    } else {
      // If no artifact found, call on-chain to get the developerRegistrar
      developerRegistrarAddress = await getDeveloperRegistrarFromContract(projectRegistrarAddress, provider);
    }

    // In the case of a localhost deployment, we request the enrollmentId which will not be saved in Supabase
    if (chainId.eq(31337)) {
      enrollmentIdLocal = await getEnrollmentId(rl, chainId.toString());
    }

    // Instantiate the projectRegistrar
    const projectRegistrar = new PBTSimpleProjectRegistrar__factory(await hre.ethers.getSigner(developerOwner)).attach(projectRegistrarAddress);

    let gate = await instantiateGateway();

    // Cycle through signing ownership proofs for each chip, getting the chipIDs, and building the chipInfo array     
    [ownershipProofs, chipInfo] = await createOwnershipProofsFromScan(chipDataList);
    // TODO: we should take the ownership proofs and add them back to the tokenURI csv file under "developerProof"

    // Upload token URI data to IPFS and update the ProjectRegistrar
    const directoryPath = path.resolve(`task_outputs/createProject/${projectRegistrarAddress}/tokenUri`);
   
    if (fs.existsSync(directoryPath)) {
      const chipTokenUriFiles = (await getAllFiles(directoryPath)).filter(file => path.extname(file.path) === '.json');
  
      // Upload the directory to IPFS
      const ipfsObject = await uploadDirectoryToIPFS(directoryPath, projectRegistrarAddress);
      const ipfsBaseUri = `ipfs://${ipfsObject.cid}/`;
      console.log(`Token URI data uploaded to IPFS: ${ipfsBaseUri}`);
  
      if(ipfsBaseUri) {
        // Call the setBaseURI function to update the token URI base in the ProjectRegistrar
        await rawTx({
          from: developerOwner,
          to: projectRegistrarAddress,
          data: projectRegistrar.interface.encodeFunctionData(
            "setBaseURI",
            [ipfsBaseUri]
          )
        });
        console.log(`Token URI base updated to ${ipfsBaseUri}`);
      } else {
        console.log(`No tokenURI data was found, not updating contract.`);
      }

    }

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
      saveProjectRegistrarArtifact(projectRegistrarDeploy.address, developerRegistrar.address, params, chainId.toString());
    
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
      const outputDir = path.join(__dirname, `../task_outputs/createProject`);
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
      params.developerRegistrar = await getUserDeveloperRegistrar(rl, chainId.toString());
      params.name = await getProjectName(
        rl,
        await getERSRegistry(hre, developerOwner),
        await getDeveloperRegistrar(hre, params.developerRegistrar, developerOwner)
      );
      params.tokenSymbol = await getProjectSymbol(rl);
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

    async function createOwnershipProofsFromScan(chipDataList: ChipData[]): Promise<[string[], ChipInfo[]]> {
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
    
      // TODO: we should match the number of chips scanned to the metadata; if we have iterated through all the metadata we should stop scanning and indicate the count of chips scanned
      while (true) {
        const chipData = chipDataList[i];
        const chipRegistry = await getChipRegistry(hre, developerOwner);

        if (chipData && chipData.chipId) {
          // Check if chip already exists in the chip registry
          const existingChipInfo = await chipRegistry.chipEnrollments(chipData.chipId);
          
          if (existingChipInfo.chipEnrolled) {
            console.log(`Chip with ID ${chipData.chipId} is already enrolled, skipping.`);
            i++;
            continue;
          }
        }
    
        if (chipData) {
          console.log('\nPlease scan the following chip...\n');
          // Attempt to render the media if it's a JPEG or PNG image
          if (chipData.media_mime_type === 'image/jpg' || chipData.media_mime_type === 'image/jpeg' || chipData.media_mime_type === 'image/png') {
            try {
                const image = await renderImageInTerminal(chipData.media_uri);
            } catch (error) {
                console.log(`Unable to render image from URI: ${chipData.media_uri}. Error: ${error}`);
            }
        }
          console.log(`Name: ${chipData.name}`);
          console.log(`Description: ${chipData.description}`);
          console.log(`Media URI: ${chipData.media_uri}`);
          console.log(`Media MIME Type: ${chipData.media_mime_type}`);
          console.log(`Chip ID: ${chipData.chipId || "Not Provided"}`);
      } else {
          console.log("Please scan the next chip.");
      }
    
        const signResponse = await getChipTypedSigWithGateway(gate, { domain, types, value });

        if (chipData && chipData.chipId && chipData.chipId !== signResponse.etherAddress) {
          console.error(`Scanned chip ID does not match expected chip ID for ${chipData.name}. Please scan the correct chip.`);
          continue;
        }

        // Check if chip already exists in the chip registry
        const existingChipInfo = await chipRegistry.chipEnrollments(signResponse.etherAddress);
        
        if (existingChipInfo.chipEnrolled) {
          console.log(`Chip with ID ${signResponse.etherAddress} is already enrolled. Please scan another chip.`);
          i++;
          continue;
        }

        // Upload chip media to IPFS, if needed
        if (
          !chipData.media_uri.startsWith('ipfs://') &&
          !chipData.media_uri.startsWith('https://') &&
          !chipData.media_uri.startsWith('http://')
        ) {
          const uploadedMedia = await uploadFileToIPFS(chipData.media_uri);
          chipData.media_uri = `ipfs://${uploadedMedia.cid}`;  // Assuming the CID is returned in the format `{ cid: '...' }`
        }
          
        ownershipProofs.push(signResponse.signature.ether);
    
        const manufacturerValidation = await getEnrollmentData(signResponse.etherAddress);
    
        chipInfo.push({
          chipId: signResponse.etherAddress,
          manufacturerValidation: manufacturerValidation,
        } as ChipInfo);
    
        // Save ChipData as JSON if provided
        if (chipData) {
          const outputDir = path.join(__dirname, `../task_outputs/createProject/${projectRegistrarAddress}/tokenUri`);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const chipJsonPath = path.join(outputDir, `${signResponse.etherAddress}.json`);
          fs.writeFileSync(chipJsonPath, JSON.stringify(chipData, null, 2));
        }
    
        const continueScanning = await queryUser(rl, "Do you want to continue scanning chips? (y/n): ");
        if (continueScanning.toLowerCase() !== 'y') {
          break;
        }
    
        i++;
      }
    
      return [ownershipProofs, chipInfo];
    }
    
  });

  function saveProjectRegistrarArtifact(projectRegistrar: string, developerRegistrar: string, params: CreateProject, chainId: string) {
    const outputDir = path.join(__dirname, `../task_outputs/createProject`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    const artifact = {
      chainId: chainId || '',
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