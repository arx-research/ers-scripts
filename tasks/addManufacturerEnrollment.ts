import { BigNumber, ethers, utils } from "ethers";
import * as fs from 'fs';
import * as path from 'path';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import {
  calculateEnrollmentId,
  ManufacturerValidationInfo
} from "@arx-research/ers-contracts";

import { getDeployedContractAddress } from "../utils/helpers";
import {
  getManufacturerRegistry,
  rl,
} from "../utils/scriptHelpers";
import {
  getManufacturerSigner,
  getManufacturerId,
  getAuthModel,
  getEnrollmentAuthModel,
  getBootloaderApp,
  getChipModel
} from "../utils/prompts/addManufacturerEnrollmentPrompts";
import { AddManufacturerEnrollment } from "../types/scripts";

task("addManufacturerEnrollment", "Add a new enrollment to the ManufacturerRegistry")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const chainId = await hre.getChainId();
    const networkName = hre.network.name;

    let params: AddManufacturerEnrollment = await getAndValidateParams();
    const { deployer, defaultManufacturer } = await hre.getNamedAccounts();

    const manufacturerRegistry = await getManufacturerRegistry(
      hre,
      deployer,
      await getDeployedContractAddress(hre.network.name, "ManufacturerRegistry")
    );

    const manufacturerInfo = await manufacturerRegistry.getManufacturerInfo(params.manufacturerId);
    const expectedEnrollmentId = calculateEnrollmentId(params.manufacturerId, manufacturerInfo.nonce);

    await rawTx({
      from: defaultManufacturer,
      to: manufacturerRegistry.address,
      data: manufacturerRegistry.interface.encodeFunctionData(
        "addChipEnrollment",
        [
          params.manufacturerId,
          params.manufacturerSigner,
          params.authModel,
          params.enrollmentAuthModel,
          "ipfs://",
          params.bootloaderApp,
          params.chipModel
        ]
      )
    });

    console.log(`Manufacturer ${params.manufacturerId} added chip enrollment. Enrollment ID is ${expectedEnrollmentId}`);

    // Save the enrollment data to a JSON file
    const outputDir = path.join(__dirname, `../task_outputs/${networkName}/addManufacturerEnrollment`);
    const outputFilePath = path.join(outputDir, `${expectedEnrollmentId}.json`);

    // Ensure the output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Data to be saved
    const outputData = {
      chainId: chainId.toString(),
      enrollmentId: expectedEnrollmentId,
      manufacturerId: params.manufacturerId,
      manufacturerSigner: params.manufacturerSigner,
      authModel: params.authModel,
      enrollmentAuthModel: params.enrollmentAuthModel,
      bootloaderApp: params.bootloaderApp,
      chipModel: params.chipModel,
      manufacturerRegistry: manufacturerRegistry.address,
    };

    // Write the data to the JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), "utf8");

    console.log(`Data saved to ${outputFilePath}`);

    async function getAndValidateParams(): Promise<AddManufacturerEnrollment> {
      let params: AddManufacturerEnrollment = {} as AddManufacturerEnrollment;

      // Set the manufacturer signer
      params.manufacturerSigner = await getManufacturerSigner(rl);

      // Set the manufacturer Id
      params.manufacturerId = await getManufacturerId(rl);

      // Set the auth model, passing chainId
      params.authModel = await getAuthModel(rl, networkName);

      // Set the enrollment auth model, passing chainId
      params.enrollmentAuthModel = await getEnrollmentAuthModel(rl, networkName);

      // Set the bootloader app
      params.bootloaderApp = await getBootloaderApp(rl);

      // Set the chip model
      params.chipModel = await getChipModel(rl);

      return params;
    }
});
