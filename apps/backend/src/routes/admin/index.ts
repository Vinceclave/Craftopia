// apps/backend/src/routes/admin/index.ts

import { Router } from "express";
import dashboardRoutes from "./dashboard.route";
import userManagementRoutes from "./userManagement.route";
import contentModerationRoutes from "./contentModeration.route";

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/management', userManagementRoutes);
router.use('/moderation', contentModerationRoutes);

export default router;