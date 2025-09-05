// routes/userChallenge.routes.ts
import { Router } from "express";
import * as userChallengeController from "../controllers/userChallenge.controller";

const router = Router();

// User joins a challenge
router.post("/join", userChallengeController.joinChallenge);

// User completes challenge
router.post("/:userChallengeId/complete", userChallengeController.completeChallenge);

// Admin/AI verifies challenge
router.post("/:userChallengeId/verify", userChallengeController.verifyChallenge);

// Get all user challenges
router.get("/user/:userId", userChallengeController.getUserChallenges);

export default router;
