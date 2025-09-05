import { Router } from 'express';
import * as postController from '../controllers/post.controller';

const router = Router();

// POSTS
router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.get('/:postId', postController.getPostById);
router.delete('/:postId', postController.deletePost);

// COMMENTS
router.post('/comment', postController.addComment);
router.get('/:postId/comments', postController.getCommentsByPost);
router.delete('/comment/:commentId', postController.deleteComment);

// REACTIONS (LIKE/UNLIKE TOGGLE)
router.post('/:postId/reaction/toggle', postController.handlePostReactionToggle);
router.get('/:postId/reaction/count', postController.getPostReactionCount);

export default router;
