import { Router } from "express";
import dashboardRoutes from "./dashboard.route";
import userManagementRoutes from "./userManagement.route";
import contentModerationRoutes from "./contentModeration.route";
import { requireAdmin } from "../../middlewares/rolebase.middleware";

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Register sub-routes
router.use('/dashboard', dashboardRoutes);
router.use('/management', userManagementRoutes);
router.use('/moderation', contentModerationRoutes);

export default router;