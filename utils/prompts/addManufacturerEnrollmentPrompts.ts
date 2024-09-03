import * as readline from 'readline';
import { BigNumber } from "ethers";

import { queryUser } from "../scriptHelpers";

export async function getChainId(prompter: readline.ReadLine): Promise<number> {
  const chainId = await queryUser(
    prompter,
    `What chainId is the project being deployed on (optional: default is 31337 for localhost)? `
  );

  if (isNaN(parseInt(chainId))) {
    console.log("No chainId provided. Defaulting to 31337 for localhost.");
    return 31337;
  }

  return parseInt(chainId);
}

export async function getManufacturerSigner(prompter: readline.ReadLine): Promise<string> {
  const manufacturerSigner = await queryUser(
    prompter,
    `What is the address of the manufacturer signer? `
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
    console.log("Invalid manufacturerId. Please provide a valid address.");
    return getManufacturerId(prompter);
  }

  return manufacturerId;
}

export async function getAuthModel(prompter: readline.ReadLine): Promise<string> {
  const manufacturerAuthModel = await queryUser(
    prompter,
    `What is the chip auth model? `
  );

  if (manufacturerAuthModel.slice(0, 2) != '0x' || manufacturerAuthModel.length != 42) {
    console.log("Invalid manufacturer auth model. Please provide a valid address.");
    return getAuthModel(prompter);
  }

  return manufacturerAuthModel;
}

export async function getEnrollmentAuthModel(prompter: readline.ReadLine): Promise<string> {
  const manufacturerAuthModel = await queryUser(
    prompter,
    `What is the enrollment auth model? `
  );

  if (manufacturerAuthModel.slice(0, 2) != '0x' || manufacturerAuthModel.length != 42) {
    console.log("Invalid manufacturer auth model. Please provide a valid address.");
    return getEnrollmentAuthModel(prompter);
  }

  return manufacturerAuthModel;
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
