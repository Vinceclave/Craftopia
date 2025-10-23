// apps/backend/src/schemas/post.schema.ts - ADD UPDATE SCHEMA
import Joi from 'joi';
import { VALIDATION_LIMITS } from '../constats';

// Existing create post schema
export const createPostSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(VALIDATION_LIMITS.POST.TITLE_MAX)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.max': `Title cannot exceed ${VALIDATION_LIMITS.POST.TITLE_MAX} characters`,
    }),
  
  content: Joi.string()
    .trim()
    .min(1)
    .max(VALIDATION_LIMITS.POST.CONTENT_MAX)
    .required()
    .messages({
      'string.empty': 'Content is required',
      'string.max': `Content cannot exceed ${VALIDATION_LIMITS.POST.CONTENT_MAX} characters`,
    }),
  
  imageUrl: Joi.string()
    .uri()
    .allow('', null)
    .optional(),
  
  tags: Joi.array()
    .items(Joi.string().trim())
    .default([])
    .optional(),
  
  category: Joi.string()
    .valid('Social', 'Tutorial', 'Challenge', 'Marketplace', 'Other')
    .required()
    .messages({
      'any.only': 'Category must be one of: Social, Tutorial, Challenge, Marketplace, Other',
    }),
  
  featured: Joi.boolean()
    .default(false)
    .optional(),
});

// NEW: Update post schema (all fields optional except at least one must be provided)
export const updatePostSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(VALIDATION_LIMITS.POST.TITLE_MAX)
    .optional()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': `Title cannot exceed ${VALIDATION_LIMITS.POST.TITLE_MAX} characters`,
    }),
  
  content: Joi.string()
    .trim()
    .min(1)
    .max(VALIDATION_LIMITS.POST.CONTENT_MAX)
    .optional()
    .messages({
      'string.empty': 'Content cannot be empty',
      'string.max': `Content cannot exceed ${VALIDATION_LIMITS.POST.CONTENT_MAX} characters`,
    }),
  
  imageUrl: Joi.string()
    .uri()
    .allow('', null)
    .optional(),
  
  tags: Joi.array()
    .items(Joi.string().trim())
    .optional(),
  
  category: Joi.string()
    .valid('Social', 'Tutorial', 'Challenge', 'Marketplace', 'Other')
    .optional()
    .messages({
      'any.only': 'Category must be one of: Social, Tutorial, Challenge, Marketplace, Other',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update',
  });

// Existing create comment schema
export const createCommentSchema = Joi.object({
  postId: Joi.number()
    .positive()
    .integer()
    .required()
    .messages({
      'number.base': 'Post ID must be a number',
      'any.required': 'Post ID is required',
    }),
  
  content: Joi.string()
    .trim()
    .min(1)
    .max(VALIDATION_LIMITS.COMMENT.MAX)
    .required()
    .messages({
      'string.empty': 'Comment content is required',
      'string.max': `Comment cannot exceed ${VALIDATION_LIMITS.COMMENT.MAX} characters`,
    }),
});