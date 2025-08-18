import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import "hardhat-deploy";
import {
  DeveloperRegistrar__factory,
  PBTSimpleProjectRegistrar__factory,
  calculateLabelHash,
} from "@arx-research/ers-contracts/";

import { rl } from "../utils/scriptHelpers";
import {
  promptDeveloperRegistrarForManualAdd,
  promptProjectRegistrarForManualAdd,
  promptServiceIdForManualAdd,
  promptProjectNameForManualAdd,
  promptLockinPeriodForManualAdd,
} from '../utils/prompts/projectMiscPrompts';

task("addProjectToRegistrar", "Manually add an existing project to a DeveloperRegistrar")
  .setAction(async (_, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const { developerOwner } = await hre.getNamedAccounts();
    const chainId = BigNumber.from(await hre.getChainId());
    const networkName = hre.network.name;
    const provider = hre.ethers.provider;

    console.log("This task allows you to manually add an existing project to a DeveloperRegistrar.");
    console.log("Use this when a project was created but failed to be added to the registrar.");

    // Get the DeveloperRegistrar address
    const developerRegistrarAddress = await promptDeveloperRegistrarForManualAdd(rl, chainId.toString(), networkName);
    console.log(`Using DeveloperRegistrar: ${developerRegistrarAddress}`);

    // Get the ProjectRegistrar address
    const projectRegistrarAddress = await promptProjectRegistrarForManualAdd(rl, chainId.toString(), networkName);
    console.log(`Using ProjectRegistrar: ${projectRegistrarAddress}`);

    // Verify the ProjectRegistrar exists and get its details
    try {
      const projectRegistrar = PBTSimpleProjectRegistrar__factory.connect(projectRegistrarAddress, provider);
      
      // Verify this project belongs to the specified DeveloperRegistrar
      const projectDeveloperRegistrar = await projectRegistrar.developerRegistrar();
      if (projectDeveloperRegistrar.toLowerCase() !== developerRegistrarAddress.toLowerCase()) {
        throw new Error(`Project's DeveloperRegistrar (${projectDeveloperRegistrar}) does not match the specified DeveloperRegistrar (${developerRegistrarAddress})`);
      }

      console.log(`✓ ProjectRegistrar verified and belongs to the specified DeveloperRegistrar`);
    } catch (error) {
      console.error(`Failed to verify ProjectRegistrar: ${error}`);
      throw error;
    }

    // Get project details
    const projectName = await promptProjectNameForManualAdd(rl);
    const serviceId = await promptServiceIdForManualAdd(rl, chainId.toString(), networkName);
    const lockinPeriod = await promptLockinPeriodForManualAdd(rl);

    console.log(`\nProject Details:`);
    console.log(`- Project Name: ${projectName}`);
    console.log(`- Project Registrar: ${projectRegistrarAddress}`);
    console.log(`- Developer Registrar: ${developerRegistrarAddress}`);
    console.log(`- Service ID: ${serviceId}`);
    console.log(`- Lockin Period: ${lockinPeriod} seconds`);

    // Confirm before proceeding
    const confirm = await new Promise<string>((resolve) => {
      rl.question("\nDo you want to proceed with adding this project? (y/n): ", resolve);
    });

    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log("Operation cancelled.");
      return;
    }

    try {
      // Add the project to the DeveloperRegistrar
      console.log("Adding project to DeveloperRegistrar...");
      
      const developerRegistrar = new DeveloperRegistrar__factory(await hre.ethers.getSigner(developerOwner)).attach(developerRegistrarAddress);
      
      await rawTx({
        from: developerOwner,
        to: developerRegistrarAddress,
        data: developerRegistrar.interface.encodeFunctionData(
          "addProject",
          [
            projectRegistrarAddress,
            calculateLabelHash(projectName),
            serviceId,
            BigNumber.from(lockinPeriod),
          ]
        )
      });

      console.log(`✓ Project "${projectName}" successfully added to DeveloperRegistrar`);
      console.log(`  Project Registrar: ${projectRegistrarAddress}`);
      console.log(`  Developer Registrar: ${developerRegistrarAddress}`);

    } catch (error) {
      console.error(`Failed to add project to DeveloperRegistrar: ${error}`);
      throw error;
    }
  });