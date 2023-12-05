import { BigNumber, ethers, utils } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import {
  calculateEnrollmentId,
  ManufacturerRegistry,
  ManufacturerRegistry__factory,
  ManufacturerTree,
  ManufacturerValidationInfo
} from "@arx-research/ers-contracts";
import { CIDString, File } from "nft.storage";

import { getDeployedContractAddress } from "../utils/helpers";
import { getChipPublicKeys, instantiateGateway, saveFilesLocally, uploadFilesToIPFS } from "../utils/scriptHelpers";
import { AddManufacturerEnrollment, ManufacturerEnrollmentIPFS, UploadChipData, KeysFromChipScan, ChipKeys } from "../types/scripts";
import {connectToDatabase, uploadChipToDB} from "../utils/database"

task("addManufacturerEnrollment", "Add a new enrollment to the ManufacturerRegistry")
  .addParam("scan", "Number of chips to scan", "0", undefined, true)
  .addParam("postIpfs", "Post resulting data to IPFS", undefined, undefined, true)
  .addParam("postDb", "Post chip data to MongoDB",undefined, undefined, true)
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const { postIpfs, postDb } = taskArgs;

    let params: AddManufacturerEnrollment = getAndValidateParams();
    const { deployer, defaultManufacturer, defaultManufacturerSigner } = await hre.getNamedAccounts();
    let chips: ChipKeys = {};

    if (Number(taskArgs.scan) != 0) {
      console.log(`Scanning chips set to ${taskArgs.scan}`);
      const gateway = await instantiateGateway();
      for (let i = 0; i < taskArgs.scan; i++) {
        const [ chipId, pk2, _rawKeys ] = await getChipPublicKeys(gateway);
        // Make rawKeys available outside of the loop
        if (Object.keys(chips).includes(chipId)) {
          console.log(`Chip ${chipId} already scanned. Skipping...`);
          i--;
          continue;
        }

        chips[chipId] = {secondaryKeyAddress: pk2};
        console.log(`Scanned chip ${i + 1} of ${taskArgs.scan}`);
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

    const manufacturerRegistry = await getManufacturerRegistry();

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

    async function getManufacturerRegistry(): Promise<ManufacturerRegistry> {
      const signer = await hre.ethers.getSigner(deployer);
      const manufacturerRegistryAddress = getDeployedContractAddress(hre.network.name, "ManufacturerRegistry");
      const manufacturerRegistry = new ManufacturerRegistry__factory(signer).attach(manufacturerRegistryAddress);
      return manufacturerRegistry;
    }

    async function generateAndSaveManufacturerEnrollmentFiles(): Promise<CIDString> {
      let chipValidationDataUri: CIDString;
      const manufacturerValidationFiles = _generateManufacturerEnrollmentFiles(merkleTree, expectedEnrollmentId, chips, certificates);
      // Post to IPFS if requested
      if (postIpfs) {
        console.log(`Posting manufacturer enrollment to IPFS...`);
        chipValidationDataUri = await uploadFilesToIPFS(manufacturerValidationFiles);
      } else {
        chipValidationDataUri = "Not posted to IPFS!"; 
      }

      // Post to DB if requested
      if(postDb){
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

      saveFilesLocally("addManufacturerEnrollment", manufacturerValidationFiles);

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

function getAndValidateParams(): AddManufacturerEnrollment {
  let params: AddManufacturerEnrollment = JSON.parse(fs.readFileSync('./task_params/addManufacturerEnrollment.json', 'utf-8'));

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
