import Joi from 'joi';
import { ReportStatus } from '../generated/prisma';

export const createReportSchema = Joi.object({
  reported_post_id: Joi.number().positive().optional(),
  reported_comment_id: Joi.number().positive().optional(),
  reason: Joi.string().min(10).max(500).required()
}).custom((value, helpers) => {
  if (!value.reported_post_id && !value.reported_comment_id) {
    return helpers.error('custom.missingTarget');
  }
  if (value.reported_post_id && value.reported_comment_id) {
    return helpers.error('custom.multipleTargets');
  }
  return value;
}).messages({
  'custom.missingTarget': 'Either reported_post_id or reported_comment_id is required',
  'custom.multipleTargets': 'Cannot report both post and comment in single report'
});

export const updateReportStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ReportStatus)).required(),
  moderator_notes: Joi.string().max(1000).optional()
});

export const getReportsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  status: Joi.string().valid(...Object.values(ReportStatus)).optional()
});

export const getUserReportsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(10)
});
