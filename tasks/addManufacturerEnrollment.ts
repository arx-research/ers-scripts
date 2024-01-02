import { BigNumber, ethers, utils } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import {
  calculateEnrollmentId,
  ManufacturerTree,
  ManufacturerValidationInfo
} from "@arx-research/ers-contracts";
import { CIDString, File } from "nft.storage";

import { getDeployedContractAddress } from "../utils/helpers";
import {
  getChipPublicKeys,
  getManufacturerRegistry,
  instantiateGateway,
  rl,
  saveFilesLocally,
  uploadFilesToIPFS
} from "../utils/scriptHelpers";
import { getNumberOfChips, getPostToIpfs, getSaveToDB } from "../utils/prompts/addManufacturerEnrollmentPrompts";
import { AddManufacturerEnrollment, ManufacturerEnrollmentIPFS, UploadChipData, ChipKeys } from "../types/scripts";
import {connectToDatabase, uploadChipToDB} from "../utils/database"

task("addManufacturerEnrollment", "Add a new enrollment to the ManufacturerRegistry")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;

    let params: AddManufacturerEnrollment = await getAndValidateParams();
    const { deployer, defaultManufacturer, defaultManufacturerSigner } = await hre.getNamedAccounts();
    let chips: ChipKeys = {};

    if (Number(params.numberOfChips) != 0) {
      console.log(`Scanning chips set to ${params.numberOfChips}`);
      const gateway = await instantiateGateway();
      for (let i = 0; i < params.numberOfChips.toNumber(); i++) {
        const [ chipId, pk2, _rawKeys ] = await getChipPublicKeys(gateway);
        // Make rawKeys available outside of the loop
        if (Object.keys(chips).includes(chipId)) {
          console.log(`Chip ${chipId} already scanned. Skipping...`);
          i--;
          continue;
        }

        chips[chipId] = {secondaryKeyAddress: pk2};
        console.log(`Scanned chip ${i + 1} of ${params.numberOfChips}`);
      }
    } else {
      const keysFromJson = params.chipKeys;
      for (let i = 0; i < keysFromJson.length; i++) {
        const chipScan = keysFromJson[i];

        const primaryEtherAddress = utils.computeAddress('0x' + chipScan["publicKeys"]["1"]);
        const secondaryEtherAddress = utils.computeAddress('0x' + chipScan["publicKeys"]["2"]);

        chips[primaryEtherAddress] = {
          secondaryKeyAddress: secondaryEtherAddress
        }
      }
    }

    console.log(`Generating merkle tree for ${Object.keys(chips).length} chips...`);
    const merkleTree = new ManufacturerTree(Object.keys(chips).map((address) => {return {"chipId": address}}));
    
    console.log(`Creating certificates...`);
    const certificates: string[] = await createCertificates();

    const manufacturerRegistry = await getManufacturerRegistry(
      hre,
      deployer,
      await getDeployedContractAddress(hre.network.name, "ManufacturerRegistry")
    );

    const manufacturerInfo = await manufacturerRegistry.getManufacturerInfo(params.manufacturerId);
    const expectedEnrollmentId = calculateEnrollmentId(params.manufacturerId, manufacturerInfo.nonce);
    
    let chipValidationDataUri: CIDString = await generateAndSaveManufacturerEnrollmentFiles();
    console.log(`Manufacturer enrollment ID is ${expectedEnrollmentId}, IPFS CID is ${chipValidationDataUri}`);

    await rawTx({
      from: defaultManufacturer,
      to: manufacturerRegistry.address,
      data: manufacturerRegistry.interface.encodeFunctionData(
        "addChipEnrollment",
        [
          params.manufacturerId,
          merkleTree.getRoot(),
          defaultManufacturerSigner,
          params.authModel,
          chipValidationDataUri,
          params.bootloaderApp,
          params.chipModel
        ]
      )
    });

    await saveChipDataLocally();

    console.log(`Manufacturer ${params.manufacturerId} added chip enrollment. Enrollment ID is ${expectedEnrollmentId}, IPFS address is ${chipValidationDataUri}`);

    async function createCertificates(): Promise<string[]> {
      const certSigner = await hre.ethers.getSigner(defaultManufacturerSigner);
      const certificates: string[] = [];
      for (let i = 0; i < Object.keys(chips).length; i++) {
        const packedCert = ethers.utils.solidityPack(["address"], [Object.keys(chips)[i]]);
        certificates.push(await certSigner.signMessage(ethers.utils.arrayify(packedCert)));
      }
      return certificates;
    }

    async function generateAndSaveManufacturerEnrollmentFiles(): Promise<CIDString> {
      let chipValidationDataUri: CIDString;
      const manufacturerValidationFiles = _generateManufacturerEnrollmentFiles(merkleTree, expectedEnrollmentId, chips, certificates);
      // Post to IPFS if requested
      if (await getPostToIpfs(rl)) {
        console.log(`Posting manufacturer enrollment to IPFS...`);
        chipValidationDataUri = await uploadFilesToIPFS(manufacturerValidationFiles);
      } else {
        chipValidationDataUri = "N/A"; 
      }

      // Post to DB if requested
      if(await getSaveToDB(rl)){
        const chipAddresses = Object.keys(chips)
        for(let i = 0; i < chipAddresses.length; i++){
          console.log("Uploading chip to DB: " + chipAddresses[i])
          const chipUploadData: UploadChipData = {
            primary_key_address: chipAddresses[i],
            secondary_key_address: chips[chipAddresses[i]].secondaryKeyAddress,
            ipfs_cid: chipValidationDataUri,
            manufacturerEnrollmentId: expectedEnrollmentId
          }
          await connectToDatabase();
          await uploadChipToDB(chipUploadData)

          console.log("Uploaded chip to DB: " + chipAddresses[i])
        }
      }

      saveFilesLocally(`manufacturerEnrollments/${hre.network.name}`, manufacturerValidationFiles);

      return chipValidationDataUri;
    }

    async function saveChipDataLocally(): Promise<void> {
      console.log("Saving chip data locally...")
      const chipInfo = Object.keys(chips).map((address) => {
        return {"chipId": address, "pk2": chips[address].secondaryKeyAddress, "enrollmentId": expectedEnrollmentId, "enrollmentCid": chipValidationDataUri}
      });

      // We are saving both the enrollment info as well as a chipData.json file which can immediately be used for projectCreation.
      const enrollmentInfoFile = new File([JSON.stringify(chipInfo)], `${expectedEnrollmentId}.json`, { type: 'application/json' });
      const chipInfoFile = new File([JSON.stringify(chipInfo)], `chipData.json`, { type: 'application/json' });
      await saveFilesLocally("enrollmentData", [enrollmentInfoFile]);
      await saveFilesLocally("chipData", [chipInfoFile]);
    }
  });

async function getAndValidateParams(): Promise<AddManufacturerEnrollment> {
  let params: AddManufacturerEnrollment = JSON.parse(fs.readFileSync('./task_params/addManufacturerEnrollment.json', 'utf-8'));

  params.numberOfChips = await getNumberOfChips(rl);

  if(params.manufacturerId.slice(0, 2) != '0x' || params.manufacturerId.length != 66) {
    throw Error(`Passed manufacturer Id: ${params.manufacturerId} is not a bytes32 hash`);
  }
  
  if(params.authModel.slice(0, 2) != '0x' || params.authModel.length != 42) {
    throw Error(`Passed auth model: ${params.authModel} is not an Ethereum compliant address`);
  }

  if (params.bootloaderApp.length == 0) {
    throw Error(`Must define a bootloader app`);
  }

  if (params.chipModel.length == 0) {
    throw Error(`Must define a chip model`);
  }

  return params;
}

function _generateManufacturerEnrollmentFiles(
  merkleTree: ManufacturerTree,
  enrollmentId: string,
  chips: ChipKeys,
  certificates: string[]
): File[] {
  let manufacturerValidationFiles: File[] = [];
  for (let i = 0; i < Object.keys(chips).length; i++) {
    const chipId = Object.keys(chips)[i];
    let chipValidationInfo: ManufacturerValidationInfo = {
      mIndex: BigNumber.from(i),
      manufacturerProof: merkleTree.getProof(i),
      enrollmentId,
    };

    let manufacturerValidation: ManufacturerEnrollmentIPFS = {
      validationInfo: chipValidationInfo,
      certificate: certificates[i],
      pk2: chips[chipId].secondaryKeyAddress,
    };
    manufacturerValidationFiles.push(new File([JSON.stringify(manufacturerValidation)], `${chipId}.json`, { type: 'application/json' }));
  }

  return manufacturerValidationFiles;
}
