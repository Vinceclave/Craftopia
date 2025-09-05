import Joi from 'joi';
import { MaterialType } from '../generated/prisma';

export const createChallengeSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  points_reward: Joi.number().min(1).max(1000).required(),
  material_type: Joi.string().valid(...Object.values(MaterialType)).required(),
  created_by_admin_id: Joi.number().positive().optional()
});

export const joinChallengeSchema = Joi.object({
  user_id: Joi.number().positive().required(),
  challenge_id: Joi.number().positive().required()
});