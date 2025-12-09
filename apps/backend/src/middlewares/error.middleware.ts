// apps/backend/src/middlewares/error.middleware.ts - COMPLETE VERSION
import { Request, Response, NextFunction } from "express";
import { 
  AppError, 
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  ExternalServiceError
} from "../utils/error";

// Error logger utility
const logError = (err: Error, req: Request) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.userId,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };

  console.error('❌ Error occurred:', JSON.stringify(errorLog, null, 2));
};

// Format error response
const formatErrorResponse = (err: AppError, includeStack: boolean = false) => {
  const response: any = {
    success: false,
    error: err.message,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };

  if (err.details) {
    response.details = err.details;
  }

  if (includeStack && err.stack) {
    response.stack = err.stack;
  }

  return response;
};

// Handle Prisma errors
const handlePrismaError = (error: any): AppError => {
  switch (error.code) {
    case 'P2002': {
      // Unique constraint violation
      const target = error.meta?.target || ['field'];
      const fields = Array.isArray(target) ? target.join(', ') : target;
      return new ConflictError(
        `Duplicate entry - ${fields} already exists`,
        { fields, code: error.code }
      );
    }
    case 'P2025':
      // Record not found
      return new NotFoundError('Resource');
    
    case 'P2003':
      // Foreign key constraint failed
      return new ValidationError('Foreign key constraint failed', {
        code: error.code,
        field: error.meta?.field_name
      });
    
    case 'P2011':
      // Null constraint violation
      return new ValidationError('Null constraint violation', {
        code: error.code,
        field: error.meta?.constraint
      });
    
    case 'P2014':
      // Invalid relation violation
      return new ValidationError('Invalid relation violation', {
        code: error.code
      });
    
    case 'P2015':
      // Related record not found
      return new NotFoundError('Related record');
    
    case 'P2021':
      // Table does not exist
      return new DatabaseError('Table does not exist', {
        code: error.code,
        table: error.meta?.table
      });
    
    case 'P2022':
      // Column does not exist
      return new DatabaseError('Column does not exist', {
        code: error.code,
        column: error.meta?.column
      });
    
    default:
      return new DatabaseError('Database operation failed', {
        code: error.code,
        message: error.message
      });
  }
};

// Handle JWT errors
const handleJWTError = (error: any): AppError => {

  if (error.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token expired');
  }
  if (error.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Invalid token');
  }
  if (error.name === 'NotBeforeError') {
    return new UnauthorizedError('Token not active yet');
  }
  return new UnauthorizedError('Authentication failed');
};

// Handle Multer errors
const handleMulterError = (error: any): AppError => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('File too large (max 10MB)', { 
      maxSize: '10MB',
      code: error.code 
    });
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new ValidationError('Too many files', { code: error.code });
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError('Unexpected file field', { code: error.code });
  }
  return new ValidationError('File upload failed', { 
    message: error.message,
    code: error.code 
  });
};

// Handle Joi validation errors
const handleJoiError = (error: any): AppError => {
  const details = error.details?.map((detail: any) => ({
    field: detail.path.join('.'),
    message: detail.message,
    type: detail.type,
    value: detail.context?.value
  }));

  return new ValidationError(
    error.details?.[0]?.message || 'Validation failed',
    details
  );
};

// Main error handler middleware
export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Log the error
  logError(err, req);

  const isDevelopment = process.env.NODE_ENV === 'development';

  // 1. Handle known operational errors (AppError and its subclasses)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json(
      formatErrorResponse(err, isDevelopment)
    );
  }

  // 2. Handle Prisma errors (database errors)
  if (err.code?.startsWith('P')) {
    const appError = handlePrismaError(err);
    return res.status(appError.statusCode).json(
      formatErrorResponse(appError, isDevelopment)
    );
  }

  // 3. Handle JWT errors
  if (err.name === 'JsonWebTokenError' || 
      err.name === 'TokenExpiredError' || 
      err.name === 'NotBeforeError') {
    const appError = handleJWTError(err);
    return res.status(appError.statusCode).json(
      formatErrorResponse(appError, false) // Never expose JWT details
    );
  }

  // 4. Handle Multer errors (file upload)
  if (err.code?.startsWith('LIMIT_')) {
    const appError = handleMulterError(err);
    return res.status(appError.statusCode).json(
      formatErrorResponse(appError, false)
    );
  }

  // 5. Handle Joi validation errors
  if (err.isJoi || err.name === 'ValidationError') {
    const appError = handleJoiError(err);
    return res.status(appError.statusCode).json(
      formatErrorResponse(appError, false)
    );
  }

  // 6. Handle rate limiting errors
  if (err.statusCode === 429 || err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    });
  }

  // 7. Handle database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    const dbError = new DatabaseError('Database connection failed', {
      code: err.code
    });
    return res.status(503).json(
      formatErrorResponse(dbError, false)
    );
  }

  // 8. Handle MongoDB/Mongoose errors (if you ever switch databases)
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    const dbError = new DatabaseError('Database operation failed', {
      code: err.code,
      name: err.name
    });
    return res.status(500).json(
      formatErrorResponse(dbError, isDevelopment)
    );
  }

  // 9. Handle syntax errors in JSON
  if (err instanceof SyntaxError && 'body' in err) {
    const validationError = new ValidationError('Invalid JSON in request body');
    return res.status(400).json(
      formatErrorResponse(validationError, false)
    );
  }

  // 10. Handle CORS errors
  if (err.message?.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      code: 'CORS_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // 11. Default error response for unknown errors
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 
    ? 'Internal Server Error' 
    : (err.message || 'An error occurred');

  const defaultError = new AppError(
    message,
    statusCode,
    'INTERNAL_ERROR',
    isDevelopment ? { 
      originalError: err.message,
      type: err.name 
    } : undefined,
    false // Not operational
  );

  return res.status(statusCode).json(
    formatErrorResponse(defaultError, isDevelopment)
  );
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Please check the API documentation for available endpoints'
  });
};

// Async error handler wrapper (alternative to asyncHandler utility)
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};