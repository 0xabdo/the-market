const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -wallet -preferences');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, bio, avatar } = req.body;
    const updateData = {};

    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updateData.username = username;
    }

    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/sellers
// @desc    Get all sellers
// @access  Public
router.get('/sellers', async (req, res) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    
    const filter = { role: 'seller', isActive: true };
    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') }
      ];
    }

    const sellers = await User.find(filter)
      .select('-password -wallet -preferences')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      sellers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    const Review = require('../models/Review');

    const userId = req.params.id;
    
    const [productStats, orderStats, reviewStats] = await Promise.all([
      // Product stats
      Product.aggregate([
        { $match: { seller: userId } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalSales: { $sum: '$sales' },
            averagePrice: { $avg: '$price' }
          }
        }
      ]),
      
      // Order stats
      Order.aggregate([
        { $match: { seller: userId, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Review stats
      Review.aggregate([
        { $match: { reviewee: userId } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        }
      ])
    ]);

    res.json({
      products: productStats[0] || { totalProducts: 0, totalViews: 0, totalSales: 0, averagePrice: 0 },
      orders: orderStats[0] || { totalOrders: 0, totalRevenue: 0 },
      reviews: reviewStats[0] || { totalReviews: 0, averageRating: 0 }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, async (req, res) => {
  try {
    // This would integrate with Cloudinary or AWS S3
    // For now, we'll just return a placeholder
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar updated successfully',
      user
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/online
// @desc    Get online users
// @access  Private
router.get('/online', auth, async (req, res) => {
  try {
    const onlineUsers = await User.find({ isOnline: true })
      .select('_id username avatar lastSeen')
      .sort({ lastSeen: -1 });

    res.json({
      onlineUsers,
      count: onlineUsers.length
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/cleanup-online-status
// @desc    Cleanup stale online users (admin only)
// @access  Private (Admin)
router.post('/cleanup-online-status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Find users who are marked as online but haven't been seen recently
    const staleUsers = await User.find({
      isOnline: true,
      lastSeen: { $lt: fiveMinutesAgo }
    });

    if (staleUsers.length > 0) {
      const userIds = staleUsers.map(user => user._id);
      
      // Mark them as offline
      await User.updateMany(
        { _id: { $in: userIds } },
        { isOnline: false }
      );

      res.json({
        message: `Marked ${staleUsers.length} users as offline`,
        affectedUsers: userIds
      });
    } else {
      res.json({
        message: 'No stale users found',
        affectedUsers: []
      });
    }
  } catch (error) {
    console.error('Cleanup online status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
