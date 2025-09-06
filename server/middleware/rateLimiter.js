// Simple in-memory rate limiter
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  isAllowed(key, windowMs, maxRequests) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const userRequests = this.requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

const rateLimiter = new RateLimiter();

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  return async (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    
    if (!rateLimiter.isAllowed(key, windowMs, max)) {
      // Log rate limit exceeded attempt
      const SecurityLogger = require('../utils/securityLogger');
      await SecurityLogger.logSecurityEvent(
        req, 
        res, 
        'rate_limit_exceeded', 
        `Rate limit exceeded: ${max} requests per ${Math.round(windowMs / 1000)}s`, 
        429
      );
      
      return res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
    
    next();
  };
};

// Slow down middleware
const createSlowDown = (windowMs, delayAfter, delayMs, maxDelayMs) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // This is a simplified version - in production, use a proper slow down library
    next();
  };
};

module.exports = {
  createRateLimit,
  createSlowDown,
  rateLimiter
};
