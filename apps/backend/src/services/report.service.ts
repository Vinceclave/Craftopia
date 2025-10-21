// apps/backend/src/services/report.service.ts - REFACTORED VERSION
import prisma from "../config/prisma";
import { ReportStatus } from "../generated/prisma";
import { BaseService } from "./base.service";
import { ValidationError, NotFoundError, ConflictError } from "../utils/error";
import { logger } from "../utils/logger";
import { VALIDATION_LIMITS } from "../constats";

interface CreateReportData {
  reporter_id: number;
  reported_post_id?: number;
  reported_comment_id?: number;
  reason: string;
}

class ReportService extends BaseService {
  // Create report
  async createReport(data: CreateReportData) {
    this.validateId(data.reporter_id, 'Reporter ID');
    this.validateRequiredString(
      data.reason,
      'Report reason',
      VALIDATION_LIMITS.REPORT.REASON_MIN,
      VALIDATION_LIMITS.REPORT.REASON_MAX
    );

    if (!data.reported_post_id && !data.reported_comment_id) {
      throw new ValidationError('Either post or comment must be reported');
    }

    if (data.reported_post_id && data.reported_comment_id) {
      throw new ValidationError('Cannot report both post and comment in single report');
    }

    logger.info('Creating report', {
      reporterId: data.reporter_id,
      postId: data.reported_post_id,
      commentId: data.reported_comment_id
    });

    return await this.executeTransaction(async (tx) => {
      // Check if post exists
      if (data.reported_post_id) {
        const post = await tx.post.findFirst({
          where: { 
            post_id: data.reported_post_id,
            deleted_at: null 
          }
        });

        if (!post) {
          throw new NotFoundError('Post');
        }

        // Check for duplicate report
        const existingReport = await tx.report.findFirst({
          where: {
            reporter_id: data.reporter_id,
            reported_post_id: data.reported_post_id
          }
        });

        if (existingReport) {
          throw new ConflictError('You have already reported this post');
        }
      }

      // Check if comment exists
      if (data.reported_comment_id) {
        const comment = await tx.comment.findFirst({
          where: { 
            comment_id: data.reported_comment_id,
            deleted_at: null 
          }
        });

        if (!comment) {
          throw new NotFoundError('Comment');
        }

        // Check for duplicate report
        const existingReport = await tx.report.findFirst({
          where: {
            reporter_id: data.reporter_id,
            reported_comment_id: data.reported_comment_id
          }
        });

        if (existingReport) {
          throw new ConflictError('You have already reported this comment');
        }
      }

      const report = await tx.report.create({
        data: {
          reporter_id: data.reporter_id,
          reported_post_id: data.reported_post_id || null,
          reported_comment_id: data.reported_comment_id || null,
          reason: data.reason.trim(),
        },
        include: {
          reporter: {
            select: { user_id: true, username: true }
          },
          reported_post: {
            select: { 
              post_id: true, 
              content: true, 
              user: { select: { user_id: true, username: true } }
            }
          },
          reported_comment: {
            select: { 
              comment_id: true, 
              content: true, 
              user: { select: { user_id: true, username: true } }
            }
          }
        }
      });

      logger.info('Report created', { reportId: report.report_id });

      return report;
    });
  }

  // Get reports with filtering
  async getReports(page = 1, limit = 20, status?: ReportStatus) {
    if (status) {
      this.validateEnum(status, ReportStatus, 'status');
    }

    logger.debug('Fetching reports', { page, limit, status });

    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.paginate(prisma.report, {
      page,
      limit,
      where,
      orderBy: { created_at: 'desc' }
    });
  }

  // Get report by ID
  async getReportById(reportId: number) {
    this.validateId(reportId, 'Report ID');

    logger.debug('Fetching report by ID', { reportId });

    const report = await prisma.report.findUnique({
      where: { report_id: reportId },
      include: {
        reporter: {
          select: { user_id: true, username: true, email: true }
        },
        reported_post: {
          select: { 
            post_id: true, 
            content: true, 
            image_url: true,
            created_at: true,
            user: { select: { user_id: true, username: true } }
          }
        },
        reported_comment: {
          select: { 
            comment_id: true, 
            content: true, 
            created_at: true,
            user: { select: { user_id: true, username: true } },
            post: { select: { post_id: true, content: true } }
          }
        },
        resolver: {
          select: { user_id: true, username: true }
        }
      }
    });

    if (!report) {
      throw new NotFoundError('Report');
    }

    return report;
  }

  // Update report status
  async updateReportStatus(
    reportId: number,
    adminId: number,
    status: ReportStatus,
    moderatorNotes?: string
  ) {
    this.validateId(reportId, 'Report ID');
    this.validateId(adminId, 'Admin ID');
    this.validateEnum(status, ReportStatus, 'status');

    logger.info('Updating report status', { 
      reportId, 
      adminId, 
      newStatus: status 
    });

    const report = await this.checkResourceExists(
      prisma.report,
      { report_id: reportId },
      'Report'
    );

    const updateData: any = {
      status,
      moderator_notes: moderatorNotes?.trim() || null,
    };

    if (status === ReportStatus.resolved) {
      updateData.resolved_by_admin_id = adminId;
      updateData.resolved_at = new Date();
    }

    const updated = await prisma.report.update({
      where: { report_id: reportId },
      data: updateData,
      include: {
        reporter: {
          select: { user_id: true, username: true }
        },
        reported_post: {
          select: { 
            post_id: true, 
            content: true, 
            user: { select: { user_id: true, username: true } }
          }
        },
        reported_comment: {
          select: { 
            comment_id: true, 
            content: true, 
            user: { select: { user_id: true, username: true } }
          }
        },
        resolver: {
          select: { user_id: true, username: true }
        }
      }
    });

    logger.info('Report status updated', { reportId, status });

    return updated;
  }

  // Get user's reports
  async getUserReports(userId: number, page = 1, limit = 10) {
    this.validateId(userId, 'User ID');

    logger.debug('Fetching user reports', { userId, page, limit });

    return this.paginate(prisma.report, {
      page,
      limit,
      where: { reporter_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  // Get report statistics
  async getReportStats() {
    logger.debug('Fetching report statistics');

    const [pending, in_review, resolved, total] = await Promise.all([
      prisma.report.count({ where: { status: ReportStatus.pending } }),
      prisma.report.count({ where: { status: ReportStatus.in_review } }),
      prisma.report.count({ where: { status: ReportStatus.resolved } }),
      prisma.report.count()
    ]);

    return {
      pending,
      in_review,
      resolved,
      total,
      percentageResolved: total > 0 ? Math.round((resolved / total) * 100) : 0
    };
  }

  // Delete report
  async deleteReport(reportId: number) {
    this.validateId(reportId, 'Report ID');

    logger.info('Deleting report', { reportId });

    await this.checkResourceExists(
      prisma.report,
      { report_id: reportId },
      'Report'
    );

    return prisma.report.delete({
      where: { report_id: reportId }
    });
  }

  // Get reports for specific content
  async getReportsForPost(postId: number) {
    this.validateId(postId, 'Post ID');

    return prisma.report.findMany({
      where: { reported_post_id: postId },
      include: {
        reporter: {
          select: { user_id: true, username: true }
        },
        resolver: {
          select: { user_id: true, username: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getReportsForComment(commentId: number) {
    this.validateId(commentId, 'Comment ID');

    return prisma.report.findMany({
      where: { reported_comment_id: commentId },
      include: {
        reporter: {
          select: { user_id: true, username: true }
        },
        resolver: {
          select: { user_id: true, username: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // Bulk update reports
  async bulkUpdateReportStatus(
    reportIds: number[],
    adminId: number,
    status: ReportStatus,
    moderatorNotes?: string
  ) {
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      throw new ValidationError('Report IDs array is required');
    }

    if (reportIds.length > 100) {
      throw new ValidationError('Cannot update more than 100 reports at once');
    }

    this.validateId(adminId, 'Admin ID');
    this.validateEnum(status, ReportStatus, 'status');

    logger.info('Bulk updating report statuses', { 
      count: reportIds.length, 
      adminId, 
      status 
    });

    const updateData: any = {
      status,
      moderator_notes: moderatorNotes?.trim() || null,
    };

    if (status === ReportStatus.resolved) {
      updateData.resolved_by_admin_id = adminId;
      updateData.resolved_at = new Date();
    }

    const result = await prisma.report.updateMany({
      where: { report_id: { in: reportIds } },
      data: updateData
    });

    logger.info('Bulk update completed', { 
      updatedCount: result.count 
    });

    return {
      updatedCount: result.count,
      message: `Successfully updated ${result.count} reports`
    };
  }
}

// Export singleton instance
export const reportService = new ReportService();

// Export individual functions for backward compatibility
export const createReport = reportService.createReport.bind(reportService);
export const getReports = reportService.getReports.bind(reportService);
export const getReportById = reportService.getReportById.bind(reportService);
export const updateReportStatus = reportService.updateReportStatus.bind(reportService);
export const getUserReports = reportService.getUserReports.bind(reportService);
export const getReportStats = reportService.getReportStats.bind(reportService);
export const deleteReport = reportService.deleteReport.bind(reportService);
export const getReportsForPost = reportService.getReportsForPost.bind(reportService);
export const getReportsForComment = reportService.getReportsForComment.bind(reportService);
export const bulkUpdateReportStatus = reportService.bulkUpdateReportStatus.bind(reportService);