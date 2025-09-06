const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages/:orderId
// @desc    Send message in order chat
// @access  Private
router.post('/:orderId', [
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
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in this order
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to send messages for this order' });
    }

    // Add message to order
    order.messages.push({
      sender: req.user._id,
      message,
      timestamp: new Date()
    });

    await order.save();

    // Populate the latest message
    const latestMessage = order.messages[order.messages.length - 1];
    await latestMessage.populate('sender', 'username avatar');

    res.json({
      message: 'Message sent successfully',
      chatMessage: latestMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/:orderId
// @desc    Get messages for an order
// @access  Private
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('messages.sender', 'username avatar');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in this order
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to view messages for this order' });
    }

    // Mark messages as read for the current user
    order.messages.forEach(msg => {
      if (msg.sender._id.toString() !== req.user._id.toString()) {
        msg.isRead = true;
      }
    });

    await order.save();

    res.json({
      messages: order.messages,
      orderId: order._id
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({
      $or: [
        { buyer: req.user._id },
        { seller: req.user._id }
      ],
      'messages.0': { $exists: true }
    })
    .populate('buyer', 'username avatar')
    .populate('seller', 'username avatar')
    .populate('product', 'title images')
    .populate('messages.sender', 'username avatar')
    .sort({ updatedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Format conversations
    const conversations = orders.map(order => {
      const latestMessage = order.messages[order.messages.length - 1];
      const unreadCount = order.messages.filter(msg => 
        msg.sender._id.toString() !== req.user._id.toString() && !msg.isRead
      ).length;

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        otherUser: order.buyer._id.toString() === req.user._id.toString() 
          ? order.seller 
          : order.buyer,
        product: order.product,
        latestMessage: latestMessage ? {
          message: latestMessage.message,
          timestamp: latestMessage.timestamp,
          sender: latestMessage.sender
        } : null,
        unreadCount,
        status: order.status
      };
    });

    const total = await Order.countDocuments({
      $or: [
        { buyer: req.user._id },
        { seller: req.user._id }
      ],
      'messages.0': { $exists: true }
    });

    res.json({
      conversations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:orderId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:orderId/read', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in this order
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to mark messages as read for this order' });
    }

    // Mark all messages as read for the current user
    order.messages.forEach(msg => {
      if (msg.sender._id.toString() !== req.user._id.toString()) {
        msg.isRead = true;
      }
    });

    await order.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
