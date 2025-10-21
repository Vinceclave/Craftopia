// Should have requireAdmin middleware applied
import { Router } from "express";
import * as dashboardController from "../../controllers/admin/dashboard.controller";
import { requireAdmin } from "../../middlewares/rolebase.middleware";

const router = Router();

// All routes should have requireAdmin (applied in parent route or here)
router.get('/stats', dashboardController.getDashboardStats);
router.get('/activity', dashboardController.getActivityLogs);
router.get('/top-users', dashboardController.getTopUsers);
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;