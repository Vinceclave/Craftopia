import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import craftRoutes from './routes/craft.route';
import postRoutes from './routes/post.route';
import challengeRoutes from './routes/challenge.route';
import userChallengeRoutes from './routes/userChallenge.route';
import moderationRoutes from './routes/moderation.route';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/crafts', craftRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ecochallenges', challengeRoutes);   
app.use('/api/user-challenges', userChallengeRoutes); 
app.use('/api/moderation', moderationRoutes); 

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
