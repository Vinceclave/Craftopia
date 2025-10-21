// apps/backend/src/services/base.service.ts - NEW FILE
import prisma from "../config/prisma";
import { 
  NotFoundError, 
  ValidationError, 
  ForbiddenError,
  handlePrismaError 
} from "../utils/error";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: any;
  where?: any;
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
    if (!id || id <= 0) {
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

    if (value.trim().length < minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${minLength} characters long`
      );
    }

    if (maxLength && value.trim().length > maxLength) {
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
    const resource = await model.findFirst({ where });
    
    if (!resource) {
      throw new NotFoundError(resourceName);
    }

    return resource;
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

  // Paginate results
  protected async paginate<T>(
    model: any,
    options: PaginationOptions
  ): Promise<PaginationResult<T>> {
    const { 
      page = 1, 
      limit = 10, 
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
    const resource = await model.findFirst({
      where: { ...where, deleted_at: null }
    });

    if (!resource) {
      throw new NotFoundError(resourceName);
    }

    return resource;
  }

  // Execute in transaction
  protected async executeTransaction<T>(
    callback: (tx: any) => Promise<T>
  ): Promise<T> {
    try {
      return await prisma.$transaction(callback);
    } catch (error: any) {
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
}