// apps/backend/src/routes/sponsor.route.ts
import { Router } from "express";
import * as sponsorController from "../controllers/sponsor.controller";
import { requireAuth, requireAdmin } from "../middlewares/rolebase.middleware";
import { validate } from "../utils/validation";
import {
  createSponsorSchema,
  updateSponsorSchema,
  createRewardSchema,
  updateRewardSchema,
  redeemRewardSchema,
  fulfillRedemptionSchema
} from "../schemas/sponsor.schema";

const router = Router();

// ==========================================
// SPONSOR ROUTES (Admin Only)
// ==========================================

router.post(
  '/sponsors',
  requireAdmin,
  validate(createSponsorSchema),
  sponsorController.createSponsor
);

router.get(
  '/sponsors',
  requireAuth,
  sponsorController.getSponsors
);

router.get(
  '/sponsors/:sponsorId',
  requireAuth,
  sponsorController.getSponsorById
);

router.put(
  '/sponsors/:sponsorId',
  requireAdmin,
  validate(updateSponsorSchema),
  sponsorController.updateSponsor
);

router.patch(
  '/sponsors/:sponsorId/toggle-status',
  requireAdmin,
  sponsorController.toggleSponsorStatus
);

router.delete(
  '/sponsors/:sponsorId',
  requireAdmin,
  sponsorController.deleteSponsor
);

// ==========================================
// REWARD ROUTES
// ==========================================

// Admin routes
router.post(
  '/rewards',
  requireAdmin,
  validate(createRewardSchema),
  sponsorController.createReward
);

router.put(
  '/rewards/:rewardId',
  requireAdmin,
  validate(updateRewardSchema),
  sponsorController.updateReward
);

router.patch(
  '/rewards/:rewardId/toggle-status',
  requireAdmin,
  sponsorController.toggleRewardStatus
);

router.delete(
  '/rewards/:rewardId',
  requireAdmin,
  sponsorController.deleteReward
);

// Public/User routes
router.get(
  '/rewards',
  requireAuth,
  sponsorController.getRewards
);

router.get(
  '/rewards/:rewardId',
  requireAuth,
  sponsorController.getRewardById
);

// ==========================================
// REDEMPTION ROUTES
// ==========================================

// User routes
router.post(
  '/redemptions',
  requireAuth,
  validate(redeemRewardSchema),
  sponsorController.redeemReward
);

// Admin routes
router.get(
  '/redemptions',
  requireAuth,
  sponsorController.getRedemptions
);

router.patch(
  '/redemptions/:redemptionId/fulfill',
  requireAdmin,
  sponsorController.fulfillRedemption
);

router.patch(
  '/redemptions/:redemptionId/cancel',
  requireAdmin,
  sponsorController.cancelRedemption
);

// ==========================================
// STATISTICS
// ==========================================

router.get(
  '/stats',
  requireAdmin,
  sponsorController.getStats
);

export default router;