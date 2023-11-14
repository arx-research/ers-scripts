export default {
  "name": "goerli",
  "chainId": "5",
  "contracts": {
    "ArxPlaygroundRegistrar": {
      "address": "0x3d0E214C3EFB0a2DBb95A4cAd82DAEb77868984B",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            },
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
              "internalType": "contract ITSMRegistry",
              "name": "_tsmRegistry",
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
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "merkleRoot",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "projectPublicKey",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "transferPolicy",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "projectClaimDataUri",
              "type": "string"
            }
          ],
          "name": "ProjectAdded",
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
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            },
            {
              "internalType": "contract IProjectRegistrar",
              "name": "_projectRegistrar",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_merkleRoot",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_projectPublicKey",
              "type": "address"
            },
            {
              "internalType": "contract ITransferPolicy",
              "name": "_transferPolicy",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "_ownershipProof",
              "type": "bytes"
            },
            {
              "internalType": "string",
              "name": "_projectClaimDataUri",
              "type": "string"
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
          "inputs": [],
          "name": "tsmRegistry",
          "outputs": [
            {
              "internalType": "contract ITSMRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    },
    "ArxProjectEnrollmentManager": {
      "address": "0xf98b04f8BBF51D6a833F5884bbEa71108f71a76c",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IChipRegistry",
              "name": "_chipRegistry",
              "type": "address"
            },
            {
              "internalType": "contract ITSMRegistrar",
              "name": "_tsmRegistrar",
              "type": "address"
            },
            {
              "internalType": "contract IERS",
              "name": "_ers",
              "type": "address"
            },
            {
              "internalType": "contract IManufacturerRegistry",
              "name": "_manufacturerRegistry",
              "type": "address"
            },
            {
              "internalType": "contract ITransferPolicy",
              "name": "_transferPolicy",
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
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "maxBlockWindow",
              "type": "uint256"
            }
          ],
          "name": "NewMaxBlockWindowSet",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "contract ITransferPolicy",
              "name": "transferPolicy",
              "type": "address"
            }
          ],
          "name": "NewTransferPolicySet",
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
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "ProjectRegistrarDeployed",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_projectManager",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "_projectClaimDataUri",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_merkleRoot",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_projectPublicKey",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_provingChip",
              "type": "address"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "tsmIndex",
                  "type": "uint256"
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
                  "internalType": "string",
                  "name": "tokenUri",
                  "type": "string"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "tsmProof",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct IChipRegistry.TSMMerkleInfo",
              "name": "_tsmMerkleInfo",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "enrollmentId",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256",
                  "name": "mIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "manufacturerProof",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct IChipRegistry.ManufacturerValidation",
              "name": "_manufacturerValidation",
              "type": "tuple"
            },
            {
              "internalType": "bytes",
              "name": "_chipOwnershipProof",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "_projectOwnershipProof",
              "type": "bytes"
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
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_maxBlockWindow",
              "type": "uint256"
            }
          ],
          "name": "setMaxBlockWindow",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract ITransferPolicy",
              "name": "_transferPolicy",
              "type": "address"
            }
          ],
          "name": "setTransferPolicy",
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
          "inputs": [],
          "name": "transferPolicy",
          "outputs": [
            {
              "internalType": "contract ITransferPolicy",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "tsmRegistrar",
          "outputs": [
            {
              "internalType": "contract ITSMRegistrar",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    },
    "ChipRegistry": {
      "address": "0x9e4be58A53E179df2c82894765E83900D9eF0FE7",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IManufacturerRegistry",
              "name": "_manufacturerRegistry",
              "type": "address"
            },
            {
              "internalType": "string[]",
              "name": "_gatewayUrls",
              "type": "string[]"
            },
            {
              "internalType": "uint256",
              "name": "_maxBlockWindow",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_maxLockinPeriod",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "string[]",
              "name": "urls",
              "type": "string[]"
            },
            {
              "internalType": "bytes",
              "name": "callData",
              "type": "bytes"
            },
            {
              "internalType": "bytes4",
              "name": "callbackFunction",
              "type": "bytes4"
            },
            {
              "internalType": "bytes",
              "name": "extraData",
              "type": "bytes"
            }
          ],
          "name": "OffchainLookup",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "approved",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "ApprovalForAll",
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
              "indexed": false,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
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
              "indexed": true,
              "internalType": "bytes32",
              "name": "enrollmentId",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "tokenUri",
              "type": "string"
            }
          ],
          "name": "ChipClaimed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "string",
              "name": "gatewayUrl",
              "type": "string"
            }
          ],
          "name": "GatewayURLAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "string",
              "name": "gatewayUrl",
              "type": "string"
            }
          ],
          "name": "GatewayURLRemoved",
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
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "oldChipAddress",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newChipAddress",
              "type": "address"
            }
          ],
          "name": "PBTChipRemapping",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "chipAddress",
              "type": "address"
            }
          ],
          "name": "PBTMint",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "tsmRegistrar",
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
              "internalType": "address",
              "name": "transferPolicy",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "projectPublicKey",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "merkleRoot",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "projectClaimDataUri",
              "type": "string"
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
              "name": "projectRegistrar",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "merkleRoot",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "projectClaimDataUri",
              "type": "string"
            }
          ],
          "name": "ProjectMerkleRootUpdated",
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
              "name": "servicesRegistry",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "tsmRegistry",
              "type": "address"
            }
          ],
          "name": "RegistryInitialized",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
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
              "indexed": false,
              "internalType": "address",
              "name": "transferPolicy",
              "type": "address"
            }
          ],
          "name": "TransferPolicyChanged",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "CONTENT_APP_RECORDTYPE",
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
          "name": "URI_RECORDTYPE",
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
          "inputs": [
            {
              "internalType": "string",
              "name": "_gatewayUrl",
              "type": "string"
            }
          ],
          "name": "addGatewayURL",
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
              "internalType": "address",
              "name": "_projectPublicKey",
              "type": "address"
            },
            {
              "internalType": "contract ITransferPolicy",
              "name": "_transferPolicy",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_merkleRoot",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "_ownershipProof",
              "type": "bytes"
            },
            {
              "internalType": "string",
              "name": "_projectClaimDataUri",
              "type": "string"
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
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "approve",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
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
              "name": "",
              "type": "address"
            }
          ],
          "name": "chipTable",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "contract ITransferPolicy",
              "name": "transferPolicy",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "tokenUri",
              "type": "string"
            },
            {
              "internalType": "bytes",
              "name": "tokenData",
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
              "components": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "ersNode",
                  "type": "bytes32"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "tsmIndex",
                      "type": "uint256"
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
                      "internalType": "string",
                      "name": "tokenUri",
                      "type": "string"
                    },
                    {
                      "internalType": "bytes32[]",
                      "name": "tsmProof",
                      "type": "bytes32[]"
                    }
                  ],
                  "internalType": "struct IChipRegistry.TSMMerkleInfo",
                  "name": "tsmMerkleInfo",
                  "type": "tuple"
                }
              ],
              "internalType": "struct IChipRegistry.ChipClaim",
              "name": "_chipClaim",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "enrollmentId",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256",
                  "name": "mIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "manufacturerProof",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct IChipRegistry.ManufacturerValidation",
              "name": "_manufacturerValidation",
              "type": "tuple"
            },
            {
              "internalType": "bytes",
              "name": "_tsmCertificate",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "_custodyProof",
              "type": "bytes"
            }
          ],
          "name": "claimChip",
          "outputs": [],
          "stateMutability": "nonpayable",
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
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "getApproved",
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
          "name": "getGatewayUrls",
          "outputs": [
            {
              "internalType": "string[]",
              "name": "",
              "type": "string[]"
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
              "internalType": "contract IServicesRegistry",
              "name": "_servicesRegistry",
              "type": "address"
            },
            {
              "internalType": "contract ITSMRegistry",
              "name": "_tsmRegistry",
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
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "isApprovedForAll",
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
            },
            {
              "internalType": "bytes",
              "name": "_payload",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "_signature",
              "type": "bytes"
            }
          ],
          "name": "isChipSignatureForToken",
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
          "name": "name",
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
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
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
              "name": "merkleRoot",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "projectPublicKey",
              "type": "address"
            },
            {
              "internalType": "contract ITransferPolicy",
              "name": "transferPolicy",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "creationTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "claimsStarted",
              "type": "bool"
            },
            {
              "internalType": "string",
              "name": "projectClaimDataUri",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_gatewayUrl",
              "type": "string"
            }
          ],
          "name": "removeGatewayURL",
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
          "name": "resolveChipId",
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
              "internalType": "bytes",
              "name": "_response",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "_extraData",
              "type": "bytes"
            }
          ],
          "name": "resolveUnclaimedChip",
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
              "name": "",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "safeTransferFrom",
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
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
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
              "name": "",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "name": "setApprovalForAll",
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
              "name": "_newOwner",
              "type": "address"
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
          "name": "setOwner",
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
              "internalType": "contract ITransferPolicy",
              "name": "_newPolicy",
              "type": "address"
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
          "name": "setTransferPolicy",
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
          "inputs": [],
          "name": "symbol",
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
          "name": "tokenIdCounter",
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
            }
          ],
          "name": "tokenIdFor",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
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
          "name": "tokenIdToChipId",
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
          "name": "tokenURI",
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
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            }
          ],
          "name": "tokenURI",
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
              "name": "",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "transferFrom",
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
              "name": "chipId",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "signatureFromChip",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "blockNumberUsedInSig",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "useSafeTransferFrom",
              "type": "bool"
            },
            {
              "internalType": "bytes",
              "name": "payload",
              "type": "bytes"
            }
          ],
          "name": "transferToken",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "name": "transferTokenWithChip",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "tsmRegistry",
          "outputs": [
            {
              "internalType": "contract ITSMRegistry",
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
              "internalType": "contract IProjectRegistrar",
              "name": "_projectRegistrar",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_merkleRoot",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "_projectClaimDataUri",
              "type": "string"
            }
          ],
          "name": "updateProjectMerkleRoot",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "ERSRegistry": {
      "address": "0xFAb4E4b26fCFfc3943b423B7129cA8F05A423B85",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IChipRegistry",
              "name": "_chipRegistry",
              "type": "address"
            },
            {
              "internalType": "contract ITSMRegistry",
              "name": "_tsmRegistry",
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
          "name": "deleteSubnodeRecord",
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
            },
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            }
          ],
          "name": "isValidChipState",
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
        },
        {
          "inputs": [],
          "name": "tsmRegistry",
          "outputs": [
            {
              "internalType": "contract ITSMRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    },
    "ManufacturerRegistry": {
      "address": "0xD592a669F7d8D9F60B412DA6596088B140E98F6f",
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
              "internalType": "bytes32",
              "name": "merkleRoot",
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
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_manufacturerId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_merkleRoot",
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
                  "internalType": "bytes32",
                  "name": "merkleRoot",
                  "type": "bytes32"
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
              "internalType": "uint256",
              "name": "_index",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "_chipId",
              "type": "address"
            },
            {
              "internalType": "bytes32[]",
              "name": "_merkleProof",
              "type": "bytes32[]"
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
    "SECP256k1Model": {
      "address": "0x31AD013E91e28724C6abbd973A0dD28bFdA657eF",
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
      "address": "0xe6ACA2d69C7F450332404eDb5c32863Af25aF415",
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
        }
      ]
    },
    "TSMRegistrarFactory": {
      "address": "0xc84C7CA3fa2d9801eC8B3Db235d52A52a4eaB6d3",
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
              "internalType": "contract ITSMRegistry",
              "name": "_tsmRegistry",
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
              "name": "tsmRegistrar",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "TSMRegistrarDeployed",
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
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            }
          ],
          "name": "deployRegistrar",
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
          "name": "tsmRegistry",
          "outputs": [
            {
              "internalType": "contract ITSMRegistry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    },
    "TSMRegistry": {
      "address": "0x0E189E52ab089C48Ab41E7947d01Ac7EFD38460e",
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
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "tsmOwner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "nameHash",
              "type": "bytes32"
            }
          ],
          "name": "TSMAllowed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "tsmOwner",
              "type": "address"
            }
          ],
          "name": "TSMDisallowed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "tsmRegistrar",
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
          "name": "TSMRegistrarAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "tsmRegistrar",
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
          "name": "TSMRegistrarRevoked",
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
          "inputs": [
            {
              "internalType": "address",
              "name": "_tsmOwner",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "addAllowedTSM",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract ITSMRegistrarFactory",
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
              "internalType": "contract ITSMRegistrarFactory",
              "name": "_factory",
              "type": "address"
            }
          ],
          "name": "createNewTSMRegistrar",
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
          "name": "getTSMRegistrars",
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
              "internalType": "contract ITSMRegistrarFactory[]",
              "name": "_factories",
              "type": "address[]"
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
          "name": "isTSMRegistrar",
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
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "pendingTSMs",
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
          "inputs": [
            {
              "internalType": "contract ITSMRegistrarFactory",
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
              "name": "_tsmOwner",
              "type": "address"
            }
          ],
          "name": "removeAllowedTSM",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract ITSMRegistrarFactory",
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
              "name": "_tsmRegistrar",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "_nameHash",
              "type": "bytes32"
            }
          ],
          "name": "revokeTSMRegistrar",
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
    }
  }
} as const;