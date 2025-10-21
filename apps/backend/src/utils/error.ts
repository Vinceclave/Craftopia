export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 400,
    code?: string,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes for better error handling
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden - insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `${service} service unavailable`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      { service }
    );
  }
}

// Error factory functions
export const createValidationError = (message: string, details?: any) => {
  throw new ValidationError(message, details);
};

export const createNotFoundError = (resource: string) => {
  throw new NotFoundError(resource);
};

export const createUnauthorizedError = (message?: string) => {
  throw new UnauthorizedError(message);
};

export const createForbiddenError = (message?: string) => {
  throw new ForbiddenError(message);
};

export const createConflictError = (message: string, details?: any) => {
  throw new ConflictError(message, details);
};

// Prisma error handler
export const handlePrismaError = (error: any): AppError => {
  switch (error.code) {
    case 'P2002': {
      const target = error.meta?.target || ['field'];
      const fields = Array.isArray(target) ? target.join(', ') : target;
      return new ConflictError(
        `Duplicate entry - ${fields} already exists`,
        { fields, code: error.code }
      );
    }
    case 'P2025':
      return new NotFoundError('Resource');
    case 'P2003':
      return new ValidationError('Foreign key constraint failed');
    case 'P2011':
      return new ValidationError('Null constraint violation');
    case 'P2014':
      return new ValidationError('Invalid relation violation');
    default:
      return new DatabaseError('Database operation failed', {
        code: error.code,
        message: error.message
      });
  }
};

// JWT error handler
export const handleJWTError = (error: any): AppError => {
  if (error.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token expired');
  }
  if (error.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Invalid token');
  }
  return new UnauthorizedError('Authentication failed');
};