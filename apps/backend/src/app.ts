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
import '../src/cron/cleanup.cron';
import path from 'path';

dotenv.config();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many AI requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'http://192.168.1.10:8081',
      config.frontend.url
    ];
    
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api/v1', limiter);
app.use('/api/v1/ai', aiLimiter);

app.use('/api/v1', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Craftopia API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

export default app;