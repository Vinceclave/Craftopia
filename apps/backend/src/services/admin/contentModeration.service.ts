// apps/backend/src/services/admin/contentModeration.service.ts

import prisma from "../../config/prisma";
import { AppError } from "../../utils/error";
import { ModerationAction } from "../../generated/prisma";

export const deletePost = async (postId: number, adminId: number, reason?: string) => {
  if (!postId || postId <= 0) {
    throw new AppError('Invalid post ID', 400);
  }

  try {
    const post = await prisma.post.findFirst({
      where: { post_id: postId, deleted_at: null }
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Soft delete the post
    const deletedPost = await prisma.post.update({
      where: { post_id: postId },
      data: { deleted_at: new Date() }
    });

    // Log moderation action
    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: ModerationAction.delete_post,
        target_id: postId.toString(),
        target_user_id: post.user_id,
        reason: reason || 'Post removed by moderator'
      }
    });

    return deletedPost;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error deleting post:', error);
    throw new AppError('Failed to delete post', 500);
  }
};

export const deleteComment = async (commentId: number, adminId: number, reason?: string) => {
  if (!commentId || commentId <= 0) {
    throw new AppError('Invalid comment ID', 400);
  }

  try {
    const comment = await prisma.comment.findFirst({
      where: { comment_id: commentId, deleted_at: null }
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Soft delete the comment
    const deletedComment = await prisma.comment.update({
      where: { comment_id: commentId },
      data: { deleted_at: new Date() }
    });

    // Log moderation action
    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: ModerationAction.delete_comment,
        target_id: commentId.toString(),
        target_user_id: comment.user_id,
        reason: reason || 'Comment removed by moderator'
      }
    });

    return deletedComment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error deleting comment:', error);
    throw new AppError('Failed to delete comment', 500);
  }
};

export const bulkDeletePosts = async (postIds: number[], adminId: number, reason?: string) => {
  if (!Array.isArray(postIds) || postIds.length === 0) {
    throw new AppError('Post IDs array is required', 400);
  }

  if (postIds.length > 100) {
    throw new AppError('Cannot delete more than 100 posts at once', 400);
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        post_id: { in: postIds },
        deleted_at: null
      },
      select: { post_id: true, user_id: true }
    });

    if (posts.length === 0) {
      throw new AppError('No valid posts found', 404);
    }

    // Soft delete posts
    await prisma.post.updateMany({
      where: { post_id: { in: posts.map(p => p.post_id) } },
      data: { deleted_at: new Date() }
    });

    // Log moderation actions
    await prisma.moderationLog.createMany({
      data: posts.map(post => ({
        admin_id: adminId,
        action: ModerationAction.delete_post,
        target_id: post.post_id.toString(),
        target_user_id: post.user_id,
        reason: reason || 'Bulk post deletion by moderator'
      }))
    });

    return {
      deletedCount: posts.length,
      message: `Successfully deleted ${posts.length} posts`
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error bulk deleting posts:', error);
    throw new AppError('Failed to bulk delete posts', 500);
  }
};

export const restorePost = async (postId: number, adminId: number) => {
  if (!postId || postId <= 0) {
    throw new AppError('Invalid post ID', 400);
  }

  try {
    const post = await prisma.post.findUnique({
      where: { post_id: postId }
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (!post.deleted_at) {
      throw new AppError('Post is not deleted', 400);
    }

    const restoredPost = await prisma.post.update({
      where: { post_id: postId },
      data: { deleted_at: null }
    });

    // Log moderation action
    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: ModerationAction.warn_user,
        target_id: postId.toString(),
        target_user_id: post.user_id,
        reason: 'Post restored by moderator'
      }
    });

    return restoredPost;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error restoring post:', error);
    throw new AppError('Failed to restore post', 500);
  }
};

export const getContentForReview = async (page: number = 1, limit: number = 20) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 20;

  const skip = (page - 1) * limit;

  try {
    // Get posts with reports or high negative engagement
    const [reportedPosts, flaggedComments] = await Promise.all([
      prisma.post.findMany({
        where: {
          deleted_at: null,
          reports: {
            some: {
              status: { in: ['pending', 'in_review'] }
            }
          }
        },
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
        where: {
          deleted_at: null,
          reports: {
            some: {
              status: { in: ['pending', 'in_review'] }
            }
          }
        },
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
          }
        },
        orderBy: { created_at: 'desc' }
      })
    ]);

    const [totalPosts, totalComments] = await Promise.all([
      prisma.post.count({
        where: {
          deleted_at: null,
          reports: { some: { status: { in: ['pending', 'in_review'] } } }
        }
      }),
      prisma.comment.count({
        where: {
          deleted_at: null,
          reports: { some: { status: { in: ['pending', 'in_review'] } } }
        }
      })
    ]);

    return {
      posts: reportedPosts,
      comments: flaggedComments,
      meta: {
        totalPosts,
        totalComments,
        page,
        lastPage: Math.ceil((totalPosts + totalComments) / limit),
        limit
      }
    };
  } catch (error) {
    console.error('Error fetching content for review:', error);
    throw new AppError('Failed to fetch content for review', 500);
  }
};

export const featurePost = async (postId: number, adminId: number) => {
  if (!postId || postId <= 0) {
    throw new AppError('Invalid post ID', 400);
  }

  try {
    const post = await prisma.post.findFirst({
      where: { post_id: postId, deleted_at: null }
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const updatedPost = await prisma.post.update({
      where: { post_id: postId },
      data: { featured: !post.featured }
    });

    // Log moderation action
    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: ModerationAction.warn_user,
        target_id: postId.toString(),
        target_user_id: post.user_id,
        reason: post.featured ? 'Post unfeatured' : 'Post featured'
      }
    });

    return updatedPost;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error featuring post:', error);
    throw new AppError('Failed to feature post', 500);
  }
};