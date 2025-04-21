const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying SupplyChain contract...");

    // Get the contract factory
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    
    // Deploy the contract
    console.log("Deploying contract...");
    const supplyChain = await SupplyChain.deploy();
    
    // Wait for deployment to complete
    await supplyChain.waitForDeployment();
    
    // Get the deployed contract address
    const contractAddress = await supplyChain.getAddress();
    console.log("✅ SupplyChain contract deployed to:", contractAddress);
    
    // Update the .env file with the new contract address
    const fs = require('fs');
    const envPath = './.env';
    let envFile = fs.readFileSync(envPath, 'utf8');
    envFile = envFile.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${contractAddress}`
    );
    fs.writeFileSync(envPath, envFile);
    console.log("Updated .env file with new contract address");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
