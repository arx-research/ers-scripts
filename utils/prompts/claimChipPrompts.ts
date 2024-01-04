import * as readline from 'readline';
import { ethers } from "ethers";
import { ADDRESS_ZERO, AuthenticityProjectRegistrar, calculateLabelHash, ERSRegistry } from "@arx-research/ers-contracts/";

import { queryUser } from "../scriptHelpers";

export async function getChipName(
  prompter: readline.ReadLine,
  ersRegistry: ERSRegistry,
  projectRegistrar: AuthenticityProjectRegistrar,
): Promise<string> {
  const name = await queryUser(
    prompter,
    "What name would you like to give your chip? "
  );

  if (name.length == 0) {
    throw Error(`Must define a name`);
  }

  // Check that the namespace hasn't been taken
  const labelHash = calculateLabelHash(name);
  const node = await projectRegistrar.rootNode();
  const packed = ethers.utils.solidityPack(["bytes32", "bytes32"], [node, labelHash]);

  const chipNode = ethers.utils.keccak256(packed);
  const labelOwner = await ersRegistry.getOwner(chipNode);
  if (labelOwner != ADDRESS_ZERO) {
    console.log(`The name ${name} has already been taken. Please choose a different name.`);
    return await getChipName(prompter, ersRegistry, projectRegistrar);
  }

  return name;
}
