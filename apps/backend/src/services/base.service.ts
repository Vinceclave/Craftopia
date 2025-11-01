// apps/backend/src/services/base.service.ts - ENHANCED VERSION

import prisma from "../config/prisma";
import { 
  NotFoundError, 
  ValidationError, 
  ForbiddenError,
  handlePrismaError 
} from "../utils/error";
import { logger } from "../utils/logger";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: any;
  where?: any;
  include?: any;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export abstract class BaseService {
  // Validate ID
  protected validateId(id: number, resourceName: string = 'ID'): void {
    if (!id || id <= 0 || !Number.isInteger(id)) {
      throw new ValidationError(`Invalid ${resourceName}`);
    }
  }

  // Validate required string
  protected validateRequiredString(
    value: string | undefined | null, 
    fieldName: string,
    minLength: number = 1,
    maxLength?: number
  ): void {
    if (!value?.trim()) {
      throw new ValidationError(`${fieldName} is required`);
    }

    const trimmed = value.trim();

    if (trimmed.length < minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${minLength} characters long`
      );
    }

    if (maxLength && trimmed.length > maxLength) {
      throw new ValidationError(
        `${fieldName} cannot exceed ${maxLength} characters`
      );
    }
  }

  // Check resource existence
  protected async checkResourceExists(
    model: any,
    where: any,
    resourceName: string = 'Resource'
  ): Promise<any> {
    try {
      const resource = await model.findFirst({ where });
      
      if (!resource) {
        throw new NotFoundError(resourceName);
      }

      return resource;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw handlePrismaError(error);
    }
  }

  // Check ownership
  protected checkOwnership(
    resourceUserId: number,
    currentUserId: number,
    resourceName: string = 'resource'
  ): void {
    if (resourceUserId !== currentUserId) {
      throw new ForbiddenError(`You can only modify your own ${resourceName}`);
    }
  }

  // Check admin or ownership
  protected checkAdminOrOwnership(
    resourceUserId: number,
    currentUserId: number,
    isAdmin: boolean,
    resourceName: string = 'resource'
  ): void {
    if (!isAdmin && resourceUserId !== currentUserId) {
      throw new ForbiddenError(`You can only modify your own ${resourceName}`);
    }
  }

  // Paginate results
  protected async paginate<T>(
    model: any,
    options: PaginationOptions
  ): Promise<PaginationResult<T>> {
    const { 
      page = 1, 
      limit = 10, 
      include,
      orderBy = { created_at: 'desc' }, 
      where = {} 
    } = options;

    // Validate pagination params
    if (page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        model.findMany({
          where,
          skip,
          include,
          take: limit,
          orderBy,
        }),
        model.count({ where }),
      ]);

      const lastPage = Math.max(1, Math.ceil(total / limit));

      return {
        data,
        meta: {
          total,
          page,
          lastPage,
          limit,
          hasNextPage: page < lastPage,
          hasPrevPage: page > 1,
        },
      };
    } catch (error: any) {
      throw handlePrismaError(error);
    }
  }

  // Soft delete
  protected async softDelete(
    model: any,
    id: number,
    idField: string = 'id'
  ): Promise<any> {
    try {
      logger.debug('Soft deleting resource', { id, idField });
      
      return await model.update({
        where: { [idField]: id },
        data: { deleted_at: new Date() },
      });
    } catch (error: any) {
      throw handlePrismaError(error);
    }
  }

  // Check if soft deleted
  protected async checkNotDeleted(
    model: any,
    where: any,
    resourceName: string = 'Resource'
  ): Promise<any> {
    try {
      const resource = await model.findFirst({
        where: { ...where, deleted_at: null }
      });

      if (!resource) {
        throw new NotFoundError(resourceName);
      }

      return resource;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw handlePrismaError(error);
    }
  }

  // Execute in transaction
  protected async executeTransaction<T>(
    callback: (tx: any) => Promise<T>
  ): Promise<T> {
    try {
      logger.debug('Starting transaction');
      
      const result = await prisma.$transaction(callback);
      
      logger.debug('Transaction completed successfully');
      
      return result;
    } catch (error: any) {
      logger.error('Transaction failed', error);
      throw handlePrismaError(error);
    }
  }

  // Validate enum value
  protected validateEnum(
    value: string,
    enumObject: any,
    fieldName: string
  ): void {
    if (!Object.values(enumObject).includes(value)) {
      throw new ValidationError(
        `Invalid ${fieldName}. Allowed values: ${Object.values(enumObject).join(', ')}`
      );
    }
  }

  // Validate email format
  protected validateEmail(email: string | undefined | null, fieldName: string = 'Email'): void {
    if (!email?.trim()) {
      throw new ValidationError(`${fieldName} is required`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new ValidationError(`Invalid ${fieldName} format`);
    }
  }

  // Validate URL format
  protected validateUrl(url: string | undefined | null, fieldName: string = 'URL'): void {
    if (!url?.trim()) {
      throw new ValidationError(`${fieldName} is required`);
    }

    try {
      new URL(url.trim());
    } catch {
      throw new ValidationError(`Invalid ${fieldName} format`);
    }
  }

  // Validate date range
  protected validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new ValidationError('Start date must be before end date');
    }
  }

  // Validate positive number
  protected validatePositiveNumber(
    value: number | undefined | null,
    fieldName: string,
    max?: number
  ): void {
    if (value === undefined || value === null) {
      throw new ValidationError(`${fieldName} is required`);
    }

    if (value <= 0) {
      throw new ValidationError(`${fieldName} must be greater than 0`);
    }

    if (max && value > max) {
      throw new ValidationError(`${fieldName} cannot exceed ${max}`);
    }
  }

  // Sanitize HTML content
  protected sanitizeHtml(html: string): string {
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }

  // Format error for logging
  protected formatError(error: any): any {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}