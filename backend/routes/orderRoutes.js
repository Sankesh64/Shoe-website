const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getAllOrders,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  refundRazorpayPayment,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Webhook route - must be before protect middleware since it's public
router.post('/webhook/razorpay', razorpayWebhook);

// User routes
router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);

// Razorpay routes
router.post('/:id/razorpay', protect, createRazorpayOrder);
router.post('/:id/razorpay/verify', protect, verifyRazorpayPayment);

// Admin routes
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/:id/refund', protect, admin, refundRazorpayPayment);

module.exports = router;
