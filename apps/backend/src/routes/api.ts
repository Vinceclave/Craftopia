<<<<<<< HEAD
// apps/backend/src/routes/api.ts - UPDATED
=======
// apps/backend/src/routes/api.ts - UPDATE THIS FILE
>>>>>>> b0d183059e6ff4fac5a923bf8bfdaf85202ea3d0

import { Router } from 'express';
import uploadRoutes from './upload.route';
import authRoutes from './auth.route';
import postRoutes from './post.route';
import craftRoutes from './craft.route';
import challengeRoutes from './challenge.route';
import userChallengeRoutes from './userChallenge.route';
import moderationRoutes from './moderation.route';
import announcementRoutes from './announcement.route';
import reportRoutes from './report.route';
import userRoutes from './user.route';
<<<<<<< HEAD
import chatbotRoutes from './chatbot.route';
import adminRoutes from './admin'; // NEW: Admin routes
=======
import chatbotRoutes from './chatbot.route'; 
>>>>>>> b0d183059e6ff4fac5a923bf8bfdaf85202ea3d0
import prisma from '../config/prisma';

// AI Routes
import aiCraftRoutes from '../ai/routes/craft.route';
import aiChallengeRoutes from '../ai/routes/challenge.route';
import aiImageRoutes from '../ai/routes/image.route';
<<<<<<< HEAD
import aiMaterialRoutes from '../ai/routes/material.route';
=======
import aiMaterialRoutes from '../ai/routes/material.route'; // NEW
>>>>>>> b0d183059e6ff4fac5a923bf8bfdaf85202ea3d0

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/upload', uploadRoutes);
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
<<<<<<< HEAD
router.use('/ai/material', aiMaterialRoutes);

// NEW: Admin Routes (protected with requireAdmin middleware)
router.use('/admin', adminRoutes);

=======
router.use('/ai/material', aiMaterialRoutes); // NEW: Material detection routes

>>>>>>> b0d183059e6ff4fac5a923bf8bfdaf85202ea3d0
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