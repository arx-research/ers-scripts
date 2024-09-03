import { ethers } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { ManufacturerRegistry__factory } from "@arx-research/ers-contracts";
import { getDeployedContractAddress } from "../utils/helpers";
import { MULTI_SIG_ADDRESSES } from "../deployments/parameters";
import * as fs from "fs";
import * as path from "path";

task("addManufacturer", "Add a manufacturer to the ManufacturerRegistry")
  .addParam("manufacturerName", "Name of the manufacturer to add", undefined, undefined, false)
  .addParam("manufacturer", "Address of the manufacturer to add", undefined, undefined, true)
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const chainId = await hre.getChainId();

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

    // Save the data to a JSON file
    const outputDir = path.join(__dirname, "../task_outputs/addManufacturer");
    const outputFilePath = path.join(outputDir, `${manufacturerId}.json`);

    // Ensure the output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Data to be saved
    const outputData = {
      chainId: chainId.toString(),
      manufacturerId,
      manufacturerName,
      manufacturerRegistry: manufacturerRegistry.address,
    };

    // Write the data to the JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), "utf8");

    console.log(`Data saved to ${outputFilePath}`);
  });
