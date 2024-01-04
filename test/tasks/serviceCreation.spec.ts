import fs from "fs";
import chai from "chai";
import sinon from "sinon";
import mockStdin from 'mock-stdin'
import hardhat from "hardhat";
// import { taskArguments } from "hardhat/internal/core/params/argumentTypes";
import { ServicesRegistry, ServicesRegistry__factory } from "@arx-research/ers-contracts";
import { rl } from "../../utils/scriptHelpers";
import { getDeployedContractAddress } from "../../utils/helpers";
import { getServiceId } from "../../utils/prompts/serviceCreationPrompts";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;

const stdin = mockStdin.stdin()

async function getServicesRegistry(hre: HardhatRuntimeEnvironment): Promise<ServicesRegistry> {
  const { serviceCreator } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(serviceCreator);
  const servicesRegistryAddress = getDeployedContractAddress(hre.network.name, "ServicesRegistry");
  const servicesRegistry = new ServicesRegistry__factory(signer).attach(servicesRegistryAddress);
  return servicesRegistry;
}

describe("createService", () => {

  afterEach(() => {
    if (stdin) {
      stdin.restore();
    }
  });

  it("should create a new service on the ServiceRegistry", async () => {
    const cons = sinon.spy(fs, 'write');

    await getServiceId(rl, await getServicesRegistry(hardhat));
    stdin.send("CoolService");
    stdin.end();

    expect(cons).to.be.calledWith("What would you like to name the service? ")
  });
});
