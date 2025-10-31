import { BaseService } from "./base.service";
import { ValidationError } from '../utils/error';
import { logger } from "../utils/logger";
import prisma from "../config/prisma";
import { VALIDATION_LIMITS } from "../constats";
import { WebSocketEmitter } from "../websocket/events";

class AnnouncementService extends BaseService {
  // Create announcement
  async createAnnouncement(data: {
    admin_id: number;
    title: string;
    content: string;
    expires_at?: Date;
  }) {
    this.validateId(data.admin_id, 'Admin ID');
    this.validateRequiredString(
      data.title,
      'Announcement title',
      VALIDATION_LIMITS.ANNOUNCEMENT.TITLE_MIN,
      VALIDATION_LIMITS.ANNOUNCEMENT.TITLE_MAX
    );
    this.validateRequiredString(
      data.content,
      'Announcement content',
      VALIDATION_LIMITS.ANNOUNCEMENT.CONTENT_MIN,
      VALIDATION_LIMITS.ANNOUNCEMENT.CONTENT_MAX
    );

    if (data.expires_at && data.expires_at <= new Date()) {
      throw new ValidationError('Expiration date must be in the future');
    }

    logger.info('Creating announcement', { adminId: data.admin_id });

    const announcement = await prisma.announcement.create({
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

    logger.info('Announcement created', { announcementId: announcement.announcement_id });

    // 🔥 WEBSOCKET: Broadcast announcement to all users
    WebSocketEmitter.announcementCreated({
      announcement_id: announcement.announcement_id,
      title: announcement.title,
      content: announcement.content,
      expires_at: announcement.expires_at,
      created_by: announcement.admin?.username || 'Admin'
    });

    return announcement;
  }

  // Get announcements with pagination
  async getAnnouncements(page = 1, limit = 10, includeExpired = false) {
    logger.info('=== FETCHING ANNOUNCEMENTS ===', { page, limit, includeExpired });

    const now = new Date();
    
    // Build where clause - show all non-deleted announcements
    const where: any = {
      deleted_at: null
    };

    // If not including expired, filter by expiration date
    if (!includeExpired) {
      where.OR = [
        { expires_at: null }, // Never expires
        { expires_at: { gte: now } } // Not expired yet
      ];
      
      logger.info('Filtering expired announcements', { 
        now: now.toISOString(),
        includeExpired 
      });
    }

    logger.info('Where clause', JSON.stringify(where, null, 2));

    // Use custom pagination to include admin data
    const skip = (page - 1) * limit;
    
    try {
      const [data, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
          include: {
            admin: {
              select: { user_id: true, username: true }
            }
          }
        }),
        prisma.announcement.count({ where })
      ]);

      logger.info('=== QUERY RESULTS ===', { 
        found: data.length, 
        total,
        page,
        limit,
        announcements: data.map(a => ({
          id: a.announcement_id,
          title: a.title,
          is_active: a.is_active,
          expires_at: a.expires_at,
          deleted_at: a.deleted_at
        }))
      });

      const lastPage = Math.ceil(total / limit) || 1;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage,
          hasNextPage: page < lastPage,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      logger.error('Error fetching announcements', error);
      throw error;
    }
  }

  // Get announcement by ID
  async getAnnouncementById(announcementId: number) {
    this.validateId(announcementId, 'Announcement ID');

    logger.debug('Fetching announcement', { announcementId });

    const announcement = await this.checkNotDeleted(
      prisma.announcement,
      { announcement_id: announcementId },
      'Announcement'
    );

    return announcement;
  }

  // Update announcement
  async updateAnnouncement(
    announcementId: number,
    data: {
      title?: string;
      content?: string;
      is_active?: boolean;
      expires_at?: Date | null;
    }
  ) {
    this.validateId(announcementId, 'Announcement ID');

    await this.checkNotDeleted(
      prisma.announcement,
      { announcement_id: announcementId },
      'Announcement'
    );

    // Validate fields if provided
    if (data.title !== undefined) {
      this.validateRequiredString(
        data.title,
        'Title',
        VALIDATION_LIMITS.ANNOUNCEMENT.TITLE_MIN,
        VALIDATION_LIMITS.ANNOUNCEMENT.TITLE_MAX
      );
    }

    if (data.content !== undefined) {
      this.validateRequiredString(
        data.content,
        'Content',
        VALIDATION_LIMITS.ANNOUNCEMENT.CONTENT_MIN,
        VALIDATION_LIMITS.ANNOUNCEMENT.CONTENT_MAX
      );
    }

    if (data.expires_at && data.expires_at <= new Date()) {
      throw new ValidationError('Expiration date must be in the future');
    }

    logger.info('Updating announcement', { announcementId });

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.content !== undefined) updateData.content = data.content.trim();
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.expires_at !== undefined) updateData.expires_at = data.expires_at;

    const updated = await prisma.announcement.update({
      where: { announcement_id: announcementId },
      data: updateData,
      include: {
        admin: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Announcement updated', { announcementId });

    // 🔥 WEBSOCKET: Notify users of announcement update
    WebSocketEmitter.announcementUpdated({
      announcement_id: updated.announcement_id,
      title: updated.title,
      content: updated.content,
      is_active: updated.is_active,
      expires_at: updated.expires_at
    });

    return updated;
  }

  // Delete announcement (soft delete)
  async deleteAnnouncement(announcementId: number) {
    this.validateId(announcementId, 'Announcement ID');

    await this.checkNotDeleted(
      prisma.announcement,
      { announcement_id: announcementId },
      'Announcement'
    );

    logger.info('Deleting announcement', { announcementId });

    const result = await this.softDelete(prisma.announcement, announcementId, 'announcement_id');

    // 🔥 WEBSOCKET: Notify users of announcement deletion
    WebSocketEmitter.announcementDeleted(announcementId);

    return result;
  }

  // Get active announcements
  async getActiveAnnouncements(limit: number = 5) {
    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }

    logger.debug('Fetching active announcements', { limit });

    const now = new Date();

    return prisma.announcement.findMany({
      where: {
        deleted_at: null,
        is_active: true,
        OR: [
          { expires_at: null },
          { expires_at: { gte: now } }
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
  }

  // Toggle announcement status
  async toggleAnnouncementStatus(announcementId: number) {
    this.validateId(announcementId, 'Announcement ID');

    const announcement = await this.checkNotDeleted(
      prisma.announcement,
      { announcement_id: announcementId },
      'Announcement'
    );

    logger.info('Toggling announcement status', { 
      announcementId, 
      currentStatus: announcement.is_active 
    });

    const updated = await prisma.announcement.update({
      where: { announcement_id: announcementId },
      data: { is_active: !announcement.is_active },
      include: {
        admin: {
          select: { user_id: true, username: true }
        }
      }
    });

    // 🔥 WEBSOCKET: Notify users of status change
    WebSocketEmitter.announcementUpdated({
      announcement_id: updated.announcement_id,
      title: updated.title,
      content: updated.content,
      is_active: updated.is_active,
      expires_at: updated.expires_at
    });

    return updated;
  }
}

// Export singleton instance
export const announcementService = new AnnouncementService();

// Export individual functions for backward compatibility
export const createAnnouncement = announcementService.createAnnouncement.bind(announcementService);
export const getAnnouncements = announcementService.getAnnouncements.bind(announcementService);
export const getAnnouncementById = announcementService.getAnnouncementById.bind(announcementService);
export const updateAnnouncement = announcementService.updateAnnouncement.bind(announcementService);
export const deleteAnnouncement = announcementService.deleteAnnouncement.bind(announcementService);
export const getActiveAnnouncements = announcementService.getActiveAnnouncements.bind(announcementService);
export const toggleAnnouncementStatus = announcementService.toggleAnnouncementStatus.bind(announcementService);