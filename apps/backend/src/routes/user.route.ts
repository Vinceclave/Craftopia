import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middlewares/rolebase.middleware';
import { validate } from '../utils/validation';
import { updateProfileSchema } from '../schemas/user.schema';

const router = Router();

// Profile routes
router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, validate(updateProfileSchema), userController.updateProfile);
router.get('/stats', requireAuth, userController.getUserStats);

// Public routes
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:userId', userController.getUserById);

export default router;