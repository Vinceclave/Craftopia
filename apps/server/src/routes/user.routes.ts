import { Router } from "express";
import * as userController from "../controllers/user.contoller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Mobile-only: require USER role
router.get("/profile", authenticate, authorize(["USER"]), userController.getProfile);
router.put("/profile", authenticate, authorize(["USER"]), userController.updateProfile);

export default router;
