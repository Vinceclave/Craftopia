// apps/backend/src/services/craft.service.ts
// ✅ ENHANCED: Title-based duplicate detection with full TypeScript safety

import prisma from "../config/prisma";
import { BaseService } from "./base.service";
import { ValidationError, NotFoundError, AppError } from "../utils/error";
import { logger } from "../utils/logger";
import { uploadBase64ToS3 } from "./s3.service";
import crypto from "crypto";
import { Prisma } from "../generated/prisma";

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

/**
 * ✅ Safely extract string array from Prisma Json field
 */
function extractStringArray(jsonValue: Prisma.JsonValue | null | undefined): string[] {
  if (!jsonValue) return [];
  
  if (Array.isArray(jsonValue)) {
    return jsonValue.filter((item): item is string => typeof item === 'string');
  }
  
  return [];
}

/**
 * ✅ Safely extract object from Prisma Json field
 */
function extractObject(jsonValue: Prisma.JsonValue | null | undefined): Record<string, any> {
  if (!jsonValue) return {};
  
  if (typeof jsonValue === 'object' && !Array.isArray(jsonValue) && jsonValue !== null) {
    return jsonValue as Record<string, any>;
  }
  
  return {};
}

/**
 * ✅ Create a unique hash from craft title and description
 * This helps detect duplicates even without idea_id
 */
function createCraftHash(title: string, description: string, materials: string[]): string {
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedDescription = description.toLowerCase().trim();
  const normalizedMaterials = materials.map(m => m.toLowerCase().trim()).sort().join(',');
  
  const hashString = `${normalizedTitle}|||${normalizedDescription}|||${normalizedMaterials}`;
  
  // Create SHA-256 hash
  return crypto.createHash('sha256').update(hashString).digest('hex').substring(0, 32);
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
   * ✅ ENHANCED: Save craft idea from base64 image with duplicate detection
   * Uses title + description + materials hash to detect duplicates
   */
  async saveCraftFromBase64(data: SaveCraftFromBase64Data) {
    this.validateId(data.user_id, 'User ID');

    if (!data.idea_json || typeof data.idea_json !== 'object') {
      throw new ValidationError('Valid idea_json is required');
    }

    // Extract title, description, and materials for hash
    const ideaJson = extractObject(data.idea_json as Prisma.JsonValue);
    const title = String(ideaJson.title || '');
    const description = String(ideaJson.description || '');
    
    // ✅ Safely convert materials to string array
    const materials = extractStringArray(data.recycled_materials as Prisma.JsonValue);

    if (!title.trim()) {
      throw new ValidationError('Craft title is required');
    }

    // ✅ Create unique hash from craft details
    const craftHash = createCraftHash(title, description, materials);

    logger.info('Saving craft with duplicate detection', { 
      userId: data.user_id,
      title,
      craftHash 
    });

    // ✅ Check for existing craft with same hash (duplicate detection)
    const existingCrafts = await prisma.craftIdea.findMany({
      where: {
        generated_by_user_id: data.user_id,
        deleted_at: null,
        is_saved: true
      }
    });

    // Check if any existing craft matches this hash
    for (const existingCraft of existingCrafts) {
      try {
        const existingIdeaJson = extractObject(existingCraft.idea_json);
        const existingTitle = String(existingIdeaJson.title || '');
        const existingDescription = String(existingIdeaJson.description || '');
        
        // ✅ Safely convert existing materials to string array
        const existingMaterials = extractStringArray(existingCraft.recycled_materials);

        const existingHash = createCraftHash(
          existingTitle,
          existingDescription,
          existingMaterials
        );

        if (existingHash === craftHash) {
          logger.warn('Duplicate craft detected', {
            userId: data.user_id,
            existingIdeaId: existingCraft.idea_id,
            craftHash
          });

          // Return the existing craft instead of creating duplicate
          return {
            ...existingCraft,
            isDuplicate: true,
            message: 'This craft has already been saved to your collection'
          };
        }
      } catch (hashError) {
        logger.error('Error computing hash for existing craft', { error: hashError });
        continue;
      }
    }

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
        idea_json: data.idea_json as Prisma.InputJsonValue,
        recycled_materials: data.recycled_materials as Prisma.InputJsonValue,
        generated_image_url: s3ImageUrl,
        is_saved: true,
      },
      include: {
        generated_by_user: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('New craft idea saved', { 
      ideaId: craftIdea.idea_id,
      craftHash 
    });

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
          ...(data.idea_json && { idea_json: data.idea_json as Prisma.InputJsonValue }),
          ...(data.recycled_materials && { recycled_materials: data.recycled_materials as Prisma.InputJsonValue })
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

    const [totalCrafts, recentCrafts, savedCrafts, craftsWithMaterials] = await Promise.all([
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
      }),
      prisma.craftIdea.findMany({
        where: {
          generated_by_user_id: userId,
          deleted_at: null
        },
        select: {
          recycled_materials: true
        }
      })
    ]);

    // Calculate total unique materials
    const allMaterials = new Set<string>();
    craftsWithMaterials.forEach(craft => {
      const materials = extractStringArray(craft.recycled_materials);
      materials.forEach(material => {
        if (material && material.trim()) {
          allMaterials.add(material.trim().toLowerCase());
        }
      });
    });

    return {
      totalCrafts,
      craftsThisMonth: recentCrafts,
      savedCrafts,
      totalMaterials: allMaterials.size,
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