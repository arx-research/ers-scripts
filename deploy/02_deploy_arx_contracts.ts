import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { DeveloperNameGovernor } from "@arx-research/ers-contracts";

import { getDeployedContractAddress, setNewOwner } from "../utils/helpers";
import {
  MAX_BLOCK_WINDOW,
  MULTI_SIG_ADDRESSES,
  NAME_COORDINATOR
} from "../deployments/parameters";
import { NULL_NODE } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, rawTx } = await hre.deployments
  const network = hre.deployments.getNetworkName();

  const { deployer } = await hre.getNamedAccounts();
  const multiSig = MULTI_SIG_ADDRESSES[network] ? MULTI_SIG_ADDRESSES[network] : deployer;

  // Add allowed Developer to deploy ArxPlaygroundRegistrar
  const developerNameGovernor: DeveloperNameGovernor = await ethers.getContractAt(
    "DeveloperNameGovernor",
    getDeployedContractAddress(network, "DeveloperNameGovernor")
  );
  
  const developerRegistry = await ethers.getContractAt(
    "DeveloperRegistry",
    getDeployedContractAddress(network, "DeveloperRegistry")
  );

  const deployerSigner = await hre.ethers.getSigner(deployer);

  // Set NameCoordinator role
  if ((await developerNameGovernor.nameCoordinator()).toLowerCase() != NAME_COORDINATOR[network].toLowerCase()) {
    await rawTx(
      {
        from: deployer,
        to: developerNameGovernor.address,
        data: developerNameGovernor.interface.encodeFunctionData(
          "updateNameCoordinator",
          [NAME_COORDINATOR[network]]
        ),
      }
    );
  }

  await setNewOwner(hre, developerRegistry, multiSig);
  await setNewOwner(hre, developerNameGovernor, multiSig);
  console.log("Ownership set for remaining contracts");
};

export default func;
