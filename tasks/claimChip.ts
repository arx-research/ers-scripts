import { BigNumber, ethers } from "ethers";
import * as fs from 'fs';
import axios from "axios";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import {
  Address,
  calculateLabelHash,
  AuthenticityProjectRegistrar,
  AuthenticityProjectRegistrar__factory
} from "@arx-research/ers-contracts";

import { getDeployedContractAddress } from "../utils/helpers";
import { getChipPublicKeys, getChipSigWithGateway, instantiateGateway } from "../utils/scriptHelpers";
import { ProjectEnrollmentIPFS, ManufacturerEnrollmentIPFS, ClaimChip } from "../types/scripts";

task("claimChip", "Claim a chip enrolled in a ERS project")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;

    let params: ClaimChip = getAndValidateParams();
    const { chipOwner } = await hre.getNamedAccounts();

    const gate = await instantiateGateway();
    console.log("Grabbing chipId...scan chip please");
    const [chipId,, ] = await getChipPublicKeys(gate);

    const chipIdManufacturerInfo: ManufacturerEnrollmentIPFS = await getChipManufacturerValidation(chipId);
    const chipIdClaimInfo: ProjectEnrollmentIPFS = await getChipClaimData(chipId);

    const projectRegistrar = await getProjectRegistrar(chipIdClaimInfo.projectRegistrar);
    console.log(`Fetching claim data from IPFS for ${chipId}...`);
    const chainId = BigNumber.from(await hre.getChainId());
    const commitBlock = BigNumber.from(await hre.ethers.provider.getBlockNumber());
    const nameHash = calculateLabelHash(params.name);

    const packedMsg = ethers.utils.solidityPack(["uint256", "uint256", "bytes32", "address"], [chainId,commitBlock, nameHash, chipOwner]);
    console.log(`Creating chip ownership proof for ${chipId}...`);
    const chipOwnershipProof = (await getChipSigWithGateway(gate, packedMsg)).signature.ether;
    console.log(`Submitting claim for ${chipId}...`);
    await rawTx({
      from: chipOwner,
      to: projectRegistrar.address,
      data: projectRegistrar.interface.encodeFunctionData(
        "claimChip",
        [
          chipId,
          nameHash,
          chipIdClaimInfo.developerMerkleInfo,
          chipIdManufacturerInfo.validationInfo,
          commitBlock,
          chipOwnershipProof,
          chipIdClaimInfo.developerCertificate,
          chipIdClaimInfo.custodyProof
        ]
      )
    });

    async function getProjectRegistrar(projectRegistrarAddress: Address): Promise<AuthenticityProjectRegistrar> {
      const signer = await hre.ethers.getSigner(chipOwner);
      const projectRegistrar = new AuthenticityProjectRegistrar__factory(signer).attach(projectRegistrarAddress);
      return projectRegistrar;
    }

    async function getChipManufacturerValidation(chip: Address): Promise<ManufacturerEnrollmentIPFS> {
      if (params.manufacturerValidationLocation.slice(0, 5) == 'https') {
        return (await axios.get(params.manufacturerValidationLocation + `${chip}.json`)).data;
      } else {
        return JSON.parse(
          fs.readFileSync(params.manufacturerValidationLocation + `${chip}.json`, 'utf-8')
        );
      }
    }

    async function getChipClaimData(chip: Address): Promise<ProjectEnrollmentIPFS> {
      if (params.chipClaimDataLocation.slice(0, 5) == 'https') {
        return (await axios.get(params.chipClaimDataLocation + `${chip}.json`)).data;
      } else {
        return JSON.parse(
          fs.readFileSync(params.chipClaimDataLocation + `${chip}.json`, 'utf-8')
        );
      }
    }
  });

  function getAndValidateParams(): ClaimChip {
    let params: ClaimChip = JSON.parse(fs.readFileSync('./task_params/claimChip.json', 'utf-8'));

    if (params.name.length == 0) {
      throw Error(`Must define a name for your chip`);
    }

    if (params.manufacturerValidationLocation.length == 0) {
      throw Error(`Must define a manufacturer validation location`);
    }
  
    if (params.chipClaimDataLocation.length == 0) {
      throw Error(`Must define a chip claim data location`);
    }
  
    return params;
  }

