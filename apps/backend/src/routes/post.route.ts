import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POSTS
router.post('/', authMiddleware, postController.createPost);
router.get('/', authMiddleware, postController.getPosts);
router.get('/:postId', authMiddleware, postController.getPostById);
router.delete('/:postId', authMiddleware, postController.deletePost);

// COMMENTS
router.post('/comment', authMiddleware, postController.addComment);
router.get('/:postId/comments', authMiddleware, postController.getCommentsByPost);
router.delete('/comment/:commentId', authMiddleware, postController.deleteComment);

// REACTIONS (LIKE/UNLIKE TOGGLE)
router.post('/:postId/reaction/toggle', authMiddleware, postController.handlePostReactionToggle);
router.get('/:postId/reaction/count', authMiddleware, postController.getPostReactionCount);

export default router;
