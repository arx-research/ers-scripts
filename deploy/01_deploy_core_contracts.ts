import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { calculateLabelHash, calculateSubnodeHash } from "@arx-research/ers-contracts";

import {
  CHIP_REGISTRY_DEPLOY,
  MAX_BLOCK_WINDOW,
  MULTI_SIG_ADDRESSES,
  NAME_COORDINATOR
} from "../deployments/parameters"
import { setNewOwner } from "../utils/helpers";
import { NULL_NODE } from "../utils/constants";

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
      CHIP_REGISTRY_DEPLOY[network].maxLockinPeriod,
      deployer
    ],
  });
  console.log("ChipRegistry deployed to:", chipRegistryDeploy.address);

  const developerRegistryDeploy = await deploy("DeveloperRegistry", {
    from: deployer,
    args: [deployer],
  });
  console.log("DeveloperRegistry deployed to:", developerRegistryDeploy.address);

  const developerNameGovernor = await deploy("DeveloperNameGovernor", {
    from: deployer,
    args: [developerRegistryDeploy.address, deployer],
  });
  console.log("DeveloperNameGovernor deployed to:", developerNameGovernor.address);

  const ersRegistryDeploy = await deploy("ERSRegistry", {
    from: deployer,
    args: [
      chipRegistryDeploy.address, 
      developerRegistryDeploy.address
    ],
  });
  console.log("ERSRegistry deployed to:", ersRegistryDeploy.address);

  const servicesRegistryDeploy = await deploy("ServicesRegistry", {
    from: deployer,
    args: [chipRegistryDeploy.address, MAX_BLOCK_WINDOW[network]],
  });
  console.log("ServicesRegistry deployed to:", servicesRegistryDeploy.address);

  const developerRegistrarImplDeploy = await deploy("DeveloperRegistrar", {
    from: deployer,
    args: [
      chipRegistryDeploy.address, 
      ersRegistryDeploy.address,
      developerRegistryDeploy.address,
      servicesRegistryDeploy.address
    ],
  });
  console.log("DeveloperRegistrar implementation deployed to:", developerRegistrarImplDeploy.address);

  const developerRegistrarFactoryDeploy = await deploy("DeveloperRegistrarFactory", {
    from: deployer,
    args: [developerRegistrarImplDeploy.address, developerRegistryDeploy.address],
  });
  console.log("DeveloperRegistrarFactory deployed to:", developerRegistrarFactoryDeploy.address);

  const secp256AuthModelDeploy = await deploy("SECP256k1Model", {
    from: deployer,
    args: [],
  });
  console.log("SECP256k1Model deployed to:", secp256AuthModelDeploy.address);

  const enrollmentEIP191Model = await deploy("EnrollmentEIP191Model", {
    from: deployer,
    args: [],
  });
  console.log("EnrollmentEIP191Model deployed to:", enrollmentEIP191Model.address);

  const openTransferPolicyDeploy = await deploy("OpenTransferPolicy", {
    from: deployer,
    args: [],
  });
  console.log("OpenTransferPolicy deployed to:", openTransferPolicyDeploy.address);

  const chipRegistry = await ethers.getContractAt("ChipRegistry", chipRegistryDeploy.address);
  const developerRegistry = await ethers.getContractAt("DeveloperRegistry", developerRegistryDeploy.address);
  const ersRegistry = await ethers.getContractAt("ERSRegistry", ersRegistryDeploy.address);

  // initialize DeveloperRegistry
  if(!await developerRegistry.initialized()) {
    await developerRegistry.initialize(
      ersRegistryDeploy.address,
      [developerRegistrarFactoryDeploy.address],
      developerNameGovernor.address
    );
  }
  // initialize ChipRegistry
  if(!await chipRegistry.initialized()) {
    await chipRegistry.initialize(
      ersRegistryDeploy.address,
      developerRegistryDeploy.address
    );
  }
  console.log("Registries initialized");

  // Make DeveloperRegistry the owner of .ers domain
  const ersNodeOwner = await ersRegistry.getOwner(calculateSubnodeHash("ers"));
  if (ersNodeOwner != developerRegistryDeploy.address) {
    await ersRegistry.createSubnodeRecord(
      NULL_NODE,
      calculateLabelHash("ers"),
      developerRegistryDeploy.address,
      developerRegistryDeploy.address
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
