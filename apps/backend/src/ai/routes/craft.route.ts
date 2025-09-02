import { Router } from 'express';
import { generateCrafts } from '@/ai/controllers/craft.controller';

const router = Router();

router.post('/generate', generateCrafts)

export default router;