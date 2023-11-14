import mongoose from 'mongoose'
import { ChipSchemaInterface, UploadChipData } from '../types/scripts'


const ChipSchema: mongoose.Schema = new mongoose.Schema({
    content: { type: String },
    content_cid: { type: String },
    primary_key_address: { type: String, unique: true },
    secondary_key_address: { type: String, unique: true },
    title: { type: String },
    description: { type: String },
    live: { type: Boolean, default: false },
    edition_number: { type: Number },
    numbered: { type: Boolean, default: false },
    manufacturer_uid: { type: String },
    url: { type: String },
    project: { type: mongoose.Types.ObjectId, ref: 'Project' },
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    ersEnrollmentId: { type: String },
    ipfs_cid: { type: String },
    manufacturerEnrollmentId: { type: String }
})

// Mongoose Chip Model to interact with the Chip DB
const CHIP_MODEL = mongoose.model<ChipSchemaInterface>('Chip', ChipSchema)

// Check for MongoDB URI that's needed to connect to the database
if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

// Arguments for connecting to MongoDB
const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_OPTIONS: any = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

/**
 * Connect to MongoDB
 */
export const connectToDatabase = async () => {
    mongoose.connect(MONGODB_URI, MONGODB_OPTIONS).then(() => {
        console.log('Connected to database')
    })
}

/**
 * Upload a chip to the database
 */
export const uploadChipToDB = async (chip: UploadChipData) => {
    const chipExists = await CHIP_MODEL.exists({ primary_key_address: chip.primary_key_address })
    if(chipExists) {
        console.log("Updating existing record...")
        const filter = { _id: chipExists._id};
        const update = {
            primary_key_address: chip.primary_key_address,
            secondary_key_address: chip.secondary_key_address,
            ipfs_cid: chip.ipfs_cid,
            manufacturerEnrollmentId: chip.manufacturerEnrollmentId
          };
        const updatedChip = await CHIP_MODEL.findByIdAndUpdate(filter, update, {
            new: true,
        }).exec()
        console.log(`Updated record with ID: ${updatedChip!._id}`)
    } else {
        console.log("Adding new record...")
        const newChip = await CHIP_MODEL.create({
            primary_key_address: chip.primary_key_address,
            secondary_key_address: chip.secondary_key_address,
            ipfs_cid: chip.ipfs_cid,
            manufacturerEnrollmentId: chip.manufacturerEnrollmentId
          })

        console.log(`Added new record to database. ID: ${newChip._id}`)
    }
}

