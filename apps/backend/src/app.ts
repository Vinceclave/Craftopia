// apps/backend/src/app.ts - ENHANCED VERSION WITH FIXED IPv6 HANDLING
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import apiRoutes from './routes/api';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { config } from './config';
import { logger } from './utils/logger';
import { RATE_LIMITS } from './constats';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// Remove X-Powered-By header
app.disable('x-powered-by');

// ============================================
// CORS CONFIGURATION
// ============================================

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'http://192.168.1.10:8081',
      config.frontend.url
    ];
    
    // Allow all localhost origins in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.logSecurityEvent('CORS Blocked Origin', 'low', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ============================================
// BODY PARSING
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STATIC FILES
// ============================================

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ============================================
// LOGGING
// ============================================

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production logging
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400, // Only log errors in production
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// ============================================
// RATE LIMITING
// ============================================

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.WINDOW_MS,
  max: RATE_LIMITS.GENERAL.MAX,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurityEvent(
      'Rate Limit Exceeded',
      'medium',
      { ip: req.ip, url: req.url }
    );
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      timestamp: new Date().toISOString()
    });
  }
});

// AI endpoints rate limiter
const aiLimiter = rateLimit({
  windowMs: RATE_LIMITS.AI.WINDOW_MS,
  max: RATE_LIMITS.AI.MAX,
  message: {
    success: false,
    error: 'Too many AI requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// FIXED: Auth rate limiter using ipKeyGenerator for proper IPv6 support
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX,
  keyGenerator: (req, res) => {
    // Use email (or username) if provided
    const email = req.body?.email?.toLowerCase();
    if (email && email.trim()) {
      return `email:${email}`;
    }
    // Use the official ipKeyGenerator helper for proper IPv4/IPv6 handling
    // Note: ipKeyGenerator only takes the request object
    return ipKeyGenerator(req.ip || '');
  },
  handler: (req, res) => {
    logger.logSecurityEvent(
      'Auth Rate Limit Exceeded',
      'high',
      { 
        email: req.body?.email,
        url: req.url 
      }
    );
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use('/api/v1', generalLimiter);
app.use('/api/v1/ai', aiLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/v1', apiRoutes);

// ============================================
// ROOT ENDPOINT
// ============================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Craftopia API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/v1/docs' // TODO: Add API documentation
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Not Found handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// CRON JOBS (import after app setup)
// ============================================

import './cron/challenge.cron';
import './cron/cleanup.cron';

logger.info('Application initialized successfully');

export default app;