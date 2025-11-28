import * as userChallengeController from "../controllers/userChallenge.controller";
import { 
  joinChallengeSchema, 
  completeChallengeSchema,
  verifyChallengeSchema,
  manualVerifySchema,
  skipChallengeSchema
} from "../schemas/userChallenge.schema";
import { Router } from "express";
import { validate } from "../utils/validation";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";

const ucRouter = Router();

// ========================================
// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// ========================================

// User actions
ucRouter.post(
  '/join',
  requireAuth,
  validate(joinChallengeSchema),
  userChallengeController.joinChallenge
);

// ✅ FIXED: Move specific routes BEFORE :challengeId routes
ucRouter.get(
  '/pending-verifications',
  requireAdmin,
  userChallengeController.getPendingVerifications
);

ucRouter.get(
  '/leaderboard',
  requireAuth,
  userChallengeController.getChallengeLeaderboard
);

// ✅ FIXED: Move waste stats route BEFORE :challengeId
ucRouter.get(
  '/my-waste-stats',
  requireAuth,
  userChallengeController.getMyWasteStats
);

ucRouter.get(
  '/all',
  requireAdmin,
  userChallengeController.getAllUserChallenges
);

// ✅ FIXED: Move user challenges list BEFORE :challengeId
ucRouter.get(
  '/user/:userId?',
  requireAuth,
  userChallengeController.getUserChallenges
);

// ========================================
// Parameterized routes come AFTER specific routes
// ========================================

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

ucRouter.post(
  '/:userChallengeId/skip',
  requireAuth,
  validate(skipChallengeSchema),
  userChallengeController.skipChallenge
);

// ✅ FIXED: This should be LAST since it uses :challengeId parameter
ucRouter.get(
  '/:challengeId',
  requireAuth,
  userChallengeController.getUserChallengeById
);



export default ucRouter;
