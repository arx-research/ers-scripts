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
  TSMRegistrar,
  TSMRegistrar__factory,
  TSMRegistrarFactory,
  TSMRegistrarFactory__factory,
  TSMRegistry,
  TSMRegistry__factory,
} from "@arx-research/ers-contracts"

import {
  CHIP_REGISTRY_DEPLOY,
  MAX_BLOCK_WINDOW,
  MULTI_SIG_ADDRESSES,
  NULL_NODE,
} from "../utils/constants";

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
  let playgroundRegistrar: TSMRegistrar;
  let servicesRegistry: ServicesRegistry;
  let tsmRegistrarFactory: TSMRegistrarFactory;
  let tsmRegistry: TSMRegistry;

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

    const tsmRegistryAddress  = await getDeployedContractAddress(network, "TSMRegistry");
    tsmRegistry = new TSMRegistry__factory(deployer.wallet).attach(tsmRegistryAddress);

    const tsmRegistrarFactoryAddress  = await getDeployedContractAddress(network, "TSMRegistrarFactory");
    tsmRegistrarFactory = new TSMRegistrarFactory__factory(deployer.wallet).attach(tsmRegistrarFactoryAddress);

    const playgroundRegistrarAddress = await getDeployedContractAddress(network, "ArxPlaygroundRegistrar");
    playgroundRegistrar = new TSMRegistrar__factory(deployer.wallet).attach(playgroundRegistrarAddress);
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

    it("should have the correct tsm registry", async () => {
      const actualTsmRegistry = await chipRegistry.tsmRegistry();
      expect(actualTsmRegistry).to.eq(tsmRegistry.address);
    });

    it("should have the correct gateway Urls", async () => {
      const actualGatewayUrls = await chipRegistry.getGatewayUrls();
      expect(actualGatewayUrls).to.deep.eq(CHIP_REGISTRY_DEPLOY.gatewayUrls);
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
    it("should have the correct tsm registry", async () => {
      const actualTsmRegistry = await ersRegistry.tsmRegistry();
      expect(actualTsmRegistry).to.eq(tsmRegistry.address);
    });

    it("should have the correct chip registry", async () => {
      const actualChipRegistry = await ersRegistry.chipRegistry();
      expect(actualChipRegistry).to.eq(chipRegistry.address);
    });

    it("should have the null node owned by the multi-sig", async () => {
      const actualNullNodeOwner = await ersRegistry.getOwner(NULL_NODE);
      expect(actualNullNodeOwner).to.eq(multiSig);
    });

    it("should have the ers node owned by the tsmRegistry", async () => {
      const actualErsNodeOwner = await ersRegistry.getOwner(calculateSubnodeHash("ers"));
      expect(actualErsNodeOwner).to.eq(tsmRegistry.address);
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

  describe("TSMRegistry", async () => {
    it("should have the correct owner", async () => {
      const actualOwner = await tsmRegistry.owner();
      expect(actualOwner).to.eq(multiSig);
    });

    it("should have the correct ers registry", async () => {
      const actualErsRegistry = await tsmRegistry.ersRegistry();
      expect(actualErsRegistry).to.eq(ersRegistry.address);
    });

    it("should have the TSMRegistrarFactory as enabled factory", async () => {
      const isFactory = await tsmRegistry.registrarFactories(tsmRegistrarFactory.address);
      expect(isFactory).to.be.true;
    });
  });

  describe("TSMRegistrarFactory", async () => {
    it("should have the correct ers registry", async () => {
      const actualErsRegistry = await tsmRegistrarFactory.ers();
      expect(actualErsRegistry).to.eq(ersRegistry.address);
    });

    it("should have the correct chipRegistry", async () => {
      const actualChipRegistry = await tsmRegistrarFactory.chipRegistry();
      expect(actualChipRegistry).to.eq(chipRegistry.address);
    });

    it("should have the correct tsm registry", async () => {
      const actualTsmRegistry = await tsmRegistrarFactory.tsmRegistry();
      expect(actualTsmRegistry).to.eq(tsmRegistry.address);
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

    it("should have the correct tsmRegistrar", async () => {
      const actualTSMRegistrar = await arxProjectEnrollmentManager.tsmRegistrar();
      expect(actualTSMRegistrar).to.eq(playgroundRegistrar.address);
    });

    it("should have the correct transferPolicy", async () => {
      const actualTransferPolicy = await arxProjectEnrollmentManager.transferPolicy();
      expect(actualTransferPolicy).to.eq(ADDRESS_ZERO);
    });

    it("should have the correct max block window", async () => {
      const actualMaxBlockWindow = await arxProjectEnrollmentManager.maxBlockWindow();
      expect(actualMaxBlockWindow).to.eq(MAX_BLOCK_WINDOW[network]);
    });
  });
});
