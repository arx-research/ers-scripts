import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { calculateSubnodeHash } from "@arx-research/ers-contracts";
import { BigNumber } from "ethers";
import * as fs from 'fs';
import * as path from 'path';
import { getDeveloperNameApproval } from "../utils/prompts/createDeveloperRegistrarPrompts";
import { getDeveloperNameGovernor, getDeveloperRegistry, getERSRegistry } from "../utils/scriptHelpers";
import { getDeployedContractAddress } from "../utils/helpers";
import { rl } from "../utils/scriptHelpers";

task("createDeveloperRegistrar", "Create developer registrar")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const { developerOwner } = await hre.getNamedAccounts();

    const chainId = BigNumber.from(await hre.getChainId());
    const networkName = hre.network.name;
    const developerNameGovernor = await getDeveloperNameGovernor(hre, developerOwner);

    const [approvalProof, proofTimestamp, nameHash, name] = await getDeveloperNameApproval(rl, developerOwner, chainId, developerNameGovernor.address);

    const developerRegistry = await getDeveloperRegistry(hre, developerOwner);

    console.log(`Claiming name ${name} with name hash ${nameHash}, this might take a moment...`);
    await rawTx({
      from: developerOwner,
      to: developerNameGovernor.address,
      data: developerNameGovernor.interface.encodeFunctionData(
        "claimName",
        [nameHash, proofTimestamp, approvalProof]
      )
    });

    console.log(`Creating developer registrar for name ${name}, this might take a moment...`);
    const receipt = await rawTx({
      from: developerOwner,
      to: developerRegistry.address,
      data: developerRegistry.interface.encodeFunctionData(
        "createNewDeveloperRegistrar",
        [getDeployedContractAddress(hre.network.name, "DeveloperRegistrarFactory")]
      )
    });

    const ersRegistry = await getERSRegistry(hre, developerOwner);

    const developerRegistrarAddress = await ersRegistry.getSubnodeOwner(calculateSubnodeHash("ers"), nameHash);
    console.log(`Developer registrar created at ${developerRegistrarAddress}`);

    // Save the developer registrar data to a JSON file
    const outputDir = path.join(__dirname, `../task_outputs/${networkName}/createDeveloperRegistrar`);
    const outputFilePath = path.join(outputDir, `${developerRegistrarAddress}.json`);

    // Ensure the output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Data to be saved
    const outputData = {
      chainId: chainId.toString(),
      developerOwner,
      developerNameGovernor: developerNameGovernor.address,
      name,
      nameHash,
      proofTimestamp: proofTimestamp.toString(),
      approvalProof,
      developerRegistrar: developerRegistrarAddress,
      developerRegistry: developerRegistry.address,
    };

    // Write the data to the JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), "utf8");

    console.log(`Data saved to ${outputFilePath}`);
  });
