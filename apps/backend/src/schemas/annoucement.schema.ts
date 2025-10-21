import Joi from 'joi';
import { commonSchemas } from '../utils/validation';
import { VALIDATION_LIMITS } from '../constats';

export const createAnnouncementSchema = Joi.object({
  title: commonSchemas.requiredString(
    VALIDATION_LIMITS.ANNOUNCEMENT.TITLE_MIN,
    VALIDATION_LIMITS.ANNOUNCEMENT.TITLE_MAX
  ),
  content: commonSchemas.requiredString(
    VALIDATION_LIMITS.ANNOUNCEMENT.CONTENT_MIN,
    VALIDATION_LIMITS.ANNOUNCEMENT.CONTENT_MAX
  ),
  expires_at: commonSchemas.futureDate.optional()
});

export const updateAnnouncementSchema = Joi.object({
  title: commonSchemas.optionalString(VALIDATION_LIMITS.ANNOUNCEMENT.TITLE_MAX),
  content: commonSchemas.optionalString(VALIDATION_LIMITS.ANNOUNCEMENT.CONTENT_MAX),
  is_active: commonSchemas.optionalBoolean,
  expires_at: Joi.alternatives().try(
    commonSchemas.futureDate,
    Joi.valid(null)
  ).optional()
});

export const getAnnouncementsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  includeExpired: commonSchemas.optionalBoolean
});
