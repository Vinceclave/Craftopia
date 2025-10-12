// apps/backend/src/routes/api.ts - UPDATE THIS FILE

import { Router } from 'express';
import uploadRoutes from './upload.route'
import authRoutes from './auth.route';
import postRoutes from './post.route';
import craftRoutes from './craft.route';
import challengeRoutes from './challenge.route';
import userChallengeRoutes from './userChallenge.route';
import moderationRoutes from './moderation.route';
import announcementRoutes from './announcement.route';
import reportRoutes from './report.route';
import userRoutes from './user.route';
import chatbotRoutes from './chatbot.route'; 
import prisma from '../config/prisma';

// AI Routes
import aiCraftRoutes from '../ai/routes/craft.route';
import aiChallengeRoutes from '../ai/routes/challenge.route';
import aiImageRoutes from '../ai/routes/image.route';
import aiMaterialRoutes from '../ai/routes/material.route'; // NEW

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/upload', uploadRoutes)
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/crafts', craftRoutes);
router.use('/challenges', challengeRoutes);
router.use('/user-challenges', userChallengeRoutes);
router.use('/moderation', moderationRoutes);
router.use('/announcements', announcementRoutes);
router.use('/reports', reportRoutes);
router.use('/chatbot', chatbotRoutes);

// AI Routes
router.use('/ai/craft', aiCraftRoutes);
router.use('/ai/challenge', aiChallengeRoutes);
router.use('/ai/image', aiImageRoutes);
router.use('/ai/material', aiMaterialRoutes); // NEW: Material detection routes

// Health check
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      success: true, 
      message: 'API is healthy',
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'API unhealthy - database connection failed',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;