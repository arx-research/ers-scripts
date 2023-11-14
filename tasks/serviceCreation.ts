import { ethers } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { ServiceRecord, ServicesRegistry, ServicesRegistry__factory } from "@arx-research/ers-contracts";
import { boolean } from "hardhat/internal/core/params/argumentTypes";

import { stringToBytes } from "../utils/scriptHelpers";
import { CONTENT_APP_RECORD_TYPE } from "../utils/constants";
import { getDeployedContractAddress } from "../utils/helpers";

task("createService", "Create a new service on the ServiceRegistry")
  .addParam("serviceName", "Name of the new service")
  .addParam("content", "String representing a link to off-chain content")
  .addParam("appendId", "Append chipId to end of content string", false, boolean)
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const { serviceName, content, appendId } = taskArgs;

    const { serviceCreator } = await hre.getNamedAccounts();

    const serviceId = ethers.utils.formatBytes32String(serviceName);

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

    async function getServicesRegistry(): Promise<ServicesRegistry> {
      const signer = await hre.ethers.getSigner(serviceCreator);
      const servicesRegistryAddress = getDeployedContractAddress(hre.network.name, "ServicesRegistry");
      const servicesRegistry = new ServicesRegistry__factory(signer).attach(servicesRegistryAddress);
      return servicesRegistry;
    }
  });
