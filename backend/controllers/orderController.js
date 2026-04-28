const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const crypto = require('crypto');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  res.status(201).json({ success: true, data: order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({ success: true, data: orders });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'fullName email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only allow the order owner or admin to view
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    updateTime: req.body.update_time,
    emailAddress: req.body.payer?.email_address,
  };

  const updatedOrder = await order.save();
  res.json({ success: true, data: updatedOrder });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  order.status = status;

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.json({ success: true, data: updatedOrder });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.limit) || 20;

  const count = await Order.countDocuments();
  const orders = await Order.find()
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    },
  });
});

// @desc    Create Razorpay Order
// @route   POST /api/orders/:id/razorpay
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: Math.round(order.totalPrice * 100),
      currency: 'USD',
      receipt: `receipt_${order._id}`
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    res.status(400);
    throw new Error(data.error?.description || 'Failed to create Razorpay order');
  }

  res.json({
    success: true,
    data: {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    }
  });
});

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/:id/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
    
  if (generated_signature === razorpay_signature) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = 'Razorpay';
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'captured',
      updateTime: new Date().toISOString(),
      emailAddress: req.user.email
    };
    
    const updatedOrder = await order.save();
    
    res.json({ success: true, data: updatedOrder });
  } else {
    res.status(400);
    throw new Error('Payment verification failed');
  }
});

// @desc    Handle Razorpay Webhook
// @route   POST /api/orders/webhook/razorpay
// @access  Public
const razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(req.rawBody);
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentId = payload.payment.entity.id;
      // We could find order by receipt id if we passed it in notes, 
      // or we just acknowledge. Razorpay webhooks can update orders.
      // For this example, we assume verification endpoint handles it, 
      // but webhook is a fallback.
      console.log('Webhook: Payment Captured ->', paymentId);
    } else if (event === 'payment.failed') {
      console.log('Webhook: Payment Failed ->', payload.payment.entity.id);
    } else if (event === 'refund.processed') {
      console.log('Webhook: Refund Processed ->', payload.refund.entity.id);
    }
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(400).send('Invalid signature');
  }
});

// @desc    Initiate Refund for Razorpay Payment
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
const refundRazorpayPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.isPaid || !order.paymentResult?.id) {
    res.status(400);
    throw new Error('Order is not paid or missing payment ID');
  }

  if (order.isRefunded) {
    res.status(400);
    throw new Error('Order is already refunded');
  }

  const paymentId = order.paymentResult.id;
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: Math.round(order.totalPrice * 100)
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    res.status(400);
    throw new Error(data.error?.description || 'Failed to initiate refund');
  }

  order.isRefunded = true;
  order.status = 'refunded';
  order.refundDetails = {
    id: data.id,
    amount: data.amount,
    status: data.status,
    createdAt: new Date().toISOString()
  };

  const updatedOrder = await order.save();
  res.json({ success: true, data: updatedOrder });
});

module.exports = {
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
};
