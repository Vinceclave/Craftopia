import prisma from "../config/prisma";
import { ReportStatus } from "../generated/prisma";
import { AppError } from '../utils/error';

export const createReport = async (data: {
  reporter_id: number;
  reported_post_id?: number;
  reported_comment_id?: number;
  reason: string;
}) => {
  if (!data.reason?.trim()) {
    throw new AppError('Report reason is required', 400);
  }

  if (!data.reported_post_id && !data.reported_comment_id) {
    throw new AppError('Either post or comment must be reported', 400);
  }

  if (data.reported_post_id && data.reported_comment_id) {
    throw new AppError('Cannot report both post and comment in single report', 400);
  }

  // Check if post exists (if reporting a post)
  if (data.reported_post_id) {
    const post = await prisma.post.findFirst({
      where: { 
        post_id: data.reported_post_id,
        deleted_at: null 
      }
    });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user already reported this post
    const existingReport = await prisma.report.findFirst({
      where: {
        reporter_id: data.reporter_id,
        reported_post_id: data.reported_post_id
      }
    });
    if (existingReport) {
      throw new AppError('You have already reported this post', 400);
    }
  }

  // Check if comment exists (if reporting a comment)
  if (data.reported_comment_id) {
    const comment = await prisma.comment.findFirst({
      where: { 
        comment_id: data.reported_comment_id,
        deleted_at: null 
      }
    });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if user already reported this comment
    const existingReport = await prisma.report.findFirst({
      where: {
        reporter_id: data.reporter_id,
        reported_comment_id: data.reported_comment_id
      }
    });
    if (existingReport) {
      throw new AppError('You have already reported this comment', 400);
    }
  }

  return await prisma.report.create({
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
};

export const getReports = async (page = 1, limit = 20, status?: ReportStatus) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 20;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
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
    }),
    prisma.report.count({ where })
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

export const getReportById = async (reportId: number) => {
  if (!reportId || reportId <= 0) {
    throw new AppError('Invalid report ID', 400);
  }

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
    throw new AppError('Report not found', 404);
  }

  return report;
};

export const updateReportStatus = async (
  reportId: number, 
  adminId: number,
  status: ReportStatus,
  moderatorNotes?: string
) => {
  if (!reportId || reportId <= 0) {
    throw new AppError('Invalid report ID', 400);
  }

  if (!Object.values(ReportStatus).includes(status)) {
    throw new AppError(`Invalid status. Allowed values: ${Object.values(ReportStatus).join(', ')}`, 400);
  }

  const report = await prisma.report.findUnique({
    where: { report_id: reportId }
  });

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  const updateData: any = {
    status,
    moderator_notes: moderatorNotes?.trim() || null,
  };

  if (status === ReportStatus.resolved) {
    updateData.resolved_by_admin_id = adminId;
    updateData.resolved_at = new Date();
  }

  return await prisma.report.update({
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
};

export const getUserReports = async (userId: number, page = 1, limit = 10) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  if (page < 1) page = 1;
  if (limit < 1 || limit > 50) limit = 10;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where: { reporter_id: userId },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
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
    }),
    prisma.report.count({ where: { reporter_id: userId } })
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

export const getReportStats = async () => {
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
    total
  };
};

export const deleteReport = async (reportId: number) => {
  if (!reportId || reportId <= 0) {
    throw new AppError('Invalid report ID', 400);
  }

  const report = await prisma.report.findUnique({
    where: { report_id: reportId }
  });

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  return await prisma.report.delete({
    where: { report_id: reportId }
  });
};
