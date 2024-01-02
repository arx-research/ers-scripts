import { BigNumber, ethers } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE, HardhatRuntimeEnvironment } from "hardhat/types";
import {
  Address,
  calculateLabelHash,
} from "@arx-research/ers-contracts";

import {
  getChipPublicKeys,
  getChipInfoFromGateway,
  getChipSigWithGateway,
  getERSRegistry,
  getProjectRegistrar,
  instantiateGateway,
  rl
} from "../utils/scriptHelpers";
import { ClaimChip, ManufacturerEnrollmentIPFS, ProjectEnrollmentIPFS } from "../types/scripts";
import { getChipName } from "../utils/prompts/claimChipPrompts";

task("claimChip", "Claim a chip enrolled in a ERS project")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    
    const gate = await instantiateGateway();
    const { chipOwner } = await hre.getNamedAccounts();
    let params: ClaimChip = await getAndValidateParams(hre, gate, chipOwner);

    const projectRegistrar = await getProjectRegistrar(hre, chipOwner, params.projectEnrollment.projectRegistrar);

    const chainId = BigNumber.from(await hre.getChainId());
    const commitBlock = BigNumber.from(await hre.ethers.provider.getBlockNumber());
    const nameHash = calculateLabelHash(params.name);

    const packedMsg = ethers.utils.solidityPack(["uint256", "uint256", "bytes32", "address"], [chainId, commitBlock, nameHash, chipOwner]);
    console.log(`Please scan your chip to create the chip ownership proof for ${params.chipId}...`);
    const chipOwnershipProof = (await getChipSigWithGateway(gate, packedMsg)).signature.ether;

    console.log(`Submitting claim for ${params.chipId}...`);
    await rawTx({
      from: chipOwner,
      to: projectRegistrar.address,
      data: projectRegistrar.interface.encodeFunctionData(
        "claimChip",
        [
          params.chipId,
          nameHash,
          params.projectEnrollment.developerMerkleInfo,
          params.manufacturerEnrollment.validationInfo,
          commitBlock,
          chipOwnershipProof,
          params.projectEnrollment.developerCertificate,
          params.projectEnrollment.custodyProof
        ]
      )
    });
  });

  async function getAndValidateParams(
    hre: HardhatRuntimeEnvironment,
    gate: any,
    signerAddress: Address
  ): Promise<ClaimChip> {
    let params: ClaimChip = {} as ClaimChip;

    console.log("Grabbing chipId...scan chip please");
    const [chipId,, ] = await getChipPublicKeys(gate);

    let projectEnrollmentInfo: ProjectEnrollmentIPFS = {} as ProjectEnrollmentIPFS;
    let manufacturerEnrollmentInfo: ManufacturerEnrollmentIPFS = {} as ManufacturerEnrollmentIPFS;
    if (hre.network.name == "localhost") {
      console.log("Fetching Project and Manufacturer data from local files...");

      manufacturerEnrollmentInfo = JSON.parse(fs.readFileSync(`task_outputs/manufacturerEnrollments/localhost/${chipId}.json`, 'utf-8'));
      projectEnrollmentInfo = JSON.parse(fs.readFileSync(`task_outputs/projectEnrollments/localhost/${chipId}.json`, 'utf-8'));
    } else {
      console.log("Fetching Project and Manufacturer data for your chip from 3668 gateway...");

      [ projectEnrollmentInfo, manufacturerEnrollmentInfo ] = await getChipInfoFromGateway(chipId);
    }

    if (projectEnrollmentInfo == {} as ProjectEnrollmentIPFS && manufacturerEnrollmentInfo == {} as ManufacturerEnrollmentIPFS) {
      throw Error(`Chip ${chipId} has not been enrolled in ERS`);
    }

    if (projectEnrollmentInfo == {} as ProjectEnrollmentIPFS) {
      throw Error(`Chip ${chipId} has not been enrolled in a project`);
    }

    params.projectEnrollment = projectEnrollmentInfo;
    params.manufacturerEnrollment = manufacturerEnrollmentInfo;
    params.chipId = chipId;
    params.name = await getChipName(
      rl,
      await getERSRegistry(hre, signerAddress),
      await getProjectRegistrar(hre, signerAddress, projectEnrollmentInfo.projectRegistrar)
    );

    return params;
  }

