import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { calculateLabelHash, calculateSubnodeHash } from "@arx-research/ers-contracts";

import {
  CHIP_REGISTRY_DEPLOY,
  MAX_BLOCK_WINDOW,
  MULTI_SIG_ADDRESSES,
  NULL_NODE
} from "../utils/constants"
import { setNewOwner } from "../utils/helpers"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments
  const network = hre.deployments.getNetworkName();

  const { deployer } = await hre.getNamedAccounts();
  const multiSig = MULTI_SIG_ADDRESSES[network] ? MULTI_SIG_ADDRESSES[network] : deployer;
  console.log("Starting Deploy...");
  const manufacturerRegistryDeploy = await deploy("ManufacturerRegistry", {
    from: deployer,
    args: [multiSig],
  });
  console.log("ManufacturerRegistry deployed to:", manufacturerRegistryDeploy.address);

  const chipRegistryDeploy = await deploy("ChipRegistry", {
    from: deployer,
    args: [
      manufacturerRegistryDeploy.address,
      CHIP_REGISTRY_DEPLOY.gatewayUrls,
      MAX_BLOCK_WINDOW[network],
      CHIP_REGISTRY_DEPLOY.maxLockinPeriod
    ],
  });
  console.log("ChipRegistry deployed to:", chipRegistryDeploy.address);

  const tsmRegistryDeploy = await deploy("TSMRegistry", {
    from: deployer,
    args: [deployer],
  });
  console.log("TSMRegistry deployed to:", tsmRegistryDeploy.address);

  const ersRegistryDeploy = await deploy("ERSRegistry", {
    from: deployer,
    args: [chipRegistryDeploy.address, tsmRegistryDeploy.address],
  });
  console.log("ERSRegistry deployed to:", ersRegistryDeploy.address);

  const servicesRegistryDeploy = await deploy("ServicesRegistry", {
    from: deployer,
    args: [chipRegistryDeploy.address, MAX_BLOCK_WINDOW[network]],
  });
  console.log("ServicesRegistry deployed to:", servicesRegistryDeploy.address);

  const tsmRegistrarFactoryDeploy = await deploy("TSMRegistrarFactory", {
    from: deployer,
    args: [chipRegistryDeploy.address, ersRegistryDeploy.address, tsmRegistryDeploy.address],
  });
  console.log("TSMRegistrarFactory deployed to:", tsmRegistrarFactoryDeploy.address);

  const secp256AuthModelDeploy = await deploy("SECP256k1Model", {
    from: deployer,
    args: [],
  });
  console.log("SECP256k1Model deployed to:", secp256AuthModelDeploy.address);

  const chipRegistry = await ethers.getContractAt("ChipRegistry", chipRegistryDeploy.address);
  const tsmRegistry = await ethers.getContractAt("TSMRegistry", tsmRegistryDeploy.address);
  const ersRegistry = await ethers.getContractAt("ERSRegistry", ersRegistryDeploy.address);

  // initialize TSMRegistry
  if(!await tsmRegistry.initialized()) {
    await tsmRegistry.initialize(ersRegistryDeploy.address, [tsmRegistrarFactoryDeploy.address]);
  }
  // initialize ChipRegistry
  if(!await chipRegistry.initialized()) {
    await chipRegistry.initialize(
      ersRegistryDeploy.address,
      servicesRegistryDeploy.address,
      tsmRegistryDeploy.address
    );
  }
  console.log("Registries initialized");

  // Make TSMRegistry the owner of .ers domain
  const ersNodeOwner = await ersRegistry.getOwner(calculateSubnodeHash("ers"));
  if (ersNodeOwner != tsmRegistryDeploy.address) {
    await ersRegistry.createSubnodeRecord(
      NULL_NODE,
      calculateLabelHash("ers"),
      tsmRegistryDeploy.address,
      tsmRegistryDeploy.address
    );
  }

  const nullNodeOwner = await ersRegistry.getOwner(NULL_NODE);
  if (nullNodeOwner != multiSig) {
    await ersRegistry.setNodeOwner(
      NULL_NODE,
      multiSig
    );
  }
  console.log("Node owners set");

  // Transfer ownership to multi-sig
  await setNewOwner(hre, chipRegistry, multiSig);
  console.log("ChipRegistry ownership transferred");
};

export default func;
