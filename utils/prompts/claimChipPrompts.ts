import * as readline from 'readline';
import { ethers } from "ethers";
import { ADDRESS_ZERO, AuthenticityProjectRegistrar, calculateLabelHash, ERSRegistry } from "@arx-research/ers-contracts/";

import { queryUser } from "../scriptHelpers";

// export async function getProjectEnrollmentDataLocation(prompter: readline.ReadLine): Promise<string> {
//   const providePath = await queryUser(
//     prompter,
//     `
//     Since you are using localhost we cannot get chip info from the 3668 gateway. Can you provide
//     `
//   );

//   if (["yes", "y"].includes(providePath.toLowerCase())) {
//     return queryUser(
//       prompter,
//       "Please provide the path to the chip data file. "
//     );
//   }

//   if (!["yes", "y", "no", "n"].includes(providePath.toLowerCase())) {
//     console.log("I'm sorry we could not understand that response. Reply with a yes/y or no/n. ");
//     return getChipClaimDataLocation(prompter);
//   }

//   return "";
// }

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
