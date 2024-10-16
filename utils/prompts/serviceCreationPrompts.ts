import * as readline from 'readline';
import { ethers } from "ethers";
import { ADDRESS_ZERO, ServicesRegistry } from "@arx-research/ers-contracts/";

import { queryUser } from "../scriptHelpers";

export async function getServiceId(prompter: readline.ReadLine, servicesRegistry: ServicesRegistry): Promise<[string, string]> {
  const serviceName = await queryUser(prompter, "What would you like to name the service? ");
  // Calculate serviceId from serviceName
  const serviceId = ethers.utils.formatBytes32String(serviceName);

  // Validate that serviceId isn't in use, if so then re-prompt
  const serviceInfo = await servicesRegistry.getServiceInfo(serviceId);
  if (serviceInfo.owner != ADDRESS_ZERO) {
    console.log("Service name already in use, please choose another.")
    return await getServiceId(prompter, servicesRegistry);
  }

  return [serviceId, serviceName];
}

// TODO: validate that it's a http or https or ipfs URI, prompt again if not
export async function getRedirectContent(prompter:readline.ReadLine): Promise<string> {
  const content = await queryUser(prompter, "What root URL or URI would you like to redirect chips enrolled in this service to? ");

  // If content doesn't end in backslash then append backslash in case ID is being appended to end of content string
  return content[content.length-1] == "/" ? content : content + "/";
}

export async function getAppendId(prompter: readline.ReadLine): Promise<boolean> {
  const ans = await queryUser(prompter, "Do you want to append chip IDs to the end of your root URI/URL (e.g. ipfs.com/0x123/$chipId)? Doing so allows you to create personalized tokenUri data for each chip (yes/no)");

  if (["yes", "y"].includes(ans.toLowerCase())) {
    return true;
  } else if (["no", "n"].includes(ans.toLowerCase())) {
    return false;
  } else {
    console.log("Answer must be yes/y or no/n");
    return await getAppendId(prompter);
  }
}
