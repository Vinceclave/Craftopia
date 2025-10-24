import { Router } from "express";
import * as challengeController from "../controllers/challenge.controller";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";
import { validate } from "../utils/validation";
import { createChallengeSchema, updateChallengeSchema, generateChallengeSchema } from "../schemas/challenge.schema";

const router = Router();

// Admin routes
router.post(
  '/',
  requireAdmin,
  validate(createChallengeSchema),
  challengeController.createChallenge
);

router.post(
  '/generate',
  requireAdmin,
  validate(generateChallengeSchema),
  challengeController.generateChallenge
);

router.put(
  '/:challengeId',
  requireAdmin,
  validate(updateChallengeSchema),
  challengeController.updateChallenge
);

router.delete(
  '/:challengeId',
  requireAdmin,
  challengeController.deleteChallenge
);

// Public/User routes
router.get(
  '/',
  requireAuth,
  challengeController.getAllChallenges
);

router.get(
  '/:challengeId',
  requireAuth,
  challengeController.getChallengeById
);

router.get(
  '/options',
  requireAuth,
  challengeController.getChallengeOptions
);

router.get(
  '/recommended',
  requireAuth,
  challengeController.getRecommendedChallenges
);


export default router;