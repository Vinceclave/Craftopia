import Joi from 'joi';
import { Category } from '../generated/prisma';
import { commonSchemas } from '../utils/validation';
import { VALIDATION_LIMITS } from '../constats';

export const createPostSchema = Joi.object({
  title: commonSchemas.requiredString(1, VALIDATION_LIMITS.POST.TITLE_MAX)
    .messages({
      'string.empty': 'Post title cannot be empty',
      'string.max': `Post title cannot exceed ${VALIDATION_LIMITS.POST.TITLE_MAX} characters`
    }),
  content: commonSchemas.requiredString(1, VALIDATION_LIMITS.POST.CONTENT_MAX)
    .messages({
      'string.empty': 'Post content cannot be empty',
      'string.max': `Post content cannot exceed ${VALIDATION_LIMITS.POST.CONTENT_MAX} characters`
    }),
  imageUrl: commonSchemas.optionalUrl,
  tags: commonSchemas.stringArray,
  category: commonSchemas.enum(Object.values(Category)),
  featured: commonSchemas.optionalBoolean
});

export const updatePostSchema = Joi.object({
  title: commonSchemas.optionalString(VALIDATION_LIMITS.POST.TITLE_MAX),
  content: commonSchemas.optionalString(VALIDATION_LIMITS.POST.CONTENT_MAX),
  imageUrl: commonSchemas.optionalUrl,
  tags: commonSchemas.stringArray,
  featured: commonSchemas.optionalBoolean
});

export const createCommentSchema = Joi.object({
  postId: commonSchemas.positiveId
    .messages({ 
      'number.base': 'Invalid post ID', 
      'number.positive': 'Post ID must be positive' 
    }),
  content: commonSchemas.requiredString(1, VALIDATION_LIMITS.COMMENT.MAX)
    .messages({
      'string.empty': 'Comment content cannot be empty',
      'string.max': `Comment cannot exceed ${VALIDATION_LIMITS.COMMENT.MAX} characters`
    })
});

export const getPostsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  feedType: commonSchemas.optionalEnum(['all', 'trending', 'popular', 'featured']),
  category: commonSchemas.optionalEnum(Object.values(Category))
});
