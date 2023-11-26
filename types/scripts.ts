import { Address, ManufacturerValidationInfo, TSMMerkleProofInfo } from "@arx-research/ers-contracts";
import { BigNumber } from "ethers";
import mongoose from "mongoose";

export interface AddManufacturerEnrollment {
  manufacturerId: string,
  chipKeys: KeysFromChipScan[],
  authModel: Address,
  bootloaderApp: string,
  chipModel: string
}

export interface ManufacturerEnrollmentIPFS {
  validationInfo: ManufacturerValidationInfo,
  certificate: string,
  pk2: Address
}

export interface CreateProject {
  name: string,
  chipDataLocation: string,
  manufacturerValidationLocation: string,
  tokenUriRoot: string,
  lockinPeriod: BigNumber,
  serviceId: string,
}

export interface ProjectEnrollmentIPFS {
  projectRegistrar: Address,
  enrollmentId: string,
  TSMMerkleInfo: TSMMerkleProofInfo,
  tsmCertificate: string,
  custodyProof: string
}

export interface ClaimChip {
  name: string,
  projectRegistrarAddress: Address,
  chipClaimDataLocation: string,
  manufacturerValidationLocation: string,
}

export interface UploadChipData {
  primary_key_address: string
  secondary_key_address: string
  ipfs_cid: string,
  manufacturerEnrollmentId: string
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
  [primaryKeyAddress: Address]: {secondaryKeyAddress: Address}
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
