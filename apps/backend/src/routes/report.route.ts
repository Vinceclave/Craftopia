import * as reportController from "../controllers/report.controller";
import { 
  createReportSchema, 
  updateReportStatusSchema,
  bulkUpdateReportsSchema
} from "../schemas/report.schema";
import { Router } from "express";
import { validate } from "../utils/validation";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";

const reportRouter = Router();

// User routes
reportRouter.post(
  '/',
  requireAuth,
  validate(createReportSchema),
  reportController.createReport
);

reportRouter.get(
  '/my-reports',
  requireAuth,
  reportController.getUserReports
);

// Admin routes
reportRouter.get(
  '/',
  requireAdmin,
  reportController.getReports
);

reportRouter.get(
  '/stats',
  requireAdmin,
  reportController.getReportStats
);

reportRouter.get(
  '/:reportId',
  requireAdmin,
  reportController.getReportById
);

reportRouter.patch(
  '/:reportId/status',
  requireAdmin,
  validate(updateReportStatusSchema),
  reportController.updateReportStatus
);

reportRouter.post(
  '/bulk-update',
  requireAdmin,
  validate(bulkUpdateReportsSchema),
  reportController.bulkUpdateReports
);

reportRouter.delete(
  '/:reportId',
  requireAdmin,
  reportController.deleteReport
);

export default reportRouter;