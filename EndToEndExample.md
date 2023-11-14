# End to End - From Manufacturer Chip Enrollment to Chip Claim

## Chip Claim
Claiming a chip can be broken down into 6 steps which we will walk through below:
1. Scan chip to get chipId
2. Fetch Manufacturer Enrollment Information and Project Enrollment Information from IPFS via 3668 gateway
3. Decode and validate Manufacturer Enrollment Information and Project Enrollment Information
4. Create and Hash ERS Name
5. Create ownership proof for chip
6. Submit transaction to claim chip

### Get Chip ID
This step is fairly straight forward and involves get the chipId (or pk1) from the chip via a chip scanner or the libhalo gateway. For purposes of this example let's say the `chipId` pulled from the chip is `0x6Ee717Bc0055bB403e6b1e2D197B37fE7c92b669`.

### Fetch Manufacturer Enrollment Information and Project Enrollment Information
To be able to claim a chip there are a couple pieces of information created in prior steps that are needed:
1. Manufacturer Enrollment Information
2. Project Enrollment Information

These pieces of information are tied to a specific chip. In order to get the information, if it is not stored locally, or otherwise easily accessible it is recommended to call a protocol approved 3668 gateway. Typically the 3668 gateway is used to resolve chips to a pre-defined piece of content via a call to the `ChipRegistry` contract. In our case we will not be calling the `ChipRegistry` contract and instead will call the 3668 gateway API directly. The API endpoint is structured as follows,`/resolve-unclaimed-data/:sender/:chipId`, where a root url can be prepended. The `sender` can be filled with the address that is submitting the claim transaction on-chain and the `chipId` is retrieved in the previous step. The resulting call could look something like this:
```
axios.get(
    https://3668.arx.network/resolve-unclaimed-data/0x3bF6ab503Ce7F8f487FAD7C3Ecd35DF4dEab6BcA/0x6Ee717Bc0055bB403e6b1e2D197B37fE7c92b669
)
```
where we use `0x3bF6ab503Ce7F8f487FAD7C3Ecd35DF4dEab6BcA` as the sender / chip owner. The response from the API will be a bytestring of data that will need to be decoded and validated.

### Decode and Validate Manufacturer Enrollment Information and Project Enrollment Information
The bytestring returned from the API call will need to be decoded and validated. The data returned from the API is encoded as such:
```
abi.encode(["uint256", "bytes[]],[number of entries in array, array])
```

This can be decoded using the following code:
```
const abiCoder = new ethers.utils.AbiCoder();
const decoded = abiCoder.decode(
  ["uint256", "bytes[]"],
  "0x..."
);
```
This returns the number of project enrollment entries in the array and the array itself. For our example let's say that the number of project enrollment entries returned is 2, this would mean that the array is of length 3 because the last entry contains the Manufacturer Enrollment Information. So then the correct Project Enrollment Information is encoded in _one of_ the first two entries in the array, for each of those two entries we would go through and decode the data according to the following schema:
```
const abiCoder = new ethers.utils.AbiCoder();
const decoded = abiCoder.decode(
  ["bytes32", "address", "tuple(uint256,bytes32,uint256,string,bytes32[])", "bytes", "bytes"],
  array[i]
);
```
where `array[i]` is the i-th index of the array. An example of this decoded data can be found below.

**Project Enrollment Information**
```
{
  enrollmentId: "0xF35Fd92E6E27bbf5c2bDd6aE51a2e5dCCACF9cE3D38CE0daA06BFfA6243F4A56",   // Note same as in Manufacturer Enrollment
  projectRegistrar: "0x8BDfb17c37996B805deAEB1425F7b6FBe561AccF"
  TSMMerkleInfo: {
    tsmIndex: 0,
    serviceId: "0x4775636369000000000000000000000000000000000000000000000000000000",
    lockinPeriod: 100
    tokenUri: "ipfs://bafybe..."
    tsmProof: ["0xbBdAeFD0cD64d2D1aAA1dE3cce43239CBB481B7AaaEBBD43C0Fd4d77B8c497ad"]
  },
  tsmCertificate: "0x2AF60afEBa95EeceCBb8Bdf1e6a759a24527CB0F45c9ecE629f11647e1Dc0ed2"
  custodyProof: "0x9Be1B7dEcc768D9290f7C61914cb7b5Efe2e4458f9AED235bcF4CDd4B5EC370b"
}
```
**[TO DO: Validation steps]**

Once we have found a validated Project Enrollment Information entry we can then decode the Manufacturer Enrollment Information which is the last entry of the array. The Manufacturer Enrollment Information can be decoded as follows:
```
const abiCoder = new ethers.utils.AbiCoder();
const decoded = abiCoder.decode(
  ["tuple(bytes32, uint256, bytes32[])"],
  array[-1]
);
```
See below for an example Manufacturer Enrollment Information object.
**Manufacturer Enrollment Information**
```
  {
    enrollmentId: "0xF35Fd92E6E27bbf5c2bDd6aE51a2e5dCCACF9cE3D38CE0daA06BFfA6243F4A56",
    mIndex: 0,
    manufacturerProof: ["0xFE75d3ed6Ffb6b099fbBbBE25f3eeC495D25fFC44a4B5F9F7FbBA0Bfe1AF29Ee"]
  },
```
With this decoded object we only have a couple last pieces of information to be able to claim the chip.

**Error Cases**
**[TO DO: Error cases]**

### Create and Hash ERS Name
In addition to the above data we rely on the user to the ERS name for their chip. It is important to note that the user is likely to provide a human-readable string which we will then need to hash to make it compliant with ERS ([example](https://github.com/arx-research/ers-contracts/blob/c03c0f2fef6a5b17fb5680cf21d385f81c623dcd/utils/protocolUtils/index.ts#L43)). You can also see this done in the `claimChip` script.

### Create Ownership Proof for Chip
We are left with one step before submitting the transaction, creating the ownership proof for the chip. The ownership proof is a message adhering to a specific schema that is then signed by the chip. The schema is as follows:
```
ethers.utils.solidityPack(["uint256", "uint256", "bytes32", "address"], [chainId, commitBlock, nameHash, chipOwner])
```
Where:
- chainId is the chainId of the network you are claiming the chip in
- commitBlock is the block you want to tie this signature to, claim must be submitted within 50 blocks of this block.
- nameHash is the hash of the ERS name provided by the user calculated above
- chipOwner is the address of the user claiming the chip

The resulting data could look something like this:
```
ethers.utils.solidityPack(["uint256", "uint256", "bytes32", "address"], [1, 18472060, 
"0xA68b1d52a29dAE3AeFCb469bcdB3b5a5b7cAEF15359c8afB14B95305c94Ff7Db", "0x3bF6ab503Ce7F8f487FAD7C3Ecd35DF4dEab6BcA"])
```
where chainId = 1 represents submitting the transaction to mainnet Ethereum, 18472060 represents the current Ethereum block, and "0x3bF6ab503Ce7F8f487FAD7C3Ecd35DF4dEab6BcA" represents the address submitting the transaction. The resulting concatenated bytestring is then signed by the chip, thus creating the ownership proof.

### Submit Transaction to Claim Chip
Now we have all the pieces to submit the transaction, below you will find an annotated example of the transaction submission:
```
    await rawTx({
      from: chipOwner,                                      // 0x3bF6ab503Ce7F8f487FAD7C3Ecd35DF4dEab6BcA
      to: projectRegistrar.address,                         // 0x8BDfb17c37996B805deAEB1425F7b6FBe561AccF (from Project Enrollment)
      data: projectRegistrar.interface.encodeFunctionData(
        "claimChip",
        [
          chipId,                                           // Grabbed from chip when scanned
          nameHash,                                         // 0xA68b1d52a29dAE3AeFCb469bcdB3b5a5b7cAEF15359c8afB14B95305c94Ff7Db
          projectEnrollment.TSMMerkleInfo,                  // TSMMerkleInfo found in Project enrollment information decoded in step 3
          manufacturerEnrollmentInformation,                // Manufacturer enrollment information decoded in step 3
          commitBlock,                                      // 18472060, must match block in ownership proof
          chipOwnershipProof,                               // Calculated chip ownership proof
          projectEnrollment.tsmCertificate,                 // 0x2AF60afEBa95EeceCBb8Bdf1e6a759a24527CB0F45c9ecE629f11647e1Dc0ed2
          projectEnrollment.custodyProof                    // 0x9Be1B7dEcc768D9290f7C61914cb7b5Efe2e4458f9AED235bcF4CDd4B5EC370b
        ]
      )
    });
```
