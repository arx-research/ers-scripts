import * as readline from 'readline';
import { Address } from "@arx-research/ers-contracts/";

import { queryUser } from "../scriptHelpers";
import axios from 'axios';

export async function getDeveloperNameApproval(prompter: readline.ReadLine, developerOwner: Address): Promise<[string, string]> {
  const name = await queryUser(
    prompter,
    "What name would you like to register as a developer? In ERS this will create a subnode with the path [name].ers. "
  );

  if (name.length == 0) {
    throw Error(`Must define a project name`);
  }

  let res;
  try {
    res = await axios.post(
      `${process.env.NAME_APPROVER_ENDPOINT}sign-message`,
      {developerOwner, name},
      {headers: {'Content-Type': 'application/json',}}
    );
  } catch (e) {
    console.log(`The name ${name} has already been taken or is reserved. Please choose a different name.`);
    return await getDeveloperNameApproval(prompter, developerOwner);
  }

  return [res.data.signature, res.data.nameHash];
}
