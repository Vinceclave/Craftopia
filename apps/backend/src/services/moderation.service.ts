import prisma from "../config/prisma";
import { ModerationAction } from "../generated/prisma";

export const createModerationLog = async ({
  adminId,
  targetId,
  targetUserId,
  reason,
  action, // make sure this comes from the request
}: {
  adminId: number;
  targetId: string;
  targetUserId?: number;
  reason?: string;
  action: ModerationAction;
}) => {
  return await prisma.moderationLog.create({
    data: {
      admin_id: adminId,
      target_id: targetId,
      target_user_id: targetUserId,
      reason,
      action, // ✅ required
    },
  });
};



export const getModerationLogs = async () => {
    return prisma.moderationLog.findMany({
        include: { admin: true, target_user: true },
        orderBy: { created_at: 'desc' },
    })
}