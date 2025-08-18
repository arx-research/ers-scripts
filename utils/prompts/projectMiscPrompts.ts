import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { queryUser } from "../scriptHelpers";

function getTaskOutputs(taskName: string, currentChainId: string, currentNetworkName: string): { id: string, model: string }[] {
  const outputDir = path.join(__dirname, `../../task_outputs/${currentNetworkName}/${taskName}`);
  if (!fs.existsSync(outputDir)) {
    return [];
  }

  const files = fs.readdirSync(outputDir);
  return files
    .filter(file => path.extname(file).toLowerCase() === '.json')
    .map((file) => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));

        if (content.chainId !== currentChainId) {
          return null;
        }

        switch (taskName) {
          case 'createDeveloperRegistrar':
            return {
              id: content.developerRegistrar || 'Unknown',
              model: `Name: ${content.name}`
            };

          case 'createProject':
            return {
              id: content.projectRegistrar || 'Unknown',
              model: content.name || 'Unknown'
            };

          case 'createService':
            return {
              id: content.serviceId || 'Unknown',
              model: content.serviceName || 'Unknown'
            };

          default:
            return null;
        }
      } catch (error) {
        console.error(`Failed to process file ${file}:`, error);
        return null;
      }
    })
    .filter((output): output is { id: string, model: string } => output !== null);
}

export async function promptDeveloperRegistrarForManualAdd(
  prompter: readline.ReadLine,
  chainId: string,
  networkName: string
): Promise<string> {
  const taskOutputs = getTaskOutputs('createDeveloperRegistrar', chainId, networkName);

  if (taskOutputs.length > 0) {
    console.log("Available DeveloperRegistrars:");
    taskOutputs.forEach((output, index) => {
      console.log(`${index + 1}: ${output.model} (ID: ${output.id})`);
    });
    console.log(`${taskOutputs.length + 1}: Enter custom DeveloperRegistrar address`);

    const choice = await queryUser(prompter, "Select a DeveloperRegistrar or enter a custom address (default is option 1): ");

    if (!choice) {
      return taskOutputs[0].id;
    }

    const choiceNum = parseInt(choice);
    
    // If it's not a valid number or is an address, treat as custom address
    if (isNaN(choiceNum) || choice.startsWith('0x')) {
      return choice;
    }

    if (choiceNum <= 0 || choiceNum > taskOutputs.length + 1) {
      return taskOutputs[0].id;
    }

    if (choiceNum === taskOutputs.length + 1) {
      return await queryUser(prompter, "Enter DeveloperRegistrar address: ");
    }

    return taskOutputs[choiceNum - 1].id;
  }

  return queryUser(prompter, "What is the address of your DeveloperRegistrar? ");
}

export async function promptProjectRegistrarForManualAdd(
  prompter: readline.ReadLine,
  chainId: string,
  networkName: string
): Promise<string> {
  const taskOutputs = getTaskOutputs('createProject', chainId, networkName);

  if (taskOutputs.length > 0) {
    console.log("Available Project Registrars:");
    taskOutputs.forEach((output, index) => {
      console.log(`${index + 1}: ${output.model} (ID: ${output.id})`);
    });
    console.log(`${taskOutputs.length + 1}: Enter custom Project Registrar address`);

    const choice = await queryUser(prompter, "Select a Project Registrar or enter a custom address (default is option 1): ");

    if (!choice) {
      return taskOutputs[0].id;
    }

    const choiceNum = parseInt(choice);
    
    // If it's not a valid number or is an address, treat as custom address
    if (isNaN(choiceNum) || choice.startsWith('0x')) {
      return choice;
    }

    if (choiceNum <= 0 || choiceNum > taskOutputs.length + 1) {
      return taskOutputs[0].id;
    }

    if (choiceNum === taskOutputs.length + 1) {
      return await queryUser(prompter, "Enter Project Registrar address: ");
    }

    return taskOutputs[choiceNum - 1].id;
  }

  return queryUser(prompter, "What is the address of your Project Registrar? ");
}

export async function promptServiceIdForManualAdd(
  prompter: readline.ReadLine,
  chainId: string,
  networkName: string
): Promise<string> {
  const taskOutputs = getTaskOutputs('createService', chainId, networkName);

  if (taskOutputs.length > 0) {
    console.log("Available Services:");
    taskOutputs.forEach((output, index) => {
      console.log(`${index + 1}: ${output.model} (ID: ${output.id})`);
    });
    console.log(`${taskOutputs.length + 1}: Enter custom Service ID`);

    const choice = await queryUser(prompter, "Select a Service ID or enter a custom ID (default is option 1): ");

    if (!choice) {
      return taskOutputs[0].id;
    }

    const choiceNum = parseInt(choice);
    
    // If it's not a valid number or is an address, treat as custom ID
    if (isNaN(choiceNum) || choice.startsWith('0x')) {
      return choice;
    }

    if (choiceNum <= 0 || choiceNum > taskOutputs.length + 1) {
      return taskOutputs[0].id;
    }

    if (choiceNum === taskOutputs.length + 1) {
      return await queryUser(prompter, "Enter Service ID: ");
    }

    return taskOutputs[choiceNum - 1].id;
  }

  const serviceId = await queryUser(prompter, "Enter the Service ID for this project: ");

  if (serviceId.slice(0, 2) != '0x' || serviceId.length != 66) {
    console.log("Not a valid Service ID, service ID must be a bytes32 hash");
    return await promptServiceIdForManualAdd(prompter, chainId, networkName);
  }

  return serviceId;
}

export async function promptProjectNameForManualAdd(prompter: readline.ReadLine): Promise<string> {
  const name = await queryUser(prompter, "Enter the project name: ");
  
  if (name.length === 0) {
    throw Error("Must define a project name");
  }

  return name;
}

export async function promptLockinPeriodForManualAdd(prompter: readline.ReadLine): Promise<number> {
  const lockinPeriod = await queryUser(prompter, "Enter the lockin period (in seconds, or press Enter for 0): ");
  
  if (!lockinPeriod) {
    return 0;
  }

  const parsed = parseInt(lockinPeriod);
  if (isNaN(parsed) || parsed < 0) {
    console.log("Invalid lockin period. Please enter a valid number.");
    return await promptLockinPeriodForManualAdd(prompter);
  }

  return parsed;
}