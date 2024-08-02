import { BigNumber, ethers, utils } from "ethers";
import * as fs from 'fs';
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
  getChainId,
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

    async function getAndValidateParams(): Promise<AddManufacturerEnrollment> {
      let params: AddManufacturerEnrollment = JSON.parse(fs.readFileSync('./task_params/addManufacturerEnrollment.json', 'utf-8'));

      // Set the default chain ID if not provided
      params.chainId = await getChainId(rl);

      // Set the manufacturer signer
      params.manufacturerSigner = await getManufacturerSigner(rl);

      // Set the manufacturer Id
      params.manufacturerId = await getManufacturerId(rl);

      // Set the auth model
      params.authModel = await getAuthModel(rl);

      // Set the enrollment auth model
      params.enrollmentAuthModel = await getEnrollmentAuthModel(rl);

      // Set the bootloader app
      params.bootloaderApp = await getBootloaderApp(rl);

      // Set the chip model
      params.chipModel = await getChipModel(rl);

      return params;
    }
});
