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

    // If name was manually approved, skip claiming step but verify approval
    if (approvalProof === "" && proofTimestamp === "0") {
      console.log(`Name ${name} was manually approved, skipping claim step.`);
      
      // Verify that the developer is approved for this nameHash
      const maxRetries = 10;
      let retries = 0;
      let isApproved = false;
      
      while (!isApproved && retries < maxRetries) {
        try {
          const pendingNameHash = await developerRegistry.pendingDevelopers(developerOwner);
          isApproved = pendingNameHash === nameHash;
          
          if (!isApproved) {
            console.log(`Waiting for manual approval to be confirmed... (${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            retries++;
          }
        } catch (error) {
          console.log(`Error checking approval status, retrying... (${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries++;
        }
      }
      
      if (!isApproved) {
        throw new Error(`Failed to verify manual approval after ${maxRetries} attempts. The developer may not be approved for nameHash ${nameHash}.`);
      }
      
      console.log(`Manual approval verified successfully.`);
    } else {
      console.log(`Claiming name ${name} with name hash ${nameHash}, this might take a moment...`);
      const claimTxReceipt = await rawTx({
        from: developerOwner,
        to: developerNameGovernor.address,
        data: developerNameGovernor.interface.encodeFunctionData(
          "claimName",
          [nameHash, proofTimestamp, approvalProof]
        )
      });

      // Wait for the claim transaction to be confirmed before proceeding
      console.log(`Name claimed successfully. Transaction hash: ${claimTxReceipt.transactionHash}`);
      
      // Verify that the claim was successful by checking if the developer is approved for this nameHash
      const maxRetries = 10;
      let retries = 0;
      let isApproved = false;
      
      while (!isApproved && retries < maxRetries) {
        try {
          const pendingNameHash = await developerRegistry.pendingDevelopers(developerOwner);
          isApproved = pendingNameHash === nameHash;
          
          if (!isApproved) {
            console.log(`Waiting for claim to propagate... (${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            retries++;
          }
        } catch (error) {
          console.log(`Error checking claim status, retrying... (${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries++;
        }
      }
      
      if (!isApproved) {
        throw new Error(`Failed to verify name claim after ${maxRetries} attempts. The claim may not have propagated properly.`);
      }
      
      console.log(`Name claim verified successfully.`);
    }

    console.log(`Creating developer registrar for name ${name}, this might take a moment...`);
    const createRegistrarReceipt = await rawTx({
      from: developerOwner,
      to: developerRegistry.address,
      data: developerRegistry.interface.encodeFunctionData(
        "createNewDeveloperRegistrar",
        [getDeployedContractAddress(hre.network.name, "DeveloperRegistrarFactory")]
      )
    });

    console.log(`Developer registrar creation confirmed. Transaction hash: ${createRegistrarReceipt.transactionHash}`);

    const ersRegistry = await getERSRegistry(hre, developerOwner);

    // Verify that the developer registrar creation has propagated by checking the subnode owner
    const maxRetries = 10;
    let retries = 0;
    let developerRegistrarAddress = "0x0000000000000000000000000000000000000000";
    
    while (developerRegistrarAddress === "0x0000000000000000000000000000000000000000" && retries < maxRetries) {
      try {
        developerRegistrarAddress = await ersRegistry.getSubnodeOwner(calculateSubnodeHash("ers"), nameHash);
        
        if (developerRegistrarAddress === "0x0000000000000000000000000000000000000000") {
          console.log(`Waiting for developer registrar creation to propagate... (${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
          retries++;
        }
      } catch (error) {
        console.log(`Error checking registrar creation status, retrying... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        retries++;
      }
    }
    
    if (developerRegistrarAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Failed to verify developer registrar creation after ${maxRetries} attempts. The creation may not have propagated properly.`);
    }
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
