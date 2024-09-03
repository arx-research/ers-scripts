import { BigNumber, ethers } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE, HardhatRuntimeEnvironment } from "hardhat/types";
import {
  Address,
} from "@arx-research/ers-contracts";

import {
  getChipPublicKeys,
  getChipMessageSigWithGateway,
  getChipRegistry,
  getProjectRegistrar,
  instantiateGateway,
  rl
} from "../utils/scriptHelpers";
import { ChipInfo } from "../types/scripts";
// import { getChipName } from "../utils/prompts/claimChipPrompts";

task("transferToken", "Transfer a chip PBT enrolled in an ERS project")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    
    const gate = await instantiateGateway();
    const { chipOwner } = await hre.getNamedAccounts();
    console.log(`Desired new chip owner set to: ${chipOwner} (modify this in hardhat.config.ts if necessary)`)
    
    const chipRegistry = await getChipRegistry(hre, chipOwner);

    let params: ChipInfo = await getAndValidateParams(hre, gate, chipOwner);

    const chipInfo = await chipRegistry.chipEnrollments(params.chipId);

    const oldOwner = await chipRegistry.ownerOf(params.chipId);
    console.log(`Current owner of chip ${params.chipId} is: ${oldOwner}`);
    
    console.log(JSON.stringify(chipInfo));
    params.nameHash = chipInfo[0]; // bytes32 nameHash
    params.projectRegistrar = chipInfo[1]; // address projectRegistrar
    params.enrollmentId = chipInfo[2]; // bytes32 manufacturerEnrollmentId

    const projectRegistrar = await getProjectRegistrar(hre, chipOwner, params.projectRegistrar);
    
    const commitBlock = await hre.ethers.provider.getBlock("latest");

    const packedMsg = ethers.utils.solidityPack(
      ["address", "bytes32", "bytes"],
      [chipOwner, commitBlock.hash, "0x"]
    );

    console.log(`Please scan your chip to create the chip ownership proof for ${params.chipId}...`);
    const chipOwnershipProof = (await getChipMessageSigWithGateway(gate, packedMsg)).signature.ether;

    console.log(`Submitting transfer for ${params.chipId}...`);
    await rawTx({
      from: chipOwner,
      to: projectRegistrar.address,
      data: projectRegistrar.interface.encodeFunctionData(
        "transferToken",
        [
          params.chipId,
          chipOwnershipProof,
          commitBlock.number,
          false,
          "0x" // Assuming payload is empty; change if necessary
        ]
      )
    });

    // Final check to verify the new owner
    const newOwner = await chipRegistry.ownerOf(params.chipId);

    // Ensure the desired new owner is the actual new owner
    if (newOwner === chipOwner) {
      console.log(`Ownership transfer successful. New owner is: ${newOwner}`);
    } else {
      console.log(`Ownership transfer failed.`);
    }
  });

  async function getAndValidateParams(
    hre: HardhatRuntimeEnvironment,
    gate: any,
    signerAddress: Address
  ): Promise<ChipInfo> {
    let params: ChipInfo = {} as ChipInfo;

    console.log("Grabbing chipId...scan chip please");
    const [chipId,, ] = await getChipPublicKeys(gate);
    params.chipId = chipId;

    return params;
  }

