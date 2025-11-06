// routes/upload.route.ts
import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { uploadToMemory } from '../middlewares/upload.middleware';
import { requireAuth } from '../middlewares/rolebase.middleware';

const router = Router();

router.post('/image', requireAuth, uploadToMemory.single('image'), uploadImage);

export default router;
