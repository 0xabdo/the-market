const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  // Request Information
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    default: null
  },
  referer: {
    type: String,
    default: null
  },
  
  // Request Details
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  },
  path: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  
  // Security Information
  securityType: {
    type: String,
    required: true,
    enum: ['unauthorized_access', 'invalid_api_key', 'invalid_origin', 'rate_limit_exceeded', 'suspicious_content', 'blocked_request']
  },
  reason: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  
  // Request Data (for analysis)
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  requestHeaders: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  queryParams: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Geographic Information (if available)
  country: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  region: {
    type: String,
    default: null
  },
  
  // Risk Assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Additional Metadata
  sessionId: {
    type: String,
    default: null
  },
  fingerprint: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
securityLogSchema.index({ ipAddress: 1, timestamp: -1 });
securityLogSchema.index({ securityType: 1, timestamp: -1 });
securityLogSchema.index({ riskLevel: 1, timestamp: -1 });
securityLogSchema.index({ isBlocked: 1, timestamp: -1 });

// Virtual for time ago
securityLogSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Method to calculate risk level based on frequency
securityLogSchema.statics.calculateRiskLevel = function(ipAddress, timeWindow = 3600000) { // 1 hour
  const oneHourAgo = new Date(Date.now() - timeWindow);
  
  return this.countDocuments({
    ipAddress: ipAddress,
    timestamp: { $gte: oneHourAgo }
  }).then(count => {
    if (count >= 50) return 'critical';
    if (count >= 20) return 'high';
    if (count >= 10) return 'medium';
    return 'low';
  });
};

// Method to get security statistics
securityLogSchema.statics.getSecurityStats = function(timeWindow = 86400000) { // 24 hours
  const timeAgo = new Date(Date.now() - timeWindow);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: timeAgo } } },
    {
      $group: {
        _id: '$securityType',
        count: { $sum: 1 },
        uniqueIPs: { $addToSet: '$ipAddress' }
      }
    },
    {
      $project: {
        securityType: '$_id',
        count: 1,
        uniqueIPCount: { $size: '$uniqueIPs' }
      }
    }
  ]);
};

// Method to get top attacking IPs
securityLogSchema.statics.getTopAttackingIPs = function(limit = 10, timeWindow = 86400000) {
  const timeAgo = new Date(Date.now() - timeWindow);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: timeAgo } } },
    {
      $group: {
        _id: '$ipAddress',
        count: { $sum: 1 },
        lastAttempt: { $max: '$timestamp' },
        securityTypes: { $addToSet: '$securityType' },
        riskLevel: { $max: '$riskLevel' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('SecurityLog', securityLogSchema);
