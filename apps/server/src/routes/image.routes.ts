import { Router } from 'express';
import { getImageAnalysis } from '../controller.ts/image.controller';

const router = Router();

router.post('/analyze', getImageAnalysis);

export default router;