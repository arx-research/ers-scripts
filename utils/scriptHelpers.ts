import { ethers } from "ethers";
import { HaloGateway } from "@arx-research/libhalo/api/desktop.js";
import QRCode from 'qrcode';
import websocket from 'websocket';
import * as dotenv from 'dotenv';
import fs from "fs";
import { NFTStorage, Blob, File, CIDString } from "nft.storage";
import * as readline from 'readline';

import { ERSConfig } from '@arx-research/lib-ers/dist/types/src/types';
import { libErs as ERS } from '@arx-research/lib-ers';
import { Address } from "@arx-research/ers-contracts";

import { getDeployedContractAddress } from "./helpers";
import { KeysFromChipScan } from "../types/scripts";

dotenv.config();

export async function uploadFilesToIPFS(files: File[]): Promise<CIDString> {
  const nftStorageApiKey = process.env.NFT_STORAGE_API_KEY;
  if(!nftStorageApiKey){
    throw new Error("NFT_STORAGE_API_KEY environment variable not set");
  }

  const client = new NFTStorage({ token: nftStorageApiKey })
  const cid = await client.storeDirectory(files);
  return cid;
}

export async function saveFilesLocally(directoryRoot: string, files: File[]): Promise<void> {
  fs.mkdirSync(`task_outputs/${directoryRoot}`, { recursive: true });

  for (let i = 0; i < files.length; i++) {
    const filePath = `task_outputs/${directoryRoot}/${files[i].name}`;
    fs.writeFileSync(filePath, await files[i].text(), { flag: 'w' });
  }
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

export async function createERSInstance(hre: any): Promise<ERS> {
  const ersConfig: ERSConfig = {
    chipRegistry: getDeployedContractAddress(hre.network.name, "ChipRegistry"),
    servicesRegistry: getDeployedContractAddress(hre.network.name, "ServicesRegistry"),
    enrollmentManagerAddress: getDeployedContractAddress(hre.network.name, "ArxProjectEnrollmentManager"),
    ersRegistry: getDeployedContractAddress(hre.network.name, "ERSRegistry"),
    developerRegistrar: getDeployedContractAddress(hre.network.name, "ArxPlaygroundRegistrar"),
  };
  return new ERS(new ethers.providers.JsonRpcProvider(hre.network.config.url), ersConfig);
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
