import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { sendError } from './response';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false, // Show all errors
      stripUnknown: true // Remove unknown fields
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return sendError(
        res, 
        error.details[0]?.message || 'Validation failed', 
        400, 
        details
      );
    }
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return sendError(
        res, 
        error.details[0]?.message || 'Query validation failed', 
        400, 
        details
      );
    }
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, { 
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return sendError(
        res, 
        error.details[0]?.message || 'Parameter validation failed', 
        400, 
        details
      );
    }
    next();
  };
};

// Common parameter schemas
export const commonSchemas = {
  positiveId: Joi.object({
    id: Joi.number().positive().required()
  }),
  
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
  }),
  
  optionalString: (maxLength = 255) => Joi.string().trim().max(maxLength).optional(),
  requiredString: (maxLength = 255) => Joi.string().trim().min(1).max(maxLength).required()
};