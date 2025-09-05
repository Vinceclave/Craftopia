import Joi from 'joi';

export const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
  imageUrl: Joi.string().uri().optional()
});

export const createCommentSchema = Joi.object({
  postId: Joi.number().positive().required(),
  content: Joi.string().min(1).max(500).required()
});

export const reactionSchema = Joi.object({
  userId: Joi.number().positive().required()
});