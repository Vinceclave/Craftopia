import { asyncHandler } from '../utils/asyncHandler';
import * as reportService from "../services/report.service";
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Request, Response } from "express";

export const createReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await reportService.createReport({
    reporter_id: req.user!.userId,
    ...req.body
  });
  
  sendSuccess(res, report, 'Report submitted successfully', 201);
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const status = req.query.status as any;
  
  const result = await reportService.getReports(page, limit, status);
  sendPaginatedSuccess(res, result.data, result.meta, 'Reports retrieved');
});

export const getReportById = asyncHandler(async (req: Request, res: Response) => {
  const reportId = Number(req.params.reportId);
  const report = await reportService.getReportById(reportId);
  
  sendSuccess(res, report, 'Report retrieved successfully');
});

export const updateReportStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reportId = Number(req.params.reportId);
  const { status, moderator_notes } = req.body;
  
  const report = await reportService.updateReportStatus(
    reportId,
    req.user!.userId,
    status,
    moderator_notes
  );
  
  sendSuccess(res, report, 'Report status updated successfully');
});

export const getUserReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  
  const result = await reportService.getUserReports(userId, page, limit);
  sendPaginatedSuccess(res, result.data, result.meta, 'User reports retrieved');
});

export const getReportStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await reportService.getReportStats();
  sendSuccess(res, stats, 'Report statistics retrieved');
});

export const deleteReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reportId = Number(req.params.reportId);
  
  await reportService.deleteReport(reportId);
  sendSuccess(res, null, 'Report deleted successfully');
});

export const bulkUpdateReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reportIds, status, moderator_notes } = req.body;
  
  const result = await reportService.bulkUpdateReportStatus(
    reportIds,
    req.user!.userId,
    status,
    moderator_notes
  );
  
  sendSuccess(res, result, 'Reports updated successfully');
});
