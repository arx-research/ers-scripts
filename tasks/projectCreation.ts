import { ethers, BigNumber } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";

import { CIDString, File } from "nft.storage";

import { ChipInfo, libErs as ERS } from '@arx-research/lib-ers';
import {
  Address,
  PBTSimpleProjectRegistrar__factory
  DeveloperRegistrar__factory,
  calculateLabelHash,
  DeveloperMerkleProofInfo,
  ManufacturerValidationInfo,
  ADDRESS_ZERO,
} from "@arx-research/ers-contracts/";

import { CreateProject, ProjectEnrollmentIPFS } from "../types/scripts";

import { 
  createERSInstance,
  createIpfsAddress,
  getChipInfoFromGateway,
  getChipSigWithGateway,
  getDeveloperRegistrar,
  getERSRegistry,
  instantiateGateway,
  saveFilesLocally,
  queryUser,
  rl,
  uploadFilesToIPFS
} from "../utils/scriptHelpers";
import { getDeployedContractAddress } from '../utils/helpers';
import { 
  getUserDeveloperRegistrar,
  getProjectName,
  getProjectSymbol,
  getServiceTimelock,
  getServiceId,
  getTokenURIData,
 } from '../utils/prompts/projectCreationPrompts';
import { MAX_BLOCK_WINDOW } from "../deployments/parameters";

task("createProject", "Create a new project using the ArxProjectEnrollmentManager")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;

    const { projectPublicKey, developerOwner, projectOwner } = await hre.getNamedAccounts();
    const network = hre.network.name;
    let params: CreateProject = await getAndValidateParams();

    const ersInstance: ERS = await createERSInstance(hre);
    
    let gate = await instantiateGateway();

    let chipInfo: ChipInfo[];
    // let ownershipProofs: string[];
    // let developerCertificates: string[];
    if (network == "localhost") {
      // If using localhost you will have had to run the addManufacturerEnrollment task which creates the chipData.json file
      chipInfo = JSON.parse(fs.readFileSync(`task_outputs/chipData/${hre.network.name}/chipData.json`, 'utf-8'));
      console.log(`Adding ${chipInfo.length} chips...`);

      // // Sign ownership proofs for each chip
      // ownershipProofs = await createOwnershipProofsFromChipInfo(chipInfo);
      // // Sign Developer certificates for each chip
      // developerCertificates = await createDeveloperCertificates(chipInfo);
    } else {
      // Get the amount of chips being enrolled
      const numChips = parseInt(await queryUser(rl, "How many chips are you enrolling? "));
      // Cycle through signing ownership proofs for each chip, getting the chipIDs, and building the chipInfo array
      
      //TODO: replace this function with one that scans chips (getChipPublicKeys) and creates the chipInfo array. We don't care about ownershipProofs anymore.
      [ ownershipProofs, chipInfo ] = await createOwnershipProofsFromScan(numChips)

      // ...and example of scanning from another task:
      //     task("scanChips", "Pull information off of chips")
      // .addParam("num", "Amount of chips to scan")
      // .setAction(async (taskArgs, hre: HRE) => {
      //   const encoder = new ethers.utils.AbiCoder();
      //   const content = "ipfs://bafybeifqfk6jhelsfjzmi3xk2d764cziaid3lse3744e6hlitm2zkrvjem"
      //   console.log(stringToBytes(content));
      //   const gateway = await instantiateGateway();

      //   let chipAddresses: Address[];
      //   for (let i = 0; i < taskArgs.num; i++) {
      //     const [chipId,, ] = await getChipPublicKeys(gateway);
      //     chipAddresses = [];
      //     if (chipAddresses.includes(chipId)) {
      //       console.log(`Chip ${chipId} already scanned. Skipping...`);
      //       i--;
      //       continue;
      //     }

      //     chipAddresses.push(chipId);
      //     console.log(`Scanned chip ${i + 1} of ${taskArgs.num} has chipId: ${chipId}`);
      //   }
      // });
      // ...you will note that the manufacturer certificate is not included here. Let's stub in a call to an API which will give us this info.

      // // Sign Developer certificates for each chip
      // developerCertificates = await createDeveloperCertificates(chipInfo);
    }

    let chipValidationDataUri: CIDString;
    
    const { deploy } = await hre.deployments;

    let projectRegistrarDeploy;

    projectRegistrarDeploy = await deploy("PBTSimpleProjectRegistrar", {
      from: projectOwner,
      args: [
        projectOwner,
        getDeployedContractAddress(hre.network.name, "ChipRegistry"),
        getDeployedContractAddress(hre.network.name, "ERSRegistry"),
        params.developerRegistrar,
        params.name,
        params.tokenSymbol,
        params.tokenUriRoot,
        params.lockinPeriod,
        getDeployedContractAddress(hre.network.name, "OpenTransferPolicy"),
      ],
    });

    console.log(`New ProjectRegistrar deployed at ${projectRegistrarDeploy.address}`);
    
    const developerRegistrar = new DeveloperRegistrar__factory(await hre.ethers.getSigner(projectOwner)).attach(params.developerRegistrar);
    await rawTx({
      from: developerOwner,
      to: params.developerRegistrar,
      data: developerRegistrar.interface.encodeFunctionData(
        "addProject",
        [
          projectRegistrarDeploy.address,
          calculateLabelHash(params.name),
          params.serviceId,
          params.lockinPeriod,
        ]
      )
    });

    // TODO: add chips to project.

    // Here is an extremely roughh example -- this has been lifted from hardhat tests. What we need to do is create another tx to call addChips with chipInfo for each chip.
    //   subjectAdditionData = [
    //     {
    //       chipId: chipIdOne,
    //       chipOwner: developerOne.address,
    //       nameHash: nameHashOne,
    //       manufacturerValidation: manufacturerValidationOne,
    //     } as ProjectChipAddition,
    //     {
    //       chipId: chipIdTwo,
    //       chipOwner: developerOne.address,
    //       nameHash: nameHashTwo,
    //       manufacturerValidation: manufacturerValidationTwo,
    //     } as ProjectChipAddition,
    //   ];
    //   subjectCaller = developerOne;
    // });

    // async function subject(): Promise<any> {
    //   return projectRegistrar.connect(subjectCaller.wallet).addChips(subjectAdditionData);
    // }

    async function getAndValidateParams(): Promise<CreateProject> {
      let params: CreateProject = {} as CreateProject;
      
      params.developerRegistrar = await getUserDeveloperRegistrar(rl);
      params.name = await getProjectName(
        rl,
        await getERSRegistry(hre, projectOwner),
        await getDeveloperRegistrar(hre, params.developerRegistrar, projectOwner)
      );
      params.tokenSymbol = await getProjectSymbol(rl);
      params.tokenUriRoot = await getTokenURIData(rl);
      params.lockinPeriod = await getServiceTimelock(rl);
      params.serviceId = await getServiceId(rl);
  
      return params;
    }

    // async function createDeveloperCertificates(chipInfo: ChipInfo[]): Promise<string[]> {
    //   const developerCertificates: string[] = new Array<string>(chipInfo.length);
    //   for (let i = 0; i < chipInfo.length; i++) {
    //     developerCertificates[i] = await createDeveloperInclusionProof(
    //       {
    //         address: projectPublicKey,
    //         wallet: await hre.ethers.getSigner(projectPublicKey)
    //       },
    //       chipInfo[i].chipId
    //     );
    //   }

    //   return developerCertificates;
    // }

    // async function createOwnershipProofsFromScan(numChips: number): Promise<[string[], ChipInfo[]]> {
    //   const ownershipProofs: string[] = new Array<string>(numChips);
    //   const chipInfo: ChipInfo[] = new Array<ChipInfo>(numChips);

    //   const message = ethers.utils.solidityPack(["address"], [projectPublicKey]);
    //   for (let i = 0; i < numChips; i++) {
    //     const signResponse = await getChipSigWithGateway(gate, message);
    //     console.log(`Ownership proof created for chipId: ${signResponse.etherAddress} with proof: ${signResponse.signature.ether}`)
    //     ownershipProofs[i] = signResponse.signature.ether;

    //     const [ , chipManufacturerInfo ] = await getChipInfoFromGateway(hre, signResponse.etherAddress);

    //     chipInfo[i] = {
    //       chipId: signResponse.etherAddress,
    //       enrollmentId: chipManufacturerInfo.enrollmentId
    //     } as ChipInfo;
    //   }

    //   return [ownershipProofs, chipInfo];
    // }

    // console.log(`Scanning chips set to ${params.numberOfChips}`);
    // const gateway = await instantiateGateway();
    // for (let i = 0; i < params.numberOfChips.toNumber(); i++) {
    //   const [ chipId, pk2, _rawKeys ] = await getChipPublicKeys(gateway);
    //   // Make rawKeys available outside of the loop
    //   if (Object.keys(chips).includes(chipId)) {
    //     console.log(`Chip ${chipId} already scanned. Skipping...`);
    //     i--;
    //     continue;
    //   }

    //   chips[chipId] = {secondaryKeyAddress: pk2};
    //   console.log(`Scanned chip ${i + 1} of ${params.numberOfChips}`);
    // }

    // async function scanChips(numChips: number): Promise<ChipInfo[]> {
    //   const chipInfo: ChipInfo[] = new Array<ChipInfo>(numChips);
    //   for (let i = 0; i < numChips; i++) {
    //     const [ chipId, pk2, _rawKeys ] = await getChipPublicKeys(gate);
    //     chipInfo[i] = {
    //       chipId: chipId,
    //       secondaryKey: pk2
    //     } as ChipInfo;
    //   }

    //   return chipInfo;
    // }

    async function createOwnershipProofsFromChipInfo(chipInfo: ChipInfo[]): Promise<string[]> {
      const ownershipProofs: string[] = new Array<string>(chipInfo.length);
      const message = ethers.utils.solidityPack(["address"], [projectPublicKey]);     
      for (let i = 0; i < chipInfo.length; i++) {
        const signResponse = await getChipSigWithGateway(gate, message);
        const index = chipInfo.findIndex(item => item.chipId == signResponse.etherAddress);
        
        if (index == -1) {
          console.log(`Could not find chipId ${signResponse.etherAddress} in chipInfo`);
          i -= 1;
          continue
        };

        if (ownershipProofs[index]) {
          console.log(`ChipId ${chipInfo[i].chipId} already has an ownership proof`);
          i -= 1;
          continue
        }

        console.log(`Ownership proof created for chipId: ${chipInfo[i].chipId} with proof: ${signResponse.signature.ether}`)
        ownershipProofs[index] = signResponse.signature.ether;
      }

      return ownershipProofs;
    }

    // async function generateAndSaveProjectEnrollmentFiles(projectRegistrarAddress: Address): Promise<CIDString> {
    //   let chipValidationDataUri: CIDString;
    //   const developerValidationFiles = _generateProjectEnrollmentFiles(
    //     ersInstance,
    //     projectRegistrarAddress,
    //     developerCertificates,
    //     ownershipProofs
    //   );
    //   if (await getPostToIpfs(rl)) {
    //     chipValidationDataUri = createIpfsAddress(await uploadFilesToIPFS(developerValidationFiles));
    //     console.log(`Project enrollment files created and saved at ${chipValidationDataUri}`);
    //   } else {
    //     chipValidationDataUri = createIpfsAddress("dummyAddress"); 
    //   }

    //   saveFilesLocally(`projectEnrollments/${network}`, developerValidationFiles);

    //   return chipValidationDataUri;
    // }

    // function _generateProjectEnrollmentFiles(
    //   ers: ERS,
    //   projectRegistrarAddress: Address,
    //   certificates: string[],
    //   ownershipProof: string[]
    // ): File[] {
    //   let projectEnrollmentFiles: File[] = [];
    //   for (let i = 0; i < ers.projectCreation.treeData.length; i++) {
    //     const chipData = ers.projectCreation.treeData[i];
    //     let chipValidationInfo: DeveloperMerkleProofInfo = {
    //       developerIndex: BigNumber.from(i),
    //       serviceId: chipData.primaryServiceId,
    //       lockinPeriod: chipData.lockinPeriod,
    //       tokenUri: chipData.tokenUri,
    //       developerProof: ers.projectCreation.developerTree.getProof(i),
    //     };
  
    //     let projectEnrollment: ProjectEnrollmentIPFS = {
    //       enrollmentId: chipData.enrollmentId,
    //       projectRegistrar: projectRegistrarAddress,
    //       developerMerkleInfo: chipValidationInfo,
    //       developerCertificate: certificates[i],
    //       custodyProof: ownershipProof[i]
    //     };
    //     projectEnrollmentFiles.push(new File([JSON.stringify(projectEnrollment)], `${chipData.chipId}.json`, { type: 'application/json' }));
    //   }
    
    //   return projectEnrollmentFiles;
    // }

    // async function getProvingChipManufacturerValidationInfo(
    //   provingChip: Address,
    //   network: string
    // ): Promise<ManufacturerValidationInfo> {
    //   if (network != "localhost") {
    //     const [ , chipManufacturerInfo ] = await getChipInfoFromGateway(hre, provingChip);
    //     return chipManufacturerInfo;
    //   } else {
    //     return JSON.parse(fs.readFileSync(`task_outputs/manufacturerEnrollments/${network}/${provingChip}.json`, 'utf-8')).validationInfo;
    //   }
    // }

    // async function addProjectViaEnrollmentManager(
    //   projectOwnershipProof: string,
    //   provingChip: Address,
    //   provingChipManufacturerInfo: ManufacturerValidationInfo,
    //   chipOwnershipProof: string,
    // ) {
    //   const signer = await hre.ethers.getSigner(projectOwner);
    //   const enrollmentManagerAddress = getDeployedContractAddress(hre.network.name, "ArxProjectEnrollmentManager");
    //   const enrollmentManager = new ArxProjectEnrollmentManager__factory(signer).attach(enrollmentManagerAddress);

    //   const chipClaimInfo = JSON.parse(fs.readFileSync(`task_outputs/projectEnrollments/${network}/${provingChip}.json`, 'utf-8'));
    //   await rawTx({
    //     from: projectOwner,
    //     to: enrollmentManagerAddress,
    //     data: enrollmentManager.interface.encodeFunctionData(
    //       "addProject",
    //       [
    //         projectOwner,
    //         chipValidationDataUri,
    //         calculateLabelHash(params.name),
    //         ersInstance.projectCreation.developerTree.getRoot(),
    //         projectPublicKey,
    //         provingChip,
    //         chipClaimInfo.developerMerkleInfo,
    //         provingChipManufacturerInfo,
    //         chipOwnershipProof,
    //         projectOwnershipProof
    //       ]
    //     )
    //   });
    // }
  });
