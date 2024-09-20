import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { ServiceRecord, ServicesRegistry, ServicesRegistry__factory } from "@arx-research/ers-contracts";
import * as fs from 'fs';
import * as path from 'path';

import { stringToBytes, rl } from "../utils/scriptHelpers";
import { CONTENT_APP_RECORD_TYPE } from "../utils/constants";
import { getDeployedContractAddress } from "../utils/helpers";
import { getServiceId, getRedirectContent, getAppendId } from "../utils/prompts/serviceCreationPrompts";

task("createService", "Create a new service on the ServiceRegistry")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const chainId = await hre.getChainId();
    const networkName = hre.network.name;

    const { serviceCreator } = await hre.getNamedAccounts();
    const [serviceId, serviceName] = await getServiceId(rl, await getServicesRegistry());
    const content = await getRedirectContent(rl);
    const appendId = await getAppendId(rl);
    rl.close();

    const serviceRecord: ServiceRecord = {
      recordType: CONTENT_APP_RECORD_TYPE,
      content: stringToBytes(content),
      appendId: appendId
    };

    const servicesRegistry = await getServicesRegistry();

    await rawTx({
      from: serviceCreator,
      to: servicesRegistry.address,
      data: servicesRegistry.interface.encodeFunctionData(
        "createService",
        [
          serviceId,
          [serviceRecord]
        ]
      )
    });

    console.log(`Service ${serviceName} created on ServiceRegistry with following id: ${serviceId}`);

    // Save the service creation data to a JSON file
    const outputDir = path.join(__dirname, `../task_outputs/${networkName}/createService`);
    const outputFilePath = path.join(outputDir, `${serviceId}.json`);

    // Ensure the output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Data to be saved
    const outputData = {
      chainId: chainId.toString(),
      serviceId,
      serviceName,
      serviceCreator,
      serviceRecord,
      servicesRegistry: servicesRegistry.address,
    };

    // Write the data to the JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), "utf8");

    console.log(`Data saved to ${outputFilePath}`);

    async function getServicesRegistry(): Promise<ServicesRegistry> {
      const signer = await hre.ethers.getSigner(serviceCreator);
      const servicesRegistryAddress = getDeployedContractAddress(hre.network.name, "ServicesRegistry");
      const servicesRegistry = new ServicesRegistry__factory(signer).attach(servicesRegistryAddress);
      return servicesRegistry;
    }
  });
