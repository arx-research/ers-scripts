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
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

import { CreateProject } from "../types/scripts";

import { 
  getChipTypedSigWithGateway,
  getDeveloperRegistrar,
  getERSRegistry,
  getChipRegistry,
  instantiateGateway,
  parseTokenUriDataCSV,
  validateCSVHeaders,
  renderImageInTerminal,
  uploadDirectoryToIPFS,
  uploadFileToIPFS,
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
  promptContinueScanning,
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
  developerProof: string;
  projectRegistrar: string;
  edition: number;
}

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_API_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

task("createProject", "Create a new project")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;

    const { developerOwner } = await hre.getNamedAccounts();
    const chainId = BigNumber.from(await hre.getChainId());
    const networkName = hre.network.name;
    const chipRegistry = await getChipRegistry(hre, developerOwner);

    // Obtain the provider from hre
    const provider = hre.ethers.provider;

    // Call the promptProjectRegistrar function
    const projectChoice = await promptProjectRegistrar(rl, chainId.toString(), networkName);
    let projectRegistrarAddress: string = projectChoice.id;
    let developerRegistrarAddress: string;
    let params: CreateProject = {} as CreateProject;
    
    // Set empty tokenUriRoot as default
    params.tokenUriRoot = "ipfs://";

    let chipDataList: ChipData[] = []; // Chip token URI data  
    let enrollmentIdLocal: string;     // Enrollment ID for localhost deployment
    let tokenUriCsv = "";           // Token URI data CSV

    // Prompt the user for the token URI root or to scan chips one by one based on a tokenUriData CSV
    let tokenUriDataChoice = await getTokenUriSource(rl);

    if (tokenUriDataChoice === "csv") {
      tokenUriCsv = await getTokenUriCsv(rl);

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
      tokenUriDataChoice = "none";
      console.log("No token URI data entered, skipping.");
    }

    if (projectChoice.isNew) {
      // If a new project is to be created, get the parameters and deploy it
      params = await getAndValidateParams();
      console.log(`Creating new project, this might take a moment...`);
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
      enrollmentIdLocal = await getEnrollmentId(rl, chainId.toString(), networkName);
    }

    // Instantiate the projectRegistrar
    const projectRegistrar = new PBTSimpleProjectRegistrar__factory(await hre.ethers.getSigner(developerOwner)).attach(projectRegistrarAddress);

    let gate = await instantiateGateway();

    // Cycle through signing ownership proofs for each chip, getting the chipIDs, and building the chipInfo array
    const [ownershipProofs, chipInfo, csvOutPath] = await createOwnershipProofsFromScan(chipDataList, tokenUriCsv, projectRegistrarAddress);

    // Check if any new proofs were generated
    if (csvOutPath) {
        // Upload token URI data to IPFS and update the ProjectRegistrar
        const directoryPath = path.resolve(`task_outputs/${networkName}/createProject/${projectRegistrarAddress}/tokenUri`);

        if (fs.existsSync(directoryPath)) {
            if (tokenUriDataChoice === "csv") {
              // Upload the directory to IPFS
              const ipfsObject = await uploadDirectoryToIPFS(directoryPath, projectRegistrarAddress);
              const ipfsBaseUri = `ipfs://${ipfsObject.cid}/`;
              console.log(`Token URI data uploaded to IPFS: ${ipfsBaseUri}, calling setBaseURI, this might take a moment...`);

              if (ipfsBaseUri) {
                  // Call the setBaseURI function to update the token URI base in the ProjectRegistrar
                  await rawTx({
                      from: developerOwner,
                      to: projectRegistrarAddress,
                      data: projectRegistrar.interface.encodeFunctionData(
                          "setBaseURI",
                          [ipfsBaseUri]
                      )
                  });
                  console.log(`Token URI base updated to ${ipfsBaseUri}.`);
              } else {
                  console.log(`No tokenURI data was found, not updating baseTokenUri.`);
              }
            } else if (tokenUriDataChoice === "uri") {
              console.log(`Calling setBaseURI, this might take a moment...`);
              await rawTx({
                from: developerOwner,
                to: projectRegistrarAddress,
                data: projectRegistrar.interface.encodeFunctionData(
                    "setBaseURI",
                    [params.tokenUriRoot]
                )
              });
              console.log(`Token URI base updated to ${params.tokenUriRoot}.`);
            }
        }
        
        console.log(`Calling addChips, this might take a moment...`);
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
    } else {
        console.log("No new ownership proofs were generated, skipping IPFS upload and contract update.");
    }

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
    
      console.log(`New ProjectRegistrar deployed at ${projectRegistrarDeploy.address}, adding project to the DeveloperRegistrar, this might take a moment...`);
    
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
      saveProjectRegistrarArtifact(projectRegistrarDeploy.address, developerRegistrar.address, params, chainId.toString(), networkName);
    
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
      const outputDir = path.join(__dirname, `../task_outputs/${networkName}/createProject`);
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
      params.developerRegistrar = await getUserDeveloperRegistrar(rl, chainId.toString(), networkName);
      params.name = await getProjectName(
        rl,
        await getERSRegistry(hre, developerOwner),
        await getDeveloperRegistrar(hre, params.developerRegistrar, developerOwner)
      );
      params.tokenSymbol = await getProjectSymbol(rl);
      params.lockinPeriod = await getServiceTimelock(rl);
      params.serviceId = await getServiceId(rl, chainId.toString(), networkName);
      return params;
    }
    
    async function getEnrollmentData(chipId: string, chainId: string): Promise<ManufacturerValidationInfo | null> {
      const networkName = hre.network.name;
      const columnName = `${networkName}EnrollmentId`;
      let selectColumns: string;
    
      // Construct the select columns safely
      if (enrollmentIdLocal) {
        selectColumns = ['manufacturerCertificate', 'payload']
        .map(col => `"${col}"`)
        .join(', ');
      } else {
        selectColumns = ['manufacturerCertificate', 'payload', columnName]
        .map(col => `"${col}"`)
        .join(', ');
      }

    
      // Perform the query without specifying type parameters
      const { data, error } = await supabase
        .from('certificates')
        .select(selectColumns)
        .eq('chipId', chipId)
        .single();
    
      // Handle query error
      if (error) {
        throw new Error(`Error fetching enrollment data for chipId ${chipId}: ${error.message}`);
      }
    
      // Handle no data returned
      if (!data) {
        throw new Error(`No data found for chipId ${chipId}`);
      }
    
      // Cast 'data' as 'Record<string, any>' to allow dynamic indexing
      const dataRecord = data as Record<string, any>;
    
      // Access the enrollmentId dynamically
      let enrollmentId: string | undefined;
      if (enrollmentIdLocal) {
        enrollmentId = enrollmentIdLocal;
      } else {
        enrollmentId = dataRecord[columnName]
      }
    
      // Use local enrollmentId if in localhost deployment, otherwise use Supabase data
      if (enrollmentIdLocal) {
        dataRecord[columnName] = enrollmentIdLocal;
      } else if (!enrollmentId) {
        throw new Error(`No enrollmentId found for chipId ${chipId} in column ${columnName}`);
      }
    
      // Ensure payload exists, fallback to '0x00' if missing
      const payload = dataRecord.payload || "0x00";
    
      // Return the data as ManufacturerValidationInfo
      return {
        enrollmentId: enrollmentId,
        manufacturerCertificate: dataRecord.manufacturerCertificate,
        payload: payload,
      } as ManufacturerValidationInfo;
    }

    async function createOwnershipProofsFromScan(
      chipDataList: ChipData[],
      originalCsvPath: string,
      projectRegistrarAddress: string,
    ): Promise<[string[], ChipInfo[], string | null]> {
      let ownershipProofs: string[] = [];
      let chipInfo: ChipInfo[] = [];
      let updatedData: any[] = []; // Array to store updated data for each chip
      let newProofsGenerated = false; // Flag to track if any new proofs were generated
    
      const chainIdNumber = chainId.toNumber();
      const domain = {
        name: 'ERS',
        version: '2.0.0',
        chainId: chainIdNumber,
        verifyingContract: chipRegistry.address,
      };
    
      const types = {
        DeveloperCustodyProof: [
          { name: 'developerRegistrar', type: 'address' },
        ],
      };
    
      const value = {
        developerRegistrar: developerRegistrarAddress,
      };
    
      // Determine the output CSV path
      const csvOutPath = originalCsvPath
        ? path.join(__dirname, `../task_outputs/${networkName}/createProject/${projectRegistrarAddress}/${path.basename(originalCsvPath, '.csv')}_out.csv`)
        : path.join(__dirname, `../task_outputs/${networkName}/createProject/${projectRegistrarAddress}/scanData_out.csv`);
    
      const csvWriter = createCsvWriter({
        path: csvOutPath,
        header: [
          { id: 'edition', title: 'Edition' },
          { id: 'chipId', title: 'Chip ID' },
          { id: 'media_uri', title: 'Media URI' },
          { id: 'media_mime_type', title: 'Media MIME Type' },
          { id: 'name', title: 'Name' },
          { id: 'description', title: 'Description' },
          { id: 'developerProof', title: 'Developer Proof' },
          { id: 'projectRegistrar', title: 'Project Registrar' }
        ]
      });
    
      let i = 0;
    
      if (chipDataList.length === 0) {
        // No chip data from CSV, prompt user to scan chips one by one
        console.log("No token URI data provided. You can now scan chips one by one.");
    
        while (true) {
          console.log('\nPlease scan the next chip...\n');
    
          const signResponse = await getChipTypedSigWithGateway(gate, { domain, types, value });
          console.log(JSON.stringify(signResponse))
    
          // Check if chip already exists in the chip registry
          const existingChipInfo = await chipRegistry.chipEnrollments(signResponse.etherAddress);
    
          if (existingChipInfo.chipEnrolled) {
            console.log(`Chip with ID ${signResponse.etherAddress} is already enrolled. Please scan another chip.`);
            continue;
          }
    
          // Prepare default chip data
          const chipData: ChipData = {
            edition: i + 1,
            chipId: signResponse.etherAddress,
            name: '',
            description: '',
            media_uri: '',
            media_mime_type: '',
            developerProof: signResponse.signature.ether,
            projectRegistrar: projectRegistrarAddress,
          };
  
          updatedData.push(chipData);
    
          ownershipProofs.push(signResponse.signature.ether);
    
          const manufacturerValidation = await getEnrollmentData(signResponse.etherAddress, chainId.toString());
    
          chipInfo.push({
            chipId: signResponse.etherAddress,
            manufacturerValidation: manufacturerValidation,
          } as ChipInfo);
    
          newProofsGenerated = true; // Mark that a new proof has been generated
    
          // Save ChipData as JSON
          const outputDir = path.join(__dirname, `../task_outputs/${networkName}/createProject/${projectRegistrarAddress}/tokenUri`);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const chipJsonPath = path.join(outputDir, `${signResponse.etherAddress}.json`);
          fs.writeFileSync(chipJsonPath, JSON.stringify(chipData, null, 2));
    
          i++;
    
          // After each chip, prompt the user if they want to scan another chip or stop
          const answer = await promptContinueScanning(rl); // Moved to prompts script
          if (!answer) {
            break;
          }
        }
      } else {
        // Process chips from the CSV as before
        while (i < chipDataList.length) {
          const chipData = chipDataList.find(chip => chip.edition === i + 1);
          if (!chipData) {
            console.error(`No chip data found for edition: ${i + 1}`);
            break;
          }
    
          // Skip chips with a different projectRegistrar
          if (chipData.projectRegistrar && chipData.projectRegistrar !== projectRegistrarAddress) {
            console.warn(`Chip with edition ${chipData.edition} has a different projectRegistrar. Skipping.`);
            i++;
            continue;
          }
    
          if (chipData.chipId) {
            const existingChipInfo = await chipRegistry.chipEnrollments(chipData.chipId);
            if (existingChipInfo.chipEnrolled) {
              console.log(`Chip with ID ${chipData.chipId} is already enrolled, skipping.`);
              i++;
              continue;
            }
          }

          // If all the chip information is provided, we don't need to scan the chip. Useful for when developer proofs have already been captured.
          let signResponse: any;
          if (chipData.developerProof && 
              chipData.chipId && 
              chipData.edition && 
              chipData.name && 
              chipData.description && 
              chipData.media_uri && 
              chipData.media_mime_type
            ) {
            signResponse = {
              etherAddress: chipData.chipId,
              signature: { ether: chipData.developerProof },
            };
            console.warn(`Complete chip data found. Skipping scan.`);
          } else {
            if (chipData) {
              console.log('\nPlease scan the following chip...\n');
              // Attempt to render the media if it's a JPEG or PNG image
              if (chipData.media_mime_type === 'image/jpg' || chipData.media_mime_type === 'image/jpeg' || chipData.media_mime_type === 'image/png') {
                try {
                  await renderImageInTerminal(chipData.media_uri);
                } catch (error) {
                  console.log(`Unable to render image from URI: ${chipData.media_uri}. Error: ${error}`);
                }
              }
              console.log(`Edition: ${chipData.edition}`);
              console.log(`Name: ${chipData.name}`);
              console.log(`Description: ${chipData.description}`);
              console.log(`Media URI: ${chipData.media_uri}`);
              console.log(`Media MIME Type: ${chipData.media_mime_type}`);
              console.log(`Chip ID: ${chipData.chipId || "Not Provided"}`);
            } else {
              console.log("Please scan the next chip.");
            }

            signResponse = await getChipTypedSigWithGateway(gate, { domain, types, value });
          }
    
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
            try {
              const uploadedMedia = await uploadFileToIPFS(chipData.media_uri);
              chipData.media_uri = `ipfs://${uploadedMedia.cid}`;  // Assuming the CID is returned in the format `{ cid: '...' }`
            } catch (error) {
              console.error(`Failed to upload media to IPFS: ${error}`);
              process.exit(1);
            }
          }
    
          // Prepare the updated data for this chip
          const updatedChipData = {
            edition: chipData.edition,
            chipId: signResponse.etherAddress,
            media_uri: chipData.media_uri,
            developerProof: signResponse.signature.ether,
            projectRegistrar: projectRegistrarAddress,
            name: chipData.name,
            description: chipData.description,
            media_mime_type: chipData.media_mime_type,
          };
          updatedData.push(updatedChipData);
    
          ownershipProofs.push(signResponse.signature.ether);
    
          const manufacturerValidation = await getEnrollmentData(signResponse.etherAddress, chainId.toString());
    
          chipInfo.push({
            chipId: signResponse.etherAddress,
            manufacturerValidation: manufacturerValidation,
          } as ChipInfo);
    
          newProofsGenerated = true; // Mark that a new proof has been generated
    
          // Save ChipData as JSON if provided
          const outputDir = path.join(__dirname, `../task_outputs/${networkName}/createProject/${projectRegistrarAddress}/tokenUri`);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const chipJsonPath = path.join(outputDir, `${signResponse.etherAddress}`);
          fs.writeFileSync(chipJsonPath, JSON.stringify(chipData, null, 2));
    
          i++;
        }
      }
    
      if (newProofsGenerated) {
        // Write the updated data to the output CSV
        await csvWriter.writeRecords(updatedData);
        console.log("Updated CSV written to:", csvOutPath);
      } else {
        console.log("No new proofs were generated; skipping IPFS upload.");
      }
    
      return [ownershipProofs, chipInfo, newProofsGenerated ? csvOutPath : null];
    }
  
    
    
  });

  function saveProjectRegistrarArtifact(projectRegistrar: string, developerRegistrar: string, params: CreateProject, chainId: string, networkName: string) {
    const outputDir = path.join(__dirname, `../task_outputs/${networkName}/createProject`);
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