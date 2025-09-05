import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { requireAuth } from '../middlewares/rolebase.middleware';
import { validate } from '../utils/validation';
import { createPostSchema, createCommentSchema, reactionSchema } from '../schemas/post.schema';

const router = Router();

// POSTS
router.post('/', requireAuth, validate(createPostSchema), postController.createPost);
router.get('/', requireAuth, postController.getPosts);
router.get('/:postId', requireAuth, postController.getPostById);
router.delete('/:postId', requireAuth, postController.deletePost);

// COMMENTS
router.post('/comment', requireAuth, validate(createCommentSchema), postController.addComment);
router.get('/:postId/comments', requireAuth, postController.getCommentsByPost);
router.delete('/comment/:commentId', requireAuth, postController.deleteComment);

// REACTIONS
router.post('/:postId/reaction/toggle', requireAuth, postController.handlePostReactionToggle);
router.get('/:postId/reaction/count', requireAuth, postController.getPostReactionCount);

export default router;