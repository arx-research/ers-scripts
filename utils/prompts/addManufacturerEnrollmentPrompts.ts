import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { BigNumber } from "ethers";

import { queryUser } from "../scriptHelpers";

export async function getManufacturerSigner(prompter: readline.ReadLine): Promise<string> {
  const manufacturerSigner = await queryUser(
    prompter,
    `What is the address of the manufacturer signer for this enrollment? `
  );

  if (manufacturerSigner.slice(0, 2) != '0x' || manufacturerSigner.length != 42) {
    console.log("Invalid manufacturer signer address. Please provide a valid address.");
    return getManufacturerSigner(prompter);
  }

  return manufacturerSigner;
}

export async function getManufacturerId(prompter: readline.ReadLine): Promise<string> {
  const manufacturerId = await queryUser(
    prompter,
    `What is the manufacturerId? `
  );

  if (manufacturerId.slice(0, 2) != '0x' || manufacturerId.length != 66) {
    console.log("Invalid manufacturerId. Please provide a valid bytes32 hex string.");
    return getManufacturerId(prompter);
  }

  return manufacturerId;
}

// TODO: update this given that the $chainId folder is the correpsonding chain name -- perhaps we can get this from hardhat.config.ts
export async function getAuthModel(prompter: readline.ReadLine, networkName: string): Promise<string> {
  let defaultAuthModel = '';
  const deploymentFilePath = path.join(__dirname, `../../deployments/${networkName}/SECP256k1Model.json`);

  if (fs.existsSync(deploymentFilePath)) {
    const deploymentData = JSON.parse(fs.readFileSync(deploymentFilePath, 'utf8'));
    defaultAuthModel = deploymentData.address;
  }

  const promptMessage = defaultAuthModel
    ? `What is the chip auth model? (default for ${networkName}: ${defaultAuthModel}) `
    : `What is the chip auth model? `;

  let manufacturerAuthModel = await queryUser(prompter, promptMessage);

  if (!manufacturerAuthModel && defaultAuthModel) {
    manufacturerAuthModel = defaultAuthModel;
  }

  if (manufacturerAuthModel.slice(0, 2) != '0x' || manufacturerAuthModel.length != 42) {
    console.log("Invalid manufacturer auth model. Please provide a valid address.");
    return getAuthModel(prompter, networkName);
  }

  return manufacturerAuthModel;
}

// TODO: update this given that the $chainId folder is the correpsonding chain name -- perhaps we can get this from hardhat.config.ts
export async function getEnrollmentAuthModel(prompter: readline.ReadLine, networkName: string): Promise<string> {
  let defaultEnrollmentAuthModel = '';
  const deploymentFilePath = path.join(__dirname, `../../deployments/${networkName}/EnrollmentEIP191Model.json`);

  if (fs.existsSync(deploymentFilePath)) {
    const deploymentData = JSON.parse(fs.readFileSync(deploymentFilePath, 'utf8'));
    defaultEnrollmentAuthModel = deploymentData.address;
  }

  const promptMessage = defaultEnrollmentAuthModel
    ? `What is the enrollment auth model? (default for ${networkName}: ${defaultEnrollmentAuthModel}) `
    : `What is the enrollment auth model? `;

  let enrollmentAuthModel = await queryUser(prompter, promptMessage);

  if (!enrollmentAuthModel && defaultEnrollmentAuthModel) {
    enrollmentAuthModel = defaultEnrollmentAuthModel;
  }

  if (enrollmentAuthModel.slice(0, 2) != '0x' || enrollmentAuthModel.length != 42) {
    console.log("Invalid enrollment auth model. Please provide a valid address.");
    return getEnrollmentAuthModel(prompter, networkName);
  }

  return enrollmentAuthModel;
}

export async function getBootloaderApp(prompter: readline.ReadLine): Promise<string> {
  const bootloaderApp = await queryUser(
    prompter,
    `What is the bootloader app URI? `
  );

  if (bootloaderApp.length == 0) {
    console.log("Invalid bootloader app. Please provide a valid URI.");
    return getBootloaderApp(prompter);
  }

  return bootloaderApp;
}

export async function getChipModel(prompter: readline.ReadLine): Promise<string> {
  const chipModel = await queryUser(
    prompter,
    `What is the chip model? `
  );

  if (chipModel.length == 0) {
    console.log("Invalid chip model. Please provide a valid model.");
    return getChipModel(prompter);
  }

  return chipModel;
}
