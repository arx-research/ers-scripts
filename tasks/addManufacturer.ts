import { ethers } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { ManufacturerRegistry__factory } from "@arx-research/ers-contracts";

import { getDeployedContractAddress } from "../utils/helpers";
import { MULTI_SIG_ADDRESSES } from "../deployments/parameters";

task("addManufacturer", "Add a manufacturer to the ManufacturerRegistry")
  .addParam("manufacturerName", "Name of the manufacturer to add", undefined, undefined, false)
  .addParam("manufacturer", "Address of the manufacturer to add", undefined, undefined, true)
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;

    const { manufacturerName, manufacturer } = taskArgs;
    const { deployer, defaultManufacturer } = await hre.getNamedAccounts();

    const multiSig = MULTI_SIG_ADDRESSES[hre.network.name] ? MULTI_SIG_ADDRESSES[hre.network.name] : deployer;

    const manufacturerAddress = manufacturer ? manufacturer : defaultManufacturer;

    const manufacturerId = ethers.utils.formatBytes32String(manufacturerName);

    const manufacturerRegistryAddress = getDeployedContractAddress(hre.network.name, "ManufacturerRegistry");
    const manufacturerRegistry = new ManufacturerRegistry__factory().attach(manufacturerRegistryAddress);

    // If the manufacturer is already registered, do nothing if the multiSig isn't an EOA then skip
    await rawTx({
      from: multiSig,
      to: manufacturerRegistry.address,
      data: manufacturerRegistry.interface.encodeFunctionData("addManufacturer", [manufacturerId, manufacturerAddress])
    });

    console.log(`Manufacturer ${manufacturerName} added to ManufacturerRegistry with following id: ${manufacturerId}`);
  });
