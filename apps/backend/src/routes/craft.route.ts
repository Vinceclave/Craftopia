import { Router } from 'express';
import * as craftController from '../controllers/craft.controller'

const router = Router();

// Create a new craft idea
router.post('/', craftController.createCraftIdea);

// Get all craft ideas (with pagination, filtering, search)
router.get('/', craftController.getCraftIdeas);

// Get craft idea by ID
router.get('/:idea_id', craftController.getCraftIdeaById);

// Get all craft ideas by user
router.get('/user/:user_id', craftController.getCraftIdeasByUser);

// Delete craft idea (soft delete)
router.delete('/:idea_id', craftController.deleteCraftIdea);

// Optional stats routes
router.get('/stats/count', craftController.countCraftIdeas);
router.get('/stats/recent', craftController.getRecentCraftIdeas);

export default router;
