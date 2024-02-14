import * as readline from 'readline';
import { BigNumber } from "ethers";

import { queryUser } from "../scriptHelpers";

export async function getPostToIpfs(prompter: readline.ReadLine): Promise<boolean> {
  const postToIPFS = await queryUser(
    prompter,
    "Do you want to post your project files to IPFS (y/n)?"
  );

  if (!["yes", "y", "no", "n"].includes(postToIPFS.toLowerCase())) {
    console.log("I'm sorry we could not understand that response. Reply with a yes/y or no/n. ");
    return getPostToIpfs(prompter);
  }

  return ["yes", "y"].includes(postToIPFS.toLowerCase());
}

export async function getChipData(prompter: readline.ReadLine): Promise<BigNumber> {
  const preScanned = await checkPrescanChips(prompter);

  if (preScanned) {
    return BigNumber.from(0);
  }

  // If chips have not been prescanned, ask how many chips to scan
  return getNumberOfChips(prompter);
}

async function getNumberOfChips(prompter: readline.ReadLine): Promise<BigNumber> {
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

async function checkPrescanChips(prompter: readline.ReadLine): Promise<boolean> {
  const preScanned = await queryUser(
    prompter,
    `Have you prescanned your chips and included them in the params file? (y/n) `
  );
  
  // Ask if chips have been prescanned, if so then return 0
  if (!["yes", "y", "no", "n"].includes(preScanned.toLowerCase())) {
    console.log("I'm sorry we could not understand that response. Reply with a yes/y or no/n. ");
    return checkPrescanChips(prompter);
  }
  
  return ["yes", "y"].includes(preScanned.toLowerCase());
}
