const pool = require('../config/db');
const crypto = require('crypto');
const web3Service = require('../services/web3Service');

// Add a new product to the blockchain
const addProduct = async (req, res) => {
  const { name, description, manufacturer_id } = req.body;
  
  try {
    // Generate a unique QR code hash
    const qrCodeHash = crypto.createHash('sha256').update(`${name}-${Date.now()}`).digest('hex');
    
    // Add to database
    const dbResult = await pool.query(
      'INSERT INTO products (name, description, manufacturer_id, qr_code_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, manufacturer_id, qrCodeHash]
    );
    
    // Add to blockchain
    const blockchainResult = await web3Service.addProductToBlockchain(name, qrCodeHash);
    
    if (!blockchainResult.success) {
      // If blockchain operation fails, we should rollback the database operation
      await pool.query('DELETE FROM products WHERE id = $1', [dbResult.rows[0].id]);
      return res.status(500).json({ 
        message: 'Error adding product to blockchain',
        error: blockchainResult.error
      });
    }
    
    // Update the product with blockchain transaction hash
    await pool.query(
      'UPDATE products SET blockchain_tx_hash = $1 WHERE id = $2',
      [blockchainResult.transactionHash, dbResult.rows[0].id]
    );
    
    res.status(201).json({
      ...dbResult.rows[0],
      blockchain_tx_hash: blockchainResult.transactionHash
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product to blockchain' });
  }
};

// Transfer product ownership
const transferProduct = async (req, res) => {
  const { product_id, from_id, to_id } = req.body;
  
  try {
    // Get the product details
    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get the user's Ethereum address
    const toUserResult = await pool.query(
      'SELECT ethereum_address FROM users WHERE id = $1',
      [to_id]
    );
    
    if (toUserResult.rows.length === 0 || !toUserResult.rows[0].ethereum_address) {
      return res.status(400).json({ message: 'Recipient does not have an Ethereum address' });
    }
    
    // Transfer on blockchain
    const blockchainResult = await web3Service.transferProductOwnership(
      productResult.rows[0].blockchain_id,
      toUserResult.rows[0].ethereum_address
    );
    
    if (!blockchainResult.success) {
      return res.status(500).json({ 
        message: 'Error transferring product on blockchain',
        error: blockchainResult.error
      });
    }
    
    // Add to database
    const result = await pool.query(
      'INSERT INTO supply_chain (product_id, from_id, to_id, blockchain_tx_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_id, from_id, to_id, blockchainResult.transactionHash]
    );
    
    res.status(201).json({
      ...result.rows[0],
      blockchain_tx_hash: blockchainResult.transactionHash
    });
  } catch (error) {
    console.error('Error transferring product:', error);
    res.status(500).json({ message: 'Error transferring product ownership' });
  }
};

// Get product details
const getProduct = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get from database
    const dbResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (dbResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get from blockchain if we have a blockchain ID
    let blockchainData = null;
    if (dbResult.rows[0].blockchain_id) {
      const blockchainResult = await web3Service.getProductFromBlockchain(dbResult.rows[0].blockchain_id);
      if (blockchainResult.success) {
        blockchainData = blockchainResult.product;
      }
    }
    
    res.json({
      ...dbResult.rows[0],
      blockchain_data: blockchainData
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: 'Error retrieving product details' });
  }
};

// Verify QR code
const verifyQRCode = async (req, res) => {
  const { qr_code } = req.params;
  
  try {
    // First check in database
    const dbResult = await pool.query(
      'SELECT p.*, sc.from_id, sc.to_id, sc.timestamp FROM products p LEFT JOIN supply_chain sc ON p.id = sc.product_id WHERE p.qr_code_hash = $1',
      [qr_code]
    );
    
    if (dbResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found in database' });
    }
    
    // Then verify on blockchain
    const blockchainResult = await web3Service.verifyQRCodeInBlockchain(qr_code);
    
    res.json({
      ...dbResult.rows[0],
      blockchain_verified: blockchainResult.success && blockchainResult.exists
    });
  } catch (error) {
    console.error('Error verifying QR code:', error);
    res.status(500).json({ message: 'Error verifying QR code' });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    console.log('Fetching products from database...');
    // Get products from database
    const dbResult = await pool.query(`
      SELECT p.*, u.username as manufacturer_name
      FROM products p
      LEFT JOIN users u ON p.manufacturer_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    console.log('Database products:', dbResult.rows);
    
    console.log('Fetching products from blockchain...');
    // Get products from blockchain
    const blockchainResult = await web3Service.getAllProductsFromBlockchain();
    console.log('Blockchain products:', blockchainResult.products);
    
    // Combine the results
    const products = dbResult.rows.map(dbProduct => {
      // Find matching blockchain product
      const blockchainProduct = blockchainResult.products?.find(
        bp => bp.qrCodeHash === dbProduct.qr_code_hash
      );
      
      return {
        ...dbProduct,
        blockchain_data: blockchainProduct || null,
        is_on_blockchain: !!blockchainProduct
      };
    });
    
    console.log('Combined products:', products);
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Error retrieving products' });
  }
};

// Get product history
const getProductHistory = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get database history
    const dbResult = await pool.query(
      'SELECT sc.*, u1.username as from_name, u2.username as to_name FROM supply_chain sc LEFT JOIN users u1 ON sc.from_id = u1.id LEFT JOIN users u2 ON sc.to_id = u2.id WHERE sc.product_id = $1 ORDER BY sc.timestamp DESC',
      [id]
    );
    
    // Get blockchain history if we have a blockchain ID
    let blockchainHistory = null;
    const productResult = await pool.query(
      'SELECT blockchain_id FROM products WHERE id = $1',
      [id]
    );
    
    if (productResult.rows.length > 0 && productResult.rows[0].blockchain_id) {
      const blockchainResult = await web3Service.getProductHistoryFromBlockchain(productResult.rows[0].blockchain_id);
      if (blockchainResult.success) {
        blockchainHistory = blockchainResult.history;
      }
    }
    
    res.json({
      database_history: dbResult.rows,
      blockchain_history: blockchainHistory
    });
  } catch (error) {
    console.error('Error getting product history:', error);
    res.status(500).json({ message: 'Error retrieving product history' });
  }
};

// Get products owned by the current user
const getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get products from database where user is either manufacturer or current owner
    const dbResult = await pool.query(`
      SELECT p.*, u.username as manufacturer_name
      FROM products p
      JOIN users u ON p.manufacturer_id = u.id
      WHERE p.manufacturer_id = $1 OR p.current_owner_id = $1
      ORDER BY p.created_at DESC
    `, [userId]);
    
    // Get products from blockchain
    const blockchainResult = await web3Service.getAllProductsFromBlockchain();
    
    // Combine the results
    const products = dbResult.rows.map(dbProduct => {
      // Find matching blockchain product
      const blockchainProduct = blockchainResult.products?.find(
        bp => bp.qrCodeHash === dbProduct.qr_code_hash
      );
      
      return {
        ...dbProduct,
        blockchain_data: blockchainProduct || null,
        is_on_blockchain: !!blockchainProduct
      };
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error getting my products:', error);
    res.status(500).json({ message: 'Error retrieving my products' });
  }
};

// Purchase a product
const purchaseProduct = async (req, res) => {
  const { id } = req.params;
  const buyerId = req.user.id;
  
  try {
    // Get product details
    const productResult = await pool.query(
      'SELECT p.*, u.username as manufacturer_name FROM products p JOIN users u ON p.manufacturer_id = u.id WHERE p.id = $1',
      [id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    
    // Get buyer's Ethereum address
    const buyerResult = await pool.query(
      'SELECT ethereum_address FROM users WHERE id = $1',
      [buyerId]
    );
    
    if (buyerResult.rows.length === 0 || !buyerResult.rows[0].ethereum_address) {
      return res.status(400).json({ message: 'Buyer does not have an Ethereum address' });
    }
    
    const buyerAddress = buyerResult.rows[0].ethereum_address;
    
    // Transfer product ownership on blockchain using the QR code hash
    const blockchainResult = await web3Service.transferProductOwnership(
      product.qr_code_hash, // Use QR code hash instead of blockchain_id
      buyerAddress
    );
    
    if (!blockchainResult.success) {
      return res.status(500).json({ 
        message: 'Error transferring product on blockchain',
        error: blockchainResult.error
      });
    }
    
    // Update product ownership in database
    await pool.query(
      'UPDATE products SET current_owner_id = $1 WHERE id = $2',
      [buyerId, id]
    );
    
    // Add to supply chain history
    await pool.query(
      'INSERT INTO supply_chain (product_id, from_id, to_id, blockchain_tx_hash) VALUES ($1, $2, $3, $4)',
      [id, product.manufacturer_id, buyerId, blockchainResult.transactionHash]
    );
    
    res.json({
      message: 'Product purchased successfully',
      transactionHash: blockchainResult.transactionHash
    });
  } catch (error) {
    console.error('Error purchasing product:', error);
    res.status(500).json({ message: 'Error purchasing product', error: error.message });
  }
};

// Check user's purchase history
const checkPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all products purchased by the user
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.qr_code_hash,
        p.created_at as purchase_date,
        u.username as manufacturer_name,
        sc.blockchain_tx_hash
      FROM products p
      JOIN users u ON p.manufacturer_id = u.id
      JOIN supply_chain sc ON p.id = sc.product_id
      WHERE sc.to_id = $1
      ORDER BY sc.timestamp DESC
    `, [userId]);
    
    res.json({
      hasPurchases: result.rows.length > 0,
      purchases: result.rows
    });
  } catch (error) {
    console.error('Error checking purchase history:', error);
    res.status(500).json({ message: 'Error checking purchase history' });
  }
};

module.exports = {
  addProduct,
  transferProduct,
  getProduct,
  verifyQRCode,
  getAllProducts,
  getProductHistory,
  getMyProducts,
  purchaseProduct,
  checkPurchaseHistory
}; 