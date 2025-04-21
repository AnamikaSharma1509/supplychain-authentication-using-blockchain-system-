const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

// Define paths
const buildPath = path.resolve(__dirname, 'build');
const contractsPath = path.resolve(__dirname, 'contracts');
const contractFile = 'SupplyChain.sol';  // Change this if your filename is different
const contractPath = path.resolve(contractsPath, contractFile);

// Ensure the Solidity file exists
if (!fs.existsSync(contractPath)) {
    console.error(`❌ Error: ${contractFile} not found in contracts directory.`);
    process.exit(1);
}

// Remove the existing build directory
fs.removeSync(buildPath);

// Read the Solidity contract source code
const source = fs.readFileSync(contractPath, 'utf-8');

// Define Solidity compiler input format
const input = {
    language: 'Solidity',
    sources: {
        [contractFile]: { content: source }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode.object']
            }
        }
    }
};

// Compile the Solidity contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for compilation errors
if (output.errors) {
    for (let error of output.errors) {
        console.error(`❌ Compilation Error: ${error.formattedMessage}`);
    }
    process.exit(1);
}

// Ensure the build directory exists
fs.ensureDirSync(buildPath);

// Extract and save compiled contracts
for (let contractName in output.contracts[contractFile]) {
    const contractData = output.contracts[contractFile][contractName];
    const filePath = path.resolve(buildPath, contractName + '.json');
    fs.outputJSONSync(filePath, contractData);
}

console.log("✅ Compilation completed successfully.");
