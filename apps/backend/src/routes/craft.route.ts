import * as craftController from '../controllers/craft.controller';
import { createCraftIdeaSchema, updateCraftIdeaSchema } from '../schemas/craft.schema';
import { Router } from 'express';
import { validate } from '../utils/validation';
import { requireAuth } from '../middlewares/rolebase.middleware';

const craftRouter = Router();

// Create
craftRouter.post(
  '/',
  requireAuth,
  validate(createCraftIdeaSchema),
  craftController.createCraftIdea
);

// Read
craftRouter.get(
  '/',
  requireAuth,
  craftController.getCraftIdeas
);

craftRouter.get(
  '/stats/count',
  requireAuth,
  craftController.countCraftIdeas
);

craftRouter.get(
  '/stats/recent',
  requireAuth,
  craftController.getRecentCraftIdeas
);

craftRouter.get(
  '/user/:user_id',
  requireAuth,
  craftController.getCraftIdeasByUser
);

craftRouter.get(
  '/:idea_id',
  requireAuth,
  craftController.getCraftIdeaById
);

// Update
craftRouter.put(
  '/:idea_id',
  requireAuth,
  validate(updateCraftIdeaSchema),
  craftController.updateCraftIdea
);

// Delete
craftRouter.delete(
  '/:idea_id',
  requireAuth,
  craftController.deleteCraftIdea
);

export default craftRouter;