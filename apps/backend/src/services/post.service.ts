// apps/backend/src/services/post.service.ts - REFACTORED VERSION
import prisma from "../config/prisma";
import { BaseService } from "./base.service";
import { 
  ValidationError, 
  NotFoundError, 
  ForbiddenError 
} from "../utils/error";
import { VALIDATION_LIMITS } from "../constats";
import { Category } from "../generated/prisma";

type FeedType = 'all' | 'trending' | 'popular' | 'featured';

class PostService extends BaseService {
  // Create post
  async createPost(data: {
    user_id: number;
    title: string;
    content: string;
    imageUrl?: string;
    tags?: string[];
    category: Category;
    featured?: boolean;
  }) {
    // Validate
    this.validateId(data.user_id, 'User ID');
    this.validateRequiredString(
      data.title, 
      'Post title', 
      1, 
      VALIDATION_LIMITS.POST.TITLE_MAX
    );
    this.validateRequiredString(
      data.content, 
      'Post content', 
      1, 
      VALIDATION_LIMITS.POST.CONTENT_MAX
    );
    this.validateEnum(data.category, Category, 'category');

    return prisma.post.create({
      data: {
        user_id: data.user_id,
        title: data.title.trim(),
        content: data.content.trim(),
        image_url: data.imageUrl || null,
        tags: data.tags || [],
        category: data.category,
        featured: data.featured || false,
      },
      include: {
        user: {
          select: { user_id: true, username: true }
        }
      }
    });
  }

  // Get posts with feed type
  async getPosts(
    feedType: FeedType = 'all',
    page = 1,
    limit = 10,
    userId?: number
  ) {
    // Define filters based on feed type
    let where: any = { deleted_at: null };
    let orderBy: any = { created_at: 'desc' };

    switch (feedType) {
      case 'trending':
        orderBy = [
          { likes: { _count: 'desc' } },
          { comments: { _count: 'desc' } },
          { created_at: 'desc' }
        ];
        break;
      case 'popular':
        orderBy = [
          { likes: { _count: 'desc' } },
          { created_at: 'desc' }
        ];
        break;
      case 'featured':
        where.featured = true;
        break;
      default:
        // 'all' - use default ordering
        break;
    }

    const result = await this.paginate<any>(prisma.post, {
      page,
      limit,
      where,
      orderBy
    });

    // Transform posts to include user reaction status
    const transformedPosts = await Promise.all(
      result.data.map(async (post) => {
        const [commentCount, likeCount, isLiked] = await Promise.all([
          prisma.comment.count({ 
            where: { post_id: post.post_id, deleted_at: null } 
          }),
          prisma.like.count({ 
            where: { post_id: post.post_id, deleted_at: null } 
          }),
          userId 
            ? prisma.like.findFirst({
                where: { 
                  post_id: post.post_id, 
                  user_id: userId, 
                  deleted_at: null 
                }
              }).then(like => !!like)
            : Promise.resolve(false)
        ]);

        const tagScore = post.tags.length * 1;
        const commentScore = commentCount * 2;
        const likeScore = likeCount * 1;

        return {
          ...post,
          commentCount,
          likeCount,
          isLiked,
          trendingScore: tagScore + commentScore + likeScore
        };
      })
    );

    // Additional sorting for trending
    if (feedType === 'trending') {
      transformedPosts.sort((a, b) => {
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return {
      data: transformedPosts,
      meta: result.meta
    };
  }

  // Get trending tags
  async getTrendingTags(limit: number = 10) {
    const posts = await prisma.post.findMany({
      where: { deleted_at: null },
      select: { tags: true }
    });

    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Get post by ID
  async getPostById(postId: number) {
    this.validateId(postId, 'Post ID');

    const post = await this.checkNotDeleted(
      prisma.post,
      { post_id: postId },
      'Post'
    );

    const [comments, likes] = await Promise.all([
      prisma.comment.findMany({
        where: { post_id: postId, deleted_at: null },
        include: { user: { select: { user_id: true, username: true } } },
        orderBy: { created_at: 'asc' }
      }),
      prisma.like.findMany({
        where: { post_id: postId, deleted_at: null },
        include: { user: { select: { user_id: true, username: true } } }
      })
    ]);

    return {
      ...post,
      comments,
      likes
    };
  }

  // Delete post
  async deletePost(postId: number, userId: number) {
    this.validateId(postId, 'Post ID');

    const post = await this.checkNotDeleted(
      prisma.post,
      { post_id: postId },
      'Post'
    );

    this.checkOwnership(post.user_id, userId, 'posts');

    return this.softDelete(prisma.post, postId, 'post_id');
  }

  // Add comment
  async addComment(data: { postId: number; userId: number; content: string }) {
    this.validateId(data.postId, 'Post ID');
    this.validateId(data.userId, 'User ID');
    this.validateRequiredString(
      data.content, 
      'Comment content', 
      1, 
      VALIDATION_LIMITS.COMMENT.MAX
    );

    // Check post exists
    await this.checkNotDeleted(
      prisma.post,
      { post_id: data.postId },
      'Post'
    );

    return prisma.comment.create({
      data: { 
        post_id: data.postId, 
        user_id: data.userId, 
        content: data.content.trim() 
      },
      include: { 
        user: { select: { user_id: true, username: true } } 
      }
    });
  }

  // Get comments by post
  async getCommentsByPost(postId: number) {
    this.validateId(postId, 'Post ID');

    // Check post exists
    await this.checkNotDeleted(
      prisma.post,
      { post_id: postId },
      'Post'
    );

    return prisma.comment.findMany({
      where: { post_id: postId, deleted_at: null },
      include: { user: { select: { user_id: true, username: true } } },
      orderBy: { created_at: 'asc' }
    });
  }

  // Delete comment
  async deleteComment(commentId: number, userId: number) {
    this.validateId(commentId, 'Comment ID');

    const comment = await this.checkNotDeleted(
      prisma.comment,
      { comment_id: commentId },
      'Comment'
    );

    this.checkOwnership(comment.user_id, userId, 'comments');

    return this.softDelete(prisma.comment, commentId, 'comment_id');
  }

  // Toggle post reaction
  async togglePostReaction(postId: number, userId: number) {
    this.validateId(postId, 'Post ID');
    this.validateId(userId, 'User ID');

    // Check post exists
    await this.checkNotDeleted(
      prisma.post,
      { post_id: postId },
      'Post'
    );

    return await this.executeTransaction(async (tx) => {
      // Check if user already has a reaction
      const existing = await tx.like.findFirst({
        where: { post_id: postId, user_id: userId }
      });

      if (!existing) {
        // Create new like
        await tx.like.create({
          data: { post_id: postId, user_id: userId }
        });
      } else {
        // Toggle existing like (soft delete/restore)
        await tx.like.update({
          where: { like_id: existing.like_id },
          data: { deleted_at: existing.deleted_at ? null : new Date() }
        });
      }

      // Get updated counts and status
      const [likeCount, userReaction] = await Promise.all([
        tx.like.count({ where: { post_id: postId, deleted_at: null } }),
        tx.like.findFirst({
          where: { post_id: postId, user_id: userId, deleted_at: null }
        })
      ]);

      return {
        isLiked: !!userReaction,
        likeCount,
        postId,
        userId
      };
    });
  }

  // Count reactions
  async countReactions(postId: number) {
    this.validateId(postId, 'Post ID');
    return prisma.like.count({ 
      where: { post_id: postId, deleted_at: null } 
    });
  }

  // Get user's reaction status
  async getUserReactionStatus(postId: number, userId: number) {
    this.validateId(postId, 'Post ID');
    this.validateId(userId, 'User ID');

    const reaction = await prisma.like.findFirst({
      where: {
        post_id: postId,
        user_id: userId,
        deleted_at: null
      }
    });

    return !!reaction;
  }
}

// Export singleton instance
export const postService = new PostService();

// Export individual functions for backward compatibility
export const createPost = postService.createPost.bind(postService);
export const getPosts = postService.getPosts.bind(postService);
export const getTrendingTags = postService.getTrendingTags.bind(postService);
export const getPostById = postService.getPostById.bind(postService);
export const deletePost = postService.deletePost.bind(postService);
export const addComment = postService.addComment.bind(postService);
export const getCommentsByPost = postService.getCommentsByPost.bind(postService);
export const deleteComment = postService.deleteComment.bind(postService);
export const togglePostReaction = postService.togglePostReaction.bind(postService);
export const countReactions = postService.countReactions.bind(postService);
export const getUserReactionStatus = postService.getUserReactionStatus.bind(postService);