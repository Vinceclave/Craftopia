import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from '@/config/passport';
// Routes
import authRoutes from '@/routes/auth.route';
import craftRoutes from '@/ai/routes/craft.route';
import recyclingRoutes from '@/ai/routes/recycling.route';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Initialize passport
app.use(passport.initialize());

// Base routes
app.get('/', (req, res) => {
  res.json({
    message: 'Express + TypeScript Server is running!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/ai/craft', craftRoutes);
app.use('/ai/recycling', recyclingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
