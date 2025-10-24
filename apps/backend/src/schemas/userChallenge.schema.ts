import Joi from 'joi';
import { ChallengeStatus } from '../generated/prisma';
import { commonSchemas } from '../utils/validation';

export const joinChallengeSchema = Joi.object({
  challenge_id: commonSchemas.positiveId
});

export const completeChallengeSchema = Joi.object({
  proof_url: commonSchemas.optionalUrl
});

export const verifyChallengeSchema = Joi.object({
  proof_url: commonSchemas.url,
  description: commonSchemas.requiredString(1, 500),
  points: Joi.number().positive().required(),
  challenge_id: commonSchemas.positiveId,
  userId: commonSchemas.positiveId
});

export const manualVerifySchema = Joi.object({
  approved: commonSchemas.boolean,
  notes: commonSchemas.optionalString(500)
});

export const getUserChallengesQuerySchema = Joi.object({
  status: commonSchemas.optionalEnum(Object.values(ChallengeStatus)),
  userId: commonSchemas.optionalPositiveId
});

export const leaderboardQuerySchema = Joi.object({
  challengeId: commonSchemas.optionalPositiveId,
  limit: Joi.number().min(1).max(50).default(10)
});

export const skipChallengeSchema = Joi.object({
  reason: Joi.string().max(200).optional().allow('', null).trim()
});