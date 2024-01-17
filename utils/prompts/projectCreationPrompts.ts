import * as readline from 'readline';
import { BigNumber } from "ethers";
import {
  ADDRESS_ZERO,
  calculateLabelHash,
  calculateSubnodeHash,
  DeveloperRegistrar,
  ERSRegistry,
} from "@arx-research/ers-contracts/";

import { queryUser } from "../scriptHelpers";

export async function getUserDeveloperRegistrar(prompter: readline.ReadLine): Promise<string> {
  const hasDeveloperRegistrar = await queryUser(
    prompter,
    "Are you registered as a developer in ERS and have deployed your own DeveloperRegistrar? (y/n) "
  );

  if (!["yes", "y", "no", "n"].includes(hasDeveloperRegistrar.toLowerCase())) {
    console.log("I'm sorry we could not understand that response. Reply with a yes/y or no/n. ");
    return getUserDeveloperRegistrar(prompter);
  }

  if (["no", "n"].includes(hasDeveloperRegistrar.toLowerCase())) {
    return ADDRESS_ZERO;
  }

  return queryUser(
    prompter,
    "What is the address of your DeveloperRegistrar? "
  );
}

export async function getProjectName(
  prompter: readline.ReadLine,
  ersRegistry: ERSRegistry,
  developerRegistrar: DeveloperRegistrar
): Promise<string> {
  const name = await queryUser(
    prompter,
    "What name would you like to give your project? "
  );

  if (name.length == 0) {
    throw Error(`Must define a project name`);
  }

  // Check that the namespace hasn't been taken
  let labelOwner;
  if (developerRegistrar.address != ADDRESS_ZERO) {
    const developerRootnode = await developerRegistrar.rootNode();
    labelOwner = await ersRegistry.getSubnodeOwner(developerRootnode, calculateLabelHash(name));
  } else {
    const userSubnodeHash = calculateSubnodeHash(name + ".arxplayground.ers");
    labelOwner = await ersRegistry.getOwner(userSubnodeHash);
  }
  if (labelOwner != ADDRESS_ZERO) {
    console.log(`The name ${name} has already been taken. Please choose a different name.`);
    return await getProjectName(prompter, ersRegistry, developerRegistrar);
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

  // lib-ers adds the slash when generating the tokenURI, so we need to remove it if it's there
  return tokenURIRoot[tokenURIRoot.length-1] == "/" ? tokenURIRoot.slice(0,-1) : tokenURIRoot;
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
