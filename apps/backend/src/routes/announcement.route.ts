import * as announcementController from "../controllers/annoucement.controller";
import { 
  createAnnouncementSchema, 
  updateAnnouncementSchema
} from "../schemas/annoucement.schema";
import { Router } from "express";
import { validate } from "../utils/validation";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";

const announcementRouter = Router();

// Admin routes
announcementRouter.post(
  '/',
  requireAdmin,
  validate(createAnnouncementSchema),
  announcementController.createAnnouncement
);

announcementRouter.put(
  '/:announcementId',
  requireAdmin,
  validate(updateAnnouncementSchema),
  announcementController.updateAnnouncement
);

announcementRouter.delete(
  '/:announcementId',
  requireAdmin,
  announcementController.deleteAnnouncement
);

announcementRouter.patch(
  '/:announcementId/toggle-status',
  requireAdmin,
  announcementController.toggleAnnouncementStatus
);

// Public/User routes
announcementRouter.get(
  '/',
  requireAuth,
  announcementController.getAnnouncements
);

announcementRouter.get(
  '/active',
  announcementController.getActiveAnnouncements
);

announcementRouter.get(
  '/:announcementId',
  requireAuth,
  announcementController.getAnnouncementById
);

export default announcementRouter;