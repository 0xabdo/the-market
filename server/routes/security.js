const express = require('express');
const router = express.Router();
const SecurityLogger = require('../utils/securityLogger');
const SecurityLog = require('../models/SecurityLog');
const { auth } = require('../middleware/auth');

// Apply authentication middleware to all security routes
router.use(auth);

// Get security dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const [
      securityStats,
      topAttackingIPs,
      recentEvents,
      totalEvents,
      criticalEvents
    ] = await Promise.all([
      SecurityLogger.getSecurityStats(86400000), // Last 24 hours
      SecurityLogger.getTopAttackingIPs(10, 86400000), // Top 10 IPs in last 24 hours
      SecurityLogger.getRecentSecurityEvents(20, 86400000), // Last 20 events
      SecurityLog.countDocuments({ timestamp: { $gte: new Date(Date.now() - 86400000) } }),
      SecurityLog.countDocuments({ 
        timestamp: { $gte: new Date(Date.now() - 86400000) },
        riskLevel: { $in: ['high', 'critical'] }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: securityStats,
        topAttackingIPs,
        recentEvents,
        summary: {
          totalEvents24h: totalEvents,
          criticalEvents24h: criticalEvents,
          uniqueIPs24h: topAttackingIPs.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting security dashboard:', error);
    res.status(500).json({ message: 'Error retrieving security data' });
  }
});

// Get security events with pagination and filters
router.get('/events', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const {
      page = 1,
      limit = 50,
      securityType,
      riskLevel,
      ipAddress,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (securityType) filter.securityType = securityType;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (ipAddress) filter.ipAddress = { $regex: ipAddress, $options: 'i' };
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [events, total] = await Promise.all([
      SecurityLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-requestBody -requestHeaders'), // Exclude large fields
      SecurityLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error getting security events:', error);
    res.status(500).json({ message: 'Error retrieving security events' });
  }
});

// Get detailed security event
router.get('/events/:id', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const event = await SecurityLog.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Security event not found' });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error getting security event:', error);
    res.status(500).json({ message: 'Error retrieving security event' });
  }
});

// Get IP analysis
router.get('/ip/:ipAddress', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { ipAddress } = req.params;
    const { days = 7 } = req.query;
    
    const timeWindow = parseInt(days) * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    const timeAgo = new Date(Date.now() - timeWindow);

    const [
      ipEvents,
      ipStats,
      riskLevel
    ] = await Promise.all([
      SecurityLog.find({
        ipAddress,
        timestamp: { $gte: timeAgo }
      })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('-requestBody -requestHeaders'),
      
      SecurityLog.aggregate([
        { $match: { ipAddress, timestamp: { $gte: timeAgo } } },
        {
          $group: {
            _id: '$securityType',
            count: { $sum: 1 },
            lastAttempt: { $max: '$timestamp' }
          }
        }
      ]),
      
      SecurityLogger.calculateRiskLevel(ipAddress)
    ]);

    res.json({
      success: true,
      data: {
        ipAddress,
        riskLevel,
        timeWindow: `${days} days`,
        events: ipEvents,
        stats: ipStats,
        totalEvents: ipEvents.length
      }
    });
  } catch (error) {
    console.error('Error getting IP analysis:', error);
    res.status(500).json({ message: 'Error retrieving IP analysis' });
  }
});

// Block/Unblock IP address
router.post('/ip/:ipAddress/block', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { ipAddress } = req.params;
    const { action = 'block' } = req.body; // 'block' or 'unblock'

    if (action === 'block') {
      // Mark all recent events from this IP as blocked
      await SecurityLog.updateMany(
        { 
          ipAddress,
          timestamp: { $gte: new Date(Date.now() - 86400000) } // Last 24 hours
        },
        { isBlocked: true }
      );
      
      res.json({
        success: true,
        message: `IP ${ipAddress} has been blocked`
      });
    } else if (action === 'unblock') {
      // Unblock the IP
      await SecurityLog.updateMany(
        { ipAddress },
        { isBlocked: false }
      );
      
      res.json({
        success: true,
        message: `IP ${ipAddress} has been unblocked`
      });
    } else {
      res.status(400).json({ message: 'Invalid action. Use "block" or "unblock"' });
    }
  } catch (error) {
    console.error('Error blocking/unblocking IP:', error);
    res.status(500).json({ message: 'Error processing IP action' });
  }
});

// Get security statistics for charts
router.get('/stats', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { period = '24h' } = req.query;
    
    let timeWindow;
    switch (period) {
      case '1h':
        timeWindow = 60 * 60 * 1000;
        break;
      case '24h':
        timeWindow = 24 * 60 * 60 * 1000;
        break;
      case '7d':
        timeWindow = 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        timeWindow = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        timeWindow = 24 * 60 * 60 * 1000;
    }

    const timeAgo = new Date(Date.now() - timeWindow);

    // Get hourly/daily breakdown
    const breakdown = await SecurityLog.aggregate([
      { $match: { timestamp: { $gte: timeAgo } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === '1h' ? '%Y-%m-%d %H:00' : '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 },
          uniqueIPs: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          uniqueIPs: { $size: '$uniqueIPs' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get security type breakdown
    const typeBreakdown = await SecurityLog.aggregate([
      { $match: { timestamp: { $gte: timeAgo } } },
      {
        $group: {
          _id: '$securityType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        timeWindow,
        breakdown,
        typeBreakdown
      }
    });
  } catch (error) {
    console.error('Error getting security stats:', error);
    res.status(500).json({ message: 'Error retrieving security statistics' });
  }
});

module.exports = router;
