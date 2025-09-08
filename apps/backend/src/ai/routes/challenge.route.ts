
import { Router } from "express";
import { generateChallenges } from "../controllers/challenges.controller";

const router = Router();

// Route to generate and display the EcoChallenge
router.post('/generate-challenge', generateChallenges);

export default router;
