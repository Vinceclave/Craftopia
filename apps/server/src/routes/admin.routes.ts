import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Admin-only routes
router.get("/users", authenticate, authorize(["ADMIN"]), adminController.listUsers);
router.get("/users/:id", authenticate, authorize(["ADMIN"]), adminController.getUser);
router.delete("/users/:id", authenticate, authorize(["ADMIN"]), adminController.deleteUser);

export default router;
