const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', [
  auth,
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('paymentMethod')
    .isIn(['stripe', 'paypal', 'crypto'])
    .withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity = 1, paymentMethod } = req.body;

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive || !product.isApproved) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Check if user is trying to buy their own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot buy your own product' });
    }

    // Get seller details
    const seller = await User.findById(product.seller);
    if (!seller || !seller.isActive) {
      return res.status(400).json({ message: 'Seller not available' });
    }

    const totalAmount = product.price * quantity;

    // Create order
    const order = new Order({
      buyer: req.user._id,
      seller: product.seller,
      product: productId,
      quantity,
      totalAmount,
      paymentMethod,
      deliveryDetails: {
        method: product.deliveryMethod,
        time: product.deliveryTime
      }
    });

    try {
      await order.save();
    } catch (saveError) {
      console.error('Order save error:', saveError);
      if (saveError.code === 11000) {
        // Duplicate order number, retry once
        await order.save();
      } else {
        throw saveError;
      }
    }

    // Update product stock
    product.stock -= quantity;
    await product.save();

    // Populate order with details
    await order.populate([
      { path: 'buyer', select: 'username email' },
      { path: 'seller', select: 'username email' },
      { path: 'product', select: 'title price images' }
    ]);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, type = 'all', page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    if (type === 'buying') {
      filter.buyer = req.user._id;
    } else if (type === 'selling') {
      filter.seller = req.user._id;
    } else {
      filter.$or = [
        { buyer: req.user._id },
        { seller: req.user._id }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('buyer', 'username avatar')
      .populate('seller', 'username avatar')
      .populate('product', 'title images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'username email avatar')
      .populate('seller', 'username email avatar')
      .populate('product', 'title description images price deliveryMethod deliveryTime')
      .populate('messages.sender', 'username email avatar');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in this order
    if (order.buyer._id.toString() !== req.user._id.toString() && 
        order.seller._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', [
  auth,
  body('status')
    .isIn(['pending', 'paid', 'processing', 'delivered', 'completed', 'cancelled', 'disputed'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['paid', 'cancelled'],
      paid: ['processing', 'cancelled'],
      processing: ['delivered', 'disputed'],
      delivered: ['completed', 'disputed'],
      completed: [],
      cancelled: [],
      disputed: ['completed', 'cancelled']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${order.status} to ${status}` 
      });
    }

    // Update order
    order.status = status;
    
    if (status === 'delivered') {
      order.deliveryDetails.deliveredAt = new Date();
    }

    await order.save();

    // If order is completed, update product sales count
    if (status === 'completed') {
      await Product.findByIdAndUpdate(order.product, {
        $inc: { sales: 1 }
      });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/delivery-proof
// @desc    Upload delivery proof
// @access  Private (Seller)
router.post('/:id/delivery-proof', [
  auth,
  body('type')
    .isIn(['image', 'file', 'text'])
    .withMessage('Invalid proof type'),
  body('url')
    .notEmpty()
    .withMessage('Proof URL is required'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, url, description } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the seller
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only seller can upload delivery proof' });
    }

    // Add delivery proof
    order.deliveryProof.push({
      type,
      url,
      description
    });

    await order.save();

    res.json({
      message: 'Delivery proof uploaded successfully',
      order
    });
  } catch (error) {
    console.error('Upload delivery proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/dispute
// @desc    Create dispute
// @access  Private
router.post('/:id/dispute', [
  auth,
  body('reason')
    .notEmpty()
    .withMessage('Dispute reason is required'),
  body('description')
    .notEmpty()
    .withMessage('Dispute description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason, description } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in this order
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to create dispute for this order' });
    }

    // Check if dispute already exists
    if (order.dispute.status !== 'none') {
      return res.status(400).json({ message: 'Dispute already exists for this order' });
    }

    // Create dispute
    order.dispute = {
      reason,
      description,
      status: 'open',
      createdAt: new Date()
    };

    order.status = 'disputed';

    await order.save();

    res.json({
      message: 'Dispute created successfully',
      order
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/process-payment
// @desc    Process payment for an order
// @access  Private
router.post('/process-payment', [
  auth,
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required'),
  body('paymentMethod')
    .isIn(['stripe', 'paypal', 'demo'])
    .withMessage('Invalid payment method'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, paymentMethod, amount, cardDetails } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Check if order is in pending status
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order is not in pending status' });
    }

    // Check if amount matches
    if (amount !== order.totalAmount) {
      return res.status(400).json({ message: 'Payment amount does not match order total' });
    }

    // Simulate payment processing
    if (paymentMethod === 'demo') {
      // Demo payment - always succeeds
      order.status = 'paid';
      order.paymentStatus = 'paid';
      order.paymentId = 'demo_' + Date.now();
    } else {
      // Real payment processing would go here
      // For now, we'll simulate success
      order.status = 'paid';
      order.paymentStatus = 'paid';
      order.paymentId = paymentMethod + '_' + Date.now();
    }

    await order.save();

    // Populate order with details
    await order.populate([
      { path: 'buyer', select: 'username email' },
      { path: 'seller', select: 'username email' },
      { path: 'product', select: 'title price images' }
    ]);

    res.json({
      message: 'Payment processed successfully',
      order
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/message
// @desc    Send message in order
// @access  Private
router.post('/:id/message', [
  auth,
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in this order
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to send messages for this order' });
    }

    // Add message
    order.messages.push({
      sender: req.user._id,
      message: message.trim(),
      timestamp: new Date()
    });

    await order.save();

    res.json({
      message: 'Message sent successfully',
      order
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/create-and-pay
// @desc    Create order and process payment in one step
// @access  Private
router.post('/create-and-pay', [
  auth,
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('paymentMethod')
    .isIn(['stripe', 'paypal', 'demo'])
    .withMessage('Invalid payment method'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity = 1, paymentMethod, amount, cardDetails } = req.body;

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive || !product.isApproved) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Check if user is trying to buy their own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot buy your own product' });
    }

    // Get seller details
    const seller = await User.findById(product.seller);
    if (!seller || !seller.isActive) {
      return res.status(400).json({ message: 'Seller not available' });
    }

    const totalAmount = product.price * quantity;

    // Verify amount matches
    if (amount !== totalAmount) {
      return res.status(400).json({ message: 'Payment amount does not match product total' });
    }

    // Simulate payment processing
    let paymentStatus = 'pending';
    let paymentId = null;
    let orderStatus = 'pending';

    if (paymentMethod === 'demo') {
      // Demo payment - always succeeds
      paymentStatus = 'paid';
      paymentId = 'demo_' + Date.now();
      orderStatus = 'paid';
    } else {
      // Real payment processing would go here
      // For now, we'll simulate success
      paymentStatus = 'paid';
      paymentId = paymentMethod + '_' + Date.now();
      orderStatus = 'paid';
    }

    // Create order
    const order = new Order({
      buyer: req.user._id,
      seller: product.seller,
      product: productId,
      quantity,
      totalAmount,
      paymentMethod,
      paymentStatus,
      paymentId,
      status: orderStatus,
      deliveryDetails: {
        method: product.deliveryMethod,
        time: product.deliveryTime
      }
    });

    try {
      await order.save();
    } catch (saveError) {
      console.error('Order save error:', saveError);
      if (saveError.code === 11000) {
        // Duplicate order number, retry once
        await order.save();
      } else {
        throw saveError;
      }
    }

    // Update product stock
    product.stock -= quantity;
    await product.save();

    // Populate order with details
    await order.populate([
      { path: 'buyer', select: 'username email' },
      { path: 'seller', select: 'username email' },
      { path: 'product', select: 'title price images' }
    ]);

    res.status(201).json({
      message: 'Order created and payment processed successfully',
      order
    });
  } catch (error) {
    console.error('Create order and pay error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
