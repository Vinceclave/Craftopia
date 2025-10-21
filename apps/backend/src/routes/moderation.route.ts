import * as moderationController from "../controllers/moderation.controller";
import { createModerationLogSchema } from "../schemas/moderation.schema";
import { Router } from "express";
import { validate } from "../utils/validation";
import { requireAdmin } from "../middlewares/rolebase.middleware";

const moderationRouter = Router();

// All routes require admin
moderationRouter.post(
  '/',
  requireAdmin,
  validate(createModerationLogSchema),
  moderationController.createLog
);

moderationRouter.get(
  '/',
  requireAdmin,
  moderationController.getLogs
);

moderationRouter.get(
  '/:logId',
  requireAdmin,
  moderationController.getLogById
);

export default moderationRouter;