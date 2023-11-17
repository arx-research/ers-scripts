# ers-scripts
Scripts for deploying and interacting with the ERS protocol from the command line.

## General
Before running any scripts, make sure you install all dependencies by running `yarn install` in the root directory.

Then make sure that you have set up your `.env` file by calling:
```bash
cp .env.default .env
```
Fill out the resulting fields in the `.env` file with the appropriate values. If you want to post to IPFS you will need to fill out the `NFT_STORAGE_API_KEY` field. You can get an nft.storage API key by navigating to [this website](https://nft.storage/docs/quickstart/#get-an-api-token), creating an account, and requesting an API key. The rest of the fields should only be necessary if you are deploying / running scripts against a non-local blockchain network.

In order to deploy or run scripts there needs to be a valid node to interact with. If you are testing and planning on running locally you can start the `localhost` network by running `yarn chain`, this opens up a local node at the default port `8545`.

## Deployment
### Local
Local deployment is simple all it requires is running:
```bash
yarn deploy:localhost
```

If you want to make sure that you have a completely new local deployment you need to run:
```bash
yarn deploy:localhost:clean
```
Otherwise the deployment script will try to reuse the existing deployment and run any deployments that were not run before. To see
if there is an existing deployment for your environment you can check the `deployments` folder. If there is a sub-directory with the name of your environment then there is an existing deployment.
### Goerli
[x]

## Using Scripts
In order to use scripts you need to be sure that there are valid deploments in the environment you are deploying to (see previous section for information on this). Once you have a valid deployment in your chosen environment you can start running scripts. It is worth noting that these scripts build on each other, so if you're starting from a clean deployment you need first run the scripts in the `MnaufacturerUsage` file then continue with the scripts below.

### createService
This script creates a service that can be assigned to chips in the project enrollment process. It takes in four arguments:
1. `service-name`: The name of the service
2. `content`: URL/URI of the content app
3. `append-id`: Indicate whether chipId should be appended to the content app URL/URI
4. `network`: The network you want to interact with (defaults to `hardhat`)

Example:
```bash
yarn createService --service-name [name] --content [url/uri] --append-id [true/false] --network [network]
```

Additionally there is a specific `localhost` version of this script that can be run by running:
```bash
yarn createService:localhost --service-name [name] --content [url/uri] --append-id [true/false]
```

Note that the service creation function is narrowly scoped to only creating a service with a contentApp record. Also the resulting `serviceId` will be printed in the console as part of a successful transaction.

### generateTokenUriData
This script creates formatted tokenUriData for chips in the project and adds it to IPFS. An NFT.storage API token is required for this script. It takes two arguments:

1. `network`: The network you want to interact with (defaults to `hardhat`)
2. `scan`: The number of chips that you wish to scan and generate tokenUriData for.

The script will prompt you to add `name`, `description` and `media` information. This information can be reused for all chips scanned, or you can individually add information on a per chip basis. It will then be formatted and added to IPFS via NFT.storage.

The script will also prompt for the creation of a `chipData.json` file that can be used in project creation. It returns a CID that can be used for the `tokenUriRoot` in `projectCreation.json`.

### createProject
This script creates a project and enrolls chips in the project. Similarly to `addManufacturerEnrollment` it takes in two arguments:
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
    "chipDataLocation": local path to the chipData enrollment files (created after each successful addManufacturerEnrollment and saved in task_outputs/chipData/chipData.json),
    "manufacturerValidationLocation": local path to the folder containing manufacturerValidation data (this is auto-saved locally in task_outputs/addManufacturerEnrollment/),
    "tokenUriRoot": tokenUri root for chips in the project,
    "lockinPeriod": lockinPeriod in seconds,
    "serviceId": Primary service ID for the project,
}
```

You will be prompted by a QR code scanner to create ownership proofs for the chips and sign the message for the proving chip. Scan the QR code on your phone and follow the resulting instructions. You can scan your chip by tapping it to the NFC reader on the back of your phone.

```
Example:
```bash
yarn createProject --network [network] --post [true/false]
```

Additionally there is a specific `localhost` version of this script that can be run by running:
```bash
yarn createProject:localhost --post [true/false]
```

**Outputs:** If `--post false` is included in the command the files that would be posted to IPFS will be saved in the `task_outputs/projectEnrollment/` directory.

### claimChip
This script claims a chip that has been enrolled in a project. To run this script you need to have the chip you are wishing to claim and need to select the environment you are looking to claim it in by specifying the following argument:
1. `network`: The network you want to interact with (defaults to `hardhat`)

Additionally this script uses a param file that can be found under `task_params/claimChip.json`. This file contains the information that will be used to create the project. If the file doesn't exist you can create it by running:
```bash
cp task_params/claimChip.default.json task_params/claimChip.json
```

This newly created file is `.gitignore`d so you can edit it without worrying about committing it to the repo. In the file you will see the following params that can be edited:
```
{
    "name": ERS name you want to tie to the chip,
    "chipClaimDataLocation": local path to the chipData (version of this is created in createProject and saved in task_outputs/projectEnrollment),
    "manufacturerValidationLocation": local path to the folder containing manufacturerValidation data (this is auto-saved locally in task_outputs/addManufacturerEnrollment/). Additionally, an IPFS hash can be provided from which data posted in addManufacturerEnrollment can be retrieved.
}
```

You will be prompted by a QR code scanner to scan the chip to get the chipId. Scan the QR code on your phone and follow the resulting instructions. You can scan your chip by tapping it to the NFC reader on the back of your phone. You will also be prompted to scan the chip to sign an ownership message that ties the chip to the claiming address, follow the same scanning instructions.

```
Example:
```bash
yarn claimChip --network [network]
```

Additionally there is a specific `localhost` version of this script that can be run by running:
```bash
yarn claimChip:localhost
```

## Arx Manufacturer Enrollments
Arx maintains a public repo with all Arx HaLo chip enrollments at https://github.com/arx-research/arx-chip-enrollments. You can use this to resolve the enrollment for a given chip. 

Add the enrollments that are appropriate for the chain you wish to deploy to within the `task_outputs/enrollmentData/` directory (create this directory if it doesn't exist). The `manufacturerValidationLocation` in your `projectCreation` JSON file should reference this directory.
