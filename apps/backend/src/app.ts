import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api';
import { errorHandler } from './middlewares/error.middleware';
import { config } from './config';
import '../src/cron/challenge.cron'


dotenv.config();

const app = express();

// Basic security headers (one-line solution)
app.use(helmet());

// Remove X-Powered-By header (hide Express)
app.disable('x-powered-by');

// Rate limiting (prevent DoS attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    timestamp: new Date().toISOString()
  }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit for AI endpoints
  message: {
    success: false,
    error: 'Too many AI requests, please try again later',
    timestamp: new Date().toISOString()
  }
});

// CORS - Only allow your frontend
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:8081',
    config.frontend.url
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with reasonable limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply rate limiting
app.use('/api/v1', limiter);
app.use('/api/v1/ai', aiLimiter);

// Logging
app.use(morgan('combined'));

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

export default app;