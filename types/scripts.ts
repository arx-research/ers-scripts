import { Address, ManufacturerValidationInfo, DeveloperMerkleProofInfo } from "@arx-research/ers-contracts";
import { BigNumber } from "ethers";
import mongoose from "mongoose";

export interface AddManufacturerEnrollment {
  manufacturerId: string,
  manufacturerSigner: Address,
  chipKeys: KeysFromChipScan[],
  authModel: Address,
  enrollmentAuthModel: Address,
  bootloaderApp: string,
  chipModel: string,
  numberOfChips: BigNumber,
  chainId: number
}

export interface ManufacturerEnrollmentIPFS {
  validationInfo: ManufacturerValidationInfo,
  pk2: Address
}

export interface CreateProject {
  developerRegistrar: Address,
  name: string,
  tokenSymbol: string,
  tokenUriRoot: string,
  lockinPeriod: BigNumber,
  serviceId: string,
}

export interface ChipInfo {
  chipId: Address,
  nameHash: string,
  projectRegistrar: Address,
  enrollmentId: string,
}

export interface ChipSchemaInterface extends Document {
  primary_key_address: string
  secondary_key_address: string
  content: string
  content_cid: string
  title: string
  description: string
  live: boolean
  edition_number: number
  manufacturer_uid: string
  url: string
  project?: mongoose.Types.ObjectId
  user?: mongoose.Types.ObjectId
  ersEnrollmentId?: string,
  ipfs_cid: string,
  manufacturerEnrollmentId: string
}

export interface ChipKeys {
  [primaryKeyAddress: string]: {secondaryKeyAddress: Address}
}

export interface KeysFromChipScan {
  "publicKeys": {
    "1": string,
    "2": string
  },
  "compressedPublicKeys": {
    "1": string,
    "2": string
  },
  "etherAddresses": {
    "1": Address,
    "2": Address
  }
}
