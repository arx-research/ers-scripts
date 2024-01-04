import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { Address, ADDRESS_ZERO, calculateLabelHash, DeveloperRegistrar__factory } from "@arx-research/ers-contracts";

import { getDeployedContractAddress, saveFactoryDeploy, setNewOwner } from "../utils/helpers";
import {
  ARX_REGISTRAR_LABEL,
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
  const developerNameGovernor = await ethers.getContractAt(
    "DeveloperNameGovernor",
    getDeployedContractAddress(network, "DeveloperNameGovernor")
  );
  
  const developerRegistry = await ethers.getContractAt(
    "DeveloperRegistry",
    getDeployedContractAddress(network, "DeveloperRegistry")
  );

  const deployerSigner = await hre.ethers.getSigner(deployer);
  const nameLabelHash = calculateLabelHash(ARX_REGISTRAR_LABEL[network]);
  const nameClaimMsg = ethers.utils.solidityPack(["address", "bytes32"], [deployer, nameLabelHash]);
  const nameClaim = await deployerSigner.signMessage(ethers.utils.arrayify(nameClaimMsg));

  if ((await developerRegistry.pendingDevelopers(deployer)) == NULL_NODE) {
    await rawTx(
      {
        from: deployer,
        to: developerNameGovernor.address,
        data: developerNameGovernor.interface.encodeFunctionData(
          "claimName", 
          [nameLabelHash, nameClaim]
        ),
      }
    );
    console.log("New Developer added to DeveloperRegistry");
  }

  // Deploy ArxPlaygroundRegistrar
  let developerRegistrarAddress: Address = ADDRESS_ZERO;
  let developerRegistrar: any;
  let arxProjectEnrollmentManagerDeploy: any;
  const isAllowed = (await developerRegistry.pendingDevelopers(deployer)) != NULL_NODE;
  if (isAllowed) {
    const tx = await rawTx(
      {
        from: deployer,
        to: developerRegistry.address,
        data: developerRegistry.interface.encodeFunctionData(
          "createNewDeveloperRegistrar",
          [getDeployedContractAddress(network, "DeveloperRegistrarFactory")]
        ),
      }
    );
  
    // Get ArxPlaygroundRegistrar address, create contract object, and save to deployments
    developerRegistrarAddress = await getDeveloperRegistrarAddress(tx, developerRegistry);
    developerRegistrar = await ethers.getContractAt("DeveloperRegistrar", developerRegistrarAddress);
    saveFactoryDeploy(hre, "ArxPlaygroundRegistrar", DeveloperRegistrar__factory.abi, developerRegistrarAddress);
    console.log("New DeveloperRegistrar deployed at:", developerRegistrarAddress);
  }

  if (developerRegistrarAddress != ADDRESS_ZERO) {
    // Deploy ArxProjectEnrollmentManager
    arxProjectEnrollmentManagerDeploy = await deploy("ArxProjectEnrollmentManager", {
      from: deployer,
      args: [
        getDeployedContractAddress(network, "ChipRegistry"),
        developerRegistrarAddress,
        getDeployedContractAddress(network, "ERSRegistry"),
        getDeployedContractAddress(network, "ManufacturerRegistry"),
        ADDRESS_ZERO,
        MAX_BLOCK_WINDOW[network]
      ],
    });
    console.log("ArxProjectEnrollmentManager deployed to:", arxProjectEnrollmentManagerDeploy.address);
  }

  const arxProjectEnrollmentManager = await ethers.getContractAt(
    "ArxProjectEnrollmentManager",
    arxProjectEnrollmentManagerDeploy.address
  );

  // Set new owner for ArxProjectEnrollmentManager, DeveloperRegistrar, DeveloperRegistry, and DeveloperNameGovernor
  // DeveloperRegistrar owner is set to ArxProjectEnrollmentManager
  await setNewOwner(hre, arxProjectEnrollmentManager, multiSig);
  await setNewOwner(hre, developerRegistrar, arxProjectEnrollmentManager.address);
  await setNewOwner(hre, developerRegistry, multiSig);
  await setNewOwner(hre, developerNameGovernor, multiSig);
  console.log("Ownership set for remaining contracts");
};

async function getDeveloperRegistrarAddress(tx: any, developerRegistry: any): Promise<Address> {
  const receipt = await ethers.provider.getTransactionReceipt(tx.transactionHash)
  const registrarAddress = developerRegistry.interface.parseLog(receipt.logs[receipt.logs.length - 1]).args.developerRegistrar;
  return registrarAddress;
}

export default func;
