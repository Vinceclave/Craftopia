// apps/backend/src/utils/validation.ts - FIXED VERSION
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './error';

// Format Joi validation errors
const formatJoiErrors = (error: Joi.ValidationError) => {
  return error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    type: detail.type,
    value: detail.context?.value
  }));
};

// Generic validation middleware factory
const createValidationMiddleware = (
  schema: Joi.ObjectSchema,
  source: 'body' | 'query' | 'params'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // ✅ Add debugging for craft generate endpoint
    if (req.path.includes('/craft/generate')) {
      console.log('\n🔍 ===== VALIDATION MIDDLEWARE =====');
      console.log('🔍 Request path:', req.path);
      console.log('🔍 Source:', source);
      console.log('🔍 Keys BEFORE validation:', Object.keys(req[source]));
      console.log('🔍 Has referenceImageBase64 BEFORE:', !!(req[source] as any).referenceImageBase64);
      if ((req[source] as any).referenceImageBase64) {
        const imageLength = (req[source] as any).referenceImageBase64.length;
        console.log('🔍 Image length BEFORE:', imageLength, 'characters');
        console.log('🔍 Image size BEFORE:', (imageLength / (1024 * 1024)).toFixed(2), 'MB');
      }
    }

    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: false,  // ✅ CRITICAL FIX: Don't strip unknown fields!
      allowUnknown: true,   // ✅ CRITICAL FIX: Allow unknown fields!
      convert: true
    });

    if (error) {
      const details = formatJoiErrors(error);
      
      // ✅ Add debugging for validation errors
      if (req.path.includes('/craft/generate')) {
        console.log('❌ VALIDATION FAILED');
        console.log('❌ Errors:', details);
        console.log('🔍 ====================================\n');
      }
      
      return next(new ValidationError(
        error.details[0]?.message || `${source} validation failed`,
        details
      ));
    }

    // ✅ Add debugging after validation
    if (req.path.includes('/craft/generate')) {
      console.log('✅ VALIDATION PASSED');
      console.log('🔍 Keys AFTER validation:', Object.keys(value));
      console.log('🔍 Has referenceImageBase64 AFTER:', !!(value as any).referenceImageBase64);
      if ((value as any).referenceImageBase64) {
        const imageLength = (value as any).referenceImageBase64.length;
        console.log('🔍 Image length AFTER:', imageLength, 'characters');
        console.log('🔍 Image size AFTER:', (imageLength / (1024 * 1024)).toFixed(2), 'MB');
      }
      console.log('🔍 ====================================\n');
    }

    // Replace request data with validated & sanitized data
    req[source] = value;
    next();
  };
};

// Export validation middleware creators
export const validate = (schema: Joi.ObjectSchema) => 
  createValidationMiddleware(schema, 'body');

export const validateQuery = (schema: Joi.ObjectSchema) => 
  createValidationMiddleware(schema, 'query');

export const validateParams = (schema: Joi.ObjectSchema) => 
  createValidationMiddleware(schema, 'params');

// Common validation schemas
export const commonSchemas = {
  // ID validation
  positiveId: Joi.number().positive().integer().required(),
  optionalPositiveId: Joi.number().positive().integer().optional(),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
  }),

  // Strings
  requiredString: (minLength = 1, maxLength = 255) =>
    Joi.string().trim().min(minLength).max(maxLength).required(),
  
  optionalString: (maxLength = 255) =>
    Joi.string().trim().max(maxLength).allow('', null).optional(),

  // Email
  email: Joi.string().email().required(),
  optionalEmail: Joi.string().email().optional(),

  // URLs
  url: Joi.string().uri().required(),
  optionalUrl: Joi.string().uri().allow('', null).optional(),

  // Dates
  isoDate: Joi.date().iso().required(),
  optionalIsoDate: Joi.date().iso().optional(),
  futureDate: Joi.date().iso().greater('now').required(),

  // Boolean
  boolean: Joi.boolean().required(),
  optionalBoolean: Joi.boolean().optional(),

  // Arrays
  stringArray: Joi.array().items(Joi.string().trim()).default([]),
  requiredStringArray: Joi.array().items(Joi.string().trim()).min(1).required(),

  // Enum validation factory
  enum: (values: string[]) => Joi.string().valid(...values).required(),
  optionalEnum: (values: string[]) => Joi.string().valid(...values).optional(),

  // Password
  password: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Username
  username: Joi.string().trim().min(3).max(30)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .message('Username can only contain letters, numbers, underscores, and hyphens')
    .required(),

  // Sort order
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),

  // JSON object
  jsonObject: Joi.object().unknown(true).optional(),
};

// Composite validation schemas
export const commonValidations = {
  // ID parameter
  idParam: Joi.object({
    id: commonSchemas.positiveId
  }),

  // Pagination query
  paginationQuery: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
  }),

  // Search with pagination
  searchWithPagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    search: commonSchemas.optionalString(200),
    sortBy: Joi.string().optional(),
    sortOrder: commonSchemas.sortOrder
  }),

  // Date range query
  dateRangeQuery: Joi.object({
    startDate: commonSchemas.optionalIsoDate,
    endDate: commonSchemas.optionalIsoDate
  }).custom((value, helpers) => {
    if (value.startDate && value.endDate) {
      if (new Date(value.startDate) > new Date(value.endDate)) {
        return helpers.error('date.range');
      }
    }
    return value;
  }).messages({
    'date.range': 'startDate must be before endDate'
  })
};

// Sanitization helpers
export const sanitize = {
  // Remove HTML tags
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>/g, '');
  },

  // Trim and normalize whitespace
  normalizeWhitespace: (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
  },

  // Sanitize filename
  sanitizeFilename: (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  },

  // Limit array size
  limitArray: <T>(arr: T[], maxLength: number): T[] => {
    return arr.slice(0, maxLength);
  }
};