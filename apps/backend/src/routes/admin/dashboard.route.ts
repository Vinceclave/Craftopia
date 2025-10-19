// apps/backend/src/routes/admin/dashboard.route.ts

import { Router } from "express";
import * as dashboardController from "../../controllers/admin/dashboard.controller";
import { requireAdmin } from "../../middlewares/rolebase.middleware";

const router = Router();

router.get('/stats', requireAdmin, dashboardController.getDashboardStats);
router.get('/activity', requireAdmin, dashboardController.getActivityLogs);
router.get('/top-users', requireAdmin, dashboardController.getTopUsers);
router.get('/recent-activity', requireAdmin, dashboardController.getRecentActivity);

export default router;
