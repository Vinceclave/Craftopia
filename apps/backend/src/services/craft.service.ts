import prisma from "../config/prisma";
import { AppError } from '../utils/error';

export const createCraftIdea = async (data: {
  generated_by_user_id?: number;
  idea_json: object;
  recycled_materials?: object;
}) => {
  if (!data.idea_json || typeof data.idea_json !== 'object') {
    throw new AppError('Valid idea_json is required', 400);
  }

  return await prisma.craftIdea.create({
    data,
    include: {
      generated_by_user: {
        select: { user_id: true, username: true }
      }
    }
  });
};

interface GetCraftIdeasOptions {
  page?: number;
  limit?: number;
  search?: string;
  material?: string;
  startDate?: string;
  endDate?: string;
  user_id?: number;
}

export const getCraftIdeas = async (options: GetCraftIdeasOptions) => {
  const {
    page = 1,
    limit = 10,
    search,
    material,
    startDate,
    endDate,
    user_id,
  } = options;

  if (page < 1) throw new AppError('Page must be greater than 0', 400);
  if (limit < 1 || limit > 100) throw new AppError('Limit must be between 1 and 100', 400);

  const skip = (page - 1) * limit;
  const where: any = { deleted_at: null };

  if (user_id) {
    if (user_id <= 0) throw new AppError('Invalid user ID', 400);
    where.generated_by_user_id = user_id;
  }

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) throw new AppError('Invalid start date format', 400);
      where.created_at.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) throw new AppError('Invalid end date format', 400);
      where.created_at.lte = end;
    }
  }

  if (search?.trim()) {
    where.OR = [
      { idea_json: { path: [], string_contains: search.trim() } },
      { recycled_materials: { path: [], string_contains: search.trim() } },
    ];
  }

  if (material?.trim()) {
    where.recycled_materials = {
      array_contains: [material.trim()],
    };
  }

  const [data, total] = await Promise.all([
    prisma.craftIdea.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { 
        generated_by_user: {
          select: { user_id: true, username: true }
        }
      },
    }),
    prisma.craftIdea.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
      limit,
    },
  };
};

export const getCraftIdeaById = async (idea_id: number) => {
  if (!idea_id || idea_id <= 0) {
    throw new AppError('Invalid craft idea ID', 400);
  }

  const craftIdea = await prisma.craftIdea.findFirst({
    where: { 
      idea_id,
      deleted_at: null 
    },
    include: { 
      generated_by_user: {
        select: { user_id: true, username: true }
      }
    },
  });

  if (!craftIdea) {
    throw new AppError('Craft idea not found', 404);
  }

  return craftIdea;
};

export const getCraftIdeasByUser = async (user_id: number) => {
  if (!user_id || user_id <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  return await prisma.craftIdea.findMany({
    where: { 
      generated_by_user_id: user_id, 
      deleted_at: null 
    },
    orderBy: { created_at: 'desc' },
    include: {
      generated_by_user: {
        select: { user_id: true, username: true }
      }
    }
  });
};

// FIXED: Use transaction for delete operations
export const deleteCraftIdea = async (idea_id: number, userId: number) => {
  if (!idea_id || idea_id <= 0) {
    throw new AppError('Invalid craft idea ID', 400);
  }

  return await prisma.$transaction(async (tx) => {
    const craftIdea = await tx.craftIdea.findFirst({
      where: { 
        idea_id,
        deleted_at: null 
      }
    });

    if (!craftIdea) {
      throw new AppError('Craft idea not found', 404);
    }

    if (craftIdea.generated_by_user_id !== userId) {
      throw new AppError('You can only delete your own craft ideas', 403);
    }

    return await tx.craftIdea.update({
      where: { idea_id },
      data: { deleted_at: new Date() },
    });
  });
};

export const countCraftIdeas = async (user_id?: number) => {
  const where: any = { deleted_at: null };
  if (user_id) {
    if (user_id <= 0) throw new AppError('Invalid user ID', 400);
    where.generated_by_user_id = user_id;
  }
  return await prisma.craftIdea.count({ where });
};

export const getRecentCraftIdeas = async (limit: number = 5) => {
  if (limit < 1 || limit > 50) {
    throw new AppError('Limit must be between 1 and 50', 400);
  }

  return await prisma.craftIdea.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
      generated_by_user: {
        select: { user_id: true, username: true }
      }
    }
  });
};