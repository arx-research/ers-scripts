import * as readline from 'readline';
import { BigNumber } from "ethers";
import { calculateSubnodeHash, ADDRESS_ZERO, ERSRegistry } from "@arx-research/ers-contracts/";

import { queryUser } from "../scriptHelpers";

export async function getProjectName(prompter: readline.ReadLine, ersRegistry: ERSRegistry): Promise<string> {
  const name = await queryUser(
    prompter,
    "What name would you like to give your project? In ERS this will create a subnode with the path [name].arx-playground.ers. "
  );

  if (name.length == 0) {
    throw Error(`Must define a project name`);
  }

  // Check that the namespace hasn't been taken
  const labelHash = calculateSubnodeHash(name + ".arxplayground.ers");
  const labelOwner = await ersRegistry.getOwner(labelHash);
  if (labelOwner != ADDRESS_ZERO) {
    console.log(`The name ${name} has already been taken. Please choose a different name.`);
    return await getProjectName(prompter, ersRegistry);
  }

  return name;
}

export async function getServiceTimelock(prompter: readline.ReadLine): Promise<BigNumber> {
  const rawTimelock = await queryUser(
    prompter,
    "How long do you want to lock-in the redirect URL for (in seconds)? After this time the chip holder can change the redirect URL, time period can be no longer than 2 years. "
  );
  
  const timelock = BigNumber.from(rawTimelock);

  const verifyInput = await queryUser(
    prompter,
    `Are you sure you want to set the lock-in period for ${timelock.div(86400).toString()} days? (y/n) `
  );

  if (verifyInput == 'n') {
    return await getServiceTimelock(prompter);
  }

  if (timelock.gt(31536000)) {
    console.log("Specified time period is too long. Please re-enter a valid time period.");
    return await getServiceTimelock(prompter);
  }

  // Calculate current timestamp and add timelock period to it to get the expiration timestamp
  const currentTimestamp = BigNumber.from(Math.floor(Date.now() / 1000));

  return currentTimestamp.add(timelock);
}

export async function getServiceId(prompter: readline.ReadLine): Promise<string> {
  const serviceId = await queryUser(
    prompter,
    `Which service ID would you like to set as primary service for your project enrollment? `
  );

  if(serviceId.slice(0, 2) != '0x' || serviceId.length != 66) {
    console.log("Not a valid Service ID, service ID must be a bytes32 hash");

    return await getServiceId(prompter);
  }

  return serviceId;
}

export async function getChipDataLocation(prompter: readline.ReadLine): Promise<string> {
  return await queryUser(
    prompter,
    `
    Since you are using localhost you must provide a path to the chip data file.
    What is the path to your chipData file? 
    `
  );
}

export async function getManufacturerValidationLocation(prompter: readline.ReadLine): Promise<string> {
  return await queryUser(
    prompter,
    `
    Since you are using localhost you must provide a path to your manufacturer validation files.
    What is the path to your manufacturer validation file? 
    `
  );
}

export async function getTokenURIData(prompter: readline.ReadLine): Promise<string> {
  const tokenURIRoot = await queryUser(
    prompter,
    "What's the tokenUri root for chips in the project? All chip metadata should be bundled at the same root. "
  );

  // If tokenURIRoot doesn't end in backslash then append backslash
  return tokenURIRoot[tokenURIRoot.length-1] == "/" ? tokenURIRoot : tokenURIRoot + "/";
}

export async function getPostToIpfs(prompter: readline.ReadLine): Promise<boolean> {
  const postToIPFS = await queryUser(
    prompter,
    "Do you want to post your project files to IPFS (y/n)? "
  );

  if (!["yes", "y", "no", "n"].includes(postToIPFS.toLowerCase())) {
    console.log("I'm sorry we could not understand that response. Reply with a yes/y or no/n. ");
    return getPostToIpfs(prompter);
  }

  return ["yes", "y"].includes(postToIPFS.toLowerCase());
}
