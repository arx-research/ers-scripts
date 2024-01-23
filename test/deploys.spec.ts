import { deployments } from "hardhat";

import {
  Address,
  ADDRESS_ZERO,
  ArxProjectEnrollmentManager,
  ArxProjectEnrollmentManager__factory,
  calculateSubnodeHash,
  ChipRegistry,
  ChipRegistry__factory,
  ERSRegistry,
  ERSRegistry__factory,
  ManufacturerRegistry,
  ManufacturerRegistry__factory,
  ServicesRegistry,
  ServicesRegistry__factory,
  DeveloperNameGovernor,
  DeveloperNameGovernor__factory,
  DeveloperRegistrar,
  DeveloperRegistrar__factory,
  DeveloperRegistrarFactory,
  DeveloperRegistrarFactory__factory,
  DeveloperRegistry,
  DeveloperRegistry__factory,
} from "@arx-research/ers-contracts"

import {
  CHIP_REGISTRY_DEPLOY,
  MAX_BLOCK_WINDOW,
  MULTI_SIG_ADDRESSES,
  NAME_COORDINATOR,
} from "../deployments/parameters";
import { NULL_NODE } from "../utils/constants";

import {
  getAccounts,
  getWaffleExpect,
} from "../utils/test";
import {
  Account
} from "../utils/test/types";
import {
  getDeployedContractAddress,
} from "../utils/helpers";

const expect = getWaffleExpect();

describe("Base System Deploy", () => {
  let deployer: Account;
  let multiSig: Address;

  let arxProjectEnrollmentManager: ArxProjectEnrollmentManager;
  let chipRegistry: ChipRegistry;
  let ersRegistry: ERSRegistry;
  let manufacturerRegistry: ManufacturerRegistry;
  let playgroundRegistrar: DeveloperRegistrar;
  let servicesRegistry: ServicesRegistry;
  let developerRegistrarFactory: DeveloperRegistrarFactory;
  let developerRegistry: DeveloperRegistry;
  let developerNameGovernor: DeveloperNameGovernor;

  const network = deployments.getNetworkName();

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    multiSig = MULTI_SIG_ADDRESSES[network] ? MULTI_SIG_ADDRESSES[network] : deployer.address;

    const arxProjectEnrollmentManagerAddress = (await deployments.get("ArxProjectEnrollmentManager")).address;
    arxProjectEnrollmentManager = new ArxProjectEnrollmentManager__factory(deployer.wallet).attach(arxProjectEnrollmentManagerAddress);

    const chipRegistryAddress  = await getDeployedContractAddress(network, "ChipRegistry");
    chipRegistry = new ChipRegistry__factory(deployer.wallet).attach(chipRegistryAddress);

    const manufacturerRegistryAddress  = await getDeployedContractAddress(network, "ManufacturerRegistry");
    manufacturerRegistry = new ManufacturerRegistry__factory(deployer.wallet).attach(manufacturerRegistryAddress);

    const ersRegistryAddress  = await getDeployedContractAddress(network, "ERSRegistry");
    ersRegistry = new ERSRegistry__factory(deployer.wallet).attach(ersRegistryAddress);

    const servicesRegistryAddress  = await getDeployedContractAddress(network, "ServicesRegistry");
    servicesRegistry = new ServicesRegistry__factory(deployer.wallet).attach(servicesRegistryAddress);

    const developerRegistryAddress  = await getDeployedContractAddress(network, "DeveloperRegistry");
    developerRegistry = new DeveloperRegistry__factory(deployer.wallet).attach(developerRegistryAddress);

    const developerNameGovernorAddress  = await getDeployedContractAddress(network, "DeveloperNameGovernor");
    developerNameGovernor = new DeveloperNameGovernor__factory(deployer.wallet).attach(developerNameGovernorAddress);

    const developerRegistrarFactoryAddress  = await getDeployedContractAddress(network, "DeveloperRegistrarFactory");
    developerRegistrarFactory = new DeveloperRegistrarFactory__factory(deployer.wallet).attach(developerRegistrarFactoryAddress);

    const playgroundRegistrarAddress = await getDeployedContractAddress(network, "ArxPlaygroundRegistrar");
    playgroundRegistrar = new DeveloperRegistrar__factory(deployer.wallet).attach(playgroundRegistrarAddress);
  });

  describe("ChipRegistry", async () => {
    it("should have the correct manufacturer registry", async () => {
      const actualManufacturerRegistry = await chipRegistry.manufacturerRegistry();
      expect(actualManufacturerRegistry).to.eq(manufacturerRegistry.address);
    });

    it("should have the correct ers registry", async () => {
      const actualErsRegistry = await chipRegistry.ers();
      expect(actualErsRegistry).to.eq(ersRegistry.address);
    });

    it("should have the correct services registry", async () => {
      const actualServicesRegistry = await chipRegistry.servicesRegistry();
      expect(actualServicesRegistry).to.eq(servicesRegistry.address);
    });

    it("should have the correct developer registry", async () => {
      const actualTsmRegistry = await chipRegistry.developerRegistry();
      expect(actualTsmRegistry).to.eq(developerRegistry.address);
    });

    it("should have the correct gateway Urls", async () => {
      const actualGatewayUrls = await chipRegistry.getGatewayUrls();
      expect(actualGatewayUrls).to.deep.eq(CHIP_REGISTRY_DEPLOY[network].gatewayUrls);
    });

    it("should have the correct gateway Urls", async () => {
      const actualGatewayUrls = await chipRegistry.maxLockinPeriod();
      expect(actualGatewayUrls).to.deep.eq(CHIP_REGISTRY_DEPLOY[network].maxLockinPeriod);
    });

    it("should have the correct max block window", async () => {
      const actualMaxBlockWindow = await chipRegistry.maxBlockWindow();
      expect(actualMaxBlockWindow).to.eq(MAX_BLOCK_WINDOW[network]);
    });

    it("should have the correct owner", async () => {
      const actualOwner = await chipRegistry.owner();
      expect(actualOwner).to.eq(multiSig);
    });
  });

  describe("ERSRegistry", async () => {
    it("should have the correct developer registry", async () => {
      const actualTsmRegistry = await ersRegistry.developerRegistry();
      expect(actualTsmRegistry).to.eq(developerRegistry.address);
    });

    it("should have the correct chip registry", async () => {
      const actualChipRegistry = await ersRegistry.chipRegistry();
      expect(actualChipRegistry).to.eq(chipRegistry.address);
    });

    it("should have the null node owned by the multi-sig", async () => {
      const actualNullNodeOwner = await ersRegistry.getOwner(NULL_NODE);
      expect(actualNullNodeOwner).to.eq(multiSig);
    });

    it("should have the ers node owned by the developerRegistry", async () => {
      const actualErsNodeOwner = await ersRegistry.getOwner(calculateSubnodeHash("ers"));
      expect(actualErsNodeOwner).to.eq(developerRegistry.address);
    });
  });

  describe("ManufacturerRegistry", async () => {
    it("should have the correct owner", async () => {
      const actualOwner = await manufacturerRegistry.owner();
      expect(actualOwner).to.eq(multiSig);
    });
  });

  describe("ServicesRegistry", async () => {
    it("should have the correct chipRegistry", async () => {
      const actualChipRegistry = await servicesRegistry.chipRegistry();
      expect(actualChipRegistry).to.eq(chipRegistry.address);
    });

    it("should have the correct max block window", async () => {
      const actualMaxBlockWindow = await servicesRegistry.maxBlockWindow();
      expect(actualMaxBlockWindow).to.eq(MAX_BLOCK_WINDOW[network]);
    });
  });

  describe("DeveloperRegistry", async () => {
    it("should have the correct owner", async () => {
      const actualOwner = await developerRegistry.owner();
      expect(actualOwner).to.eq(multiSig);
    });

    it("should have the correct ers registry", async () => {
      const actualErsRegistry = await developerRegistry.ersRegistry();
      expect(actualErsRegistry).to.eq(ersRegistry.address);
    });

    it("should have the DeveloperRegistrarFactory as enabled factory", async () => {
      const isFactory = await developerRegistry.registrarFactories(developerRegistrarFactory.address);
      expect(isFactory).to.be.true;
    });

    it("should have the DeveloperNameGovernor set in the nameGovernor role", async () => {
      const nameGovernor = await developerRegistry.nameGovernor();
      expect(nameGovernor).to.eq(developerNameGovernor.address);
    });
  });

  describe("DeveloperNameGovernor", async () => {
    it("should have the correct owner", async () => {
      const actualOwner = await developerNameGovernor.owner();
      expect(actualOwner).to.eq(multiSig);
    });

    it("should have the correct developer registry", async () => {
      const actualDevRegistry = await developerNameGovernor.developerRegistry();
      expect(actualDevRegistry).to.eq(developerRegistry.address);
    });

    it("should have the correct name coordinator set", async () => {
      const nameGovernor = await developerNameGovernor.nameCoordinator();
      expect(nameGovernor).to.eq(NAME_COORDINATOR[network]);
    });
  });

  describe("DeveloperRegistrarFactory", async () => {
    it("should have the correct ers registry", async () => {
      const actualErsRegistry = await developerRegistrarFactory.ers();
      expect(actualErsRegistry).to.eq(ersRegistry.address);
    });

    it("should have the correct chipRegistry", async () => {
      const actualChipRegistry = await developerRegistrarFactory.chipRegistry();
      expect(actualChipRegistry).to.eq(chipRegistry.address);
    });

    it("should have the correct developer registry", async () => {
      const actualTsmRegistry = await developerRegistrarFactory.developerRegistry();
      expect(actualTsmRegistry).to.eq(developerRegistry.address);
    });
  });

  describe("ArxPlaygroundRegistrar", async () => {
    it("should have the correct owner", async () => {
      const actualOwner = await playgroundRegistrar.owner();
      expect(actualOwner).to.eq(arxProjectEnrollmentManager.address);
    });

    it("should be the owner of the arxplayground.ers node", async () => {
      const actualNodeOwner = await ersRegistry.getOwner(calculateSubnodeHash("arxplayground.ers"));
      expect(actualNodeOwner).to.eq(playgroundRegistrar.address);
    });
  });

  describe("ArxProjectEnrollmentManager", async () => {
    it("should have the correct owner", async () => {
      const actualOwner = await arxProjectEnrollmentManager.owner();
      expect(actualOwner).to.eq(multiSig);
    });

    it("should have the correct ers registry", async () => {
      const actualErsRegistry = await arxProjectEnrollmentManager.ers();
      expect(actualErsRegistry).to.eq(ersRegistry.address);
    });

    it("should have the correct chipRegistry", async () => {
      const actualChipRegistry = await arxProjectEnrollmentManager.chipRegistry();
      expect(actualChipRegistry).to.eq(chipRegistry.address);
    });

    it("should have the correct developerRegistrar", async () => {
      const actualDeveloperRegistrar = await arxProjectEnrollmentManager.developerRegistrar();
      expect(actualDeveloperRegistrar).to.eq(playgroundRegistrar.address);
    });

    it("should have the correct transferPolicy", async () => {
      const actualTransferPolicy = await arxProjectEnrollmentManager.transferPolicy();
      expect(actualTransferPolicy).to.eq(await getDeployedContractAddress(network, "OpenTransferPolicy"));
    });

    it("should have the correct max block window", async () => {
      const actualMaxBlockWindow = await arxProjectEnrollmentManager.maxBlockWindow();
      expect(actualMaxBlockWindow).to.eq(MAX_BLOCK_WINDOW[network]);
    });
  });
});
