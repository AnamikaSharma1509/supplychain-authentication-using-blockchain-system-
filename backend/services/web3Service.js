const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let web3;
let supplyChainContract;
let account;

// Only initialize Web3 if MetaMask is enabled
if (process.env.METAMASK_ENABLED === 'true') {
  web3 = new Web3(process.env.SEPOLIA_RPC_URL);

  const contractABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../build/SupplyChain.json'))
  ).abi;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  supplyChainContract = new web3.eth.Contract(contractABI, contractAddress);

  account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);
}

// Add a product to the blockchain
const addProductToBlockchain = async (name, qrCodeHash) => {
  if (process.env.METAMASK_ENABLED !== 'true') {
    return {
      success: true,
      transactionHash: 'mock-transaction-hash',
      productId: 'mock-product-id',
    };
  }

  try {
    const gasEstimate = await supplyChainContract.methods
      .addProduct(name, qrCodeHash)
      .estimateGas({ from: account.address });

    const gasWithBuffer = Number(gasEstimate) * 1.2;

    const result = await supplyChainContract.methods
      .addProduct(name, qrCodeHash)
      .send({
        from: account.address,
        gas: Math.floor(gasWithBuffer),
      });

    return {
      success: true,
      transactionHash: result.transactionHash,
      productId: result.events.ProductAdded.returnValues.id,
    };
  } catch (error) {
    console.error('Error adding product to blockchain:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Transfer product ownership (fixed BigInt issue)
const transferProductOwnership = async (qrCodeHash, toAddress) => {
  if (process.env.METAMASK_ENABLED !== 'true') {
    return {
      success: true,
      transactionHash: 'mock-transfer-hash',
    };
  }

  try {
    const allProducts = await getAllProductsFromBlockchain();

    const product = allProducts.products.find(
      (p) => p.qrCodeHash === qrCodeHash
    );

    if (!product) {
      throw new Error('Product not found with the given QR code hash');
    }

    const productId = BigInt(product.productId); // Convert to BigInt

    const gasEstimate = await supplyChainContract.methods
      .transferOwnership(productId.toString(), toAddress)
      .estimateGas({ from: account.address });

    const result = await supplyChainContract.methods
      .transferOwnership(productId.toString(), toAddress)
      .send({
        from: account.address,
        gas: Math.floor(Number(gasEstimate) * 1.2),
      });

    return {
      success: true,
      transactionHash: result.transactionHash,
    };
  } catch (error) {
    console.error('Error transferring product:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get product details
const getProductFromBlockchain = async (productId) => {
  if (process.env.METAMASK_ENABLED !== 'true') {
    return {
      success: true,
      product: {
        id: productId,
        name: 'Mock Product',
        owner: 'mock-owner-address',
      },
    };
  }

  try {
    const product = await supplyChainContract.methods
      .getProduct(productId)
      .call();

    return {
      success: true,
      product,
    };
  } catch (error) {
    console.error('Error getting product from blockchain:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify QR code existence
const verifyQRCodeInBlockchain = async (qrCodeHash) => {
  if (process.env.METAMASK_ENABLED !== 'true') {
    return {
      success: true,
      exists: true,
    };
  }

  try {
    const exists = await supplyChainContract.methods
      .isQrCodeUsed(qrCodeHash)
      .call();

    return {
      success: true,
      exists,
    };
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get product history
const getProductHistoryFromBlockchain = async (productId) => {
  if (process.env.METAMASK_ENABLED !== 'true') {
    return {
      success: true,
      history: [
        {
          from: 'mock-from-address',
          to: 'mock-to-address',
          timestamp: Date.now(),
        },
      ],
    };
  }

  try {
    const history = await supplyChainContract.methods
      .getProductHistory(productId)
      .call();

    return {
      success: true,
      history,
    };
  } catch (error) {
    console.error('Error getting product history:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all products
const getAllProductsFromBlockchain = async () => {
  try {
    if (!supplyChainContract) {
      throw new Error('Contract not initialized');
    }

    const result = await supplyChainContract.methods.getAllProducts().call();

    const products = result.map(product => ({
      productId: product.id.toString(),
      name: product.name,
      timestamp: product.timestamp.toString(),
      owner: product.owner,
      qrCodeHash: product.qrCodeHash
    }));

    return { products };
  } catch (error) {
    console.error('Error getting products from blockchain:', error);
    return { products: [] };
  }
};

module.exports = {
  web3,
  supplyChainContract,
  addProductToBlockchain,
  transferProductOwnership,
  getProductFromBlockchain,
  verifyQRCodeInBlockchain,
  getProductHistoryFromBlockchain,
  getAllProductsFromBlockchain,
};