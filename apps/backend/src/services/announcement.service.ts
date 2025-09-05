import prisma from "../config/prisma";
import { AppError } from '../utils/error';

export const createAnnouncement = async (data: {
  admin_id: number;
  title: string;
  content: string;
  expires_at?: Date;
}) => {
  if (!data.title?.trim()) {
    throw new AppError('Announcement title is required', 400);
  }

  if (!data.content?.trim()) {
    throw new AppError('Announcement content is required', 400);
  }

  if (data.expires_at && data.expires_at <= new Date()) {
    throw new AppError('Expiration date must be in the future', 400);
  }

  return await prisma.announcement.create({
    data: {
      admin_id: data.admin_id,
      title: data.title.trim(),
      content: data.content.trim(),
      expires_at: data.expires_at || null,
    },
    include: {
      admin: {
        select: { user_id: true, username: true }
      }
    }
  });
};

export const getAnnouncements = async (page = 1, limit = 10, includeExpired = false) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  const skip = (page - 1) * limit;
  const now = new Date();

  const where: any = {
    deleted_at: null,
    is_active: true
  };

  if (!includeExpired) {
    where.OR = [
      { expires_at: null },
      { expires_at: { gt: now } }
    ];
  }

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        admin: {
          select: { user_id: true, username: true }
        }
      }
    }),
    prisma.announcement.count({ where })
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

export const getAnnouncementById = async (announcementId: number) => {
  if (!announcementId || announcementId <= 0) {
    throw new AppError('Invalid announcement ID', 400);
  }

  const announcement = await prisma.announcement.findFirst({
    where: { 
      announcement_id: announcementId,
      deleted_at: null 
    },
    include: {
      admin: {
        select: { user_id: true, username: true }
      }
    }
  });

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  return announcement;
};

export const updateAnnouncement = async (
  announcementId: number, 
  data: {
    title?: string;
    content?: string;
    is_active?: boolean;
    expires_at?: Date | null;
  }
) => {
  if (!announcementId || announcementId <= 0) {
    throw new AppError('Invalid announcement ID', 400);
  }

  const announcement = await prisma.announcement.findFirst({
    where: { 
      announcement_id: announcementId,
      deleted_at: null 
    }
  });

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  const updateData: any = {};
  
  if (data.title !== undefined) {
    if (!data.title.trim()) {
      throw new AppError('Title cannot be empty', 400);
    }
    updateData.title = data.title.trim();
  }

  if (data.content !== undefined) {
    if (!data.content.trim()) {
      throw new AppError('Content cannot be empty', 400);
    }
    updateData.content = data.content.trim();
  }

  if (data.is_active !== undefined) {
    updateData.is_active = data.is_active;
  }

  if (data.expires_at !== undefined) {
    if (data.expires_at && data.expires_at <= new Date()) {
      throw new AppError('Expiration date must be in the future', 400);
    }
    updateData.expires_at = data.expires_at;
  }

  return await prisma.announcement.update({
    where: { announcement_id: announcementId },
    data: updateData,
    include: {
      admin: {
        select: { user_id: true, username: true }
      }
    }
  });
};

export const deleteAnnouncement = async (announcementId: number) => {
  if (!announcementId || announcementId <= 0) {
    throw new AppError('Invalid announcement ID', 400);
  }

  const announcement = await prisma.announcement.findFirst({
    where: { 
      announcement_id: announcementId,
      deleted_at: null 
    }
  });

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  return await prisma.announcement.update({
    where: { announcement_id: announcementId },
    data: { deleted_at: new Date() }
  });
};

export const getActiveAnnouncements = async (limit: number = 5) => {
  if (limit < 1 || limit > 50) {
    throw new AppError('Limit must be between 1 and 50', 400);
  }

  const now = new Date();

  return await prisma.announcement.findMany({
    where: {
      deleted_at: null,
      is_active: true,
      OR: [
        { expires_at: null },
        { expires_at: { gt: now } }
      ]
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
      admin: {
        select: { user_id: true, username: true }
      }
    }
  });
};

export const toggleAnnouncementStatus = async (announcementId: number) => {
  if (!announcementId || announcementId <= 0) {
    throw new AppError('Invalid announcement ID', 400);
  }

  const announcement = await prisma.announcement.findFirst({
    where: { 
      announcement_id: announcementId,
      deleted_at: null 
    }
  });

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  return await prisma.announcement.update({
    where: { announcement_id: announcementId },
    data: { is_active: !announcement.is_active },
    include: {
      admin: {
        select: { user_id: true, username: true }
      }
    }
  });
};  