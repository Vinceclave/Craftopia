import { Router } from 'express';
import multer from 'multer';
import { getImageAnalysis } from '../controllers/image.controller';

const router = Router();
const upload = multer();  // Memory storage by default

router.post('/analyze', upload.single('image'), getImageAnalysis);

export default router;
