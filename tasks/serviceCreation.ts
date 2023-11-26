import { task } from "hardhat/config";
import { ServiceRecord, ServicesRegistry, ServicesRegistry__factory } from "@arx-research/ers-contracts";

import { stringToBytes, rl } from "../utils/scriptHelpers";
import { CONTENT_APP_RECORD_TYPE } from "../utils/constants";
import { getDeployedContractAddress } from "../utils/helpers";
import { getServiceId, getRedirectContent, getAppendId } from "../utils/prompts/serviceCreationPrompts";

task("createService", "Create a new service on the ServiceRegistry")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx, read } = hre.deployments;

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

    async function getServicesRegistry(): Promise<ServicesRegistry> {
      const signer = await hre.ethers.getSigner(serviceCreator);
      const servicesRegistryAddress = getDeployedContractAddress(hre.network.name, "ServicesRegistry");
      const servicesRegistry = new ServicesRegistry__factory(signer).attach(servicesRegistryAddress);
      return servicesRegistry;
    }
  });
