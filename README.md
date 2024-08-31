# ers-scripts
Scripts for deploying and interacting with the Ethereum Reality Service ("ERS") from the command line. See [the ERS docs](https://docs.ers.to/) for more information on ERS.

## Setup
1. Install all dependencies by running `yarn install` in the root directory.
2. Set up a blank `.env` file:
```bash
cp .env.default .env
```
3. Fill out the resulting fields in the `.env` file with the appropriate values. 
4. You will need a `SUPABASE_ANON_KEY` in order to access Arx manufacturer enrollments and a  
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

## Using Scripts

0. If using `ers-scripts` for localhost testing, see `ManufacturerUsage.md` for more details on creating a mock manufacturer and enrollment.
1. Create a service: `createService` with the options indicated below. A service is the `contentApp` that you want to redirect a chip to (e.g. a decentralized app hosted on IPFS, a centralized app hosted at a URL).
2. Create a project: `createProject` maps chips to a `serviceId` and adds associated `tokenUriData` (recommended, but optional).  Once enrolled, the chip should redirect when tapped to the `contentApp` provided. Some content apps may be designed to render the `tokenUriData`.
3. Claim a chip: `transferToken` allows the end user of a chip to claim ownership of the associated chip [PBT](https://eips.ethereum.org/EIPS/eip-5791), which may or may not be necessary depending on the end use case.

In order to use scripts, first ensure that there are valid deployments in the environment you are deploying to (see `Deployments` above). It is worth noting that these scripts build on each other, each step creating artifacts in `task_outputs` that can be easily selected for use in the subsequent steps. You may wish to backup `task_outputs` periodically as some artifacts, such as those used for building `tokenUri` data, may be difficult to rebuild from scratch if removed.

### createService
This script creates a [service](https://docs.ers.to/overview/concepts/services) that can be assigned to chips in the project enrollment process.

It will prompt you for several pieces of information:
1. `service-name`: The name of the service
2. `content`: URL/URI of the content app; in the case of a simple redirect this would be an `http` resource like `https://app.arx.org` where a chip may be scanned. For IPFS, this would be 
3. `append-id`: Indicate whether chipId should be appended to the content app URL/URI. This is useful for NFT/PBT applications where every chip might reference unique metadata and required if you are using the output of the `generateTokenUriData` for `tokenUri` data in your project.

Arguments:
`network`: The network you want to interact with (defaults to `hardhat`)

Example:
```bash
yarn createService --network [network]
```

Note that the resulting `serviceId` will be printed in the console as part of a successful transaction.

### createDeveloperRegistrar
This script creates your named developerRegistrar in the `.ers` namespace (e.g. `brand.ers`).

It will prompt you for your desired developer name.

Arguments:
`network`: The network you want to interact with (defaults to `hardhat`)

Example:
```bash
yarn createDeveloperRegistrar --network [network]
```

Note: Most common names are reserved, and if not reserved a name will be checked to match the enrolling developer address with the ENS owner address. If you would like to enroll using a reserved name, please contact names@ers.to -- note that trademarks, well known brand names and domain history are all factors that will be considered when requesting a reserved name.

### createProject
This script creates a [project](https://docs.ers.to/overview/concepts/developers#adding-projects) and enrolls chips in the project.

It will prompt you for several pieces of information:
1. Whether or not you wish to create a new project or add chips to an existing project; if you select an existing project, artifacts in `task_outputs` will be used to suggest options or you can manually enter the address of an existing project. (both cases will be chain specific based on the `network` argument)
2. How you would like to add `tokenUri` data: via a formatted CSV, using an existing URL, or skip. (this can be updated after contract deployment)
3. If you are on `localhost`, you will be prompted to select a manufacturer enrollment as well. For other chains this information comes from the hosted Arx enrollment data on Supabase.

You will be prompted to scan a QR code on your NFC-enabled smartphone; scan the QR code on your smartphone and follow the prompts to capture chip proof data. You can scan your chip by tapping it to the NFC reader on the back of your smartphone.

Arguments:
`network`: The network you want to interact with (defaults to `hardhat`)

Example:
```bash
yarn createProject --network [network]
```

Note: If you are creating `tokenUri` data from a formatted CSV, make sure that you backup `task_outputs`. When chips are added to an existing project, `task_outputs` will be used to ensure that metadata from previously added chips is included in the final `tokenUri` data. If this data is missing, metadata with previously enrollment chips will be overwritten and their `tokenUri` will not resolve when looked up. 

### transferToken
This script [claims ownership of a chip](https://docs.ers.to/overview/concepts/chip-claim) that has been enrolled in a project by transfering it to a new owner.

You will be prompted by a QR code scanner to scan the chip to get the `chipId` and to create a `transferToken` signature. Scan the QR code on your smartphone and follow the prompts to capture chip data. You can scan your chip by tapping it to the NFC reader on the back of your smartphone.

Arguments:
`network`: The network you want to interact with (defaults to `hardhat`)

Example:
```bash
yarn claimChip --network [network]
```
