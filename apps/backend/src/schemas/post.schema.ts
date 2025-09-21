import Joi from 'joi';

// POST SCHEMA
export const createPostSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required()
    .messages({
      'string.empty': 'Post title cannot be empty',
      'string.max': 'Post title cannot exceed 255 characters'
    }),
  content: Joi.string().trim().min(1).max(1000).required()
    .messages({
      'string.empty': 'Post content cannot be empty',
      'string.max': 'Post content cannot exceed 1000 characters'
    }),
  imageUrl: Joi.string().uri().allow(null, ''),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  category: Joi.string().valid('Social', 'Tutorial', 'Challenge', 'Marketplace', 'Other').required(),
  featured: Joi.boolean().optional()
});

// COMMENT SCHEMA
export const createCommentSchema = Joi.object({
  postId: Joi.number().positive().required()
    .messages({ 'number.base': 'Invalid post ID', 'number.positive': 'Post ID must be positive' }),
  content: Joi.string().trim().min(1).max(500).required()
    .messages({
      'string.empty': 'Comment content cannot be empty',
      'string.max': 'Comment cannot exceed 500 characters'
    })
});

// REACTION SCHEMA
export const reactionSchema = Joi.object({
  userId: Joi.number().positive().required()
    .messages({ 'number.base': 'Invalid user ID', 'number.positive': 'User ID must be positive' })
});
