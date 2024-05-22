import { BigNumber, ethers, utils } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import {
  calculateEnrollmentId,
  ManufacturerValidationInfo
} from "@arx-research/ers-contracts";
import { CIDString, File } from "nft.storage";

import { getDeployedContractAddress } from "../utils/helpers";
import {
  createIpfsAddress,
  getChipPublicKeys,
  getManufacturerRegistry,
  instantiateGateway,
  rl,
  saveFilesLocally,
  uploadFilesToIPFS
} from "../utils/scriptHelpers";
import { getChipData, getChainId, getPostToIpfs } from "../utils/prompts/addManufacturerEnrollmentPrompts";
import { AddManufacturerEnrollment, ManufacturerEnrollmentIPFS, UploadChipData, ChipKeys } from "../types/scripts";
import {connectToDatabase, uploadChipToDB} from "../utils/database"
import { get } from "http";

task("addManufacturerEnrollment", "Add a new enrollment to the ManufacturerRegistry")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;

    // TODO: we need to add a param to get the desired chain ID which should default to hardhat if not provided
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

    console.log(`Creating certificates...`);
    const certificates: string[] = await createCertificates();

    const manufacturerRegistry = await getManufacturerRegistry(
      hre,
      deployer,
      await getDeployedContractAddress(hre.network.name, "ManufacturerRegistry")
    );

    const manufacturerInfo = await manufacturerRegistry.getManufacturerInfo(params.manufacturerId);
    const expectedEnrollmentId = calculateEnrollmentId(params.manufacturerId, manufacturerInfo.nonce);
    
    // TODO: in production we won't reveal all chipId, but rather dispense them to projects as needed.
    await generateAndSaveManufacturerEnrollmentFiles();

    await rawTx({
      from: defaultManufacturer,
      to: manufacturerRegistry.address,
      data: manufacturerRegistry.interface.encodeFunctionData(
        "addChipEnrollment",
        [
          params.manufacturerId,
          defaultManufacturerSigner,
          params.authModel,
          "ipfs://",
          params.bootloaderApp,
          params.chipModel
        ]
      )
    });

    await saveChipDataLocally();

    console.log(`Manufacturer ${params.manufacturerId} added chip enrollment. Enrollment ID is ${expectedEnrollmentId}`);

    async function createCertificates(): Promise<string[]> {
      const certSigner = await hre.ethers.getSigner(defaultManufacturerSigner);
      const certificates: string[] = [];
      for (let i = 0; i < Object.keys(chips).length; i++) {
                // TODO: we also need to sign the chain ID here
        const packedCert = ethers.utils.solidityPack(["uint256","address"], [params.chainId, Object.keys(chips)[i]]);
        certificates.push(await certSigner.signMessage(ethers.utils.arrayify(packedCert)));
      }
      return certificates;
    }

    async function generateAndSaveManufacturerEnrollmentFiles(): Promise<void> {
      const manufacturerValidationFiles = _generateManufacturerEnrollmentFiles(expectedEnrollmentId, chips, certificates);
      saveFilesLocally(`manufacturerEnrollments/${hre.network.name}`, manufacturerValidationFiles);
    }

    async function saveChipDataLocally(): Promise<void> {
      console.log("Saving chip data locally...")
      const chipAddresses = Object.keys(chips);  // This collects all the chip addresses into an array
      const chipInfo = chipAddresses.map((address, index) => {
        // Access the corresponding certificate using the index
        const manufacturerCertificate = certificates[index];  // Assuming certificates are ordered as per the chips
        return {
          "chipId": address, 
          "pk2": chips[address].secondaryKeyAddress, 
          "enrollmentId": expectedEnrollmentId, 
          "manufacturerCertificate": manufacturerCertificate  // Adding the certificate directly in the chip data
        }
      });
    
      // We are saving both the enrollment info as well as a chipData.json file which can immediately be used for projectCreation.
      const enrollmentInfoFile = new File([JSON.stringify(chipInfo)], `${expectedEnrollmentId}.json`, { type: 'application/json' });
      const chipInfoFile = new File([JSON.stringify(chipInfo)], `chipData.json`, { type: 'application/json' });
      await saveFilesLocally(`enrollmentData/${hre.network.name}`, [enrollmentInfoFile]);
      await saveFilesLocally(`chipData/${hre.network.name}`, [chipInfoFile]);
    }
    
  });

async function getAndValidateParams(): Promise<AddManufacturerEnrollment> {
  let params: AddManufacturerEnrollment = JSON.parse(fs.readFileSync('./task_params/addManufacturerEnrollment.json', 'utf-8'));

  // Set the default chain ID if not provided
  params.chainId = await getChainId(rl);

  params.numberOfChips = await getChipData(rl);

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
  enrollmentId: string,
  chips: ChipKeys,
  certificates: string[]
): File[] {
  let manufacturerValidationFiles: File[] = [];
  for (let i = 0; i < Object.keys(chips).length; i++) {
    const chipId = Object.keys(chips)[i];
    let chipValidationInfo: ManufacturerValidationInfo = {
      enrollmentId,
      manufacturerCertificate: certificates[i],
    };

    let manufacturerValidation: ManufacturerEnrollmentIPFS = {
      validationInfo: chipValidationInfo,
      pk2: chips[chipId].secondaryKeyAddress,
    };
    manufacturerValidationFiles.push(new File([JSON.stringify(manufacturerValidation)], `${chipId}.json`, { type: 'application/json' }));
  }

  return manufacturerValidationFiles;
}
