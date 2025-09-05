import Joi from 'joi';
import { ChallengeStatus } from '../generated/prisma';

export const joinChallengeSchema = Joi.object({
  challenge_id: Joi.number().positive().required()
});

export const completeChallengeSchema = Joi.object({
  proof_url: Joi.string().uri().optional()
});

export const verifyChallengeSchema = Joi.object({
  approved: Joi.boolean().default(true),
  notes: Joi.string().max(500).optional()
});

export const getUserChallengesQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(ChallengeStatus)).optional(),
  userId: Joi.number().positive().optional()
});

export const leaderboardQuerySchema = Joi.object({
  challengeId: Joi.number().positive().optional(),
  limit: Joi.number().min(1).max(50).default(10)
});