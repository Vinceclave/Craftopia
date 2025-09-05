import { Router } from 'express';
import * as craftController from '../controllers/craft.controller'
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Create a new craft idea
router.post('/', authMiddleware, craftController.createCraftIdea);

// Get all craft ideas (with pagination, filtering, search)
router.get('/', authMiddleware, craftController.getCraftIdeas);

// Get craft idea by ID
router.get('/:idea_id', authMiddleware, craftController.getCraftIdeaById);

// Get all craft ideas by user
router.get('/user/:user_id', authMiddleware, craftController.getCraftIdeasByUser);

// Delete craft idea (soft delete)
router.delete('/:idea_id', authMiddleware, craftController.deleteCraftIdea);

// Optional stats routes
router.get('/stats/count', authMiddleware, craftController.countCraftIdeas);
router.get('/stats/recent', authMiddleware, craftController.getRecentCraftIdeas);

export default router;
