const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'mathscore-super-secure-secret-key-2026';

// CORS configuration configuration options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://mathscore.uz',
      'https://api.mathscore.uz',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log CORS blocking as security incident
      db.logSecurityIncident({
        type: 'CORS_BLOCKED',
        severity: 'MEDIUM',
        message: `Request from unauthorized origin blocked: ${origin}`,
        ip: 'unknown'
      });
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Global rate limiting to prevent brute force and DDoS attacks
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Juda ko\'p so\'rov yuborildi. Iltimos keyinroq qayta urinib ko\'ring.' },
  handler: (req, res, next, options) => {
    db.logSecurityIncident({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'HIGH',
      message: `Global rate limit exceeded at path ${req.path}`,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
    });
    res.status(429).json(options.message);
  }
});

// Stricter rate limiting for auth endpoints (login)
const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 login requests per 10 minutes
  message: { error: 'Kirish urinishlari ko\'payib ketdi. 10 daqiqa kuting.' },
  handler: (req, res, next, options) => {
    db.logSecurityIncident({
      type: 'BRUTE_FORCE_SUSPICION',
      severity: 'CRITICAL',
      message: `Multiple failed attempts to login/register from IP`,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      details: { email: req.body?.email }
    });
    res.status(429).json(options.message);
  }
});

// Middleware for validating input data and preventing XSS & Injection attacks
function sanitizeInput(req, res, next) {
  const sanitize = (val) => {
    if (typeof val === 'string') {
      // Detect potentially malicious characters (XSS vectors, script tags, event handlers)
      const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror=|onload=|onclick=/gi;
      if (xssPattern.test(val)) {
        db.logSecurityIncident({
          type: 'XSS_ATTEMPT_DETECTED',
          severity: 'HIGH',
          message: `XSS attack vector detected in user input! Blocked content: ${val.substring(0, 100)}`,
          ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
        });
        throw new Error('Xavfli belgi aniqlandi! Input bloklandi.');
      }
      
      // Clean typical HTML tags to prevent injections but allow math/formula syntax
      return val
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
    if (typeof val === 'object' && val !== null) {
      for (let k in val) {
        val[k] = sanitize(val[k]);
      }
    }
    return val;
  };

  try {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// Authentication Middlewares
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Ruxsat berilmagan. Token topilmadi.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      db.logSecurityIncident({
        type: 'INVALID_TOKEN_ATTEMPT',
        severity: 'MEDIUM',
        message: 'Attempted access with expired/invalid JWT token',
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
      });
      return res.status(403).json({ error: 'Noto\'g\'ri yoki muddati o\'tgan token.' });
    }
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      db.logSecurityIncident({
        type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'HIGH',
        message: `Unauthorized attempt by role '${req.user?.role}' to access ${role} resource at ${req.path}`,
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        details: { user: req.user?.email }
      });
      return res.status(403).json({ error: 'Sizda ushbu amalni bajarish huquqi yo\'q.' });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  corsOptions,
  globalRateLimiter,
  authRateLimiter,
  sanitizeInput,
  authenticateToken,
  requireRole
};
