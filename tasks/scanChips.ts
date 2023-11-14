import { ethers } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { Address } from "@arx-research/ers-contracts";

import { getChipPublicKeys, instantiateGateway, stringToBytes } from "../utils/scriptHelpers";

task("scanChips", "Pull information off of chips")
  .addParam("num", "Amount of chips to scan")
  .setAction(async (taskArgs, hre: HRE) => {
    const encoder = new ethers.utils.AbiCoder();
    const content = "ipfs://bafybeifqfk6jhelsfjzmi3xk2d764cziaid3lse3744e6hlitm2zkrvjem"
    console.log(stringToBytes(content));
    const gateway = await instantiateGateway();

    let chipAddresses: Address[];
    for (let i = 0; i < taskArgs.num; i++) {
      const [chipId,, ] = await getChipPublicKeys(gateway);
      chipAddresses = [];
      if (chipAddresses.includes(chipId)) {
        console.log(`Chip ${chipId} already scanned. Skipping...`);
        i--;
        continue;
      }

      chipAddresses.push(chipId);
      console.log(`Scanned chip ${i + 1} of ${taskArgs.num} has chipId: ${chipId}`);
    }
  });
