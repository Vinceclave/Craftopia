// apps/backend/src/services/challenge.service.ts - REFACTORED VERSION
import prisma from "../config/prisma";
import { MaterialType, ChallengeCategory, ChallengeSource } from "../generated/prisma";
import { BaseService } from "./base.service";
import { ValidationError, NotFoundError } from "../utils/error";
import { VALIDATION_LIMITS, POINTS } from "../constats";
import { logger } from "../utils/logger";

interface CreateChallengeData {
  title: string;
  description: string;
  points_reward: number;
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

    return challenge;
  }

  // Generate and save AI challenge
  async generateAndSaveChallenge(category: ChallengeCategory, adminId?: number) {
    this.validateEnum(category, ChallengeCategory, 'category');

    logger.info('Generating AI challenge', { category, adminId });

    // Simulate AI generation (replace with actual AI service call)
    const aiChallenge = await this.simulateAIGeneration(category);

    return this.createChallenge({
      title: aiChallenge.title,
      description: aiChallenge.description,
      points_reward: aiChallenge.points,
      material_type: aiChallenge.materialType,
      category,
      created_by_admin_id: adminId || null,
    });
  }

  // Get all challenges with filtering
  async getAllChallenges(category?: string) {
    logger.debug('Fetching all challenges', { category });

    // Mark expired challenges as inactive
    await this.markExpiredChallengesInactive();

    const where: any = { 
      deleted_at: null, 
      is_active: true 
    };

    if (category && category !== 'all') {
      this.validateEnum(category, ChallengeCategory, 'category');
      where.category = category;
    }

    const data = await prisma.ecoChallenge.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        created_by_admin: { 
          select: { user_id: true, username: true } 
        },
        _count: { 
          select: { 
            participants: { where: { deleted_at: null } } 
          } 
        },
      }
    });

    logger.info('Challenges fetched', { count: data.length, category });

    return { data, total: data.length };
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

  // Private: Simulate AI generation (replace with actual AI service)
  private async simulateAIGeneration(category: ChallengeCategory): Promise<{
    title: string;
    description: string;
    points: number;
    materialType: MaterialType;
  }> {
    const materials = Object.values(MaterialType);
    const randomMaterial = materials[Math.floor(Math.random() * materials.length)];

    const challenges = [
      {
        title: `Transform ${randomMaterial} waste`,
        description: `Collect and upcycle 5 pieces of ${randomMaterial} into something useful`,
        points: Math.floor(Math.random() * 30) + 15,
      },
      {
        title: `Creative ${randomMaterial} project`,
        description: `Create an artistic piece using discarded ${randomMaterial}`,
        points: Math.floor(Math.random() * 30) + 20,
      },
      {
        title: `${randomMaterial} recycling challenge`,
        description: `Properly sort and process ${randomMaterial} waste in your community`,
        points: Math.floor(Math.random() * 20) + 15,
      }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    return {
      title: randomChallenge.title,
      description: randomChallenge.description,
      points: randomChallenge.points,
      materialType: randomMaterial as MaterialType,
    };
  }
}

// Export singleton instance
export const challengeService = new ChallengeService();

// Export individual functions for backward compatibility
export const createChallenge = challengeService.createChallenge.bind(challengeService);
export const generateAndSaveChallenge = challengeService.generateAndSaveChallenge.bind(challengeService);
export const getAllChallenges = challengeService.getAllChallenges.bind(challengeService);
export const getChallengeById = challengeService.getChallengeById.bind(challengeService);
export const updateChallenge = challengeService.updateChallenge.bind(challengeService);
export const deleteChallenge = challengeService.deleteChallenge.bind(challengeService);
export const toggleActiveStatus = challengeService.toggleActiveStatus.bind(challengeService);
export const getChallengesByCategory = challengeService.getChallengesByCategory.bind(challengeService);
export const getActiveChallengesCount = challengeService.getActiveChallengesCount.bind(challengeService);