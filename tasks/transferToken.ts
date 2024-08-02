import { BigNumber, ethers } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE, HardhatRuntimeEnvironment } from "hardhat/types";
import {
  Address,
  calculateLabelHash,
  ManufacturerValidationInfo
} from "@arx-research/ers-contracts";

import {
  getChipPublicKeys,
  getChipSigWithGateway,
  getERSRegistry,
  getChipRegistry,
  getProjectRegistrar,
  instantiateGateway,
  rl
} from "../utils/scriptHelpers";
import { ChipInfo } from "../types/scripts";
// import { getChipName } from "../utils/prompts/claimChipPrompts";

task("transferChip", "Transfer a chip PBT enrolled in an ERS project")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    
    const gate = await instantiateGateway();
    const { chipOwner } = await hre.getNamedAccounts();
    
    const chipRegistry = await getChipRegistry(hre, chipOwner);

    let params: ChipInfo = await getAndValidateParams(hre, gate, chipOwner);

    const chipInfo = await chipRegistry.chipEnrollments(params.chipId);
    params.nameHash = chipInfo.nameHash;
    params.projectRegistrar = chipInfo.projectRegistrar;
    params.enrollmentId = chipInfo.manufacturerEnrollmentId;

    const projectRegistrar = await getProjectRegistrar(hre, chipOwner, params.projectRegistrar);
    
    const chainId = BigNumber.from(await hre.getChainId());
    const commitBlock = BigNumber.from(await hre.ethers.provider.getBlockNumber());

    const packedMsg = ethers.utils.solidityPack(
      ["uint256", "uint256", "bytes32", "address"],
      [chainId, commitBlock, params.nameHash, chipOwner]
  );
  
  console.log(`Please scan your chip to create the chip ownership proof for ${params.chipId}...`);
  const chipOwnershipProof = (await getChipSigWithGateway(gate, packedMsg)).signature;


    // TODO: change to transferToken tx
    console.log(`Submitting transfer for ${params.chipId}...`);
    await rawTx({
      from: chipOwner,
      to: projectRegistrar.address,
      data: projectRegistrar.interface.encodeFunctionData(
        "transferToken",
        [
          params.chipId,
          chipOwnershipProof,
          commitBlock,
          false,
          "0x" // Assuming payload is empty; change if necessary
        ]
      )
    });
  });

  async function getAndValidateParams(
    hre: HardhatRuntimeEnvironment,
    gate: any,
    signerAddress: Address
  ): Promise<ChipInfo> {
    let params: ChipInfo = {} as ChipInfo;

    console.log("Grabbing chipId...scan chip please");
    const [chipId,, ] = await getChipPublicKeys(gate);

    return params;
  }

