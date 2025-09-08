
import { Router } from "express";
import { generateAndDisplayChallenge } from "../controllers/challenge.controller";

const router = Router();

// Route to generate and display the EcoChallenge
router.post('/generate-challenge', generateAndDisplayChallenge);

export default router;
