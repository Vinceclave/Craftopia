import { Router } from "express";
import * as userChallengeController from "../controllers/userChallenge.controller";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";
import { validate, validateQuery } from "../utils/validation";
import { 
  joinChallengeSchema, 
  completeChallengeSchema,
  verifyChallengeSchema,
  getUserChallengesQuerySchema,
  leaderboardQuerySchema
} from "../schemas/userChallenge.schema";

const router = Router();

// User actions
router.post('/join', requireAuth, validate(joinChallengeSchema), userChallengeController.joinChallenge);
router.post('/:userChallengeId/complete', requireAuth, validate(completeChallengeSchema), userChallengeController.completeChallenge);

// Admin actions
router.post('/:userChallengeId/verify', requireAdmin, validate(verifyChallengeSchema), userChallengeController.verifyChallenge);
router.get('/pending-verifications', requireAdmin, userChallengeController.getPendingVerifications);

// Public/User queries
router.get('/user/:userId?', requireAuth, validateQuery(getUserChallengesQuerySchema), userChallengeController.getUserChallenges);
router.get('/leaderboard', requireAuth, validateQuery(leaderboardQuerySchema), userChallengeController.getChallengeLeaderboard);

export default router;