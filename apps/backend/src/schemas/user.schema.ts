import Joi from 'joi';
import { commonSchemas } from '../utils/validation';
import { VALIDATION_LIMITS } from '../constats';

export const updateProfileSchema = Joi.object({
  full_name: commonSchemas.optionalString(100),
  bio: commonSchemas.optionalString(VALIDATION_LIMITS.BIO.MAX),
  profile_picture_url: commonSchemas.optionalUrl,
  home_dashboard_layout: commonSchemas.jsonObject
});

export const deleteAccountSchema = Joi.object({
  password: Joi.string().required()
});

export const updateEmailSchema = Joi.object({
  newEmail: commonSchemas.email,
  password: Joi.string().required()
});

export const getUserQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10)
});
