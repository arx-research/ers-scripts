import { ethers, BigNumber } from "ethers";
import * as fs from 'fs';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";

import { CIDString, File } from "nft.storage";

import { ChipInfo, libErs as ERS } from '@arx-research/lib-ers';
import {
  Address,
  ArxProjectEnrollmentManager__factory,
  DeveloperRegistrar__factory,
  calculateLabelHash,
  calculateAuthenticityProjectRegistrarAddress,
  createDeveloperInclusionProof,
  createProjectOwnershipProof,
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
  getPostToIpfs,
  getProjectName,
  getProjectRegistrarType,
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
    let ownershipProofs: string[];
    let developerCertificates: string[];
    if (network == "localhost") {
      // If using localhost you will have had to run the addManufacturerEnrollment task which creates the chipData.json file
      chipInfo = JSON.parse(fs.readFileSync(`task_outputs/chipData/${hre.network.name}/chipData.json`, 'utf-8'));
      console.log(`Adding ${chipInfo.length} chips...`);

      // Sign ownership proofs for each chip
      ownershipProofs = await createOwnershipProofsFromChipInfo(chipInfo);
      // Sign Developer certificates for each chip
      developerCertificates = await createDeveloperCertificates(chipInfo);
    } else {
      // Get the amount of chips being enrolled
      const numChips = parseInt(await queryUser(rl, "How many chips are you enrolling? "));
      // Cycle through signing ownership proofs for each chip, getting the chipIDs, and building the chipInfo array
      [ ownershipProofs, chipInfo ] = await createOwnershipProofsFromScan(numChips)
      // Sign Developer certificates for each chip
      developerCertificates = await createDeveloperCertificates(chipInfo);
    }

    await ersInstance.projectCreation.createDeveloperMerkleTree(
      chipInfo,
      params.tokenUriRoot,
      BigNumber.from(params.lockinPeriod),
      params.serviceId
    );

    let chipValidationDataUri: CIDString;
    if (params.developerRegistrar == ADDRESS_ZERO){
      // Get deterministic project registrar address
      const projectRegistrarAddress = calculateAuthenticityProjectRegistrarAddress(
        getDeployedContractAddress(hre.network.name, "ArxProjectEnrollmentManager"),
        ersInstance.projectCreation.developerTree.getRoot(),
        [
          projectOwner,
          getDeployedContractAddress(hre.network.name, "ChipRegistry"),
          getDeployedContractAddress(hre.network.name, "ERSRegistry"),
          getDeployedContractAddress(hre.network.name, "ArxPlaygroundRegistrar"),
          MAX_BLOCK_WINDOW[hre.network.name]        // Should read blockchain for this
        ]
      );
      
      chipValidationDataUri = await generateAndSaveProjectEnrollmentFiles(projectRegistrarAddress);
      
      console.log("Now you need to pick one chip to scan of proof of chip ownership. This is primarily to prevent griefing attacks.");

      // Create chip ownership proof
      const chainId = BigNumber.from(await hre.getChainId());
      const packedMsg = ethers.utils.solidityPack(["uint256", "address"], [chainId, projectOwner]);
      const response = await getChipSigWithGateway(gate, packedMsg);

      const chipOwnershipProof = response.signature.ether;
      const provingChip = response.etherAddress;

      const provingChipManufacturerInfo: ManufacturerValidationInfo = await getProvingChipManufacturerValidationInfo(
        provingChip,
        network
      );

      // Create project ownership proof
      const projectOwnershipProof = await createProjectOwnershipProof(
        {
          address: projectPublicKey,
          wallet: await hre.ethers.getSigner(projectPublicKey)
        },
        projectRegistrarAddress,
        BigNumber.from(await hre.getChainId()).toNumber()
      );

      await addProjectViaEnrollmentManager(
        projectOwnershipProof,
        provingChip,
        provingChipManufacturerInfo,
        chipOwnershipProof
      );

      console.log(`New ProjectRegistrar deployed at ${projectRegistrarAddress}`);
    } else {
      // deploy project registrar
      const { deploy } = await hre.deployments;
      const projectRegistrarType = await getProjectRegistrarType(rl);

      let projectRegistrarDeploy;
      if (projectRegistrarType == 1) {
        projectRegistrarDeploy = await deploy("AuthenticityProjectRegistrar", {
          from: projectOwner,
          args: [
            projectOwner,
            getDeployedContractAddress(hre.network.name, "ChipRegistry"),
            getDeployedContractAddress(hre.network.name, "ERSRegistry"),
            params.developerRegistrar,
            MAX_BLOCK_WINDOW[hre.network.name]
          ],
        });
      } else {
        projectRegistrarDeploy = await deploy("RedirectProjectRegistrar", {
          from: projectOwner,
          args: [
            projectOwner,
            getDeployedContractAddress(hre.network.name, "ChipRegistry"),
            getDeployedContractAddress(hre.network.name, "ERSRegistry"),
            params.developerRegistrar
          ],
        });
      }

      chipValidationDataUri = await generateAndSaveProjectEnrollmentFiles(projectRegistrarDeploy.address);

      console.log(`New ProjectRegistrar deployed at ${projectRegistrarDeploy.address}`);

      // Create project ownership proof
      const projectOwnershipProof = await createProjectOwnershipProof(
        {
          address: projectPublicKey,
          wallet: await hre.ethers.getSigner(projectPublicKey)
        },
        projectRegistrarDeploy.address,
        BigNumber.from(await hre.getChainId()).toNumber()
      );
      
      const developerRegistrar = new DeveloperRegistrar__factory(await hre.ethers.getSigner(projectOwner)).attach(params.developerRegistrar);
      await rawTx({
        from: developerOwner,
        to: params.developerRegistrar,
        data: developerRegistrar.interface.encodeFunctionData(
          "addProject",
          [
            calculateLabelHash(params.name),
            projectRegistrarDeploy.address,
            ersInstance.projectCreation.developerTree.getRoot(),
            projectPublicKey,
            getDeployedContractAddress(hre.network.name, "OpenTransferPolicy"),
            projectOwnershipProof,
            chipValidationDataUri,
          ]
        )
      });
    }

    async function getAndValidateParams(): Promise<CreateProject> {
      let params: CreateProject = {} as CreateProject;
      
      params.developerRegistrar = await getUserDeveloperRegistrar(rl);
      params.name = await getProjectName(
        rl,
        await getERSRegistry(hre, projectOwner),
        await getDeveloperRegistrar(hre, params.developerRegistrar, projectOwner)
      );
      params.tokenUriRoot = await getTokenURIData(rl);
      params.lockinPeriod = await getServiceTimelock(rl);
      params.serviceId = await getServiceId(rl);
  
      return params;
    }

    async function createDeveloperCertificates(chipInfo: ChipInfo[]): Promise<string[]> {
      const developerCertificates: string[] = new Array<string>(chipInfo.length);
      for (let i = 0; i < chipInfo.length; i++) {
        developerCertificates[i] = await createDeveloperInclusionProof(
          {
            address: projectPublicKey,
            wallet: await hre.ethers.getSigner(projectPublicKey)
          },
          chipInfo[i].chipId
        );
      }

      return developerCertificates;
    }

    async function createOwnershipProofsFromScan(numChips: number): Promise<[string[], ChipInfo[]]> {
      const ownershipProofs: string[] = new Array<string>(numChips);
      const chipInfo: ChipInfo[] = new Array<ChipInfo>(numChips);

      const message = ethers.utils.solidityPack(["address"], [projectPublicKey]);
      for (let i = 0; i < numChips; i++) {
        const signResponse = await getChipSigWithGateway(gate, message);
        console.log(`Ownership proof created for chipId: ${signResponse.etherAddress} with proof: ${signResponse.signature.ether}`)
        ownershipProofs[i] = signResponse.signature.ether;

        const [ , chipManufacturerInfo ] = await getChipInfoFromGateway(signResponse.etherAddress);

        chipInfo[i] = {
          chipId: signResponse.etherAddress,
          enrollmentId: chipManufacturerInfo.enrollmentId
        } as ChipInfo;
      }

      return [ownershipProofs, chipInfo];
    }

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

    async function generateAndSaveProjectEnrollmentFiles(projectRegistrarAddress: Address): Promise<CIDString> {
      let chipValidationDataUri: CIDString;
      const developerValidationFiles = _generateProjectEnrollmentFiles(
        ersInstance,
        projectRegistrarAddress,
        developerCertificates,
        ownershipProofs
      );
      if (await getPostToIpfs(rl)) {
        chipValidationDataUri = createIpfsAddress(await uploadFilesToIPFS(developerValidationFiles));
        console.log(`Project enrollment files created and saved at ${chipValidationDataUri}`);
      } else {
        chipValidationDataUri = createIpfsAddress("dummyAddress"); 
      }

      saveFilesLocally(`projectEnrollments/${network}`, developerValidationFiles);

      return chipValidationDataUri;
    }

    function _generateProjectEnrollmentFiles(
      ers: ERS,
      projectRegistrarAddress: Address,
      certificates: string[],
      ownershipProof: string[]
    ): File[] {
      let projectEnrollmentFiles: File[] = [];
      for (let i = 0; i < ers.projectCreation.treeData.length; i++) {
        const chipData = ers.projectCreation.treeData[i];
        let chipValidationInfo: DeveloperMerkleProofInfo = {
          developerIndex: BigNumber.from(i),
          serviceId: chipData.primaryServiceId,
          lockinPeriod: chipData.lockinPeriod,
          tokenUri: chipData.tokenUri,
          developerProof: ers.projectCreation.developerTree.getProof(i),
        };
  
        let projectEnrollment: ProjectEnrollmentIPFS = {
          enrollmentId: chipData.enrollmentId,
          projectRegistrar: projectRegistrarAddress,
          developerMerkleInfo: chipValidationInfo,
          developerCertificate: certificates[i],
          custodyProof: ownershipProof[i]
        };
        projectEnrollmentFiles.push(new File([JSON.stringify(projectEnrollment)], `${chipData.chipId}.json`, { type: 'application/json' }));
      }
    
      return projectEnrollmentFiles;
    }

    async function getProvingChipManufacturerValidationInfo(
      provingChip: Address,
      network: string
    ): Promise<ManufacturerValidationInfo> {
      if (network != "localhost") {
        const [ , chipManufacturerInfo ] = await getChipInfoFromGateway(provingChip);
        return chipManufacturerInfo;
      } else {
        return JSON.parse(fs.readFileSync(`task_outputs/manufacturerEnrollments/${network}/${provingChip}.json`, 'utf-8')).validationInfo;
      }
    }

    async function addProjectViaEnrollmentManager(
      projectOwnershipProof: string,
      provingChip: Address,
      provingChipManufacturerInfo: ManufacturerValidationInfo,
      chipOwnershipProof: string,
    ) {
      const signer = await hre.ethers.getSigner(projectOwner);
      const enrollmentManagerAddress = getDeployedContractAddress(hre.network.name, "ArxProjectEnrollmentManager");
      const enrollmentManager = new ArxProjectEnrollmentManager__factory(signer).attach(enrollmentManagerAddress);

      const chipClaimInfo = JSON.parse(fs.readFileSync(`task_outputs/projectEnrollments/${network}/${provingChip}.json`, 'utf-8'));
      await rawTx({
        from: projectOwner,
        to: enrollmentManagerAddress,
        data: enrollmentManager.interface.encodeFunctionData(
          "addProject",
          [
            projectOwner,
            chipValidationDataUri,
            calculateLabelHash(params.name),
            ersInstance.projectCreation.developerTree.getRoot(),
            projectPublicKey,
            provingChip,
            chipClaimInfo.developerMerkleInfo,
            provingChipManufacturerInfo,
            chipOwnershipProof,
            projectOwnershipProof
          ]
        )
      });
    }
  });
