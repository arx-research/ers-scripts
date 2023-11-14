# Manufacturer Usage
See README for general usage and protocol deployment tips. This document will focus more on actions that manufacturers can take like enrolling their own chips.

## Using Scripts
In order to use scripts you need to be sure that there are valid deploments in the environment you are deploying to (see previous section for information on this). Once you have a valid deployment in your chosen environment you can start running scripts. It is worth noting that these scripts build on each other, so if you're starting from a clean deployment you need to run them in the order below.

### addManufacturer
This script adds a manufacturer to the ERS protocol. It takes in three arguments:
1. `network`: The network you want to interact with (defaults to `hardhat`)
2. `manufacturer-name`: The name of the manufacturer
3. `manufacturer`: The address of the manufacturer. **Optional**, If it is not included the second address in the specified network's accounts array will be used (see managing accounts section for more information on this).

Example:
```bash
yarn addManufacturer --network [network] --manufacturer-name [name] --manufacturer [address]
```
Additionally there is a specific `localhost` version of this script that can be run by running:
```bash
yarn addManufacturer:localhost --manufacturer-name [name] --manufacturer [address]
```
### addManufacturerEnrollment
This script adds an enrollment for a manufacturer to the ERS protocol. It takes in two arguments:
1. `network`: The network you want to interact with (defaults to `hardhat`)
2. `scan`: The amount of chips you wish to scan for the enrollment. **Optional**, if left blank it will use the chipAddresses array defined in the `task_params/addManufacturerEnrollment.json` file.
2. `post-ipfs`: **Optional**, whether or not to post the enrollment to IPFS (defaults to `false`). Recommend leaving blank if doing local development.

Additionally this script uses a param file that can be found under `task_params/addManufacturerEnrollment.json`. This file contains the information that will be used to create the enrollment. If the file doesn't exist you can create it by running:
```bash
cp task_params/addManufacturerEnrollment.default.json task_params/addManufacturerEnrollment.json
```
This newly created file is `.gitignore`d so you can edit it without worrying about committing it to the repo. In the file you will see the following params that can be edited:
```
{
    "manufacturerId": ID of the manufacturer you want to add an enrollment for (printed in the addManufacturer step),
    "chipAddresses": Array of addresses of the chips you want to enroll,
    "authModel": Address of the auth model you want to use,
    "bootloaderApp": Link that points to the bootloader app for chip's in the enrollment
    "chipModel": Name of the chip model
}
```
Example:
```bash
yarn addManufacturerEnrollment --network [network] --post [true/false]
```

Additionally there is a specific `localhost` version of this script that can be run by running:
```bash
yarn addManufacturerEnrollment:localhost --post [true/false]
```

Note that this script requires that there is a valid manufacturer in the environment you are deploying to (see previous section for information on this). Additionally, if you specify the `--scan` param you will be prompted by a QR code scanner that will allow you to scan the chips you want to enroll. Scan the QR code on your phone and follow the resulting instructions. You can scan your chip by tapping it to the NFC reader on the back of your phone.

**Outputs:** This script has three potential outputs a `$ENROLLMENT_ID.json` file (named after the `enrollmentId`) in `task_outputs/enrollmentData/`, a `chipData.json` file in `task_outputs/chipData/` directory that can be used in the `projectCreation` script and ManufacturerValidation info for each chip in `task_outputs/addManufacturerEnrollment/`. If `--post true` is passed in the ManufacturerValidation information will also be posted to IPFS. Note that the `chipData.json` file is overwritten by every new chip enrollment created.
