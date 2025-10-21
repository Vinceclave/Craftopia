import Joi from 'joi';
import { ReportStatus } from '../generated/prisma';
import { commonSchemas } from '../utils/validation';
import { VALIDATION_LIMITS } from '../constats';

export const createReportSchema = Joi.object({
  reported_post_id: commonSchemas.optionalPositiveId,
  reported_comment_id: commonSchemas.optionalPositiveId,
  reason: commonSchemas.requiredString(
    VALIDATION_LIMITS.REPORT.REASON_MIN,
    VALIDATION_LIMITS.REPORT.REASON_MAX
  )
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
  status: commonSchemas.enum(Object.values(ReportStatus)),
  moderator_notes: commonSchemas.optionalString(1000)
});

export const bulkUpdateReportsSchema = Joi.object({
  reportIds: Joi.array()
    .items(commonSchemas.positiveId)
    .min(1)
    .max(100)
    .required(),
  status: commonSchemas.enum(Object.values(ReportStatus)),
  moderator_notes: commonSchemas.optionalString(1000)
});

export const getReportsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  status: commonSchemas.optionalEnum(Object.values(ReportStatus))
});

export const getUserReportsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(10)
});

