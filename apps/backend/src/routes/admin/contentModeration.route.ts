
// apps/backend/src/routes/admin/contentModeration.route.ts

import { Router } from "express";
import * as contentModerationController from "../../controllers/admin/contentModeration.controller";
import { requireAdmin } from "../../middlewares/rolebase.middleware";
import { validate } from "../../utils/validation";
import Joi from "joi";

const router = Router();

const deleteContentSchema = Joi.object({
  reason: Joi.string().max(500).optional()
});

const bulkDeleteSchema = Joi.object({
  postIds: Joi.array().items(Joi.number().positive()).min(1).max(100).required(),
  reason: Joi.string().max(500).optional()
});

router.get('/content/review', requireAdmin, contentModerationController.getContentForReview);
router.delete('/posts/:postId', requireAdmin, validate(deleteContentSchema), contentModerationController.deletePost);
router.delete('/comments/:commentId', requireAdmin, validate(deleteContentSchema), contentModerationController.deleteComment);
router.post('/posts/bulk-delete', requireAdmin, validate(bulkDeleteSchema), contentModerationController.bulkDeletePosts);
router.patch('/posts/:postId/restore', requireAdmin, contentModerationController.restorePost);
router.patch('/posts/:postId/feature', requireAdmin, contentModerationController.featurePost);

export default router;

