import { Router } from 'express';
import { generateCraftIdea } from '../controllers/craft.controller';

const router = Router();

router.post('/craft', generateCraftIdea);

export default router;
