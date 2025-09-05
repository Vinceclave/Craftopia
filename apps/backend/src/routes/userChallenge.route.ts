// routes/userChallenge.routes.ts
import { Router } from "express";
import * as userChallengeController from "../controllers/userChallenge.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// User joins a challenge
router.post("/join", authMiddleware, userChallengeController.joinChallenge);

// User completes challenge
router.post("/:userChallengeId/complete", authMiddleware, userChallengeController.completeChallenge);

// Admin/AI verifies challenge
router.post("/:userChallengeId/verify", authMiddleware, userChallengeController.verifyChallenge);

// Get all user challenges
router.get("/user/:userId", authMiddleware, userChallengeController.getUserChallenges);

export default router;
