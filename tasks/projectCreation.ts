import axios from 'axios';
import { ethers, BigNumber, providers, Overrides } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";

import { CIDString, File } from "nft.storage";

import { libErs as ERS } from '@arx-research/lib-ers';
import { ChipInfo } from "@arx-research/lib-ers/dist/types/src/types";
import {
  Address,
  ArxProjectEnrollmentManager__factory,
  calculateLabelHash,
  TSMMerkleProofInfo,
  calculateProjectRegistrarAddress
} from "@arx-research/ers-contracts/";

import { createERSInstance, getChipSigWithGateway, instantiateGateway, saveFilesLocally, uploadFilesToIPFS } from "../utils/scriptHelpers";
import { CreateProject, ManufacturerEnrollmentIPFS, ProjectEnrollmentIPFS } from "../types/scripts";
import { getDeployedContractAddress } from '../utils/helpers';
import { MAX_BLOCK_WINDOW } from "../utils/constants";

task("createProject", "Create a new project using the ArxProjectEnrollmentManager")
  .addParam("post", "Post resulting data to IPFS", undefined, undefined, true)
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const { post } = taskArgs;

    const { projectPublicKey, projectOwner } = await hre.getNamedAccounts();
    let params: CreateProject = getAndValidateParams();

    const ersInstance: ERS = await createERSInstance(hre);

    // Create merkle tree by grabbing any enrollment files.
    const chipInfo: ChipInfo[] = JSON.parse(fs.readFileSync(params.chipDataLocation, 'utf-8'));

    console.log(`Adding ${chipInfo.length} chips...`);

    await ersInstance.projectCreation.createTSMMerkleTree(
      chipInfo,
      params.tokenUriRoot,
      BigNumber.from(params.lockinPeriod),
      params.serviceId
    );

    const gate = await instantiateGateway();

    // Create certificates (ownershipProof and tsmCertificate)
    const { tsmCertificates, ownershipProofs } = await createCertificates();

    // Get deterministic project registrar address
    const projectRegistrarAddress = calculateProjectRegistrarAddress(
      getDeployedContractAddress(hre.network.name, "ArxProjectEnrollmentManager"),
      ersInstance.projectCreation.tsmTree.getHexRoot(),
      [
        projectOwner,
        getDeployedContractAddress(hre.network.name, "ChipRegistry"),
        getDeployedContractAddress(hre.network.name, "ERSRegistry"),
        getDeployedContractAddress(hre.network.name, "ArxPlaygroundRegistrar"),
        MAX_BLOCK_WINDOW[hre.network.name]
      ]
    );

    // Post to IPFS / Save locally
    let chipValidationDataUri: CIDString = await generateAndSaveProjectEnrollmentFiles();
    
    console.log(`Project enrollment files created and saved at ${chipValidationDataUri}`);
    
    // Create chip ownership proof
    const chainId = BigNumber.from(await hre.getChainId());
    const packedMsg = ethers.utils.solidityPack(["uint256", "address"], [chainId, projectOwner]);
    console.log(`Awaiting chip action on smartphone to generate ownership proof...`);
    const response = await getChipSigWithGateway(gate, packedMsg);

    const chipOwnershipProof = response.signature.ether;
    const provingChip = response.etherAddress;
    console.log(`Proving chip ownership proof created with chipId: ${provingChip}`);

    // Create project ownership proof
    const projectOwnershipProof = await createProjectOwnershipMessage(projectRegistrarAddress);

    // Get Manufacturer Validation Info (Need to make this also able to grab from IPFS if necessary)
    const provingChipManufacturerInfo: ManufacturerEnrollmentIPFS = await getProvingChipManufacturerValidation(provingChip);

    await addProject();

    console.log(`New ProjectRegistrar deployed at ${projectRegistrarAddress}`);

    async function createCertificates(): Promise<any> {
      const certSigner = await hre.ethers.getSigner(projectPublicKey);
      const tsmCertificates: string[] = [];
      for (let i = 0; i < chipInfo.length; i++) {
        const packedCert = ethers.utils.solidityPack(["address"], [chipInfo[i].chipId]);
        tsmCertificates.push(await certSigner.signMessage(ethers.utils.arrayify(packedCert)));
      }

      const ownershipProofs: string[] = new Array<string>(chipInfo.length);
      const message = ethers.utils.solidityPack(["address"], [projectPublicKey]);     
      for (let i = 0; i < chipInfo.length; i++) {
        const sig = await getChipSigWithGateway(gate, message);
        const index = chipInfo.findIndex(item => item.chipId == sig.etherAddress);
        
        if (index == -1) {
          console.log(`Could not find chipId ${sig.etherAddress} in chipInfo`);
          i -= 1;
          continue
        };

        if (ownershipProofs[index]) {
          console.log(`ChipId ${chipInfo[i].chipId} already has an custody proof`);
          i -= 1;
          continue
        }

        console.log(`Custody proof created for chipId: ${chipInfo[i].chipId}`)
        ownershipProofs[index] = sig.signature.ether;
      }
      return { tsmCertificates, ownershipProofs };
    }

    async function generateAndSaveProjectEnrollmentFiles(): Promise<CIDString> {
      let chipValidationDataUri: CIDString;
      const tsmValidationFiles = _generateProjectEnrollmentFiles(ersInstance, tsmCertificates, ownershipProofs);
      if (post) {
        chipValidationDataUri = await uploadFilesToIPFS(tsmValidationFiles);
        saveFilesLocally("projectEnrollment", tsmValidationFiles);
      } else {
        saveFilesLocally("projectEnrollment", tsmValidationFiles);
        chipValidationDataUri = "ipfs://blank"; 
      }

      return chipValidationDataUri;
    }

    function _generateProjectEnrollmentFiles(
      ers: ERS,
      certificates: string[],
      ownershipProof: string[]
    ): File[] {
      let projectEnrollmentFiles: File[] = [];
      for (let i = 0; i < ers.projectCreation.treeData.length; i++) {
        const chipData = ers.projectCreation.treeData[i];
        let chipValidationInfo: TSMMerkleProofInfo = {
          tsmIndex: BigNumber.from(i),
          serviceId: chipData.primaryServiceId,
          lockinPeriod: chipData.lockinPeriod,
          tokenUri: chipData.tokenUri,
          tsmProof: ers.projectCreation.tsmTree.getProof(i, chipData),
        };
  
        let projectEnrollment: ProjectEnrollmentIPFS = {
          enrollmentId: chipData.enrollmentId,
          projectRegistrar: projectRegistrarAddress,
          TSMMerkleInfo: chipValidationInfo,
          tsmCertificate: certificates[i],
          custodyProof: ownershipProof[i]
        };
        projectEnrollmentFiles.push(new File([JSON.stringify(projectEnrollment)], `${chipData.chipId}.json`, { type: 'application/json' }));
      }
    
      return projectEnrollmentFiles;
    }

    async function getProvingChipManufacturerValidation(chip: Address): Promise<ManufacturerEnrollmentIPFS> {
      if (params.manufacturerValidationLocation.slice(0, 5) == 'https') {
        return (await axios.get(params.manufacturerValidationLocation + `${provingChip}.json`)).data;
      } else {
        return JSON.parse(
          fs.readFileSync(params.manufacturerValidationLocation + `${provingChip}.json`, 'utf-8')
        );
      }
    }

    async function addProject() {
      const signer = await hre.ethers.getSigner(projectOwner);
      const enrollmentManagerAddress = getDeployedContractAddress(hre.network.name, "ArxProjectEnrollmentManager");
      const enrollmentManager = new ArxProjectEnrollmentManager__factory(signer).attach(enrollmentManagerAddress);

      const chipClaimInfo = JSON.parse(fs.readFileSync(`task_outputs/projectEnrollment/${provingChip}.json`, 'utf-8'));
      await rawTx({
        from: projectOwner,
        to: enrollmentManagerAddress,
        data: enrollmentManager.interface.encodeFunctionData(
          "addProject",
          [
            projectOwner,
            chipValidationDataUri,
            calculateLabelHash(params.name),
            ersInstance.projectCreation.tsmTree.getHexRoot(),
            projectPublicKey,
            provingChip,
            chipClaimInfo.TSMMerkleInfo,
            provingChipManufacturerInfo.validationInfo,
            chipOwnershipProof,
            projectOwnershipProof
          ]
        )
      });
    }

    async function createProjectOwnershipMessage(projectRegistrarAddress: Address): Promise<string> {
      const signer = hre.ethers.provider.getSigner(projectPublicKey);
      const chainId = BigNumber.from(await signer.getChainId());
      const packedMsg = ethers.utils.solidityPack(["uint256", "address"], [chainId, projectRegistrarAddress]);
      return signer.signMessage(ethers.utils.arrayify(packedMsg));
    }
  });

  function getAndValidateParams(): CreateProject {
    let params: CreateProject = JSON.parse(fs.readFileSync('./task_params/projectCreation.json', 'utf-8'));

    if (params.name.length == 0) {
      throw Error(`Must define a project name`);
    }
  
    if (params.chipDataLocation.length == 0) {
      throw Error(`Must define a chip data location`);
    }

    if (params.manufacturerValidationLocation.length == 0) {
      throw Error(`Must define a manufacturer validation location`);
    }

    if (params.tokenUriRoot.length == 0) {
      throw Error(`Must define a token URI root`);
    }

    if (params.lockinPeriod > 31536000) {         // Seconds in a year
      throw Error(`Defined lockin period is too long`);
    }

    if(params.serviceId.slice(0, 2) != '0x' || params.serviceId.length != 66) {
      throw Error(`Passed service Id: ${params.serviceId} is not a bytes32 hash`);
    }

    return params;
  }
