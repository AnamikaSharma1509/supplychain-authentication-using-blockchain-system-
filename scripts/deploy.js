const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying contract...");

    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();

    await supplyChain.waitForDeployment(); // Fix: Use waitForDeployment() instead of deployed()

    console.log("✅ Contract deployed at:", await supplyChain.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
