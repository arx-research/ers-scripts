import { BigNumber, ethers } from "ethers"

export const MULTI_SIG_ADDRESSES: any = {
  "sepolia": "0x2764b37E4d74EEb5961429B034CBa75A93BF5199",
  "base": "0x57902DFB8EF7eA94E799155Ec59acf02E482afd0",
  "mainnet": "0x0"
}

export const NAME_COORDINATOR: any = {
  "localhost": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "sepolia": "0x2764b37E4d74EEb5961429B034CBa75A93BF5199",
  "base": "0xE06Acb2a102aD36dEbC27C93cFD5b6c38f3099bC",
  "mainnet": "0x0"
}

export const CHIP_REGISTRY_DEPLOY: any = {
  "localhost": {
    "maxLockinPeriod": BigNumber.from(10)
  },
  "sepolia": {
    "maxLockinPeriod": BigNumber.from(10)
  },
  "base": {
    "maxLockinPeriod": BigNumber.from(63072000) // 2 years at 365 days in a year
  },
  "mainnet": {
    "maxLockinPeriod": BigNumber.from(10)
  },
}

export const MAX_BLOCK_WINDOW: any = {
  "localhost": BigNumber.from(5),
  "hardhat": BigNumber.from(5),
  "sepolia": BigNumber.from(5),
  "base": BigNumber.from(100),
  "mainnet": BigNumber.from(5),
}
