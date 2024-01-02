import * as readline from 'readline';
import { BigNumber } from "ethers";

import { queryUser } from "../scriptHelpers";

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

export async function getSaveToDB(prompter: readline.ReadLine): Promise<boolean> {
  const saveToDB = await queryUser(
    prompter,
    "Do you want to save your project files to the provided database (y/n)? "
  );

  if (!["yes", "y", "no", "n"].includes(saveToDB.toLowerCase())) {
    console.log("I'm sorry we could not understand that response. Reply with a yes/y or no/n. ");
    return getPostToIpfs(prompter);
  }

  return ["yes", "y"].includes(saveToDB.toLowerCase());
}

export async function getNumberOfChips(prompter: readline.ReadLine): Promise<BigNumber> {
  const rawNoChips = await queryUser(
    prompter,
    `How many chips do you want to include in your enrollment?
     If you have a JSON file with chip data, enter 0. `
  );
  
  const noChips = BigNumber.from(rawNoChips);

  const verifyInput = await queryUser(
    prompter,
    `Are you sure you want to scan ${noChips.toString()} chips? (y/n) `
  );

  if (verifyInput == 'n') {
    return await getNumberOfChips(prompter);
  }

  return noChips;
}
