const { Pool } = require('pg');
const crypto = require('crypto');
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Add a new product to the blockchain
const addProduct = async (productData, manufacturerId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Generate a unique hash for the product
    const productHash = crypto
      .createHash('sha256')
      .update(`${productData.name}${productData.serialNumber}${Date.now()}`)
      .digest('hex');

    // Insert product into the products table
    const productResult = await client.query(
      `INSERT INTO products (name, description, serial_number, manufacturer_id, qr_code_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [productData.name, productData.description, productData.serialNumber, manufacturerId, productHash]
    );

    const productId = productResult.rows[0].id;

    // Add initial supply chain entry
    await client.query(
      `INSERT INTO supply_chain (product_id, from_entity_id, to_entity_id, status, timestamp)
       VALUES ($1, $2, $2, 'manufactured', CURRENT_TIMESTAMP)`,
      [productId, manufacturerId]
    );

    await client.query('COMMIT');
    return { productId, productHash };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Transfer product ownership
const transferOwnership = async (productId, fromEntityId, toEntityId, status) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify current ownership
    const ownershipResult = await client.query(
      `SELECT * FROM supply_chain 
       WHERE product_id = $1 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [productId]
    );

    if (ownershipResult.rows.length === 0) {
      throw new Error('Product not found in supply chain');
    }

    if (ownershipResult.rows[0].to_entity_id !== fromEntityId) {
      throw new Error('Unauthorized transfer attempt');
    }

    // Add new supply chain entry
    await client.query(
      `INSERT INTO supply_chain (product_id, from_entity_id, to_entity_id, status, timestamp)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [productId, fromEntityId, toEntityId, status]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get product details
const getProductDetails = async (productId) => {
  const result = await pool.query(
    `SELECT p.*, u.name as manufacturer_name
     FROM products p
     JOIN users u ON p.manufacturer_id = u.id
     WHERE p.id = $1`,
    [productId]
  );
  return result.rows[0];
};

// Check if QR code is used
const checkQRCode = async (hash) => {
  const result = await pool.query(
    'SELECT id FROM products WHERE qr_code_hash = $1',
    [hash]
  );
  return result.rows.length > 0;
};

// Get all products
const getAllProducts = async () => {
  const result = await pool.query(
    `SELECT p.*, u.name as manufacturer_name
     FROM products p
     JOIN users u ON p.manufacturer_id = u.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

// Get product history
const getProductHistory = async (productId) => {
  const result = await pool.query(
    `SELECT sc.*, 
            u1.name as from_entity_name,
            u2.name as to_entity_name
     FROM supply_chain sc
     JOIN users u1 ON sc.from_entity_id = u1.id
     JOIN users u2 ON sc.to_entity_id = u2.id
     WHERE sc.product_id = $1
     ORDER BY sc.timestamp DESC`,
    [productId]
  );
  return result.rows;
};

module.exports = {
  addProduct,
  transferOwnership,
  getProductDetails,
  checkQRCode,
  getAllProducts,
  getProductHistory,
}; 