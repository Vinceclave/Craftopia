import prisma from "../config/prisma";
import { ModerationAction } from "../generated/prisma";
import { AppError } from '../utils/error';

export const createModerationLog = async ({
  adminId,
  targetId,
  targetUserId,
  reason,
  action,
}: {
  adminId: number;
  targetId: string;
  targetUserId?: number;
  reason?: string;
  action: ModerationAction;
}) => {
  if (!adminId || adminId <= 0) {
    throw new AppError('Invalid admin ID', 400);
  }

  if (!targetId?.trim()) {
    throw new AppError('Target ID is required', 400);
  }

  if (!Object.values(ModerationAction).includes(action)) {
    throw new AppError(`Invalid action. Allowed values: ${Object.values(ModerationAction).join(', ')}`, 400);
  }

  return await prisma.moderationLog.create({
    data: {
      admin_id: adminId,
      target_id: targetId.trim(),
      target_user_id: targetUserId,
      reason: reason?.trim() || null,
      action,
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
};

export const getModerationLogs = async (page = 1, limit = 20) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 20;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.moderationLog.findMany({
      skip,
      take: limit,
      include: { 
        admin: {
          select: { user_id: true, username: true }
        },
        target_user: {
          select: { user_id: true, username: true }
        }
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.moderationLog.count()
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
      limit
    }
  };
};

export const getModerationLogById = async (logId: number) => {
  if (!logId || logId <= 0) {
    throw new AppError('Invalid log ID', 400);
  }

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
    throw new AppError('Moderation log not found', 404);
  }

  return log;
};