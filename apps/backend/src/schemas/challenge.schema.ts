import Joi from 'joi';
import { MaterialType, ChallengeCategory } from '../generated/prisma';
import { commonSchemas } from '../utils/validation';
import { VALIDATION_LIMITS, POINTS } from '../constats';

export const createChallengeSchema = Joi.object({
  title: commonSchemas.requiredString(
    VALIDATION_LIMITS.CHALLENGE.TITLE_MIN,
    VALIDATION_LIMITS.CHALLENGE.TITLE_MAX
  ),
  description: commonSchemas.requiredString(
    VALIDATION_LIMITS.CHALLENGE.DESCRIPTION_MIN,
    VALIDATION_LIMITS.CHALLENGE.DESCRIPTION_MAX
  ),
  points_reward: Joi.number()
    .min(POINTS.CHALLENGE.MIN)
    .max(POINTS.CHALLENGE.MAX)
    .required(),
  waste_kg: Joi.number().min(0).optional().default(0),
  material_type: commonSchemas.enum(Object.values(MaterialType)),
  category: commonSchemas.enum(Object.values(ChallengeCategory))
});

export const updateChallengeSchema = Joi.object({
  title: commonSchemas.optionalString(VALIDATION_LIMITS.CHALLENGE.TITLE_MAX),
  description: commonSchemas.optionalString(VALIDATION_LIMITS.CHALLENGE.DESCRIPTION_MAX),
  points_reward: Joi.number()
    .min(POINTS.CHALLENGE.MIN)
    .max(POINTS.CHALLENGE.MAX)
    .optional(),
  waste_kg: Joi.number().min(0).optional(),
  material_type: commonSchemas.optionalEnum(Object.values(MaterialType)),
  category: commonSchemas.optionalEnum(Object.values(ChallengeCategory)),
  is_active: commonSchemas.optionalBoolean
});

export const generateChallengeSchema = Joi.object({
  category: commonSchemas.enum(Object.values(ChallengeCategory))
});
