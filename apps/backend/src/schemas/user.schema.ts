import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  full_name: Joi.string().optional(),
  bio: Joi.string().max(500).optional(),
  profile_picture_url: Joi.string().uri().optional(),
  home_dashboard_layout: Joi.object().optional()
});