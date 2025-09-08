// Add to schemas/ai.schema.ts
import Joi from 'joi';

export const generateCraftSchema = Joi.object({
  materials: Joi.string().min(3).max(200).required()
});