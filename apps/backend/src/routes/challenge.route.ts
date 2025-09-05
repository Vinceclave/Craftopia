// routes/challenge.routes.ts
import { Router } from "express";
import * as challengeController from "../controllers/challenge.controller";

const router = Router();

// Manual challenge creation
router.post("/", challengeController.createChallenge);

// AI generated challenge
router.post("/generate", challengeController.generateChallenge);

export default router;
