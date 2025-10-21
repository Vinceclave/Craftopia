import * as userChallengeController from "../controllers/userChallenge.controller";
import { 
  joinChallengeSchema, 
  completeChallengeSchema,
  verifyChallengeSchema,
  manualVerifySchema
} from "../schemas/userChallenge.schema";
import { Router } from "express";
import { validate } from "../utils/validation";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";

const ucRouter = Router();

// User actions
ucRouter.post(
  '/join',
  requireAuth,
  validate(joinChallengeSchema),
  userChallengeController.joinChallenge
);

ucRouter.post(
  '/:userChallengeId/complete',
  requireAuth,
  validate(completeChallengeSchema),
  userChallengeController.completeChallenge
);

// AI verification
ucRouter.post(
  '/:userChallengeId/verify',
  requireAuth,
  validate(verifyChallengeSchema),
  userChallengeController.verifyChallenge
);

// Admin actions
ucRouter.post(
  '/:userChallengeId/manual-verify',
  requireAdmin,
  validate(manualVerifySchema),
  userChallengeController.manualVerify
);

ucRouter.get(
  '/pending-verifications',
  requireAdmin,
  userChallengeController.getPendingVerifications
);

// User queries
ucRouter.get(
  '/user/:userId?',
  requireAuth,
  userChallengeController.getUserChallenges
);

ucRouter.get(
  '/:challengeId',
  requireAuth,
  userChallengeController.getUserChallengeById
);

ucRouter.get(
  '/leaderboard',
  requireAuth,
  userChallengeController.getChallengeLeaderboard
);

export default ucRouter;