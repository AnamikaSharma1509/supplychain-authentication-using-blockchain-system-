require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL, // Fetching from .env
      accounts: [process.env.PRIVATE_KEY], // Using Private Key from .env
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY, // Add this section for contract verification
  },
};
