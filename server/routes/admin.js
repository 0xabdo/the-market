const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingProducts,
      activeDisputes,
      recentUsers,
      topSellers
    ] = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Total products
      Product.countDocuments(),
      
      // Total orders
      Order.countDocuments(),
      
      // Total revenue
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Pending products
      Product.countDocuments({ isApproved: false, isActive: true }),
      
      // Active disputes
      Order.countDocuments({ 'dispute.status': 'open' }),
      
      // Recent users
      User.find()
        .select('username email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      
      // Top sellers
      User.aggregate([
        { $match: { role: 'seller' } },
        { $sort: { 'rating.average': -1, 'rating.count': -1 } },
        { $limit: 5 },
        { $project: { username: 1, 'rating.average': 1, 'rating.count': 1 } }
      ])
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingProducts,
        activeDisputes
      },
      recentUsers,
      topSellers
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/suspend
// @desc    Suspend user
// @access  Private (Admin)
router.put('/users/:id/suspend', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({
      message: 'User suspended successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/activate
// @desc    Activate user
// @access  Private (Admin)
router.put('/users/:id/activate', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({
      message: 'User activated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products with filtering
// @access  Private (Admin)
router.get('/products', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    
    const filter = {};
    if (status === 'pending') {
      filter.isApproved = false;
      filter.isActive = true;
    } else if (status === 'approved') {
      filter.isApproved = true;
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { game: new RegExp(search, 'i') }
      ];
    }

    const products = await Product.find(filter)
      .populate('seller', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id/approve
// @desc    Approve product
// @access  Private (Admin)
router.put('/products/:id/approve', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isApproved = true;
    await product.save();

    res.json({
      message: 'Product approved successfully',
      product: {
        id: product._id,
        title: product.title,
        isApproved: product.isApproved
      }
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id/reject
// @desc    Reject product
// @access  Private (Admin)
router.put('/products/:id/reject', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isApproved = false;
    product.isActive = false;
    await product.save();

    res.json({
      message: 'Product rejected successfully',
      product: {
        id: product._id,
        title: product.title,
        isApproved: product.isApproved,
        isActive: product.isActive
      }
    });
  } catch (error) {
    console.error('Reject product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering
// @access  Private (Admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.orderNumber = new RegExp(search, 'i');
    }

    const orders = await Order.find(filter)
      .populate('buyer', 'username email')
      .populate('seller', 'username email')
      .populate('product', 'title')
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

// @route   GET /api/admin/disputes
// @desc    Get all disputes
// @access  Private (Admin)
router.get('/disputes', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = { 'dispute.status': { $ne: 'none' } };
    if (status) filter['dispute.status'] = status;

    const orders = await Order.find(filter)
      .populate('buyer', 'username email')
      .populate('seller', 'username email')
      .populate('product', 'title')
      .sort({ 'dispute.createdAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      disputes: orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/disputes/:orderId/resolve
// @desc    Resolve dispute
// @access  Private (Admin)
router.put('/disputes/:orderId/resolve', [
  adminAuth,
  body('resolution')
    .notEmpty()
    .withMessage('Resolution is required'),
  body('status')
    .isIn(['resolved', 'closed'])
    .withMessage('Status must be resolved or closed')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resolution, status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.dispute.status === 'none') {
      return res.status(400).json({ message: 'No dispute found for this order' });
    }

    order.dispute.status = status;
    order.dispute.resolution = resolution;
    order.dispute.resolvedAt = new Date();

    if (status === 'resolved') {
      order.status = 'completed';
    }

    await order.save();

    res.json({
      message: 'Dispute resolved successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        dispute: order.dispute
      }
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
