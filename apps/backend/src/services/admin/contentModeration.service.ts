// apps/backend/src/services/admin/contentModeration.service.ts - COMPLETE CORRECTED VERSION

import prisma from "../../config/prisma";
import { BaseService } from "../base.service";
import { AppError, ValidationError } from "../../utils/error";
import { ModerationAction } from "../../generated/prisma";
import { logger } from "../../utils/logger";

// Interface for type safety
interface PostIdentifier {
  post_id: number;
  user_id: number;
}

class ContentModerationService extends BaseService {
  async getContentForReview(page: number = 1, limit: number = 20) {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20;

    const skip = (page - 1) * limit;

    logger.debug('Fetching content for review', { page, limit });

    try {
      const [posts, comments, totalPosts, totalComments] = await Promise.all([
        prisma.post.findMany({
          where: { deleted_at: null },
          skip,
          take: limit,
          include: {
            user: {
              select: { user_id: true, username: true }
            },
            reports: {
              where: { status: { in: ['pending', 'in_review'] } },
              select: {
                report_id: true,
                reason: true,
                status: true,
                created_at: true,
                reporter: {
                  select: { user_id: true, username: true }
                }
              }
            },
            _count: {
              select: {
                reports: true,
                likes: { where: { deleted_at: null } },
                comments: { where: { deleted_at: null } }
              }
            }
          },
          orderBy: { created_at: 'desc' }
        }),
        prisma.comment.findMany({
          where: { deleted_at: null },
          skip,
          take: limit,
          include: {
            user: {
              select: { user_id: true, username: true }
            },
            post: {
              select: { post_id: true, title: true }
            },
            reports: {
              where: { status: { in: ['pending', 'in_review'] } },
              select: {
                report_id: true,
                reason: true,
                status: true,
                created_at: true,
                reporter: {
                  select: { user_id: true, username: true }
                }
              }
            },
            _count: {
              select: { reports: true }
            }
          },
          orderBy: { created_at: 'desc' }
        }),
        prisma.post.count({ where: { deleted_at: null } }),
        prisma.comment.count({ where: { deleted_at: null } })
      ]);

      logger.info('Content for review fetched successfully', {
        postsCount: posts.length,
        commentsCount: comments.length
      });

      return {
        posts,
        comments,
        meta: {
          totalPosts,
          totalComments,
          page,
          lastPage: Math.ceil(totalPosts / limit),
          limit
        }
      };
    } catch (error) {
      logger.error('Error fetching content for review', error);
      throw new AppError('Failed to fetch content for review', 500);
    }
  }

  async deletePost(postId: number, adminId: number, reason?: string) {
    this.validateId(postId, 'Post ID');
    this.validateId(adminId, 'Admin ID');

    logger.info('Deleting post', { postId, adminId });

    try {
      return await this.executeTransaction(async (tx) => {
        const post = await tx.post.findFirst({
          where: { post_id: postId, deleted_at: null }
        });

        if (!post) {
          throw new AppError('Post not found', 404);
        }

        const deletedPost = await tx.post.update({
          where: { post_id: postId },
          data: { deleted_at: new Date() }
        });

        await tx.moderationLog.create({
          data: {
            admin_id: adminId,
            action: ModerationAction.delete_post,
            target_id: postId.toString(),
            target_user_id: post.user_id,
            reason: reason?.trim() || 'Post removed by moderator'
          }
        });

        logger.info('Post deleted successfully', { postId });

        return deletedPost;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error deleting post', error);
      throw new AppError('Failed to delete post', 500);
    }
  }

  async deleteComment(commentId: number, adminId: number, reason?: string) {
    this.validateId(commentId, 'Comment ID');
    this.validateId(adminId, 'Admin ID');

    logger.info('Deleting comment', { commentId, adminId });

    try {
      return await this.executeTransaction(async (tx) => {
        const comment = await tx.comment.findFirst({
          where: { comment_id: commentId, deleted_at: null }
        });

        if (!comment) {
          throw new AppError('Comment not found', 404);
        }

        const deletedComment = await tx.comment.update({
          where: { comment_id: commentId },
          data: { deleted_at: new Date() }
        });

        await tx.moderationLog.create({
          data: {
            admin_id: adminId,
            action: ModerationAction.delete_comment,
            target_id: commentId.toString(),
            target_user_id: comment.user_id,
            reason: reason?.trim() || 'Comment removed by moderator'
          }
        });

        logger.info('Comment deleted successfully', { commentId });

        return deletedComment;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error deleting comment', error);
      throw new AppError('Failed to delete comment', 500);
    }
  }

  async bulkDeletePosts(postIds: number[], adminId: number, reason?: string) {
    if (!Array.isArray(postIds) || postIds.length === 0) {
      throw new ValidationError('Post IDs array is required');
    }

    if (postIds.length > 100) {
      throw new ValidationError('Cannot delete more than 100 posts at once');
    }

    this.validateId(adminId, 'Admin ID');

    logger.info('Bulk deleting posts', { count: postIds.length, adminId });

    try {
      return await this.executeTransaction(async (tx) => {
        const posts: PostIdentifier[] = await tx.post.findMany({
          where: {
            post_id: { in: postIds },
            deleted_at: null
          },
          select: { post_id: true, user_id: true }
        });

        if (posts.length === 0) {
          throw new AppError('No valid posts found', 404);
        }

        await tx.post.updateMany({
          where: { post_id: { in: posts.map(p => p.post_id) } },
          data: { deleted_at: new Date() }
        });

        await tx.moderationLog.createMany({
          data: posts.map(post => ({
            admin_id: adminId,
            action: ModerationAction.delete_post,
            target_id: post.post_id.toString(),
            target_user_id: post.user_id,
            reason: reason?.trim() || 'Bulk post deletion by moderator'
          }))
        });

        logger.info('Posts bulk deleted successfully', { count: posts.length });

        return {
          deletedCount: posts.length,
          message: `Successfully deleted ${posts.length} posts`
        };
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error bulk deleting posts', error);
      throw new AppError('Failed to bulk delete posts', 500);
    }
  }

  async restorePost(postId: number, adminId: number) {
    this.validateId(postId, 'Post ID');
    this.validateId(adminId, 'Admin ID');

    logger.info('Restoring post', { postId, adminId });

    try {
      return await this.executeTransaction(async (tx) => {
        const post = await tx.post.findUnique({
          where: { post_id: postId }
        });

        if (!post) {
          throw new AppError('Post not found', 404);
        }

        if (!post.deleted_at) {
          throw new ValidationError('Post is not deleted');
        }

        const restoredPost = await tx.post.update({
          where: { post_id: postId },
          data: { deleted_at: null }
        });

        await tx.moderationLog.create({
          data: {
            admin_id: adminId,
            action: ModerationAction.warn_user,
            target_id: postId.toString(),
            target_user_id: post.user_id,
            reason: 'Post restored by moderator'
          }
        });

        logger.info('Post restored successfully', { postId });

        return restoredPost;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error restoring post', error);
      throw new AppError('Failed to restore post', 500);
    }
  }

  async featurePost(postId: number, adminId: number) {
    this.validateId(postId, 'Post ID');
    this.validateId(adminId, 'Admin ID');

    logger.info('Toggling post feature status', { postId, adminId });

    try {
      return await this.executeTransaction(async (tx) => {
        const post = await tx.post.findFirst({
          where: { post_id: postId, deleted_at: null }
        });

        if (!post) {
          throw new AppError('Post not found', 404);
        }

        const updatedPost = await tx.post.update({
          where: { post_id: postId },
          data: { featured: !post.featured }
        });

        await tx.moderationLog.create({
          data: {
            admin_id: adminId,
            action: ModerationAction.warn_user,
            target_id: postId.toString(),
            target_user_id: post.user_id,
            reason: post.featured ? 'Post unfeatured' : 'Post featured'
          }
        });

        logger.info('Post feature status toggled', { 
          postId, 
          featured: updatedPost.featured 
        });

        return updatedPost;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error featuring post', error);
      throw new AppError('Failed to feature post', 500);
    }
  }
}

// Export singleton instance
export const contentModerationService = new ContentModerationService();

// Export individual functions for backward compatibility
export const getContentForReview = contentModerationService.getContentForReview.bind(contentModerationService);
export const deletePost = contentModerationService.deletePost.bind(contentModerationService);
export const deleteComment = contentModerationService.deleteComment.bind(contentModerationService);
export const bulkDeletePosts = contentModerationService.bulkDeletePosts.bind(contentModerationService);
export const restorePost = contentModerationService.restorePost.bind(contentModerationService);
export const featurePost = contentModerationService.featurePost.bind(contentModerationService);