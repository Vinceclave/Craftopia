import { Request, Response } from "express";
import * as announcementService from "../services/announcement.service";
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, expires_at } = req.body;
  
  const announcement = await announcementService.createAnnouncement({
    admin_id: req.user!.userId,
    title,
    content,
    expires_at: expires_at ? new Date(expires_at) : undefined
  });
  
  sendSuccess(res, announcement, 'Announcement created successfully', 201);
});

export const getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const includeExpired = req.query.includeExpired === 'true';
  
  const result = await announcementService.getAnnouncements(page, limit, includeExpired);
  sendPaginatedSuccess(res, result.data, result.meta, 'Announcements retrieved successfully');
});

export const getAnnouncementById = asyncHandler(async (req: Request, res: Response) => {
  const announcementId = Number(req.params.announcementId);
  const announcement = await announcementService.getAnnouncementById(announcementId);
  sendSuccess(res, announcement, 'Announcement retrieved successfully');
});

export const updateAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcementId = Number(req.params.announcementId);
  const { title, content, is_active, expires_at } = req.body;
  
  const announcement = await announcementService.updateAnnouncement(
    announcementId,
    {
      title,
      content,
      is_active,
      expires_at: expires_at ? new Date(expires_at) : expires_at
    }
  );
  
  sendSuccess(res, announcement, 'Announcement updated successfully');
});

export const deleteAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcementId = Number(req.params.announcementId);
  const announcement = await announcementService.deleteAnnouncement(announcementId);
  sendSuccess(res, announcement, 'Announcement deleted successfully');
});

export const getActiveAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  const announcements = await announcementService.getActiveAnnouncements(limit);
  sendSuccess(res, announcements, 'Active announcements retrieved successfully');
});

export const toggleAnnouncementStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcementId = Number(req.params.announcementId);
  const announcement = await announcementService.toggleAnnouncementStatus(announcementId);
  sendSuccess(res, announcement, 'Announcement status toggled successfully');
});