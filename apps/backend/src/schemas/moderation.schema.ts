import Joi from 'joi';
import { ModerationAction } from '../generated/prisma';

export const createModerationLogSchema = Joi.object({
  adminId: Joi.number().positive().required(),
  action: Joi.string().valid(...Object.values(ModerationAction)).required(),
  targetId: Joi.string().required(),
  targetUserId: Joi.number().positive().optional(),
  reason: Joi.string().max(500).optional()
});
