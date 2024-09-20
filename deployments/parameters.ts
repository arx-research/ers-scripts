import { BigNumber, ethers } from "ethers"

export const MULTI_SIG_ADDRESSES: any = {
  "sepolia": "0x2764b37E4d74EEb5961429B034CBa75A93BF5199",
  "base": "0x57902DFB8EF7eA94E799155Ec59acf02E482afd0",
}

export const NAME_COORDINATOR: any = {
  "localhost": "0x834DBDA1e8059b77A8e0Ac05b4f2143d2F787552",
  "sepolia": "0x834DBDA1e8059b77A8e0Ac05b4f2143d2F787552",
  "base": "0x834DBDA1e8059b77A8e0Ac05b4f2143d2F787552",
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
}

export const MAX_BLOCK_WINDOW: any = {
  "localhost": BigNumber.from(5),
  "hardhat": BigNumber.from(5),
  "sepolia": BigNumber.from(5),
  "base": BigNumber.from(100),
  "mainnet": BigNumber.from(5),
}
