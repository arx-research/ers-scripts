import { HardhatUserConfig } from "hardhat/config";

import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-viem';
import './tasks';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 200000,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [
        `0x${process.env.TESTNET_DEPLOY_PRIVATE_KEY}`,
        `0x${process.env.TESTNET_MANUFACTURER_PRIVATE_KEY}`,
        `0x${process.env.TESTNET_SERVICE_CREATOR_PRIVATE_KEY}`,
        `0x${process.env.TESTNET_CHIP_OWNER_PRIVATE_KEY}`,
      ],
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_KEY
        },
      },
    },
    base: {
      url: "https://developer-access-mainnet.base.org",
      // @ts-ignore
      accounts: [
        `0x${process.env.BASE_DEPLOY_PRIVATE_KEY}`,
        `0x${process.env.BASE_MANUFACTURER_PRIVATE_KEY}`,
        `0x${process.env.BASE_SERVICE_CREATOR_PRIVATE_KEY}`,
        `0x${process.env.BASE_CHIP_OWNER_PRIVATE_KEY}`,
      ],
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org/",
          apiKey: process.env.BASESCAN_API_KEY
        }
      },
    },
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  },
  namedAccounts: {
    deployer: {
      localhost: 0,
      sepolia: `privatekey://0x${process.env.TESTNET_DEPLOY_PRIVATE_KEY}`,
      base: `privatekey://0x${process.env.BASE_DEPLOY_PRIVATE_KEY}`,
    },
    defaultManufacturer: {
      localhost: 1,
      sepolia: `privatekey://0x${process.env.TESTNET_MANUFACTURER_PRIVATE_KEY}`,
      base: `privatekey://0x${process.env.BASE_MANUFACTURER_PRIVATE_KEY}`,
    },
    developerOwner: {
      localhost: 2,
      sepolia: `privatekey://0x${process.env.TESTNET_DEVELOPER_OWNER_PRIVATE_KEY}`,
      base: `privatekey://0x${process.env.BASE_DEVELOPER_OWNER_PRIVATE_KEY}`,
    },
    serviceCreator: {
      localhost: 3,
      sepolia: `privatekey://0x${process.env.TESTNET_SERVICE_CREATOR_PRIVATE_KEY}`,
      base: `privatekey://0x${process.env.BASE_SERVICE_CREATOR_PRIVATE_KEY}`,
    },
    chipOwner: {
      localhost: 6,
      sepolia: `privatekey://0x${process.env.TESTNET_CHIP_OWNER_PRIVATE_KEY}`,
      base: `privatekey://0x${process.env.BASE_CHIP_OWNER_PRIVATE_KEY}`,
    }
  },
  // @ts-ignore
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
