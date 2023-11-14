import { BigNumber, ethers } from "ethers"

export const MULTI_SIG_ADDRESSES: any = {
  "goerli": "0xa969B2687c5486491893a78dAfDE1A1617C2691a"
}

export const CHIP_REGISTRY_DEPLOY: any = {
  "gatewayUrls": [],
  "maxLockinPeriod": BigNumber.from(10)
}

export const NULL_NODE: string = ethers.constants.HashZero;
export const MAX_BLOCK_WINDOW: any = {
  "localhost": BigNumber.from(5),
  "hardhat": BigNumber.from(5),
  "goerli": BigNumber.from(5)
}

export const CONTENT_APP_RECORD_TYPE = ethers.utils.formatBytes32String("contentApp");
