import { Address } from "@arx-research/ers-contracts"
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function setNewOwner(hre: HardhatRuntimeEnvironment, contract: any, newOwner: Address): Promise<void> {
  const currentOwner = await contract.owner();

  if (currentOwner != newOwner) {
    const data = contract.interface.encodeFunctionData("transferOwnership", [newOwner]);

    await hre.deployments.rawTx({
      from: currentOwner,
      to: contract.address,
      data
    });
  }
}

export function getDeployedContractAddress(network: string, contractName: string): string {
  return require(`../deployments/${network}/${contractName}.json`).address;
}

export function saveFactoryDeploy(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  contractAbi: any,
  contractAddress: Address
): void {
  const { deployments } = hre;
  const { save } = deployments;

  save(contractName,{ abi: contractAbi, address: contractAddress });
}
