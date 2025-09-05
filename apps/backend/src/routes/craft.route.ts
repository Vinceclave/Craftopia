// routes/craft.route.ts (Updated)
import { Router } from 'express';
import * as craftController from '../controllers/craft.controller';
import { requireAuth } from '../middlewares/rolebase.middleware';
import { validate, validateQuery } from '../utils/validation';
import { createCraftIdeaSchema, getCraftIdeasSchema } from '../schemas/craft.schema';

const router = Router();

router.post('/', requireAuth, validate(createCraftIdeaSchema), craftController.createCraftIdea);
router.get('/', requireAuth, validateQuery(getCraftIdeasSchema), craftController.getCraftIdeas);
router.get('/stats/count', requireAuth, craftController.countCraftIdeas);
router.get('/stats/recent', requireAuth, craftController.getRecentCraftIdeas);
router.get('/user/:user_id', requireAuth, craftController.getCraftIdeasByUser);
router.get('/:idea_id', requireAuth, craftController.getCraftIdeaById);
router.delete('/:idea_id', requireAuth, craftController.deleteCraftIdea);

export default router;