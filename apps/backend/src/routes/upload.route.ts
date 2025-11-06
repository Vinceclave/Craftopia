// routes/upload.route.ts
import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { refreshImageUrl } from '../controllers/refresh-url.controller';
import { uploadToMemory } from '../middlewares/upload.middleware';
import { requireAuth } from '../middlewares/rolebase.middleware';

const router = Router();

// Upload image and get pre-signed URL
router.post('/image', requireAuth, uploadToMemory.single('image'), uploadImage);

// Optional: Refresh expired pre-signed URL
router.post('/refresh-url', requireAuth, refreshImageUrl);

export default router;