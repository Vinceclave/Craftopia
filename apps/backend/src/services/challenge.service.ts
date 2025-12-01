// apps/backend/src/services/challenge.service.ts - REFACTORED VERSION
import prisma from "../config/prisma";
import { MaterialType, ChallengeCategory, ChallengeSource, ChallengeStatus } from "@prisma/client";
import { BaseService } from "./base.service";
import { ValidationError, NotFoundError } from "../utils/error";
import { VALIDATION_LIMITS, POINTS } from "../constats";
import { logger } from "../utils/logger";
import { WebSocketEmitter } from "../websocket/events";
import { generateChallenge } from "../ai/services/challenges.service"; // Import real AI service

interface CreateChallengeData {
  title: string;
  description: string;
  points_reward: number;
  waste_kg?: number; // Optional waste_kg
  material_type: string;
  created_by_admin_id: number | null;
  category: ChallengeCategory;
}

class ChallengeService extends BaseService {
  // Create challenge
  async createChallenge(data: CreateChallengeData) {
    // Validate inputs
    this.validateRequiredString(
      data.title,
      'Challenge title',
      VALIDATION_LIMITS.CHALLENGE.TITLE_MIN,
      VALIDATION_LIMITS.CHALLENGE.TITLE_MAX
    );
    this.validateRequiredString(
      data.description,
      'Challenge description',
      VALIDATION_LIMITS.CHALLENGE.DESCRIPTION_MIN,
      VALIDATION_LIMITS.CHALLENGE.DESCRIPTION_MAX
    );

    if (data.points_reward < POINTS.CHALLENGE.MIN || data.points_reward > POINTS.CHALLENGE.MAX) {
      throw new ValidationError(
        `Points reward must be between ${POINTS.CHALLENGE.MIN} and ${POINTS.CHALLENGE.MAX}`
      );
    }

    this.validateEnum(data.material_type, MaterialType, 'material_type');
    this.validateEnum(data.category, ChallengeCategory, 'category');

    logger.info('Creating challenge', {
      title: data.title,
      category: data.category,
      adminId: data.created_by_admin_id
    });

    const challenge = await prisma.ecoChallenge.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        points_reward: data.points_reward,
        waste_kg: data.waste_kg || 0, // Save waste_kg
        material_type: data.material_type as MaterialType,
        category: data.category,
        source: data.created_by_admin_id ? ChallengeSource.admin : ChallengeSource.ai,
        created_by_admin_id: data.created_by_admin_id,
      },
      include: {
        created_by_admin: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Challenge created successfully', {
      challengeId: challenge.challenge_id
    });
    // 🔥 WEBSOCKET: Broadcast new challenge to all users
    WebSocketEmitter.challengeCreated({
      challenge_id: challenge.challenge_id,
      title: challenge.title,
      description: challenge.description,
      points_reward: challenge.points_reward,
      material_type: challenge.material_type,
      category: challenge.category,
      created_by: challenge.created_by_admin?.username || 'AI'
    });
    return challenge;
  }

  // Generate and save AI challenge
  async generateAndSaveChallenge(category: ChallengeCategory, adminId?: number) {
    this.validateEnum(category, ChallengeCategory, 'category');

    logger.info('Generating AI challenge', { category, adminId });

    // Call real AI service
    const aiChallenges = await generateChallenge(category);

    // We'll save all of them and return the first one to the controller for response.
    const savedChallenges = [];

    for (const aiChallenge of aiChallenges) {
      const saved = await this.createChallenge({
        title: aiChallenge.title,
        description: aiChallenge.description,
        points_reward: aiChallenge.points_reward,
        waste_kg: aiChallenge.waste_kg,
        material_type: aiChallenge.material_type,
        category: aiChallenge.category as ChallengeCategory,
        created_by_admin_id: null, // AI generated
      });
      savedChallenges.push(saved);
    }

    return savedChallenges[0];
  }

  // Get all challenges with filtering
  async getAllChallenges(options: {
    category?: string;
    includeInactive?: boolean;
  }) {
    const { category, includeInactive = true } = options; // DEFAULT: show all

    logger.debug('Fetching all challenges', { category, includeInactive });

    // ✅ CRITICAL: Only filter by deleted_at
    const where: any = {
      deleted_at: null
    };

    // Optionally filter by category
    if (category?.trim()) {
      where.category = category.trim();
    }

    // Only filter by active status if explicitly requested
    if (!includeInactive) {
      where.is_active = true;
      where.OR = [
        { expires_at: null },
        { expires_at: { gt: new Date() } }
      ];
    }

    const challenges = await prisma.ecoChallenge.findMany({
      where,
      include: {
        created_by_admin: {
          select: {
            user_id: true,
            username: true
          }
        },
        _count: {
          select: {
            participants: {
              where: {
                deleted_at: null // Only count non-deleted participants
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return challenges;
  }


  // Get challenge by ID
  async getChallengeById(challengeId: number, userId?: number) {
    this.validateId(challengeId, 'Challenge ID');

    logger.debug('Fetching challenge by ID', { challengeId, userId });

    const challenge = await this.checkNotDeleted(
      prisma.ecoChallenge,
      { challenge_id: challengeId },
      'Challenge'
    );

    // Get participants
    const participants = await prisma.userChallenge.findMany({
      where: {
        challenge_id: challengeId,
        deleted_at: null
      },
      include: {
        user: {
          select: { user_id: true, username: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    // Count total participants
    const participantCount = await prisma.userChallenge.count({
      where: {
        challenge_id: challengeId,
        deleted_at: null
      }
    });

    // Check if current user has joined
    let isJoined = false;
    if (userId) {
      const userChallenge = await prisma.userChallenge.findFirst({
        where: {
          user_id: userId,
          challenge_id: challengeId,
          deleted_at: null
        }
      });
      isJoined = !!userChallenge;
    }

    return {
      ...challenge,
      participants,
      participantCount,
      isJoined
    };
  }

  // Update challenge
  async updateChallenge(challengeId: number, data: Partial<CreateChallengeData>) {
    this.validateId(challengeId, 'Challenge ID');

    await this.checkNotDeleted(
      prisma.ecoChallenge,
      { challenge_id: challengeId },
      'Challenge'
    );

    // Validate if updating specific fields
    if (data.title !== undefined) {
      this.validateRequiredString(
        data.title,
        'Challenge title',
        VALIDATION_LIMITS.CHALLENGE.TITLE_MIN,
        VALIDATION_LIMITS.CHALLENGE.TITLE_MAX
      );
    }

    if (data.description !== undefined) {
      this.validateRequiredString(
        data.description,
        'Challenge description',
        VALIDATION_LIMITS.CHALLENGE.DESCRIPTION_MIN,
        VALIDATION_LIMITS.CHALLENGE.DESCRIPTION_MAX
      );
    }

    if (data.points_reward !== undefined) {
      if (data.points_reward < POINTS.CHALLENGE.MIN || data.points_reward > POINTS.CHALLENGE.MAX) {
        throw new ValidationError(
          `Points reward must be between ${POINTS.CHALLENGE.MIN} and ${POINTS.CHALLENGE.MAX}`
        );
      }
    }

    logger.info('Updating challenge', { challengeId, updates: Object.keys(data) });

    const updated = await prisma.ecoChallenge.update({
      where: { challenge_id: challengeId },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.description && { description: data.description.trim() }),
        ...(data.points_reward && { points_reward: data.points_reward }),
        ...(data.waste_kg !== undefined && { waste_kg: data.waste_kg }), // Update waste_kg
        ...(data.material_type && { material_type: data.material_type as MaterialType }),
        ...(data.category && { category: data.category }),
      },
      include: {
        created_by_admin: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Challenge updated successfully', { challengeId });
    // 🔥 WEBSOCKET: Notify all users of challenge update
    WebSocketEmitter.challengeCreated({
      challenge_id: updated.challenge_id,
      title: updated.title,
      description: updated.description,
      points_reward: updated.points_reward,
      material_type: updated.material_type,
      category: updated.category,
      isUpdate: true
    });

    return updated;
  }

  // Delete challenge (soft delete)
  async deleteChallenge(challengeId: number) {
    this.validateId(challengeId, 'Challenge ID');

    await this.checkNotDeleted(
      prisma.ecoChallenge,
      { challenge_id: challengeId },
      'Challenge'
    );

    logger.info('Deleting challenge', { challengeId });

    WebSocketEmitter.broadcast('challenge:deleted', {
      challengeId,
      message: 'A challenge has been removed'
    });
    return this.softDelete(prisma.ecoChallenge, challengeId, 'challenge_id');
  }

  // Toggle challenge active status
  async toggleActiveStatus(challengeId: number) {
    this.validateId(challengeId, 'Challenge ID');

    const challenge = await this.checkNotDeleted(
      prisma.ecoChallenge,
      { challenge_id: challengeId },
      'Challenge'
    );

    logger.info('Toggling challenge status', {
      challengeId,
      currentStatus: challenge.is_active
    });

    return prisma.ecoChallenge.update({
      where: { challenge_id: challengeId },
      data: { is_active: !challenge.is_active }
    });
  }

  // Get challenges by category
  async getChallengesByCategory(category: ChallengeCategory, page = 1, limit = 10) {
    this.validateEnum(category, ChallengeCategory, 'category');

    return this.paginate(prisma.ecoChallenge, {
      page,
      limit,
      where: {
        category,
        is_active: true,
        deleted_at: null
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // Get active challenges count
  async getActiveChallengesCount() {
    return prisma.ecoChallenge.count({
      where: {
        is_active: true,
        deleted_at: null,
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } }
        ]
      }
    });
  }

  // Private: Mark expired challenges as inactive
  private async markExpiredChallengesInactive() {
    const now = new Date();

    const result = await prisma.ecoChallenge.updateMany({
      where: {
        expires_at: { lt: now },
        is_active: true,
        deleted_at: null
      },
      data: { is_active: false }
    });

    if (result.count > 0) {
      logger.info('Marked expired challenges as inactive', { count: result.count });
    }

    return result;
  }

  /**
  * Get challenge options for user to choose from
  * Returns challenges user hasn't joined yet
  */
  async getChallengeOptions(
    userId: number,
    category?: string,
    limit: number = 5
  ) {
    this.validateId(userId, 'User ID');

    if (limit < 1 || limit > 20) {
      throw new ValidationError('Limit must be between 1 and 20');
    }

    logger.debug('Fetching challenge options', { userId, category, limit });

    // Get challenges user has already joined or skipped
    const userChallengeIds = await prisma.userChallenge.findMany({
      where: {
        user_id: userId,
        deleted_at: null
      },
      select: { challenge_id: true }
    });

    const excludeIds = userChallengeIds.map(uc => uc.challenge_id);

    // Build where clause
    const where: any = {
      is_active: true,
      deleted_at: null,
      challenge_id: { notIn: excludeIds },
      OR: [
        { expires_at: null },
        { expires_at: { gt: new Date() } }
      ]
    };

    if (category && category !== 'all') {
      this.validateEnum(category, ChallengeCategory, 'category');
      where.category = category;
    }

    // Get options
    const options = await prisma.ecoChallenge.findMany({
      where,
      take: limit,
      orderBy: [
        { created_at: 'desc' },
        { points_reward: 'asc' } // Show easier challenges first
      ],
      include: {
        created_by_admin: {
          select: { user_id: true, username: true }
        },
        _count: {
          select: {
            participants: {
              where: { deleted_at: null }
            }
          }
        }
      }
    });

    logger.info('Challenge options retrieved', {
      userId,
      category,
      count: options.length
    });

    return {
      options,
      total: options.length,
      category: category || 'all',
      message: options.length === 0
        ? 'No new challenges available. Check back later!'
        : `Pick a challenge that fits your schedule!`
    };
  }

  async getChallengeStats() {
    const [total, active, aiGenerated, adminCreated] = await Promise.all([
      prisma.ecoChallenge.count({
        where: { deleted_at: null }
      }),
      prisma.ecoChallenge.count({
        where: { is_active: true, deleted_at: null }
      }),
      prisma.ecoChallenge.count({
        where: { source: ChallengeSource.ai, deleted_at: null }
      }),
      prisma.ecoChallenge.count({
        where: { source: ChallengeSource.admin, deleted_at: null }
      })
    ]);

    const pending = await prisma.userChallenge.count({
      where: {
        status: ChallengeStatus.pending_verification,
        deleted_at: null
      }
    });

    return {
      total,
      active,
      aiGenerated,
      adminCreated,
      pending
    };
  }

  /**
   * Get personalized challenge recommendations based on user history
   */
  async getRecommendedChallenges(userId: number, limit: number = 5) {
    this.validateId(userId, 'User ID');

    logger.debug('Fetching recommended challenges', { userId, limit });

    // Get user's completed challenges
    const completedChallenges = await prisma.userChallenge.findMany({
      where: {
        user_id: userId,
        status: ChallengeStatus.completed,
        deleted_at: null
      },
      include: { challenge: true },
      orderBy: { verified_at: 'desc' },
      take: 20
    });

    // Analyze user preferences
    const materialCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    completedChallenges.forEach(uc => {
      const material = uc.challenge.material_type;
      const category = uc.challenge.category;

      materialCounts[material] = (materialCounts[material] || 0) + 1;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Get top preferences
    const topMaterial = Object.entries(materialCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as MaterialType | undefined;

    const topCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as ChallengeCategory | undefined;

    // Get challenges user hasn't joined
    const userChallengeIds = await prisma.userChallenge.findMany({
      where: { user_id: userId, deleted_at: null },
      select: { challenge_id: true }
    });

    const excludeIds = userChallengeIds.map(uc => uc.challenge_id);

    // Build recommendation query
    const where: any = {
      is_active: true,
      deleted_at: null,
      challenge_id: { notIn: excludeIds },
      OR: [
        { expires_at: null },
        { expires_at: { gt: new Date() } }
      ]
    };

    // Prefer user's favorite material and category
    if (topMaterial) {
      where.material_type = topMaterial;
    }
    if (topCategory) {
      where.category = topCategory;
    }

    const recommendations = await prisma.ecoChallenge.findMany({
      where,
      take: limit,
      orderBy: { created_at: 'desc' }
    });

    // If not enough recommendations with preferences, add random ones
    if (recommendations.length < limit) {
      const additional = await prisma.ecoChallenge.findMany({
        where: {
          is_active: true,
          deleted_at: null,
          challenge_id: {
            notIn: [
              ...excludeIds,
              ...recommendations.map(r => r.challenge_id)
            ]
          },
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } }
          ]
        },
        take: limit - recommendations.length,
        orderBy: { created_at: 'desc' }
      });

      recommendations.push(...additional);
    }

    logger.info('Recommendations generated', {
      userId,
      count: recommendations.length,
      topMaterial,
      topCategory
    });

    return {
      recommendations,
      reason: topMaterial
        ? `Based on your ${topMaterial} challenge history`
        : 'Recommended for you',
      preferences: {
        topMaterial,
        topCategory,
        completedCount: completedChallenges.length
      }
    };
  }
}

// Export singleton instance
export const challengeService = new ChallengeService();

// Export individual functions for backward compatibility
export const createChallenge = challengeService.createChallenge.bind(challengeService);
export const generateAndSaveChallenge = challengeService.generateAndSaveChallenge.bind(challengeService);
export const getChallengeStats = challengeService.getChallengeStats.bind(challengeService);
export const getAllChallenges = challengeService.getAllChallenges.bind(challengeService);
export const getChallengeById = challengeService.getChallengeById.bind(challengeService);
export const updateChallenge = challengeService.updateChallenge.bind(challengeService);
export const deleteChallenge = challengeService.deleteChallenge.bind(challengeService);
export const toggleActiveStatus = challengeService.toggleActiveStatus.bind(challengeService);
export const getChallengesByCategory = challengeService.getChallengesByCategory.bind(challengeService);
export const getActiveChallengesCount = challengeService.getActiveChallengesCount.bind(challengeService);
export const getChallengeOptions = challengeService.getChallengeOptions.bind(challengeService);
export const getRecommendedChallenges = challengeService.getRecommendedChallenges.bind(challengeService);