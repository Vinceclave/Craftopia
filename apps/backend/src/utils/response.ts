import { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export const sendSuccess = (
  res: Response, 
  data: any, 
  message?: string, 
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message: message || undefined,
    data,
    timestamp: new Date().toISOString()
  });
};

export const sendError = (
  res: Response, 
  message: string, 
  statusCode = 400,
  details?: any
) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    details: details || undefined,
    timestamp: new Date().toISOString()
  });
};

export const sendPaginatedSuccess = (
  res: Response,
  data: any[],
  meta: PaginationMeta,
  message?: string,
  statusCode = 200
) => {
  // ✅ CORRECT FORMAT
  res.status(statusCode).json({
    success: true,
    message: message || undefined,
    data,  // Array of items
    meta,  // Pagination info
    timestamp: new Date().toISOString()
  });
};

// Helper to create pagination meta
export const createPaginationMeta = (
  total: number, 
  page: number, 
  limit: number
): PaginationMeta => {
  const lastPage = Math.max(1, Math.ceil(total / limit));
  
  return {
    total,
    page: Math.max(1, page),
    lastPage,
    limit: Math.max(1, limit),
    hasNextPage: page < lastPage,
    hasPrevPage: page > 1,
  };
};