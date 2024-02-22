import { BigNumber, ethers } from "ethers"

export const MULTI_SIG_ADDRESSES: any = {
  "goerli": "0xa969B2687c5486491893a78dAfDE1A1617C2691a",
  "sepolia": "0x2764b37E4d74EEb5961429B034CBa75A93BF5199",
  "base": "0x57902DFB8EF7eA94E799155Ec59acf02E482afd0",
  "mainnet": "0x0"
}

export const NAME_COORDINATOR: any = {
  "localhost": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "goerli": "0xa969B2687c5486491893a78dAfDE1A1617C2691a",
  "sepolia": "0x2764b37E4d74EEb5961429B034CBa75A93BF5199",
  "base": "0xE06Acb2a102aD36dEbC27C93cFD5b6c38f3099bC",
  "mainnet": "0x0"
}

export const CHIP_REGISTRY_DEPLOY: any = {
  "localhost": {
    "gatewayUrls": [],
    "maxLockinPeriod": BigNumber.from(10)
  },
  "goerli": {
    "gatewayUrls": [],
    "maxLockinPeriod": BigNumber.from(10)
  },
  "sepolia": {
    "gatewayUrls": ["https://sepolia.ers.run/resolve-unclaimed-data/{sender}/{data}"],
    "maxLockinPeriod": BigNumber.from(10)
  },
  "base": {
    "gatewayUrls": ["https://base.ers.run/resolve-unclaimed-data/{sender}/{data}"],
    "maxLockinPeriod": BigNumber.from(63072000) // 2 years at 365 days in a year
  },
  "mainnet": {
    "gatewayUrls": [],
    "maxLockinPeriod": BigNumber.from(10)
  },
}

export const MAX_BLOCK_WINDOW: any = {
  "localhost": BigNumber.from(5),
  "hardhat": BigNumber.from(5),
  "goerli": BigNumber.from(5),
  "sepolia": BigNumber.from(5),
  "base": BigNumber.from(100),
  "mainnet": BigNumber.from(5),
}

export const ARX_REGISTRAR_LABEL: any = {
  "localhost": "arx-playground",
  "goerli": "arx-playground",
  "sepolia": "arx-playground",
  "base": "arx-playground",
  "mainnet": "arx-playground"
};
