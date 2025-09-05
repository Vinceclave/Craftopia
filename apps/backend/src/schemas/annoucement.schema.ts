import Joi from 'joi';

export const createAnnouncementSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(10).max(2000).required(),
  expires_at: Joi.date().iso().greater('now').optional()
});

export const updateAnnouncementSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  content: Joi.string().min(10).max(2000).optional(),
  is_active: Joi.boolean().optional(),
  expires_at: Joi.alternatives().try(
    Joi.date().iso().greater('now'),
    Joi.valid(null)
  ).optional()
});

export const getAnnouncementsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  includeExpired: Joi.boolean().default(false)
});
