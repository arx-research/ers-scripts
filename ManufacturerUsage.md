# Manufacturer Usage
See `README.md` for general usage and protocol deployment tips. This document will focus more on actions that manufacturers can take like enrolling their own chips. Typically ERS users will not need to run through these scripts unless they wish to deploy a local instance of ERS.

## Using Scripts
In order to use scripts you need to be sure that there are valid deploments in the environment you are deploying to (see previous section for information on this). Once you have a valid deployment in your chosen environment you can start running scripts. It is worth noting that these scripts build on each other, so if you're starting from a clean deployment you need to run them in the order below.

### addManufacturer
This script adds a manufacturer to the ERS protocol.=

Arguments:
1. `network`: The network you want to interact with (defaults to `hardhat`)
2. `manufacturer-name`: The name of the manufacturer
3. `manufacturer`: The address of the manufacturer. **Exclude for Localhost**, If it is not included the second address in the specified network's accounts array will be used (see managing accounts section for more information on this).

Example:
```bash
yarn addManufacturer --network [network] --manufacturer-name [name] --manufacturer [address]
```
Additionally there is a specific `localhost` version of this script that can be run by running:
```bash
yarn addManufacturer:localhost --manufacturer-name [name] --manufacturer [address]
```
### addManufacturerEnrollment
This script adds an enrollment for a manufacturer to the ERS protocol. You will be prompted to answer a number of questions about the chip enrollment including:
1. `chainId`
2. `manufacturerSigner` (the address the signed th)
3. `manufacturerId` (available from the previous step)
4. `authModel` (the auth model of the chips, typically the address of the deployed `SECP256k1Model` contract)
5. `enrollmentAuthModel` (the auth model of the enrollment, typically `EnrollmentEIP191Model` for Arx chips)
6. `bootloaderApp` (fallback URL to resolve the chips to)
7. `chipModel` (the model of the chip)

Arguments:
`network`: The network you want to interact with (defaults to `hardhat`)

Example:
```bash
yarn addManufacturerEnrollment --network [network]
```

Additionally there is a specific `localhost` version of this script that can be run by running:
```bash
yarn addManufacturerEnrollment:localhost
```

Note that this script requires that there is a valid manufacturer in the environment you are deploying to (see previous section for information on this). For `localhost` deployments you can still use the associated Arx Supabase instance to look up chip manufacturer certificates as long as you enter the correct `manufacturerSigner`; `bootloaderApp` and `chipModel` won't matter in this instance. Use the Supabase instance to obtain the correct `manufacturerSigner`.

**Outputs:** This script will output artifacts to `task_outputs/${networkName}/addManufacturerEnrollment/`. Those artifacts will be used to suggest enrollments to subsequent scripts.