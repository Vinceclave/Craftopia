import { Router } from "express";
import * as announcementController from "../controllers/annoucement.controller";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";
import { validate, validateQuery } from "../utils/validation";
import { 
  createAnnouncementSchema, 
  updateAnnouncementSchema,
  getAnnouncementsQuerySchema
} from "../schemas/annoucement.schema";

const router = Router();

// Admin-only routes (any admin can manage all announcements)
router.post('/', requireAdmin, validate(createAnnouncementSchema), announcementController.createAnnouncement);
router.put('/:announcementId', requireAdmin, validate(updateAnnouncementSchema), announcementController.updateAnnouncement);
router.delete('/:announcementId', requireAdmin, announcementController.deleteAnnouncement);
router.patch('/:announcementId/toggle-status', requireAdmin, announcementController.toggleAnnouncementStatus);

// Public/User routes
router.get('/', requireAuth, validateQuery(getAnnouncementsQuerySchema), announcementController.getAnnouncements);
router.get('/active', announcementController.getActiveAnnouncements); // Public endpoint
router.get('/:announcementId', requireAuth, announcementController.getAnnouncementById);

export default router;
