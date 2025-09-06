const crypto = require('crypto');
const { createRateLimit, createSlowDown } = require('./rateLimiter');
const SecurityLogger = require('../utils/securityLogger');

// Generate a secure API key for the website
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Store the API key (in production, store this in environment variables)
const WEBSITE_API_KEY = process.env.WEBSITE_API_KEY || generateApiKey();

// API key loaded successfully

// Allowed origins (your website domains)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'https://yourdomain.com', // Replace with your actual domain
      'https://www.yourdomain.com', // Replace with your actual domain
      // Add your production domains here
    ];

// CORS origins configured successfully

// Rate limiting configuration - Skip rate limiting for valid API key requests
const createRateLimitMiddleware = (windowMs, max, message) => {
  return (req, res, next) => {
    // Check if request has valid API key
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    // Skip rate limiting for requests with valid API key
    if (apiKey && apiKey === WEBSITE_API_KEY) {
      return next();
    }
    
    // Apply rate limiting for requests without valid API key
    return createRateLimit(windowMs, max, message)(req, res, next);
  };
};

// Different rate limits for different endpoints
const generalRateLimit = createRateLimitMiddleware(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

const authRateLimit = createRateLimitMiddleware(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  'Too many authentication attempts, please try again later.'
);

const uploadRateLimit = createRateLimitMiddleware(
  60 * 60 * 1000, // 1 hour
  20, // 20 uploads per hour
  'Too many upload attempts, please try again later.'
);

// Slow down configuration - Skip for valid API key requests
const speedLimiter = (req, res, next) => {
  // Check if request has valid API key
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  // Skip speed limiting for requests with valid API key
  if (apiKey && apiKey === WEBSITE_API_KEY) {
    return next();
  }
  
  // Apply speed limiting for requests without valid API key
  return createSlowDown(
    15 * 60 * 1000, // 15 minutes
    50, // Allow 50 requests per window without delay
    500, // Add 500ms delay per request after delayAfter
    20000 // Maximum delay of 20 seconds
  )(req, res, next);
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin in development
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    const isAllowed = ALLOWED_ORIGINS.some(allowedOrigin => 
      origin.startsWith(allowedOrigin)
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Requested-With'
  ],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// API Key validation middleware
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    // Log unauthorized access attempt
    await SecurityLogger.logSecurityEvent(
      req, 
      res, 
      'unauthorized_access', 
      'No API key provided', 
      401
    );
    
    return res.status(401).json({
      error: 'API key required',
      message: 'This API requires a valid API key'
    });
  }

  if (apiKey !== WEBSITE_API_KEY) {
    // Log invalid API key attempt
    await SecurityLogger.logSecurityEvent(
      req, 
      res, 
      'invalid_api_key', 
      'Invalid API key provided', 
      403,
      { providedKey: apiKey.substring(0, 10) + '...' }
    );
    
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
};

// Request origin validation
const validateOrigin = async (req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer');
  
  if (!origin) {
    // Log invalid origin attempt
    await SecurityLogger.logSecurityEvent(
      req, 
      res, 
      'invalid_origin', 
      'No origin header provided', 
      403
    );
    
    return res.status(403).json({
      error: 'Origin required',
      message: 'Requests must include a valid origin header'
    });
  }

  const isValidOrigin = ALLOWED_ORIGINS.some(allowedOrigin => 
    origin.startsWith(allowedOrigin)
  );

  if (!isValidOrigin) {
    // Log invalid origin attempt
    await SecurityLogger.logSecurityEvent(
      req, 
      res, 
      'invalid_origin', 
      `Invalid origin: ${origin}`, 
      403,
      { providedOrigin: origin }
    );
    
    return res.status(403).json({
      error: 'Invalid origin',
      message: 'Requests from this origin are not allowed'
    });
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  
  next();
};

// Request size limiter
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request size exceeds the maximum allowed limit'
    });
  }
  
  next();
};

// IP whitelist (optional - uncomment if you want to restrict by IP)
const ipWhitelist = (req, res, next) => {
  const allowedIPs = [
    '127.0.0.1',
    '::1',
    '::ffff:127.0.0.1',
    // Add your server IPs here
  ];
  
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  // Skip IP check for development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({
      error: 'IP not allowed',
      message: 'Requests from this IP address are not permitted'
    });
  }
  
  next();
};

// Request validation middleware
const validateRequest = async (req, res, next) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  const checkForSuspiciousContent = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(obj[key])) {
            return true;
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSuspiciousContent(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (checkForSuspiciousContent(req.body) || checkForSuspiciousContent(req.query)) {
    // Log suspicious content attempt
    await SecurityLogger.logSecurityEvent(
      req, 
      res, 
      'suspicious_content', 
      'Request contains potentially malicious content', 
      400
    );
    
    return res.status(400).json({
      error: 'Suspicious content detected',
      message: 'Request contains potentially malicious content'
    });
  }
  
  next();
};

// Log security events (silent - only to database)
const securityLogger = (req, res, next) => {
  // Security events are logged to database only
  // No console output to keep terminal clean
  next();
};

module.exports = {
  corsOptions,
  validateApiKey,
  validateOrigin,
  securityHeaders,
  requestSizeLimit,
  ipWhitelist,
  validateRequest,
  securityLogger,
  generalRateLimit,
  authRateLimit,
  uploadRateLimit,
  speedLimiter,
  WEBSITE_API_KEY
};
