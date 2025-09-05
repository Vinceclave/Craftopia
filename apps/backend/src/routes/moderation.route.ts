import { Router } from "express";
import * as moderationController from "../controllers/moderation.controller";
import { requireAdmin } from "../middlewares/rolebase.middleware";
import { validate } from "../utils/validation";
import { createModerationLogSchema } from "../schemas/moderation.schema";

const router = Router();

router.post('/', requireAdmin, validate(createModerationLogSchema), moderationController.createLog);
router.get('/', requireAdmin, moderationController.getLogs);
router.get('/:logId', requireAdmin, moderationController.getLogById);

export default router;