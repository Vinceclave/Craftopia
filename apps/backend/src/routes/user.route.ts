import * as userController from '../controllers/user.controller';
import { updateProfileSchema, deleteAccountSchema, updateEmailSchema } from '../schemas/user.schema';
import { Router } from 'express';
import { validate } from '../utils/validation';
import { requireAuth } from '../middlewares/rolebase.middleware';

const userRouter = Router();

// Profile routes (authenticated users only)
userRouter.get(
  '/profile', 
  requireAuth, 
  userController.getProfile
);

userRouter.put(
  '/profile', 
  requireAuth, 
  validate(updateProfileSchema), 
  userController.updateProfile
);

userRouter.get(
  '/stats', 
  requireAuth, 
  userController.getUserStats
);

userRouter.delete(
  '/account',
  requireAuth,
  validate(deleteAccountSchema),
  userController.deleteAccount
);

userRouter.put(
  '/email',
  requireAuth,
  validate(updateEmailSchema),
  userController.updateEmail
);

// Public routes
userRouter.get(
  '/leaderboard', 
  userController.getLeaderboard
);

userRouter.get(
  '/:userId', 
  userController.getUserById
);

export default userRouter;