const SecurityLog = require('../models/SecurityLog');

class SecurityLogger {
  /**
   * Log a security event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {String} securityType - Type of security event
   * @param {String} reason - Reason for the security event
   * @param {Number} statusCode - HTTP status code
   * @param {Object} additionalData - Additional data to log
   */
  static async logSecurityEvent(req, res, securityType, reason, statusCode, additionalData = {}) {
    try {
      // Extract request information
      const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const origin = req.get('Origin') || null;
      const referer = req.get('Referer') || null;
      
      // Extract request data (be careful with sensitive data)
      const requestBody = this.sanitizeRequestBody(req.body);
      const requestHeaders = this.sanitizeHeaders(req.headers);
      const queryParams = req.query;
      
      // Create security log entry
      const securityLog = new SecurityLog({
        ipAddress,
        userAgent,
        origin,
        referer,
        method: req.method,
        path: req.path,
        endpoint: req.originalUrl,
        securityType,
        reason,
        statusCode,
        requestBody,
        requestHeaders,
        queryParams,
        sessionId: req.sessionID || null,
        fingerprint: this.generateFingerprint(req),
        ...additionalData
      });
      
      // Calculate risk level based on recent activity
      const riskLevel = await this.calculateRiskLevel(ipAddress);
      securityLog.riskLevel = riskLevel;
      
      // Save to database
      await securityLog.save();
      
      // Check if IP should be blocked based on risk level
      if (riskLevel === 'critical' || riskLevel === 'high') {
        await this.checkAndBlockIP(ipAddress, riskLevel);
      }
      
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }
  
  /**
   * Sanitize request body to remove sensitive information
   */
  static sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') return null;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    // Limit size to prevent huge logs
    const bodyString = JSON.stringify(sanitized);
    if (bodyString.length > 1000) {
      return { ...sanitized, _truncated: true, _originalSize: bodyString.length };
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize headers to remove sensitive information
   */
  static sanitizeHeaders(headers) {
    if (!headers || typeof headers !== 'object') return null;
    
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  /**
   * Generate a fingerprint for the request
   */
  static generateFingerprint(req) {
    const components = [
      req.get('User-Agent') || '',
      req.get('Accept-Language') || '',
      req.get('Accept-Encoding') || '',
      req.ip || ''
    ];
    
    return require('crypto')
      .createHash('md5')
      .update(components.join('|'))
      .digest('hex');
  }
  
  /**
   * Calculate risk level based on recent activity
   */
  static async calculateRiskLevel(ipAddress, timeWindow = 3600000) { // 1 hour
    try {
      const oneHourAgo = new Date(Date.now() - timeWindow);
      
      const count = await SecurityLog.countDocuments({
        ipAddress: ipAddress,
        timestamp: { $gte: oneHourAgo }
      });
      
      if (count >= 50) return 'critical';
      if (count >= 20) return 'high';
      if (count >= 10) return 'medium';
      return 'low';
    } catch (error) {
      console.error('Error calculating risk level:', error);
      return 'medium';
    }
  }
  
  /**
   * Check if IP should be blocked and take action
   */
  static async checkAndBlockIP(ipAddress, riskLevel) {
    try {
      // Update recent logs to mark as blocked
      await SecurityLog.updateMany(
        { 
          ipAddress: ipAddress,
          timestamp: { $gte: new Date(Date.now() - 3600000) } // Last hour
        },
        { isBlocked: true }
      );
      
      // IP blocked due to high risk level
      
      // Here you could implement additional blocking mechanisms:
      // - Add to firewall rules
      // - Send alerts to administrators
      // - Update rate limiting rules
      
    } catch (error) {
      console.error('Error blocking IP:', error);
    }
  }
  
  /**
   * Get security statistics
   */
  static async getSecurityStats(timeWindow = 86400000) { // 24 hours
    try {
      return await SecurityLog.getSecurityStats(timeWindow);
    } catch (error) {
      console.error('Error getting security stats:', error);
      return [];
    }
  }
  
  /**
   * Get top attacking IPs
   */
  static async getTopAttackingIPs(limit = 10, timeWindow = 86400000) {
    try {
      return await SecurityLog.getTopAttackingIPs(limit, timeWindow);
    } catch (error) {
      console.error('Error getting top attacking IPs:', error);
      return [];
    }
  }
  
  /**
   * Get recent security events
   */
  static async getRecentSecurityEvents(limit = 50, timeWindow = 86400000) {
    try {
      const timeAgo = new Date(Date.now() - timeWindow);
      
      return await SecurityLog.find({
        timestamp: { $gte: timeAgo }
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-requestBody -requestHeaders'); // Exclude large fields for performance
    } catch (error) {
      console.error('Error getting recent security events:', error);
      return [];
    }
  }
}

module.exports = SecurityLogger;
