import { Router } from 'express';
import { generateCraftIdea } from '../controller/craft.controller';

const router = Router();

router.post('/craft', generateCraftIdea);

export default router;
