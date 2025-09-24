import { Router } from "express";
import { uploadImage, uploadMiddleware } from "../controllers/upload.controller";
import { requireAuth } from "../middlewares/rolebase.middleware";

const router = Router();

// CORRECT: middleware chain order matters!
router.post('/image', requireAuth, uploadMiddleware, uploadImage);

export default router;