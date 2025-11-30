// apps/backend/src/routes/craft.routes.ts 

import { Router } from 'express';
import * as craftController from '../controllers/craft.controller';
import { requireAuth } from '../middlewares/rolebase.middleware';
import { validate } from '../utils/validation';
import {
  createCraftIdeaSchema,
  updateCraftIdeaSchema,
  getCraftIdeasSchema,
} from '../schemas/craft.schema';

const router = Router();

// Public routes
router.get('/', validate(getCraftIdeasSchema), craftController.getCraftIdeas);
router.get('/stats/recent', craftController.getRecentCraftIdeas);
router.get('/stats/count', craftController.countCraftIdeas);
router.get('/:idea_id', craftController.getCraftIdeaById);
router.get('/user/:user_id', craftController.getCraftIdeasByUser);

// Protected routes (require authentication)
router.post('/', requireAuth, validate(createCraftIdeaSchema), craftController.createCraftIdea);
router.post('/save-from-base64', requireAuth, craftController.saveCraftFromBase64); // ✅ NEW
router.post('/:idea_id/toggle-save', requireAuth, craftController.toggleSaveCraft); // ✅ NEW
router.get('/saved/list', requireAuth, craftController.getSavedCraftIdeas); // ✅ NEW
router.get('/stats/user', requireAuth, craftController.getUserCraftStats); // ✅ NEW
router.put('/:idea_id', requireAuth, validate(updateCraftIdeaSchema), craftController.updateCraftIdea);
router.delete('/:idea_id', requireAuth, craftController.deleteCraftIdea);

export default router;