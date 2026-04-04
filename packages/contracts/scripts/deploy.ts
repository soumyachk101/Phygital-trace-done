import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying TruthAttestation...");

  const TruthAttestation = await ethers.getContractFactory("TruthAttestation");
  const attestation = await TruthAttestation.deploy();
  await attestation.waitForDeployment();

  const address = await attestation.getAddress();
  console.log(`TruthAttestation deployed to: ${address}`);

  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  const deployments = {
    network: hre.network.name,
    TruthAttestation: address,
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`Deployment info saved to ${deploymentsPath}`);

  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations before verification...");
    await attestation.deploymentTransaction()?.wait(5);
    try {
      await hre.run("verify:verify", { address, constructorArguments: [] });
      console.log("Contract verified!");
    } catch (err: any) {
      console.log(`Verification skipped: ${err.message}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
