import * as readline from 'readline';
import { Address, calculateLabelHash } from "@arx-research/ers-contracts/";

import { queryUser } from "../scriptHelpers";
import axios from 'axios';
import { BigNumberish } from 'ethers';

export async function getDeveloperNameApproval(prompter: readline.ReadLine, developerOwner: Address, chainId: BigNumberish, verifyingContract: Address): Promise<[string, string, string, string]> {
  console.log(`Note: ${process.env.NAME_APPROVER_ENDPOINT} is set as the name approver endpoint.`)
  const chainIdString = chainId.toString(); 
  const name = await queryUser(
    prompter,
    "What name would you like to register as a developer? In ERS this will create a subnode with the path [name].ers. "
  );

  if (name.length == 0) {
    throw Error(`Must define a project name`);
  }

  const isManuallyApproved = await queryUser(
    prompter,
    "Has this name been manually approved? (y/n, default: n) "
  );

  if (isManuallyApproved.toLowerCase() === 'y' || isManuallyApproved.toLowerCase() === 'yes') {
    // Return empty values for approval proof and timestamp since name is already approved
    const nameHash = calculateLabelHash(name);
    return ["", "0", nameHash, name];
  }

  let res;
  try {
    res = await axios.post(
      `${process.env.NAME_APPROVER_ENDPOINT}/sign-message`,
      {developerOwner, name, chainId: chainIdString, verifyingContract},
      {headers: {'Content-Type': 'application/json',}}
    );
  } catch (e) {
    console.log(`The name ${name} has already been taken or is reserved. Please choose a different name.`);
    return await getDeveloperNameApproval(prompter, developerOwner, chainId, verifyingContract  );
  }

  return [res.data.signature, res.data.proofTimestamp, res.data.nameHash, name];
}
