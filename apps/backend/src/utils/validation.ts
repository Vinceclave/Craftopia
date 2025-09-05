import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { sendError } from './response';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return sendError(res, error.details[0].message, 400);
    }
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return sendError(res, error.details[0].message, 400);
    }
    next();
  };
};