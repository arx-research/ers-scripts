import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { calculateSubnodeHash } from "@arx-research/ers-contracts";
import { BigNumber } from "ethers";
import { getDeveloperNameApproval } from "../utils/prompts/createDeveloperRegistrarPrompts";
import { getDeveloperNameGovernor, getDeveloperRegistry, getERSRegistry } from "../utils/scriptHelpers";
import { getDeployedContractAddress } from "../utils/helpers";
import { rl } from "../utils/scriptHelpers";

task("createDeveloperRegistrar", "Create developer registrar")
  .setAction(async (taskArgs, hre: HRE) => {
    const { rawTx } = hre.deployments;
    const { developerOwner } = await hre.getNamedAccounts();

    const chainId = BigNumber.from(await hre.getChainId());
    const developerNameGovernor = await getDeveloperNameGovernor(hre, developerOwner);

    const [approvalProof, proofTimestamp, nameHash] = await getDeveloperNameApproval(rl, developerOwner, chainId, developerNameGovernor.address);

    
    const developerRegistry = await getDeveloperRegistry(hre, developerOwner);

    await rawTx({
      from: developerOwner,
      to: developerNameGovernor.address,
      data: developerNameGovernor.interface.encodeFunctionData(
        "claimName",
        [nameHash, proofTimestamp, approvalProof]
      )
    });

    const receipt = await rawTx({
      from: developerOwner,
      to: developerRegistry.address,
      data: developerRegistry.interface.encodeFunctionData(
        "createNewDeveloperRegistrar",
        [getDeployedContractAddress(hre.network.name, "DeveloperRegistrarFactory")]
      )
    });

    const ersRegistry = await getERSRegistry(hre, developerOwner);

    const developerRegistrarAddress = await ersRegistry.getSubnodeOwner(calculateSubnodeHash("ers"), nameHash);
    console.log(`Developer registrar created at ${developerRegistrarAddress}`);
  });
