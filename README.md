# ers-scripts
Scripts for deploying and interacting with the Ethereum Reality Service ("ERS") from the command line. See [the ERS docs](https://docs.ers.to/) for more information on ERS.

## Setup
1. Install all dependencies by running `yarn install` in the root directory.
2. Set up a blank `.env` file:
```bash
cp .env.default .env
```
3. Fill out the resulting fields in the `.env` file with the appropriate values. 
4. Get [a NFT.Storage API key](https://nft.storage/docs/quickstart/#get-an-api-token). Add this to `NFT_STORAGE_API_KEY` in `.env`. NFT.Storage is used to pin IPFS enrollment data.
5. If you are deploying against a non-local blockchain network, add the private keys for the accounts that you wish to use (e.g. `TESTNET_SERVICE_CREATOR_PRIVATE_KEY`).
6. In order to deploy or run scripts there needs to be a valid node to interact with. If you are testing and planning on running locally you can start the `localhost` network by running `yarn chain`, this opens up a local node at the default port `8545`.

## Deployments
### Sepolia
The Sepolia ERS contracts are deployed at:

```
CHIP_REGISTRY=TBD
SERVICE_REGISTRY=TBD
ENROLLMENT_MANAGER_ADDRESS=TBD
ERS_REGISTRY=TBD
SM_REGISTRAR=TBD
```

You can find the deployment artifacts in `deployments/$CHAIN_NAME`.

### Local
For local testing, instantiate your local chain (e.g. `yarn chain`) and run:
```bash
yarn deploy:localhost
```

The deployment script will try to reuse the existing deployment and run any deployments that were not run before. To see
if there is an existing deployment for your environment you can check the `deployments` folder. If there is a sub-directory with the name of your environment, then there is an existing deployment.

If you want to make sure that you have a completely fresh local deployment, run:
```bash
yarn deploy:localhost:clean
```

Note: If you are working with locally modified `ers-contracts` you may need to link those contracts and rebuild in order to correctly redeploy.
1. `npm link @arx-research/ers-contracts --force`
2. `yarn clean-artifacts`
3. `yarn build`

## Arx Manufacturer Enrollments
WIP.

## Using Scripts

0. If using `ers-scripts` against a deployed version of ERS, download the Arx `manufacturerEnrollments` for the appropriate chain using `getArxManufacturerEnrollments`.
1. Create a service: `createService` with the options indicated below. A service is the `contentApp` that you want to redirect a chip to (e.g. a decentralized app hosted on IPFS, a centralized app hosted at a URL).
2. Generate tokenUriData: `generateTokenUriData` with the options indicated below. This will generate media associated with a chip, similar to the tokenUriData that would be typically associated with an NFT. If you are simple using the chip for a redirect you may not need this data.
3. Create a project: `createProject` maps chips to a `serviceId` and adds associated `tokenUriData`.  Once enrolled, the chip should redirect when tapped to the `contentApp` provided.
4. Claim a chip: `claimChip` allows the end user of a chip to claim ownership, which may or may not be necessary depending on the end use case.

In order to use scripts you need to be sure that there are valid deployments in the environment you are deploying to (see previous section for information on this). Once you have a valid deployment in your chosen environment you can start running scripts. It is worth noting that these scripts build on each other, so if you're starting from a clean deployment you need first run the scripts in the `ManufacturerUsage` file then continue with the scripts below.

### createService
This script creates a [service](https://docs.ers.to/overview/concepts/services) that can be assigned to chips in the project enrollment process. It requires one argument:
1. `network`: The network you want to interact with (defaults to `hardhat`)

It will prompt you for several pieces of information:
1. `service-name`: The name of the service
2. `content`: URL/URI of the content app; in the case of a simple redirect this would be an `http` resource like `https://app.arx.org` where a chip may be scanned. For IPFS, this would be 
3. `append-id`: Indicate whether chipId should be appended to the content app URL/URI. This is useful for NFT/PBT applications where every chip might reference unique metadata and required if you are using the output of the `generateTokenUriData` for `tokenUri` data in your project.

Example:
```bash
yarn createService --network [network]
```

Note that the service creation function is narrowly scoped to only creating a service with a contentApp record. Also the resulting `serviceId` will be printed in the console as part of a successful transaction.

### generateTokenUriData
This script creates formatted tokenUriData for chips in the project.

1. `network`: The network you want to interact with (defaults to `hardhat`)
2. `scan`: The number of chips that you wish to scan and generate tokenUriData for.

The script is designed to generate JSON formatted `tokenUri` data including a `name`, `description` and `media` that can be used for a project. The script will prompt to generate either unique data on a chip by chip basis, or it can use the same data for all chips scanned. Once input, the data is JSON formatted and output to `task_outputs/tokenUriData`.

The successful completion of the task returns a CID that can be used for the `tokenUriRoot` in `projectCreation.json`.

Example Result:
```json
// The file ../tokenUriData/0x74540fbb49721a53D5DEC9f60b04f33fd38aD0Ae.json where the filename is the chipId

{"name":"HaLo PBT","description":"A terrific HaLo PBT","media":"https://docs.arx.org/videos/chip.mp4"}
```

*Notes:* If being used to generate data for a service with a `tokenUri` record, `generateTokenUrilData` anticipates that the `append-id` option for the chip's service was set to `true`.

It is possible to encode fully onchain `tokenUri` data (e.g. `data:application/json;utf8,[...]`), however, neither this script nor `createProject` are currently designed to support preparing data in that way.

### createProject
This script creates a [project](https://docs.ers.to/overview/concepts/developers#adding-projects) and enrolls chips in the project. Similarly to `addManufacturerEnrollment` it takes in two arguments:
1. `network`: The network you want to interact with (defaults to `hardhat`)
2. `post`: Whether or not to post the project to IPFS (defaults to `false`)
Additionally this script uses a param file that can be found under `task_params/projectCreation.json`. This file contains the information that will be used to create the project. If the file doesn't exist you can create it by running:
```bash
cp task_params/projectCreation.default.json task_params/projectCreation.json
```

This newly created file is `.gitignore`d so you can edit it without worrying about committing it to the repo. In the file you will see the following params that can be edited:
```
{
    "name": .ers name for the project
    "tokenUriRoot": tokenUri root for chips in the project,
    "lockinPeriod": lockinPeriod in seconds,
    "serviceId": Primary service ID for the project,
}
```

You will be prompted to scan a QR code scanner to create ownership proofs for the chips and sign the message for the proving chip. Scan the QR code on your smartphone and follow the prompts to capture chip data. You can scan your chip by tapping it to the NFC reader on the back of your smartphone.

```
Example:
```bash
yarn createProject --network [network] --post [true/false]
```

**Outputs:** If `--post false` is included in the command the files that would be posted to IPFS will be saved in the `task_outputs/projectEnrollment/` directory.

### claimChip
This script [claims a chip](https://docs.ers.to/overview/concepts/chip-claim) that has been enrolled in a project. To run this script, you need to have the chip you want to claim and need to select the environment you are looking to claim it in by specifying the following argument:
1. `network`: The network you want to interact with (defaults to `hardhat`)

Additionally this script uses a param file that can be found under `task_params/claimChip.json`. This file contains the information that will be used to create the project. If the file doesn't exist you can create it by running:
```bash
cp task_params/claimChip.default.json task_params/claimChip.json
```

This newly created file is `.gitignore`d so you can edit it without worrying about committing it to the repo. In the file you will see the following parameters that can be edited:
```
{
    "name": ERS name you want to tie to the chip,
    "chipClaimDataLocation": local path to the chipData (version of this is created in createProject and saved in task_outputs/projectEnrollment),
    "manufacturerValidationLocation": local path to the folder containing manufacturerValidation data (this is auto-saved locally in task_outputs/addManufacturerEnrollment/). Additionally, an IPFS hash can be provided from which data posted in addManufacturerEnrollment can be retrieved.
}
```

You will be prompted by a QR code scanner to scan the chip to get the `chipId`. Scan the QR code on your smartphone and follow the prompts to capture chip data. You can scan your chip by tapping it to the NFC reader on the back of your smartphone. You will also be prompted to scan the chip to sign an ownership message that ties the chip to the claiming address, follow the same scanning instructions.

```
Example:
```bash
yarn claimChip --network [network]
```
