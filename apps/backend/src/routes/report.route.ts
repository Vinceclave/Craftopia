import { Router } from "express";
import * as reportController from "../controllers/report.controller";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";
import { validate, validateQuery } from "../utils/validation";
import { 
  createReportSchema, 
  updateReportStatusSchema,
  getReportsQuerySchema,
  getUserReportsQuerySchema
} from "../schemas/report.schema";

const router = Router();

// User routes
router.post('/', requireAuth, validate(createReportSchema), reportController.createReport);
router.get('/my-reports', requireAuth, validateQuery(getUserReportsQuerySchema), reportController.getUserReports);

// Admin routes
router.get('/', requireAdmin, validateQuery(getReportsQuerySchema), reportController.getReports);
router.get('/stats', requireAdmin, reportController.getReportStats);
router.get('/:reportId', requireAdmin, reportController.getReportById);
router.patch('/:reportId/status', requireAdmin, validate(updateReportStatusSchema), reportController.updateReportStatus);
router.delete('/:reportId', requireAdmin, reportController.deleteReport);

export default router;