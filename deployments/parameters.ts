import { BigNumber, ethers } from "ethers"

export const MULTI_SIG_ADDRESSES: any = {
  "goerli": "0xa969B2687c5486491893a78dAfDE1A1617C2691a",
  "sepolia": "0x2764b37E4d74EEb5961429B034CBa75A93BF5199",
  "base": "0x0",
  "mainnet": "0x0"
}

export const NAME_COORDINATOR: any = {
  "localhost": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "goerli": "0xa969B2687c5486491893a78dAfDE1A1617C2691a",
  "sepolia": "0x2764b37E4d74EEb5961429B034CBa75A93BF5199",
  "base": "0x0",
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
    "gatewayUrls": [],
    "maxLockinPeriod": BigNumber.from(10)
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
  "base": BigNumber.from(5),
  "mainnet": BigNumber.from(5),
}

export const ARX_REGISTRAR_LABEL: any = {
  "localhost": "arxplayground",
  "goerli": "arxplayground",
  "sepolia": "arxplayground",
  "base": "arxplayground",
  "mainnet": "arxplayground"
};
