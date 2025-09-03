// apps/backend/src/routes/user.route.ts
import { Router } from "express";
import { 
  getProfile, 
  updateProfile, 
  updateUsername, 
  changePassword, 
  deleteAccount,
  getAllUsers 
} from "@/controllers/user.controller";
import { validatePasswordChange, validateUserUpdate } from "@/middlewares/validation.middleware";
import { authenticateToken } from "@/middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User profile routes
router.get("/profile", getProfile);
router.put("/profile", validateUserUpdate, updateProfile);
router.put("/username", updateUsername);

// Security routes
router.put("/password", validatePasswordChange, changePassword);
router.delete("/account", deleteAccount);

// Admin routes (additional role check inside controller)
router.get("/all", getAllUsers);

export default router;