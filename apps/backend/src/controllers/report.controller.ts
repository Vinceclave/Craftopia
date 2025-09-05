import { Request, Response } from "express";
import * as reportService from "../services/report.service";
import { ReportStatus } from "../generated/prisma";
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reported_post_id, reported_comment_id, reason } = req.body;
  
  const report = await reportService.createReport({
    reporter_id: req.user!.userId,
    reported_post_id,
    reported_comment_id,
    reason
  });
  
  sendSuccess(res, report, 'Report submitted successfully', 201);
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const status = req.query.status as ReportStatus;
  
  const result = await reportService.getReports(page, limit, status);
  sendPaginatedSuccess(res, result.data, result.meta, 'Reports retrieved successfully');
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
  const userId = req.user!.userId; // User can only see their own reports
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  
  const result = await reportService.getUserReports(userId, page, limit);
  sendPaginatedSuccess(res, result.data, result.meta, 'User reports retrieved successfully');
});

export const getReportStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await reportService.getReportStats();
  sendSuccess(res, stats, 'Report statistics retrieved successfully');
});

export const deleteReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reportId = Number(req.params.reportId);
  const report = await reportService.deleteReport(reportId);
  sendSuccess(res, report, 'Report deleted successfully');
});
    