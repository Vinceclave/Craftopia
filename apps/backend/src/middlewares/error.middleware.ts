// apps/backend/src/middlewares/error.middleware.ts - ENHANCED VERSION
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle known operational errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    const target = err.meta?.target || 'field';
    return res.status(409).json({
      success: false,
      error: `Duplicate entry - ${Array.isArray(target) ? target.join(', ') : target} already exists`,
      code: 'DUPLICATE_ENTRY',
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found or has been deleted',
      code: 'RESOURCE_NOT_FOUND',
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      error: 'Foreign key constraint failed',
      code: 'FOREIGN_KEY_CONSTRAINT',
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'P2011') {
    return res.status(400).json({
      success: false,
      error: 'Null constraint violation',
      code: 'NULL_CONSTRAINT',
      timestamp: new Date().toISOString()
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
      timestamp: new Date().toISOString()
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.isJoi) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.details || undefined,
      timestamp: new Date().toISOString()
    });
  }

  // Handle multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large',
      code: 'FILE_TOO_LARGE',
      timestamp: new Date().toISOString()
    });
  }

  // Handle rate limiting errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    });
  }

  // Handle database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      code: 'DATABASE_CONNECTION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Handle AI service errors
  if (err.message && err.message.includes('API key')) {
    return res.status(500).json({
      success: false,
      error: 'AI service configuration error',
      code: 'AI_SERVICE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : (err.message || 'An error occurred');

  res.status(statusCode).json({
    success: false,
    error: message,
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};