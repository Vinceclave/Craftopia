import Joi from 'joi';
import { commonSchemas } from '../utils/validation';

export const generateCraftSchema = Joi.object({
  materials: Joi.alternatives().try(
    Joi.string().trim().min(1),
    Joi.array().items(Joi.string().trim().min(1))
  ).required()
});

export const createCraftIdeaSchema = Joi.object({
  idea_json: commonSchemas.jsonObject.required(),
  recycled_materials: commonSchemas.jsonObject
});

export const updateCraftIdeaSchema = Joi.object({
  idea_json: commonSchemas.jsonObject,
  recycled_materials: commonSchemas.jsonObject
});

export const getCraftIdeasSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: commonSchemas.optionalString(200),
  material: commonSchemas.optionalString(50),
  startDate: commonSchemas.optionalIsoDate,
  endDate: commonSchemas.optionalIsoDate,
  user_id: commonSchemas.optionalPositiveId
});

