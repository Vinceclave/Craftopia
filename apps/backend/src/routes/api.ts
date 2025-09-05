import { Router } from 'express';
import authRoutes from './auth.route';
import postRoutes from './post.route';
import craftRoutes from './craft.route';
import challengeRoutes from './challenge.route';
import userChallengeRoutes from './userChallenge.route';
import moderationRoutes from './moderation.route';
import announcementRoutes from './announcement.route'; // ADD THIS
import reportRoutes from './report.route'; // ADD THIS

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/posts', postRoutes);
router.use('/crafts', craftRoutes);
router.use('/challenges', challengeRoutes);
router.use('/user-challenges', userChallengeRoutes);
router.use('/moderation', moderationRoutes);
router.use('/announcements', announcementRoutes); // ADD THIS
router.use('/reports', reportRoutes); // ADD THIS

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is healthy',
    timestamp: new Date().toISOString() 
  });
});

export default router;