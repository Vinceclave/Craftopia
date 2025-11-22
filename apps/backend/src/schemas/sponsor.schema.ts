import Joi from 'joi';
import { commonSchemas } from '../utils/validation';
import { VALIDATION_LIMITS, POINTS } from '../constats';

export const createSponsorSchema = Joi.object({
  name: commonSchemas.requiredString(3, 100),
  logo_url: commonSchemas.optionalUrl,
  description: commonSchemas.optionalString(500),
  contact_email: commonSchemas.optionalEmail,
  is_active: commonSchemas.optionalBoolean
});

export const updateSponsorSchema = Joi.object({
  name: commonSchemas.optionalString(100),
  logo_url: commonSchemas.optionalUrl,
  description: commonSchemas.optionalString(500),
  contact_email: commonSchemas.optionalEmail,
  is_active: commonSchemas.optionalBoolean
});

export const createRewardSchema = Joi.object({
  sponsor_id: commonSchemas.positiveId,
  title: commonSchemas.requiredString(5, 150),
  description: commonSchemas.optionalString(500),
  points_cost: Joi.number()
    .min(POINTS.REWARD?.MIN || 50)
    .max(POINTS.REWARD?.MAX || 10000)
    .required(),
  quantity: Joi.number().min(1).optional().allow(null),
  display_on_leaderboard: commonSchemas.optionalBoolean,
  expires_at: commonSchemas.optionalIsoDate
});

export const updateRewardSchema = Joi.object({
  title: commonSchemas.optionalString(150),
  description: commonSchemas.optionalString(500),
  points_cost: Joi.number()
    .min(POINTS.REWARD?.MIN || 50)
    .max(POINTS.REWARD?.MAX || 10000)
    .optional(),
  quantity: Joi.number().min(0).optional().allow(null),
  is_active: commonSchemas.optionalBoolean,
  display_on_leaderboard: commonSchemas.optionalBoolean,
  expires_at: commonSchemas.optionalIsoDate.allow(null)
});

export const redeemRewardSchema = Joi.object({
  reward_id: commonSchemas.positiveId
});

export const fulfillRedemptionSchema = Joi.object({
  redemption_id: commonSchemas.positiveId
});