import Joi from 'joi';

export const createCraftIdeaSchema = Joi.object({
  idea_json: Joi.object().required(),
  recycled_materials: Joi.object().optional()
});

export const getCraftIdeasSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  material: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  user_id: Joi.number().positive().optional()
});