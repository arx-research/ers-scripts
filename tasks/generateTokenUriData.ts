// Import the necessary modules at the top of your script
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { File } from "nft.storage";
import * as fs from 'fs';
import * as path from 'path';
import { instantiateGateway, uploadFilesToIPFS, getChipPublicKeys, rl, queryUser } from "../utils/scriptHelpers";
import { ChipKeys } from "../types/scripts";
import * as readline from 'readline';

// Chips that we will create metadata for
let chips: ChipKeys = {};

// A utility function to prompt the user for multiple inputs
async function queryUserForData(prompter: readline.ReadLine, isCommonMetadata: boolean, address?: string): Promise<{ description: string; media: string; name: string }> {
  const context = isCommonMetadata ? "all chips" : `chip ${address}`;
  const name = await queryUser(prompter, `Enter name for ${context}: `);
  const description = await queryUser(prompter, `Enter description for ${context}: `);
  const media = await queryUser(prompter, `Enter media URL for ${context}: `);

  return {
    name,
    description,
    media
  };
}

// Get public keys from a chip scanner
async function getChips(scanCount: number): Promise<void> {
    const gateway = await instantiateGateway();
    for (let i = 0; i < scanCount; i++) {
        const [ chipId, pk2, _rawKeys ] = await getChipPublicKeys(gateway);
        // Make rawKeys available outside of the loop
        if (Object.keys(chips).includes(chipId)) {
        console.log(`Chip ${chipId} already scanned. Skipping...`);
        i--;
        continue;
        }

        chips[chipId] = {secondaryKeyAddress: pk2};
        console.log(`Scanned chip ${i + 1} of ${scanCount}`);
    }
}

// Generate JSON files and return as File objects for the IPFS CAR pack
async function generateJSONFiles(address: string, data: any): Promise<File> {
  console.log(`Generating JSON file for ${address}`);
  const jsonContent = JSON.stringify(data);
  const fileName = `${address}.json`;
  fs.mkdirSync(`task_outputs/tokenUriData`, { recursive: true });
  await fs.writeFileSync(`task_outputs/tokenUriData/${fileName}`, jsonContent);
  return new File([jsonContent], fileName, { type: 'application/json' });
}

// Define the Hardhat task
task("generateTokenUriData", "Generates JSON files for chips and uploads to NFT.Storage")
  .addParam("scan", "Number of chips to scan", "0", undefined, true)
  .setAction(async (taskArgs, hre: HRE) => {
    if(Number(taskArgs.scan) == 0){
      console.log(`Please add at least one chip to scan via --scan parameter`);
      process.exit(1);
    }

    try {
      // Get chip addresses from the scanner
      await getChips(taskArgs.scan);

      // Ask if the user wants to use the same metadata for all chips
      let commonMetadata = null;
      if (Object.keys(chips).length > 1) {
        const sameMetadataAnswer = await queryUser(rl, "Do you want to use the same metadata for all chips? (yes/no): ");
        if (sameMetadataAnswer.trim().toLowerCase() === 'yes') {
          commonMetadata = await queryUserForData(rl, true); // Call with true for common metadata
        }
      }
      
      let files: File[] = [];
      for (const address of Object.keys(chips)) {
        let data;
        if (commonMetadata) {
          data = commonMetadata;
        } else {
          // When prompting for individual chip metadata, call with false and provide the address
          data = await queryUserForData(rl, false, address);
        }
        const file = await generateJSONFiles(address, data);
        files.push(file);
      }

      // Close the readline interface
      rl.close();

    } catch (error) {
      console.error(`Error occurred: ${error}`);
      process.exit(1);
    }
  });
