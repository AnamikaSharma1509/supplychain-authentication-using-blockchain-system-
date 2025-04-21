const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  addProduct,
  transferProduct,
  getProduct,
  verifyQRCode,
  getAllProducts,
  getProductHistory,
  getMyProducts,
  purchaseProduct,
  checkPurchaseHistory
} = require('../controllers/blockchainController');

// Product routes
router.post('/products', authenticateToken, addProduct);
router.get('/products', authenticateToken, getAllProducts);
router.get('/products/:id', authenticateToken, getProduct);
router.get('/products/:id/history', authenticateToken, getProductHistory);
router.get('/my-products', authenticateToken, getMyProducts);
router.post('/products/:id/purchase', authenticateToken, purchaseProduct);
router.get('/purchase-history', authenticateToken, checkPurchaseHistory);

// Transfer routes
router.post('/transfer', authenticateToken, transferProduct);

// QR code verification
router.get('/verify/:qr_code', verifyQRCode);

module.exports = router; 