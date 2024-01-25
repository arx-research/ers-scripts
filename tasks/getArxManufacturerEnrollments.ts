import axios from 'axios';
import * as fs from 'fs';
import * as tar from 'tar';
import fetch from 'node-fetch';
import { SingleBar, Presets } from 'cli-progress';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";

async function downloadFile(url: string, outputPath: string) {
  const progressBar = new SingleBar({}, Presets.shades_classic);
  let started = false;

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    onDownloadProgress: progressEvent => {
      const total = progressEvent.total || progressEvent.loaded; // Fallback to loaded if total is undefined
      if (!started) {
        progressBar.start(total, 0);
        started = true;
      }
      progressBar.update(progressEvent.loaded);
    }
  });

  progressBar.stop();
  fs.writeFileSync(outputPath, response.data);
}

async function downloadFiles(chainName: string) {
  const url = `https://api.github.com/repos/arx-research/arx-chip-enrollments/contents/${chainName}`;
  const response = await fetch(url);
  const files = await response.json();

  if (!Array.isArray(files)) {
    throw new Error('Invalid response from GitHub');
  }

  if (!fs.existsSync('./task_outputs')) {
    fs.mkdirSync('./task_outputs');
  }

  for (const file of files) {
    if (file.type === 'file') {
      await downloadFile(file.download_url, `./task_outputs/${file.name}`);
    } else if (file.type === 'dir' && file.name === 'enrollmentData') {
      const enrollmentDataPath = `./task_outputs/${file.name}`;

      if (!fs.existsSync(enrollmentDataPath)) {
        fs.mkdirSync(enrollmentDataPath, { recursive: true });
      }

      const dirResponse = await fetch(file.url);
      const dirFiles = await dirResponse.json();

      if (!Array.isArray(dirFiles)) {
        throw new Error('Invalid response from GitHub for directory contents');
      }

      for (const dirFile of dirFiles) {
        if (dirFile.type === 'file') {
          await downloadFile(dirFile.download_url, `${enrollmentDataPath}/${dirFile.name}`);
        }
      }
    }
  }
}

async function organizeFiles(chainName: string) {
  if (!fs.existsSync('./task_outputs')) {
    fs.mkdirSync('./task_outputs');
  }

  // Extract manufacturerEnrollments.tar.gz
  if (fs.existsSync(`./task_outputs/manufacturerEnrollments.tar.gz`)) {
    await tar.x({
      file: `./task_outputs/manufacturerEnrollments.tar.gz`,
      C: './task_outputs'
    });
  }

  // Delete the .tar file after extraction
  fs.unlinkSync(`./task_outputs/manufacturerEnrollments.tar.gz`);
}

task("getArxManufacturerEnrollments", "Generates JSON files for chips and uploads to NFT.Storage")
  .addParam("scan", "Number of chips to scan", "0", undefined, true)
  .setAction(async (taskArgs, hre: HRE) => {
    const chainName = hre.network.name;
    console.log(`Downloading files for chain: ${chainName}`);
    await downloadFiles(chainName);
    console.log('Organizing files...');
    await organizeFiles(chainName);
    console.log('Done!');
  });
