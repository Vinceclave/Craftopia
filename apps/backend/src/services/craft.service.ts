// apps/backend/src/services/craft.service.ts

import prisma from "../config/prisma";
import { BaseService } from "./base.service";
import { ValidationError, NotFoundError } from "../utils/error";
import { logger } from "../utils/logger";
import { uploadBase64ToS3 } from "./s3.service";

interface CreateCraftIdeaData {
  generated_by_user_id?: number;
  idea_json: object;
  recycled_materials?: object;
  generated_image_url?: string;
}

interface SaveCraftFromBase64Data {
  user_id: number;
  idea_json: object;
  recycled_materials?: object;
  base64_image?: string;
}

interface GetCraftIdeasOptions {
  page?: number;
  limit?: number;
  search?: string;
  material?: string;
  startDate?: string;
  endDate?: string;
  user_id?: number;
}

class CraftService extends BaseService {
  // Create craft idea
  async createCraftIdea(data: CreateCraftIdeaData) {
    if (!data.idea_json || typeof data.idea_json !== 'object') {
      throw new ValidationError('Valid idea_json is required');
    }

    if (data.generated_by_user_id) {
      this.validateId(data.generated_by_user_id, 'User ID');
    }

    logger.info('Creating craft idea', { 
      userId: data.generated_by_user_id,
      hasMaterials: !!data.recycled_materials 
    });

    const craftIdea = await prisma.craftIdea.create({
      data,
      include: {
        generated_by_user: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Craft idea created', { 
      ideaId: craftIdea.idea_id,
      userId: data.generated_by_user_id 
    });

    return craftIdea;
  }

  /**
   * ✅ Save craft idea from base64 image
   * This uploads the image to S3 first, then saves to DB
   */
  async saveCraftFromBase64(data: SaveCraftFromBase64Data) {
    this.validateId(data.user_id, 'User ID');

    if (!data.idea_json || typeof data.idea_json !== 'object') {
      throw new ValidationError('Valid idea_json is required');
    }

    logger.info('Saving craft with base64 image', { userId: data.user_id });

    let s3ImageUrl: string | undefined;

    // ✅ Upload base64 image to S3 if provided
    if (data.base64_image) {
      try {
        console.log('📤 Uploading image to S3...');
        s3ImageUrl = await uploadBase64ToS3(data.base64_image, 'crafts');
        console.log('✅ Image uploaded to S3');
      } catch (uploadError: any) {
        console.error('❌ S3 upload failed:', uploadError.message);
        // Continue without image if upload fails
      }
    }

    // Save to database with S3 URL
    const craftIdea = await prisma.craftIdea.create({
      data: {
        generated_by_user_id: data.user_id,
        idea_json: data.idea_json,
        recycled_materials: data.recycled_materials,
        generated_image_url: s3ImageUrl, // ✅ S3 URL or undefined
        is_saved: true, // ✅ Set to true since user is saving it
      },
      include: {
        generated_by_user: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Craft idea saved', { ideaId: craftIdea.idea_id });

    return craftIdea;
  }

  // Get craft ideas with filtering and pagination
  async getCraftIdeas(options: GetCraftIdeasOptions) {
    const {
      page = 1,
      limit = 10,
      search,
      material,
      startDate,
      endDate,
      user_id,
    } = options;

    logger.debug('Fetching craft ideas', { 
      page, 
      limit, 
      search, 
      material, 
      userId: user_id 
    });

    const where: any = { deleted_at: null };

    // Filter by user
    if (user_id) {
      this.validateId(user_id, 'User ID');
      where.generated_by_user_id = user_id;
    }

    // Date range filter
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          throw new ValidationError('Invalid start date format');
        }
        where.created_at.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          throw new ValidationError('Invalid end date format');
        }
        where.created_at.lte = end;
      }
    }

    // Search filter
    if (search?.trim()) {
      where.OR = [
        { idea_json: { path: [], string_contains: search.trim() } },
        { recycled_materials: { path: [], string_contains: search.trim() } },
      ];
    }

    // Material filter
    if (material?.trim()) {
      where.recycled_materials = {
        array_contains: [material.trim()],
      };
    }

    return this.paginate(prisma.craftIdea, {
      page,
      limit,
      where,
      orderBy: { created_at: 'desc' }
    });
  }

  // Get craft idea by ID
  async getCraftIdeaById(ideaId: number) {
    this.validateId(ideaId, 'Craft Idea ID');

    logger.debug('Fetching craft idea', { ideaId });

    const craftIdea = await this.checkNotDeleted(
      prisma.craftIdea,
      { idea_id: ideaId },
      'Craft idea'
    );

    return craftIdea;
  }

  // Get craft ideas by user
  async getCraftIdeasByUser(userId: number) {
    this.validateId(userId, 'User ID');

    logger.debug('Fetching craft ideas by user', { userId });

    return prisma.craftIdea.findMany({
      where: { 
        generated_by_user_id: userId, 
        deleted_at: null 
      },
      orderBy: { created_at: 'desc' },
      include: {
        generated_by_user: {
          select: { user_id: true, username: true }
        }
      }
    });
  }

  // Delete craft idea
  async deleteCraftIdea(ideaId: number, userId: number) {
    this.validateId(ideaId, 'Craft Idea ID');
    this.validateId(userId, 'User ID');

    logger.info('Deleting craft idea', { ideaId, userId });

    return await this.executeTransaction(async (tx) => {
      const craftIdea = await tx.craftIdea.findFirst({
        where: { 
          idea_id: ideaId,
          deleted_at: null 
        }
      });

      if (!craftIdea) {
        throw new NotFoundError('Craft idea');
      }

      this.checkOwnership(
        craftIdea.generated_by_user_id!,
        userId,
        'craft ideas'
      );

      const deleted = await tx.craftIdea.update({
        where: { idea_id: ideaId },
        data: { deleted_at: new Date() }
      });

      logger.info('Craft idea deleted', { ideaId });

      return deleted;
    });
  }

  // Count craft ideas
  async countCraftIdeas(userId?: number) {
    const where: any = { deleted_at: null };
    
    if (userId) {
      this.validateId(userId, 'User ID');
      where.generated_by_user_id = userId;
    }

    return prisma.craftIdea.count({ where });
  }

  // Get recent craft ideas
  async getRecentCraftIdeas(limit: number = 5) {
    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }

    logger.debug('Fetching recent craft ideas', { limit });

    return prisma.craftIdea.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        generated_by_user: {
          select: { user_id: true, username: true }
        }
      }
    });
  }

  // Update craft idea
  async updateCraftIdea(
    ideaId: number, 
    userId: number, 
    data: { idea_json?: object; recycled_materials?: object }
  ) {
    this.validateId(ideaId, 'Craft Idea ID');
    this.validateId(userId, 'User ID');

    if (data.idea_json && typeof data.idea_json !== 'object') {
      throw new ValidationError('Invalid idea_json format');
    }

    logger.info('Updating craft idea', { ideaId, userId });

    return await this.executeTransaction(async (tx) => {
      const craftIdea = await tx.craftIdea.findFirst({
        where: { 
          idea_id: ideaId,
          deleted_at: null 
        }
      });

      if (!craftIdea) {
        throw new NotFoundError('Craft idea');
      }

      this.checkOwnership(
        craftIdea.generated_by_user_id!,
        userId,
        'craft ideas'
      );

      const updated = await tx.craftIdea.update({
        where: { idea_id: ideaId },
        data: {
          ...(data.idea_json && { idea_json: data.idea_json }),
          ...(data.recycled_materials && { recycled_materials: data.recycled_materials })
        },
        include: {
          generated_by_user: {
            select: { user_id: true, username: true }
          }
        }
      });

      logger.info('Craft idea updated', { ideaId });

      return updated;
    });
  }

  /**
   * ✅ Toggle save/unsave craft idea (for already-saved crafts)
   */
  async toggleSaveCraft(ideaId: number, userId: number) {
    this.validateId(ideaId, 'Craft Idea ID');
    this.validateId(userId, 'User ID');

    logger.info('Toggling saved craft', { ideaId, userId });

    return await this.executeTransaction(async (tx) => {
      const craftIdea = await tx.craftIdea.findFirst({
        where: { 
          idea_id: ideaId,
          deleted_at: null 
        }
      });

      if (!craftIdea) {
        throw new NotFoundError('Craft idea');
      }

      this.checkOwnership(
        craftIdea.generated_by_user_id!,
        userId,
        'craft ideas'
      );

      const newSavedState = !craftIdea.is_saved;

      const updated = await tx.craftIdea.update({
        where: { idea_id: ideaId },
        data: { is_saved: newSavedState }
      });

      logger.info('Craft save toggled', { 
        ideaId, 
        userId, 
        isSaved: newSavedState 
      });

      return {
        isSaved: newSavedState,
        craftIdea: updated
      };
    });
  }

  /**
   * ✅ Get saved craft ideas for a user
   */
  async getSavedCraftIdeas(userId: number, page = 1, limit = 10) {
    this.validateId(userId, 'User ID');

    logger.debug('Fetching saved craft ideas', { userId, page, limit });

    return this.paginate(prisma.craftIdea, {
      page,
      limit,
      where: {
        generated_by_user_id: userId,
        is_saved: true,
        deleted_at: null
      },
      orderBy: { created_at: 'desc' },
      include: {
        generated_by_user: {
          select: { user_id: true, username: true }
        }
      }
    });
  }

  /**
   * ✅ Get user craft statistics
   */
  async getUserCraftStats(userId: number) {
    this.validateId(userId, 'User ID');

    const [totalCrafts, recentCrafts, savedCrafts] = await Promise.all([
      prisma.craftIdea.count({
        where: { 
          generated_by_user_id: userId,
          deleted_at: null 
        }
      }),
      prisma.craftIdea.count({
        where: { 
          generated_by_user_id: userId,
          deleted_at: null,
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.craftIdea.count({
        where: { 
          generated_by_user_id: userId,
          is_saved: true,
          deleted_at: null 
        }
      })
    ]);

    return {
      totalCrafts,
      craftsThisMonth: recentCrafts,
      savedCrafts
    };
  }
}

// Export singleton instance
export const craftService = new CraftService();

// Export individual functions for backward compatibility
export const createCraftIdea = craftService.createCraftIdea.bind(craftService);
export const saveCraftFromBase64 = craftService.saveCraftFromBase64.bind(craftService);
export const getCraftIdeas = craftService.getCraftIdeas.bind(craftService);
export const getCraftIdeaById = craftService.getCraftIdeaById.bind(craftService);
export const getCraftIdeasByUser = craftService.getCraftIdeasByUser.bind(craftService);
export const deleteCraftIdea = craftService.deleteCraftIdea.bind(craftService);
export const countCraftIdeas = craftService.countCraftIdeas.bind(craftService);
export const getRecentCraftIdeas = craftService.getRecentCraftIdeas.bind(craftService);
export const updateCraftIdea = craftService.updateCraftIdea.bind(craftService);
export const toggleSaveCraft = craftService.toggleSaveCraft.bind(craftService);
export const getSavedCraftIdeas = craftService.getSavedCraftIdeas.bind(craftService);
export const getUserCraftStats = craftService.getUserCraftStats.bind(craftService);