import Joi from 'joi';
import { ModerationAction } from '../generated/prisma';
import { commonSchemas } from '../utils/validation';

export const createModerationLogSchema = Joi.object({
  action: commonSchemas.enum(Object.values(ModerationAction)),
  targetId: commonSchemas.requiredString(1, 255),
  targetUserId: commonSchemas.optionalPositiveId,
  reason: commonSchemas.optionalString(500)
});