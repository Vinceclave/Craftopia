// apps/backend/src/routes/post.route.ts - COMPLETE VERSION WITH SEARCH & UPDATE
import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { requireAuth } from '../middlewares/rolebase.middleware';
import { validate } from '../utils/validation';
import { createPostSchema, createCommentSchema } from '../schemas/post.schema';

const router = Router();

// ========================================
// POST ROUTES
// ========================================

// Create new post
router.post('/', requireAuth, validate(createPostSchema), postController.createPost);

// Get posts with feed type (all, trending, popular, featured)
router.get('/', requireAuth, postController.getPosts);

// NEW: Search posts with filters (query, category, tag)
router.get('/search', requireAuth, postController.searchPosts);

// Get trending tags
router.get('/trending', requireAuth, postController.getTrendingTags);

// Get post by ID
router.get('/:postId', requireAuth, postController.getPostById);

// NEW: Update post
router.put('/:postId', requireAuth, postController.updatePost);

// Delete post
router.delete('/:postId', requireAuth, postController.deletePost);

// ========================================
// COMMENT ROUTES
// ========================================

// Add comment to post
router.post('/comment', requireAuth, validate(createCommentSchema), postController.addComment);

// Get comments for a post
router.get('/:postId/comments', requireAuth, postController.getCommentsByPost);

// Delete comment
router.delete('/comment/:commentId', requireAuth, postController.deleteComment);

// ========================================
// REACTION ROUTES
// ========================================

// Toggle post reaction (like/unlike)
router.post('/:postId/reaction/toggle', requireAuth, postController.handlePostReactionToggle);

// Get reaction count for a post
router.get('/:postId/reaction/count', requireAuth, postController.getPostReactionCount);

// Get user's reaction status for a post
router.get('/:postId/reaction/status', requireAuth, postController.getUserReactionStatus);

export default router;