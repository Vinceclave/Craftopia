
// apps/backend/src/routes/admin/userManagement.route.ts

import { Router } from "express";
import * as userManagementController from "../../controllers/admin/userManagement.controller";
import { requireAdmin } from "../../middlewares/rolebase.middleware";
import { validate } from "../../utils/validation";
import Joi from "joi";

const router = Router();

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'admin').required()
});

router.get('/users', requireAdmin, userManagementController.getAllUsers);
router.get('/users/:userId', requireAdmin, userManagementController.getUserDetails);
router.get('/users/:userId/stats', requireAdmin, userManagementController.getUserStatistics);
router.patch('/users/:userId/status', requireAdmin, userManagementController.toggleUserStatus);
router.patch('/users/:userId/role', requireAdmin, validate(updateRoleSchema), userManagementController.updateUserRole);
router.delete('/users/:userId', requireAdmin, userManagementController.deleteUser);

export default router;
