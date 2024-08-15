import * as readline from 'readline';
import { BigNumber } from "ethers";
import * as fs from 'fs';
import * as path from 'path';
import {
  ADDRESS_ZERO,
  calculateLabelHash,
  DeveloperRegistrar,
  ERSRegistry,
} from "@arx-research/ers-contracts/";

import { queryUser } from "../scriptHelpers";

// Helper function to get task outputs
// TODO: make sure that we only show task output that match the current chainId
// Helper function to get task outputs
function getTaskOutputs(taskName: string, currentChainId: string): { id: string, model: string }[] {
  const outputDir = path.join(__dirname, `../../task_outputs/${taskName}`);
  if (!fs.existsSync(outputDir)) {
    return [];
  }

  const files = fs.readdirSync(outputDir);
  return files
    .map((file) => {
      const content = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));

      // Filter by chainId
      if (content.chainId !== currentChainId) {
        return null; // Skip non-matching chainId
      }

      switch (taskName) {
        case 'createDeveloperRegistrar':
          return {
            id: content.developerRegistrar || 'Unknown',
            model: `Name: ${content.name}`
          };

        case 'addManufacturerEnrollment':
          const manufacturerName = lookupManufacturerName(content.manufacturerId);
          return {
            id: content.enrollmentId || 'Unknown',
            model: `Manufacturer: ${manufacturerName || content.manufacturerId}`
          };

        case 'createService':
          return {
            id: content.serviceId || 'Unknown',
            model: content.serviceName || 'Unknown'
          };

        default:
          return null; // Return null for any unhandled cases
      }
    })
    .filter((output): output is { id: string, model: string } => output !== null); // Filter out null results and enforce correct typing
}

// Function to get project registrars from task outputs
function getProjectRegistrars(currentChainId: string): { id: string, model: string }[] {
  return getTaskOutputs('createProject', currentChainId);
}

// Prompt user for adding chips to existing project or creating a new one
export async function promptProjectRegistrar(
  prompter: readline.ReadLine,
  chainId: string
): Promise<{ id: string; isNew: boolean; artifactFound: boolean }> {
  console.log("Would you like to add chips to an existing project or create a new one?");
  console.log("1: Add chips to an existing project");
  console.log("2: Create a new project");

  const choice = await queryUser(prompter, "Select an option (default is option 1): ");

  if (!choice || choice === '1') {
    const projectRegistrars = getProjectRegistrars(chainId);

    if (projectRegistrars.length > 0) {
      console.log("Available Projects:");
      projectRegistrars.forEach((output, index) => {
        console.log(`${index + 1}: ${output.model} (ID: ${output.id})`);
      });
      console.log(`${projectRegistrars.length + 1}: Enter custom project address`);

      const projectChoice = await queryUser(prompter, "Select a project or enter a custom address (default is option 1): ");

      if (!projectChoice || parseInt(projectChoice) <= 0 || parseInt(projectChoice) > projectRegistrars.length) {
        return { id: projectRegistrars[0].id, isNew: false, artifactFound: true };
      }

      return { id: projectRegistrars[parseInt(projectChoice) - 1].id, isNew: false, artifactFound: true };
    }
    // TODO: validate address
    const projectChoice = await queryUser(prompter, "Enter existing project address: ");
    return { id: projectChoice, isNew: false, artifactFound: false };

  }

  return { id: '', isNew: true, artifactFound: false };
}


// Function to lookup manufacturer name from addManufacturer task outputs
function lookupManufacturerName(manufacturerId: string): string | null {
  const outputDir = path.join(__dirname, `../../task_outputs/addManufacturer`);
  if (!fs.existsSync(outputDir)) {
    return null;
  }

  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));
    if (content.manufacturerId === manufacturerId) {
      return content.manufacturerName || null;
    }
  }

  return null;
}

// Modified function to suggest DeveloperRegistrar
export async function getUserDeveloperRegistrar(prompter: readline.ReadLine, chainId: string): Promise<string> {
  const taskOutputs = getTaskOutputs('createDeveloperRegistrar', chainId);

  if (taskOutputs.length > 0) {
    console.log("Available DeveloperRegistrars:");
    taskOutputs.forEach((output, index) => {
      console.log(`${index + 1}: ${output.model} (ID: ${output.id})`);
    });
    console.log(`${taskOutputs.length + 1}: Enter custom DeveloperRegistrar address`);

    const choice = await queryUser(prompter, "Select a DeveloperRegistrar or enter a custom address (default is option 1): ");

    if (!choice || parseInt(choice) <= 0 || parseInt(choice) > taskOutputs.length) {
      return taskOutputs[0].id;
    }

    return taskOutputs[parseInt(choice) - 1].id;
  }

  return queryUser(prompter, "What is the address of your DeveloperRegistrar? ");
}

// Original function for getting project name
export async function getProjectName(
  prompter: readline.ReadLine,
  ersRegistry: ERSRegistry,
  developerRegistrar: DeveloperRegistrar
): Promise<string> {
  const name = await queryUser(
    prompter,
    "What name would you like to give your project? "
  );

  if (name.length == 0) {
    throw Error(`Must define a project name`);
  }

  // Check that the namespace hasn't been taken
  let labelOwner = ADDRESS_ZERO;
  if (developerRegistrar.address != ADDRESS_ZERO) {
    const developerRootnode = await developerRegistrar.rootNode();
    labelOwner = await ersRegistry.getSubnodeOwner(developerRootnode, calculateLabelHash(name));
  }
  if (labelOwner != ADDRESS_ZERO) {
    console.log(`The name ${name} has already been taken. Please choose a different name.`);
    return await getProjectName(prompter, ersRegistry, developerRegistrar);
  }

  return name;
}

// Original function for getting project symbol
export async function getProjectSymbol(prompter: readline.ReadLine): Promise<string> {
  const tokenSymbol = await queryUser(
    prompter,
    `Which token symbol would you like to use for your project (e.g. $ERS)? `
  );

  if (tokenSymbol.length == 0) {
    throw Error(`Must define a project symbol`);
  }

  return tokenSymbol;
}

// Modified function for getting service timelock with default and fault tolerance
export async function getServiceTimelock(prompter: readline.ReadLine): Promise<BigNumber> {
  let rawTimelock = await queryUser(
    prompter,
    "How long do you want to lock-in the redirect URL for (in seconds)? (Default is 0): "
  );

  // Default to 0 if nothing is entered
  if (!rawTimelock) {
    rawTimelock = "0";
  }

  let timelock;
  try {
    timelock = BigNumber.from(rawTimelock);
  } catch {
    console.log("Invalid input. Defaulting to 0.");
    timelock = BigNumber.from("0");
  }

  const verifyInput = await queryUser(
    prompter,
    `Are you sure you want to set the lock-in period for ${timelock.div(86400).toString()} days? (y/n) `
  );

  if (verifyInput == 'n') {
    return await getServiceTimelock(prompter);
  }

  if (timelock.gt(31536000)) {
    console.log("Specified time period is too long. Please re-enter a valid time period.");
    return await getServiceTimelock(prompter);
  }

  // Calculate current timestamp and add timelock period to it to get the expiration timestamp
  const currentTimestamp = BigNumber.from(Math.floor(Date.now() / 1000));

  return currentTimestamp.add(timelock);
}

// Modified function to suggest Service ID
export async function getServiceId(prompter: readline.ReadLine, chainId: string): Promise<string> {
  const taskOutputs = getTaskOutputs('createService', chainId);

  if (taskOutputs.length > 0) {
    console.log("Available Services:");
    taskOutputs.forEach((output, index) => {
      console.log(`${index + 1}: ${output.model} (ID: ${output.id})`);
    });
    console.log(`${taskOutputs.length + 1}: Enter custom Service ID`);

    const choice = await queryUser(prompter, "Select a Service ID or enter a custom ID (default is option 1): ");

    if (!choice || parseInt(choice) <= 0 || parseInt(choice) > taskOutputs.length) {
      return taskOutputs[0].id;
    }

    return taskOutputs[parseInt(choice) - 1].id;
  }

  const serviceId = await queryUser(prompter, `Which service ID would you like to set as primary service for your project enrollment? `);

  if(serviceId.slice(0, 2) != '0x' || serviceId.length != 66) {
    console.log("Not a valid Service ID, service ID must be a bytes32 hash");

    return await getServiceId(prompter, chainId);
  }

  return serviceId;
}

// Original function for getting token URI data
export async function getTokenURIData(prompter: readline.ReadLine): Promise<string> {
  const tokenURIRoot = await queryUser(
    prompter,
    "What's the tokenUri root for chips in the project? All chip metadata should be bundled at the same root. "
  );

  // lib-ers adds the slash when generating the tokenURI, so we need to remove it if it's there
  return tokenURIRoot[tokenURIRoot.length-1] == "/" ? tokenURIRoot.slice(0,-1) : tokenURIRoot;
}

// Modified function to suggest Enrollment ID
export async function getEnrollmentId(prompter: readline.ReadLine, chainId: string): Promise<string> {
  const taskOutputs = getTaskOutputs('addManufacturerEnrollment', chainId);

  if (taskOutputs.length > 0) {
    console.log("Available Enrollment IDs:");
    taskOutputs.forEach((output, index) => {
      console.log(`${index + 1}: ${output.model} (ID: ${output.id})`);
    });
    console.log(`${taskOutputs.length + 1}: Enter custom Enrollment ID`);

    const choice = await queryUser(prompter, "Select an Enrollment ID or enter a custom ID (default is option 1): ");

    if (!choice || parseInt(choice) <= 0 || parseInt(choice) > taskOutputs.length) {
      return taskOutputs[0].id;
    }

    return taskOutputs[parseInt(choice) - 1].id;
  }

  const enrollmentId = await queryUser(prompter, `What is the enrollmentId for these chips (only required for localhost deployments)? `);

  if (enrollmentId.slice(0, 2) != '0x' || enrollmentId.length != 66) {
    console.log("Invalid enrollmentId. Please provide a valid address.");
    return getEnrollmentId(prompter, chainId);
  }

  return enrollmentId;
}
