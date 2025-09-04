import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler (must come last)
app.use(errorHandler);

// Only start server if this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Service running on PORT: ${PORT}`);
    });
}

export default app;
