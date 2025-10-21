import { BaseService } from "./base.service";
import { ValidationError } from '../utils/error';
import { logger } from "../utils/logger";
import prisma from "../config/prisma";

import { ModerationAction } from "../generated/prisma";

class ModerationService extends BaseService {
  // Create moderation log
  async createModerationLog(data: {
    adminId: number;
    action: ModerationAction;
    targetId: string;
    targetUserId?: number;
    reason?: string;
  }) {
    this.validateId(data.adminId, 'Admin ID');
    this.validateRequiredString(data.targetId, 'Target ID', 1, 255);
    this.validateEnum(data.action, ModerationAction, 'action');

    if (data.targetUserId) {
      this.validateId(data.targetUserId, 'Target User ID');
    }

    logger.info('Creating moderation log', {
      adminId: data.adminId,
      action: data.action,
      targetId: data.targetId
    });

    const log = await prisma.moderationLog.create({
      data: {
        admin_id: data.adminId,
        target_id: data.targetId.trim(),
        target_user_id: data.targetUserId,
        reason: data.reason?.trim() || null,
        action: data.action,
      },
      include: {
        admin: {
          select: { user_id: true, username: true }
        },
        target_user: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Moderation log created', { logId: log.log_id });

    return log;
  }

  // Get moderation logs with pagination
  async getModerationLogs(page = 1, limit = 20) {
    logger.debug('Fetching moderation logs', { page, limit });

    return this.paginate(prisma.moderationLog, {
      page,
      limit,
      orderBy: { created_at: 'desc' }
    });
  }

  // Get moderation log by ID
  async getModerationLogById(logId: number) {
    this.validateId(logId, 'Log ID');

    logger.debug('Fetching moderation log', { logId });

    const log = await prisma.moderationLog.findUnique({
      where: { log_id: logId },
      include: {
        admin: {
          select: { user_id: true, username: true }
        },
        target_user: {
          select: { user_id: true, username: true }
        }
      }
    });

    if (!log) {
      throw new ValidationError('Moderation log not found');
    }

    return log;
  }

  // Get logs by admin
  async getLogsByAdmin(adminId: number, page = 1, limit = 20) {
    this.validateId(adminId, 'Admin ID');

    logger.debug('Fetching logs by admin', { adminId, page, limit });

    return this.paginate(prisma.moderationLog, {
      page,
      limit,
      where: { admin_id: adminId },
      orderBy: { created_at: 'desc' }
    });
  }

  // Get logs by action type
  async getLogsByAction(action: ModerationAction, page = 1, limit = 20) {
    this.validateEnum(action, ModerationAction, 'action');

    logger.debug('Fetching logs by action', { action, page, limit });

    return this.paginate(prisma.moderationLog, {
      page,
      limit,
      where: { action },
      orderBy: { created_at: 'desc' }
    });
  }

  // Get moderation statistics
  async getModerationStats() {
    logger.debug('Fetching moderation statistics');

    const [total, byAction, recentLogs] = await Promise.all([
      prisma.moderationLog.count(),
      prisma.moderationLog.groupBy({
        by: ['action'],
        _count: { action: true }
      }),
      prisma.moderationLog.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    const actionStats = byAction.reduce((acc, item) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      last7Days: recentLogs,
      byAction: actionStats
    };
  }
}

// Export singleton instance
export const moderationService = new ModerationService();

// Export individual functions for backward compatibility
export const createModerationLog = moderationService.createModerationLog.bind(moderationService);
export const getModerationLogs = moderationService.getModerationLogs.bind(moderationService);
export const getModerationLogById = moderationService.getModerationLogById.bind(moderationService);
export const getLogsByAdmin = moderationService.getLogsByAdmin.bind(moderationService);
export const getLogsByAction = moderationService.getLogsByAction.bind(moderationService);
export const getModerationStats = moderationService.getModerationStats.bind(moderationService);