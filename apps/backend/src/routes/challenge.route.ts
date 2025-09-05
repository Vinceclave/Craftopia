import { Router } from "express";
import * as challengeController from "../controllers/challenge.controller";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";
import { validate } from "../utils/validation";
import { createChallengeSchema } from "../schemas/challenge.schema";

const router = Router();

router.post('/', requireAdmin, validate(createChallengeSchema), challengeController.createChallenge);
router.post('/generate', requireAdmin, challengeController.generateChallenge);
router.get('/', requireAuth, challengeController.getAllChallenges);
router.get('/:challengeId', requireAuth, challengeController.getChallengeById);

export default router;