// routes/upload.route.ts
import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { uploadToFolder } from '../middlewares/upload.middleware';
import { requireAuth } from '../middlewares/rolebase.middleware';

const router = Router();

router.post('/image', requireAuth, uploadToFolder.single('image'), uploadImage);

export default router;
