export default {
  "name": "sepolia",
  "chainId": "11155111",
  "contracts": {
    "ChipRegistry": {
      "address": "0x4EED142581c111860f6323168dC60c3eFCa3af24",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IManufacturerRegistry",
              "name": "_manufacturerRegistry",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_maxLockinPeriod",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "_migrationSigner",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "InvalidShortString",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "str",
              "type": "string"
            }
          ],
          "name": "StringTooLong",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "chipId",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "projectRegistrar",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "manufacturerEnrollmentId",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "ersNode",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "hasDeveloperCustodyProof",
              "type": "bool"
            }
          ],
          "name": "ChipAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [],
          "name": "EIP712DomainChanged",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "maxLockinPeriod",
              "type": "uint256"
            }
          ],
          "name": "MaxLockinPeriodUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "migrationSigner",
              "type": "address"
            }
          ],
          "name": "MigrationSignerUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferStarted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "developerRegistrar",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "projectRegistrar",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "nameHash",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "servicesRegistry",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            }
          ],
          "name": "ProjectEnrollmentAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "developerRegistrar",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "projectRegistrar",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "nameHash",
              "type": "bytes32"
            }
          ],
          "name": "ProjectEnrollmentRemoved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "ers",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "developerRegistry",
              "type": "address"
            }
          ],
          "name": "RegistryInitialized",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "EIP712_SIGNATURE_DOMAIN",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "EIP712_SIGNATURE_VERSION",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "acceptOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_chipOwner",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "enrollmentId",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "manufacturerCertificate",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                }
              ],
              "internalType": "struct IChipRegistry.ManufacturerValidation",
              "name": "_manufacturerValidation",
              "type": "tuple"
            },
            {
              "internalType": "bytes",
              "name": "_custodyProof",
              "type": "bytes"
            }
          ],
          "name": "addChip",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IProjectRegistrar",
              "name": "_projectRegistrar",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            },
            {
              "internalType": "contract IServicesRegistry",
              "name": "_servicesRegistry",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_lockinPeriod",
              "type": "uint256"
            }
          ],
          "name": "addProjectEnrollment",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "chipEnrollments",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "nameHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "projectRegistrar",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "manufacturerEnrollmentId",
              "type": "bytes32"
            },
            {
              "internalType": "bool",
              "name": "chipEnrolled",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "developerRegistry",
          "outputs": [
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "eip712Domain",
          "outputs": [
            {
              "internalType": "bytes1",
              "name": "fields",
              "type": "bytes1"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "version",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "chainId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "verifyingContract",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "salt",
              "type": "bytes32"
            },
            {
              "internalType": "uint256[]",
              "name": "extensions",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "ers",
          "outputs": [
            {
              "internalType": "contract IERS",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IERS",
              "name": "_ers",
              "type": "address"
            },
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "_developerRegistry",
              "type": "address"
            }
          ],
          "name": "initialize",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "initialized",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "manufacturerRegistry",
          "outputs": [
            {
              "internalType": "contract IManufacturerRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "maxLockinPeriod",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "migrationSigner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            }
          ],
          "name": "node",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            }
          ],
          "name": "ownerOf",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "pendingOwner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IProjectRegistrar",
              "name": "",
              "type": "address"
            }
          ],
          "name": "projectEnrollments",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "nameHash",
              "type": "bytes32"
            },
            {
              "internalType": "contract IDeveloperRegistrar",
              "name": "developerRegistrar",
              "type": "address"
            },
            {
              "internalType": "contract IServicesRegistry",
              "name": "servicesRegistry",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "chipsAdded",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "lockinPeriod",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "creationTimestamp",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IProjectRegistrar",
              "name": "_projectRegistrar",
              "type": "address"
            }
          ],
          "name": "removeProjectEnrollment",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            }
          ],
          "name": "resolveChip",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "recordType",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "content",
                  "type": "bytes"
                }
              ],
              "internalType": "struct IServicesRegistry.Record[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_newOwner",
              "type": "address"
            }
          ],
          "name": "setChipNodeOwner",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "_interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_maxLockinPeriod",
              "type": "uint256"
            }
          ],
          "name": "updateMaxLockinPeriod",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_migrationSigner",
              "type": "address"
            }
          ],
          "name": "updateMigrationSigner",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "DeveloperNameGovernor": {
      "address": "0x1e3F1C5B5bC5a77CD5d57ce591DAf60772233dA7",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "_developerRegistry",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_nameCoordinator",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "InvalidShortString",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "str",
              "type": "string"
            }
          ],
          "name": "StringTooLong",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [],
          "name": "EIP712DomainChanged",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "newNameCoordinator",
              "type": "address"
            }
          ],
          "name": "NameCoordinatorUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferStarted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "EIP712_SIGNATURE_DOMAIN",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "EIP712_SIGNATURE_VERSION",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "acceptOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_developerName",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_proofTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "_nameApprovalProof",
              "type": "bytes"
            }
          ],
          "name": "claimName",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "developerRegistry",
          "outputs": [
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "eip712Domain",
          "outputs": [
            {
              "internalType": "bytes1",
              "name": "fields",
              "type": "bytes1"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "version",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "chainId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "verifyingContract",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "salt",
              "type": "bytes32"
            },
            {
              "internalType": "uint256[]",
              "name": "extensions",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "nameCoordinator",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "pendingOwner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_developerOwner",
              "type": "address"
            }
          ],
          "name": "removeNameClaim",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_newNameCoordinator",
              "type": "address"
            }
          ],
          "name": "updateNameCoordinator",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "DeveloperRegistrar": {
      "address": "0xD57A993Eda1fACFb87f3b7Ce735Ae853F89244E1",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IChipRegistry",
              "name": "_chipRegistry",
              "type": "address"
            },
            {
              "internalType": "contract IERS",
              "name": "_ers",
              "type": "address"
            },
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "_developerRegistry",
              "type": "address"
            },
            {
              "internalType": "contract IServicesRegistry",
              "name": "_servicesRegistry",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferStarted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "projectRegistrar",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "projectRootNode",
              "type": "bytes32"
            }
          ],
          "name": "ProjectAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "projectRegistrar",
              "type": "address"
            }
          ],
          "name": "ProjectRemoved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "rootNode",
              "type": "bytes32"
            }
          ],
          "name": "RegistrarInitialized",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "acceptOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IProjectRegistrar",
              "name": "_projectRegistrar",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_lockinPeriod",
              "type": "uint256"
            }
          ],
          "name": "addProject",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "chipRegistry",
          "outputs": [
            {
              "internalType": "contract IChipRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "developerRegistry",
          "outputs": [
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "ers",
          "outputs": [
            {
              "internalType": "contract IERS",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getProjects",
          "outputs": [
            {
              "internalType": "address[]",
              "name": "",
              "type": "address[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_rootNode",
              "type": "bytes32"
            }
          ],
          "name": "initialize",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "initialized",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "pendingOwner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "projects",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IProjectRegistrar",
              "name": "_projectRegistrar",
              "type": "address"
            }
          ],
          "name": "removeProject",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "rootNode",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "servicesRegistry",
          "outputs": [
            {
              "internalType": "contract IServicesRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "DeveloperRegistrarFactory": {
      "address": "0x656281faB5DeB3D8964BD48410859fb0d9995e0E",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_developerRegistrar",
              "type": "address"
            },
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "_developerRegistry",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "developerRegistrar",
              "type": "address"
            }
          ],
          "name": "DeveloperRegistrarDeployed",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "deployDeveloperRegistrar",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "developerRegistrar",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "developerRegistry",
          "outputs": [
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    },
    "DeveloperRegistry": {
      "address": "0x0FCb2A0df07b00f84e651a9a68c9B38543560590",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_governance",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "developerOwner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "nameHash",
              "type": "bytes32"
            }
          ],
          "name": "DeveloperAllowed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "developerOwner",
              "type": "address"
            }
          ],
          "name": "DeveloperDisallowed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "developerRegistrar",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "rootNode",
              "type": "bytes32"
            }
          ],
          "name": "DeveloperRegistrarAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "developerRegistrar",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "subnode",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "DeveloperRegistrarRevoked",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferStarted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "factory",
              "type": "address"
            }
          ],
          "name": "RegistrarFactoryAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "factory",
              "type": "address"
            }
          ],
          "name": "RegistrarFactoryRemoved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "ers",
              "type": "address"
            }
          ],
          "name": "RegistryInitialized",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "ROOT_NODE",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "acceptOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_developerOwner",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "addAllowedDeveloper",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IDeveloperRegistrarFactory",
              "name": "_factory",
              "type": "address"
            }
          ],
          "name": "addRegistrarFactory",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IDeveloperRegistrarFactory",
              "name": "_factory",
              "type": "address"
            }
          ],
          "name": "createNewDeveloperRegistrar",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "ersRegistry",
          "outputs": [
            {
              "internalType": "contract IERS",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getDeveloperRegistrars",
          "outputs": [
            {
              "internalType": "address[]",
              "name": "",
              "type": "address[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IERS",
              "name": "_ers",
              "type": "address"
            },
            {
              "internalType": "contract IDeveloperRegistrarFactory[]",
              "name": "_factories",
              "type": "address[]"
            },
            {
              "internalType": "address",
              "name": "_nameGovernor",
              "type": "address"
            }
          ],
          "name": "initialize",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "initialized",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "isDeveloperRegistrar",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "nameGovernor",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "pendingDevelopers",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "pendingOwner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IDeveloperRegistrarFactory",
              "name": "",
              "type": "address"
            }
          ],
          "name": "registrarFactories",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_developerOwner",
              "type": "address"
            }
          ],
          "name": "removeAllowedDeveloper",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IDeveloperRegistrarFactory",
              "name": "_factory",
              "type": "address"
            }
          ],
          "name": "removeRegistrarFactory",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_developerRegistrar",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "revokeDeveloperRegistrar",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "ERSRegistry": {
      "address": "0x51d2c9c145b5D4330E5FA8837E330F51Ff43465B",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IChipRegistry",
              "name": "_chipRegistry",
              "type": "address"
            },
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "_developerRegistry",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "subnode",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "nameHash",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "NewOwner",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "resolver",
              "type": "address"
            }
          ],
          "name": "NewResolver",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "chipRegistry",
          "outputs": [
            {
              "internalType": "contract IChipRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_resolver",
              "type": "address"
            }
          ],
          "name": "createChipRegistrySubnodeRecord",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_resolver",
              "type": "address"
            }
          ],
          "name": "createSubnodeRecord",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "deleteChipRegistrySubnodeRecord",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "deleteSubnodeRecord",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "developerRegistry",
          "outputs": [
            {
              "internalType": "contract IDeveloperRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            }
          ],
          "name": "getOwner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            }
          ],
          "name": "getResolver",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "getSubnodeHash",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "getSubnodeOwner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            }
          ],
          "name": "recordExists",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "name": "records",
          "outputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "resolver",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_node",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_newOwner",
              "type": "address"
            }
          ],
          "name": "setNodeOwner",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "EnrollmentEIP191Model": {
      "address": "0xaE72D74B55823fe1a1029bd81e56f0bC840E9bC6",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_manufacturerCertSigner",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "_manufacturerCertificate",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "name": "verifyManufacturerCertificate",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    },
    "ManufacturerRegistry": {
      "address": "0x02fc9a856a22048a5c24cA69536a61feD0627645",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_governance",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "manufacturerId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "enrollmentId",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "manufacturerCertSigner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "authModel",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "contract IEnrollmentAuthModel",
              "name": "enrollmentAuthModel",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "chipValidationDataUri",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "bootloaderApp",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "chipModel",
              "type": "string"
            }
          ],
          "name": "EnrollmentAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "manufacturerId",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "ManufacturerAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "manufacturerId",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "ManufacturerOwnerUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "manufacturerId",
              "type": "bytes32"
            }
          ],
          "name": "ManufacturerRemoved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferStarted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "acceptOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_manufacturerId",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_certSigner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_authModel",
              "type": "address"
            },
            {
              "internalType": "contract IEnrollmentAuthModel",
              "name": "_enrollmentAuthModel",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "_chipValidationDataUri",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_bootloaderApp",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_chipModel",
              "type": "string"
            }
          ],
          "name": "addChipEnrollment",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "enrollmentId",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_manufacturerId",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            }
          ],
          "name": "addManufacturer",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_enrollmentId",
              "type": "bytes32"
            }
          ],
          "name": "getEnrollmentBootloaderApp",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_enrollmentId",
              "type": "bytes32"
            }
          ],
          "name": "getEnrollmentInfo",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "manufacturerId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "manufacturerCertSigner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "authModel",
                  "type": "address"
                },
                {
                  "internalType": "contract IEnrollmentAuthModel",
                  "name": "enrollmentAuthModel",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "chipValidationDataUri",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "bootloaderApp",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "chipModel",
                  "type": "string"
                }
              ],
              "internalType": "struct ManufacturerRegistry.EnrollmentInfo",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_manufacturerId",
              "type": "bytes32"
            }
          ],
          "name": "getManufacturerInfo",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "registered",
                  "type": "bool"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "enrollments",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ManufacturerRegistry.ManufacturerInfo",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_enrollmentId",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "_manufacturerCertificate",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "_payload",
              "type": "bytes"
            }
          ],
          "name": "isEnrolledChip",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_enrollmentId",
              "type": "bytes32"
            }
          ],
          "name": "isValidEnrollment",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "pendingOwner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_manufacturerId",
              "type": "bytes32"
            }
          ],
          "name": "removeManufacturer",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_manufacturerId",
              "type": "bytes32"
            },
            {
              "internalType": "bool",
              "name": "_active",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "_enrollmentId",
              "type": "bytes32"
            }
          ],
          "name": "updateChipEnrollment",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_manufacturerId",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_newOwner",
              "type": "address"
            }
          ],
          "name": "updateManufacturerOwner",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "OpenTransferPolicy": {
      "address": "0x72921933c5448A253f6Fa8b90f6b4Be43b1AFaa3",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "name": "authorizeTransfer",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "SECP256k1Model": {
      "address": "0x05B7F7F555C0289d8135c60C5b138930750eDC8b",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_message",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "_signature",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "_signer",
              "type": "address"
            }
          ],
          "name": "verify",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        }
      ]
    },
    "ServicesRegistry": {
      "address": "0x7d483293BB2BB9E98987980015d8C753B32C4d7B",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IChipRegistry",
              "name": "_chipRegistry",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_maxBlockWindow",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "InvalidShortString",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "str",
              "type": "string"
            }
          ],
          "name": "StringTooLong",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [],
          "name": "EIP712DomainChanged",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "chipId",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "newPrimaryService",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "oldPrimaryService",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "serviceTimelock",
              "type": "uint256"
            }
          ],
          "name": "PrimaryServiceUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "chipId",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            }
          ],
          "name": "SecondaryServiceAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "chipId",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            }
          ],
          "name": "SecondaryServiceRemoved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "ServiceCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "oldOwner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "ServiceOwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "recordType",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "bytes",
              "name": "content",
              "type": "bytes"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "appendId",
              "type": "bool"
            }
          ],
          "name": "ServiceRecordAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "recordType",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "bytes",
              "name": "newContent",
              "type": "bytes"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "appendId",
              "type": "bool"
            }
          ],
          "name": "ServiceRecordEdited",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "serviceId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "recordType",
              "type": "bytes32"
            }
          ],
          "name": "ServiceRecordRemoved",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "EIP712_SIGNATURE_DOMAIN",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "EIP712_SIGNATURE_VERSION",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_commitBlock",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "_signature",
              "type": "bytes"
            }
          ],
          "name": "addSecondaryService",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "recordType",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "content",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "appendId",
                  "type": "bool"
                }
              ],
              "internalType": "struct ServicesRegistry.ServiceRecord[]",
              "name": "_serviceRecords",
              "type": "tuple[]"
            }
          ],
          "name": "addServiceRecords",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "chipRegistry",
          "outputs": [
            {
              "internalType": "contract IChipRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "chipServices",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "primaryService",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "serviceTimelock",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "recordType",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "content",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "appendId",
                  "type": "bool"
                }
              ],
              "internalType": "struct ServicesRegistry.ServiceRecord[]",
              "name": "_serviceRecords",
              "type": "tuple[]"
            }
          ],
          "name": "createService",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "recordType",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "content",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "appendId",
                  "type": "bool"
                }
              ],
              "internalType": "struct ServicesRegistry.ServiceRecord[]",
              "name": "_serviceRecords",
              "type": "tuple[]"
            }
          ],
          "name": "editServiceRecords",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "eip712Domain",
          "outputs": [
            {
              "internalType": "bytes1",
              "name": "fields",
              "type": "bytes1"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "version",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "chainId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "verifyingContract",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "salt",
              "type": "bytes32"
            },
            {
              "internalType": "uint256[]",
              "name": "extensions",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "name": "enrolledServices",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            }
          ],
          "name": "getAllChipServiceData",
          "outputs": [
            {
              "components": [
                {
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "serviceId",
                      "type": "bytes32"
                    },
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "recordType",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes",
                          "name": "content",
                          "type": "bytes"
                        }
                      ],
                      "internalType": "struct IServicesRegistry.Record[]",
                      "name": "records",
                      "type": "tuple[]"
                    }
                  ],
                  "internalType": "struct IServicesRegistry.Service",
                  "name": "primaryService",
                  "type": "tuple"
                },
                {
                  "internalType": "uint256",
                  "name": "serviceTimelock",
                  "type": "uint256"
                },
                {
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "serviceId",
                      "type": "bytes32"
                    },
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "recordType",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes",
                          "name": "content",
                          "type": "bytes"
                        }
                      ],
                      "internalType": "struct IServicesRegistry.Record[]",
                      "name": "records",
                      "type": "tuple[]"
                    }
                  ],
                  "internalType": "struct IServicesRegistry.Service[]",
                  "name": "secondaryServices",
                  "type": "tuple[]"
                }
              ],
              "internalType": "struct IServicesRegistry.ExpandedChipServices",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            }
          ],
          "name": "getChipSecondaryServices",
          "outputs": [
            {
              "internalType": "bytes32[]",
              "name": "",
              "type": "bytes32[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            }
          ],
          "name": "getPrimaryServiceContent",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "recordType",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "content",
                  "type": "bytes"
                }
              ],
              "internalType": "struct IServicesRegistry.Record[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_recordType",
              "type": "bytes32"
            }
          ],
          "name": "getPrimaryServiceContentByRecordtype",
          "outputs": [
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            }
          ],
          "name": "getServiceContent",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "recordType",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "content",
                  "type": "bytes"
                }
              ],
              "internalType": "struct IServicesRegistry.Record[]",
              "name": "records",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            }
          ],
          "name": "getServiceInfo",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "recordTypes",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ServicesRegistry.ServiceInfo",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            }
          ],
          "name": "isService",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "maxBlockWindow",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_commitBlock",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "_signature",
              "type": "bytes"
            }
          ],
          "name": "removeSecondaryService",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32[]",
              "name": "_recordTypes",
              "type": "bytes32[]"
            }
          ],
          "name": "removeServiceRecords",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "name": "serviceInfo",
          "outputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "name": "serviceRecords",
          "outputs": [
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "appendId",
              "type": "bool"
            },
            {
              "internalType": "bytes",
              "name": "content",
              "type": "bytes"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_timelock",
              "type": "uint256"
            }
          ],
          "name": "setInitialService",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_newTimelock",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_commitBlock",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "_signature",
              "type": "bytes"
            }
          ],
          "name": "setNewPrimaryService",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_serviceId",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_newOwner",
              "type": "address"
            }
          ],
          "name": "setServiceOwner",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "_interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    }
  }
} as const;