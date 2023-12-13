import { HardhatUserConfig } from "hardhat/config";

import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-etherscan';
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
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [
        `0x${process.env.GOERLI_DEPLOY_PRIVATE_KEY}`,
        `0x${process.env.GOERLI_MANUFACTURER_PRIVATE_KEY}`,
        `0x${process.env.GOERLI_MANUFACTURER_SIGNER_PRIVATE_KEY}`,
        `0x${process.env.GOERLI_SERVICE_CREATOR_PRIVATE_KEY}`,
        `0x${process.env.GOERLI_PROJECT_OWNER_PRIVATE_KEY}`,
        `0x${process.env.GOERLI_PROJECT_PUBLIC_PRIVATE_KEY}`,
        `0x${process.env.GOERLI_CHIP_OWNER_PRIVATE_KEY}`,
      ],
    },
  },
  namedAccounts: {
    deployer: {
      localhost: 0,
      goerli: `privatekey://0x${process.env.GOERLI_DEPLOY_PRIVATE_KEY}`,
    },
    defaultManufacturer: {
      localhost: 1,
      goerli: `privatekey://0x${process.env.GOERLI_MANUFACTURER_PRIVATE_KEY}`,
    },
    defaultManufacturerSigner: {
      localhost: 2,
      goerli: `privatekey://0x${process.env.GOERLI_MANUFACTURER_SIGNER_PRIVATE_KEY}`,
    },
    serviceCreator: {
      localhost: 3,
      goerli: `privatekey://0x${process.env.GOERLI_SERVICE_CREATOR_PRIVATE_KEY}`,
    },
    projectOwner: {
      localhost: 4,
      goerli: `privatekey://0x${process.env.GOERLI_PROJECT_OWNER_PRIVATE_KEY}`,
    },
    projectPublicKey: {
      localhost: 5,
      goerli: `privatekey://0x${process.env.GOERLI_PROJECT_PUBLIC_PRIVATE_KEY}`,
    },
    chipOwner: {
      localhost: 6,
      goerli: `privatekey://0x${process.env.GOERLI_CHIP_OWNER_PRIVATE_KEY}`,
    }
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY
    }
  },
  // @ts-ignore
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
