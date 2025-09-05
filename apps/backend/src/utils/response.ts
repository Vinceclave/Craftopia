import { Response } from 'express';

export const sendSuccess = (
  res: Response, 
  data: any, 
  message?: string, 
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const sendError = (res: Response, message: string, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

export const sendPaginatedSuccess = (
  res: Response,
  data: any[],
  pagination: any,
  message?: string
) => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  });
};