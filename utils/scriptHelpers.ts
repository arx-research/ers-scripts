import { ethers } from "ethers";
import { HaloGateway } from "@arx-research/libhalo/api/desktop.js";
import axios from "axios";
import terminalImage from 'terminal-image';
import { HardhatRuntimeEnvironment } from "hardhat/types";

import QRCode from 'qrcode';
import websocket from 'websocket';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from "fs";
import * as readline from 'readline';

import csv from 'csv-parser';

interface ChipData {
  chipId?: string;
  name: string;
  description: string;
  media_uri: string;
  media_mime_type: string;
}

import {
  ADDRESS_ZERO,
  Address,
  DeveloperNameGovernor,
  DeveloperNameGovernor__factory,
  DeveloperRegistrar,
  DeveloperRegistrar__factory,
  DeveloperRegistry,
  DeveloperRegistry__factory,
  ERSRegistry,
  ERSRegistry__factory,
  ChipRegistry,
  ChipRegistry__factory,
  ManufacturerRegistry,
  ManufacturerRegistry__factory,
  PBTSimpleProjectRegistrar__factory,
  PBTSimpleProjectRegistrar,
} from "@arx-research/ers-contracts";

import { getDeployedContractAddress } from "./helpers";
import { KeysFromChipScan } from "../types/scripts";

dotenv.config();

// export async function uploadFilesToIPFS(files: File[]): Promise<CIDString> {
//   const nftStorageApiKey = process.env.NFT_STORAGE_API_KEY;
//   if(!nftStorageApiKey){
//     throw new Error("NFT_STORAGE_API_KEY environment variable not set");
//   }

//   const client = new NFTStorage({ token: nftStorageApiKey })
//   // const cid = await client.storeDirectory(files);
//   const { cid, car } = await NFTStorage.encodeDirectory(files)
//   console.log(`File CID: ${cid}`)

//   console.log('Sending file...')
//   await client.storeCar(car, {
//     maxChunkSize: 1024 * 1024 * 25, // 25MB
//     onStoredChunk: (size) => console.log(`Stored a chunk of ${size} bytes`)
//   })

//   return cid as unknown as CIDString;
// }

export async function saveFilesLocally(directoryRoot: string, files: File[]): Promise<void> {
  fs.mkdirSync(`task_outputs/${directoryRoot}`, { recursive: true });

  for (let i = 0; i < files.length; i++) {
    const filePath = `task_outputs/${directoryRoot}/${files[i].name}`;
    fs.writeFileSync(filePath, await files[i].text(), { flag: 'w' });
  }
}

// export function createIpfsAddress(cid: CIDString): string {
//   return `ipfs://${cid}`;
// }

export async function instantiateGateway(): Promise<any> {
  let gate = new HaloGateway('wss://s1.halo-gateway.arx.org', {
    createWebSocket: (url: string) => new websocket.w3cwebsocket(url)
  });

  let pairInfo;
  try {
    pairInfo = await gate.startPairing();
    console.log('URL in the QR code:', pairInfo.qrCode);
  } catch (e) {
    console.log(e);
  }

  QRCode.toString(pairInfo.execURL, {type: 'terminal'}, function (err: any, qrtext: string) {
    console.log('Please scan the following QR code using your smartphone:');
    console.log('');
    console.log(qrtext);
    console.log('');
  });

  console.log('Waiting for smartphone to connect...');
  await gate.waitConnected();

  return gate;
}

export async function getChipPublicKeys(gate: any): Promise<[Address, Address, KeysFromChipScan]> {
  let cmd = {
    "name": "get_pkeys",
  };

  const rawKeys: KeysFromChipScan = await gate.execHaloCmd(cmd);
  return [rawKeys.etherAddresses['1'], rawKeys.etherAddresses['2'], rawKeys];
}

export async function getChipMessageSigWithGateway(gate: any, message: string): Promise<any> {

  if (message.slice(0,2) == '0x') {
    message = message.slice(2);
  }

  let cmd = {
    "name": "sign",
    "message": message,
    "keyNo": 1
  };

  return await gate.execHaloCmd(cmd);
}

export async function getChipTypedSigWithGateway(gate: any, typedData: any ): Promise<any> {
  let cmd = {
    "name": "sign",
    "keyNo": 1,
    "typedData": typedData,
  };

  return await gate.execHaloCmd(cmd);
}

export async function getERSRegistry(hre: HardhatRuntimeEnvironment, signerAddress: Address): Promise<ERSRegistry> {
  const signer = await hre.ethers.getSigner(signerAddress);
  const ersRegistryAddress = getDeployedContractAddress(hre.network.name, "ERSRegistry");
  const ersRegistry = new ERSRegistry__factory(signer).attach(ersRegistryAddress);
  return ersRegistry;
}

export async function getChipRegistry(hre: HardhatRuntimeEnvironment, signerAddress: Address): Promise<ChipRegistry> {
  const signer = await hre.ethers.getSigner(signerAddress);
  const chipRegistryAddress = getDeployedContractAddress(hre.network.name, "ChipRegistry");
  const chipRegistry = new ChipRegistry__factory(signer).attach(chipRegistryAddress);
  return chipRegistry;
}

export  async function getDeveloperNameGovernor(
  hre: HardhatRuntimeEnvironment,
  signerAddress: Address,
): Promise<DeveloperNameGovernor> {
  const developerNameGovernorAddress = getDeployedContractAddress(hre.network.name, "DeveloperNameGovernor");
  const signer = await hre.ethers.getSigner(signerAddress);
  const developerNameGovernor = new DeveloperNameGovernor__factory(signer).attach(developerNameGovernorAddress);
  return developerNameGovernor;
}

export  async function getDeveloperRegistry(
  hre: HardhatRuntimeEnvironment,
  signerAddress: Address,
): Promise<DeveloperRegistry> {
  const developerRegistryAddress = getDeployedContractAddress(hre.network.name, "DeveloperRegistry");
  const signer = await hre.ethers.getSigner(signerAddress);
  const developerRegistry = new DeveloperRegistry__factory(signer).attach(developerRegistryAddress);
  return developerRegistry;
}

export  async function getDeveloperRegistrar(
  hre: HardhatRuntimeEnvironment,
  registrarAddress: Address,
  signerAddress: Address,
): Promise<DeveloperRegistrar> {
  const signer = await hre.ethers.getSigner(signerAddress);
  const developerRegistry = new DeveloperRegistrar__factory(signer).attach(registrarAddress);
  return developerRegistry;
}

export async function getProjectRegistrar(
  hre: HardhatRuntimeEnvironment,
  signerAddress: Address,
  projectRegistrarAddress: Address
): Promise<PBTSimpleProjectRegistrar> {
  const signer = await hre.ethers.getSigner(signerAddress);
  const projectRegistrar = new PBTSimpleProjectRegistrar__factory(signer).attach(projectRegistrarAddress);
  return projectRegistrar;
}

export async function getManufacturerRegistry(
  hre: HardhatRuntimeEnvironment,
  signerAddress: Address,
  manufacturerRegistryAddress: Address
): Promise<ManufacturerRegistry> {
  const signer = await hre.ethers.getSigner(signerAddress);
  const manufacturerRegistry = new ManufacturerRegistry__factory(signer).attach(manufacturerRegistryAddress);
  return manufacturerRegistry;
}

// export async function createERSInstance(hre: any): Promise<ERS> {
//   const ersConfig: ERSConfig = {
//     chipRegistry: getDeployedContractAddress(hre.network.name, "ChipRegistry") as `0x${string}`,
//     servicesRegistry: getDeployedContractAddress(hre.network.name, "ServicesRegistry") as `0x${string}`,
//     ersRegistry: getDeployedContractAddress(hre.network.name, "ERSRegistry") as `0x${string}`,
//   };
//   // console.log(await hre.viem.getWalletClients());
//   return new ERS((await hre.viem.getWalletClients())[0], ersConfig);
// }

export const stringToBytes = (content: string): string => {
  return ethers.utils.hexlify(Buffer.from(content));
}

// Create a readline interface for user input
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// A utility function to prompt the user for input
export function queryUser(rl: readline.ReadLine, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

export async function parseTokenUriDataCSV(filePath: string): Promise<ChipData[]> {
  const chipDataList: ChipData[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const chipData: ChipData = {
          chipId: row.chipId || undefined,
          name: row.name,
          description: row.description,
          media_uri: row.media_uri,
          media_mime_type: row.media_mime_type,
        };
        chipDataList.push(chipData);
      })
      .on('end', () => {
        resolve(chipDataList);
      })
      .on('error', reject);
  });
}

export async function validateCSVHeaders(filePath: string): Promise<void> {
  const expectedHeaders: string[] = ['chipId', 'media_uri', 'media_mime_type', 'name', 'description'];
  const optionalHeaders: string[] = ['notes'];

  try {
    await fs.promises.access(filePath);
  } catch (error) {
      console.error('Cannot locate or open file at:', filePath);
  }

  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    let headersValidated = false;

    fileStream
      .pipe(csv())
      .on('headers', (headers: string[]) => {
        headersValidated = true;

        // Validate headers
        const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
        const extraHeaders = headers.filter(header => ![...expectedHeaders, ...optionalHeaders].includes(header));

        if (missingHeaders.length > 0) {
          reject(new Error(`CSV is missing the following headers: ${missingHeaders.join(', ')}`));
        } else if (extraHeaders.length > 0) {
          reject(new Error(`CSV contains unexpected headers: ${extraHeaders.join(', ')}`));
        } else {
          resolve();
        }
      })
      .on('end', () => {
        if (!headersValidated) {
          reject(new Error('CSV file appears to be empty or malformed.'));
        }
      })
      .on('error', (err) => reject(new Error(`Error parsing CSV: ${err.message}`)));
  });
}

export async function renderImageInTerminal(imageUri: string, basePath: string = __dirname): Promise<void> {
  try {
      const imagePath = path.isAbsolute(imageUri) ? imageUri : path.join(basePath, imageUri);

      // Check if the file exists
      if (!fs.existsSync(imagePath)) {
          throw new Error(`Image file not found at path: ${imagePath}`);
      }

      const imageBuffer = fs.readFileSync(imagePath);

      // Specify the width in columns (e.g., 40 columns wide)
      const image = await terminalImage.buffer(imageBuffer, {
          width: 80,  // Width specified in number of terminal columns
          preserveAspectRatio: true
      });

      console.log(image);
  } catch (error) {
      console.error(`Failed to render image: ${error}`);
  }
}

