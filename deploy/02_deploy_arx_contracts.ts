import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { Address, ADDRESS_ZERO, calculateLabelHash, TSMRegistrar__factory } from "@arx-research/ers-contracts";

import { getDeployedContractAddress, saveFactoryDeploy, setNewOwner } from "../utils/helpers";
import { MAX_BLOCK_WINDOW, MULTI_SIG_ADDRESSES } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments
  const network = hre.deployments.getNetworkName();

  const { deployer } = await hre.getNamedAccounts();
  const multiSig = MULTI_SIG_ADDRESSES[network] ? MULTI_SIG_ADDRESSES[network] : deployer;

  // Add allowed TSM to deploy ArxPlaygroundRegistrar
  const tsmRegistry = await ethers.getContractAt(
    "TSMRegistry",
    getDeployedContractAddress(network, "TSMRegistry")
  );

  await tsmRegistry.addAllowedTSM(
    deployer,
    calculateLabelHash("arxplayground")
  );
  console.log("New TSM added to TSMRegistry");

  // Deploy ArxPlaygroundRegistrar
  const tx = await tsmRegistry.createNewTSMRegistrar(
    getDeployedContractAddress(network, "TSMRegistrarFactory")
  );

  // Get ArxPlaygroundRegistrar address, create contract object, and save to deployments
  const tsmRegistrarAddress = await getTSMRegistrarAddress(tx, tsmRegistry);
  const tsmRegistrar = await ethers.getContractAt("TSMRegistrar", tsmRegistrarAddress);
  saveFactoryDeploy(hre, "ArxPlaygroundRegistrar", TSMRegistrar__factory.abi, tsmRegistrarAddress);
  console.log("New TSMRegistrar deployed at:", tsmRegistrarAddress);
  
  // Deploy ArxProjectEnrollmentManager
  const arxProjectEnrollmentManagerDeploy = await deploy("ArxProjectEnrollmentManager", {
    from: deployer,
    args: [
      getDeployedContractAddress(network, "ChipRegistry"),
      tsmRegistrarAddress,
      getDeployedContractAddress(network, "ERSRegistry"),
      getDeployedContractAddress(network, "ManufacturerRegistry"),
      ADDRESS_ZERO,
      MAX_BLOCK_WINDOW[network]
    ],
  });
  console.log("ArxProjectEnrollmentManager deployed to:", arxProjectEnrollmentManagerDeploy.address);

  const arxProjectEnrollmentManager = await ethers.getContractAt(
    "ArxProjectEnrollmentManager",
    arxProjectEnrollmentManagerDeploy.address
  );

  // Set new owner for ArxProjectEnrollmentManager, TSMRegistrar, and TSMRegistry. TSMRegistrar owner is set to ArxProjectEnrollmentManager
  await setNewOwner(hre, arxProjectEnrollmentManager, multiSig);
  await setNewOwner(hre, tsmRegistrar, arxProjectEnrollmentManager.address);
  await setNewOwner(hre, tsmRegistry, multiSig);
  console.log("Ownership set for remaining contracts");
};

async function getTSMRegistrarAddress(tx: any, tsmRegistry: any): Promise<Address> {
  const receipt = await ethers.provider.getTransactionReceipt(tx.hash)
  const registrarAddress = tsmRegistry.interface.parseLog(receipt.logs[receipt.logs.length - 1]).args.tsmRegistrar;
  return registrarAddress;
}

export default func;
