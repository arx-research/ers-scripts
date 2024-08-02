import { ethers } from "ethers";
import { HaloGateway } from "@arx-research/libhalo/api/desktop.js";
import axios from "axios";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import QRCode from 'qrcode';
import websocket from 'websocket';
import * as dotenv from 'dotenv';
import fs from "fs";
import { NFTStorage, File, CIDString } from "nft.storage";
import * as readline from 'readline';

import { libErs as ERS, ERSConfig } from '@arx-research/lib-ers';
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
  ManufacturerValidationInfo,
  PBTSimpleProjectRegistrar__factory,
  PBTSimpleProjectRegistrar,
} from "@arx-research/ers-contracts";

import { getDeployedContractAddress } from "./helpers";
import { KeysFromChipScan } from "../types/scripts";

dotenv.config();

export async function uploadFilesToIPFS(files: File[]): Promise<CIDString> {
  const nftStorageApiKey = process.env.NFT_STORAGE_API_KEY;
  if(!nftStorageApiKey){
    throw new Error("NFT_STORAGE_API_KEY environment variable not set");
  }

  const client = new NFTStorage({ token: nftStorageApiKey })
  // const cid = await client.storeDirectory(files);
  const { cid, car } = await NFTStorage.encodeDirectory(files)
  console.log(`File CID: ${cid}`)

  console.log('Sending file...')
  await client.storeCar(car, {
    maxChunkSize: 1024 * 1024 * 25, // 25MB
    onStoredChunk: (size) => console.log(`Stored a chunk of ${size} bytes`)
  })

  return cid as unknown as CIDString;
}

export async function saveFilesLocally(directoryRoot: string, files: File[]): Promise<void> {
  fs.mkdirSync(`task_outputs/${directoryRoot}`, { recursive: true });

  for (let i = 0; i < files.length; i++) {
    const filePath = `task_outputs/${directoryRoot}/${files[i].name}`;
    fs.writeFileSync(filePath, await files[i].text(), { flag: 'w' });
  }
}

export function createIpfsAddress(cid: CIDString): string {
  return `ipfs://${cid}`;
}

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

export async function getChipSigWithGateway(gate: any, message: string): Promise<any> {

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
    "typedData": typedData,
    "keyNo": 1
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

export async function createERSInstance(hre: any): Promise<ERS> {
  const ersConfig: ERSConfig = {
    chipRegistry: getDeployedContractAddress(hre.network.name, "ChipRegistry") as `0x${string}`,
    servicesRegistry: getDeployedContractAddress(hre.network.name, "ServicesRegistry") as `0x${string}`,
    enrollmentManagerAddress: getDeployedContractAddress(hre.network.name, "ArxProjectEnrollmentManager") as `0x${string}`,
    ersRegistry: getDeployedContractAddress(hre.network.name, "ERSRegistry") as `0x${string}`,
    developerRegistrar: getDeployedContractAddress(hre.network.name, "ArxPlaygroundRegistrar") as `0x${string}`,
  };
  // console.log(await hre.viem.getWalletClients());
  return new ERS((await hre.viem.getWalletClients())[0], ersConfig);
}

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
