import * as announcementService from "../services/announcement.service";
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from "express";

export const createAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcement = await announcementService.createAnnouncement({
    admin_id: req.user!.userId,
    ...req.body
  });
  
  sendSuccess(res, announcement, 'Announcement created successfully', 201);
});

export const getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const includeExpired = req.query.includeExpired === 'true';
  
  const result = await announcementService.getAnnouncements(page, limit, includeExpired);
  sendPaginatedSuccess(res, result.data, result.meta, 'Announcements retrieved');
});

export const getAnnouncementById = asyncHandler(async (req: Request, res: Response) => {
  const announcementId = Number(req.params.announcementId);
  const announcement = await announcementService.getAnnouncementById(announcementId);
  
  sendSuccess(res, announcement, 'Announcement retrieved successfully');
});

export const updateAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcementId = Number(req.params.announcementId);
  
  const announcement = await announcementService.updateAnnouncement(
    announcementId,
    req.body
  );
  
  sendSuccess(res, announcement, 'Announcement updated successfully');
});

export const deleteAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcementId = Number(req.params.announcementId);
  
  await announcementService.deleteAnnouncement(announcementId);
  sendSuccess(res, null, 'Announcement deleted successfully');
});

export const getActiveAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  const announcements = await announcementService.getActiveAnnouncements(limit);
  
  sendSuccess(res, announcements, 'Active announcements retrieved');
});

export const toggleAnnouncementStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcementId = Number(req.params.announcementId);
  
  const announcement = await announcementService.toggleAnnouncementStatus(announcementId);
  sendSuccess(res, announcement, 'Announcement status toggled successfully');
});