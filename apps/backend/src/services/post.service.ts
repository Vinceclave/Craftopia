// apps/backend/src/services/post.service.ts - FIXED WITH PROPER BROADCASTS
import prisma from "../config/prisma";
import { BaseService } from "./base.service";
import { VALIDATION_LIMITS } from "../constats";
import { Category } from "../generated/prisma";
import { WebSocketEmitter } from "../websocket/events";

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

    const post = await prisma.post.create({
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
          select: { 
            user_id: true, 
            username: true,
            profile: {
              select: {
                profile_picture_url: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: { where: { deleted_at: null } },
            comments: { where: { deleted_at: null } }
          }
        }
      }
    });

    console.log('📝 Post created:', post.post_id);

    // 🔥 BROADCAST TO ALL CLIENTS - This makes posts appear on all devices
    WebSocketEmitter.broadcast('post:created', {
      post_id: post.post_id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      category: post.category,
      tags: post.tags,
      featured: post.featured,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: post.user.username,
      user: {
        user_id: post.user.user_id,
        username: post.user.username,
        profile_picture_url: post.user.profile?.profile_picture_url || null
      },
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked: false
    });

    return post;
  }

  // Get posts with feed type
  async getPosts(
    feedType: FeedType = 'all',
    page = 1,
    limit = 10,
    userId?: number
  ) {
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
        break;
    }

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              profile: {
                select: {
                  profile_picture_url: true
                }
              }
            }
          },
          _count: {
            select: {
              likes: { where: { deleted_at: null } },
              comments: { where: { deleted_at: null } }
            }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    const lastPage = Math.max(1, Math.ceil(total / limit));

    const transformedPosts = await Promise.all(
      posts.map(async (post) => {
        const [isLiked] = await Promise.all([
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

        const commentCount = post._count.comments;
        const likeCount = post._count.likes;
        const tagScore = post.tags.length * 1;
        const commentScore = commentCount * 2;
        const likeScore = likeCount * 1;

        return {
          ...post,
          user: {
            user_id: post.user.user_id,
            username: post.user.username,
            profile_picture_url: post.user.profile?.profile_picture_url || null
          },
          commentCount,
          likeCount,
          isLiked,
          trendingScore: tagScore + commentScore + likeScore
        };
      })
    );

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
      meta: {
        total,
        page,
        lastPage,
        limit,
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1
      }
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

    const [postWithUser, comments, likes] = await Promise.all([
      prisma.post.findFirst({
        where: { post_id: postId, deleted_at: null },
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              profile: {
                select: {
                  profile_picture_url: true
                }
              }
            }
          },
          _count: {
            select: {
              likes: { where: { deleted_at: null } },
              comments: { where: { deleted_at: null } }
            }
          }
        }
      }),
      prisma.comment.findMany({
        where: { post_id: postId, deleted_at: null },
        include: { 
          user: { 
            select: { 
              user_id: true, 
              username: true,
              profile: {
                select: {
                  profile_picture_url: true
                }
              }
            } 
          } 
        },
        orderBy: { created_at: 'asc' }
      }),
      prisma.like.findMany({
        where: { post_id: postId, deleted_at: null },
        include: { 
          user: { 
            select: { 
              user_id: true, 
              username: true 
            } 
          } 
        }
      })
    ]);

    return {
      ...postWithUser,
      user: {
        user_id: postWithUser!.user.user_id,
        username: postWithUser!.user.username,
        profile_picture_url: postWithUser!.user.profile?.profile_picture_url || null
      },
      comments: comments.map(comment => ({
        ...comment,
        user: {
          user_id: comment.user.user_id,
          username: comment.user.username,
          profile_picture_url: comment.user.profile?.profile_picture_url || null
        }
      })),
      likes,
      commentCount: postWithUser!._count.comments,
      likeCount: postWithUser!._count.likes
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

    console.log('🗑️ Deleting post:', postId);

    // 🔥 BROADCAST TO ALL CLIENTS - Post deletion syncs everywhere
    WebSocketEmitter.broadcast('post:deleted', {
      postId
    });

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

    const post = await this.checkNotDeleted(
      prisma.post,
      { post_id: data.postId },
      'Post'
    );

    const [comment, commenter] = await Promise.all([
      prisma.comment.create({
        data: { 
          post_id: data.postId, 
          user_id: data.userId, 
          content: data.content.trim() 
        },
        include: { 
          user: { 
            select: { 
              user_id: true, 
              username: true,
              profile: {
                select: {
                  profile_picture_url: true
                }
              }
            } 
          } 
        }
      }),
      prisma.user.findUnique({
        where: { user_id: data.userId },
        select: { username: true }
      })
    ]);

    // Get updated comment count
    const commentCount = await prisma.comment.count({
      where: { post_id: data.postId, deleted_at: null }
    });

    console.log('💬 Comment added to post:', data.postId);

    // 🔥 BROADCAST TO ALL CLIENTS - Comment count updates everywhere
    WebSocketEmitter.broadcast('post:commented', {
      postId: data.postId,
      commentId: comment.comment_id,
      username: commenter?.username || 'Someone',
      content: comment.content.substring(0, 50),
      userId: data.userId,
      commentCount // Include updated count
    });

    // 🔥 NOTIFY POST OWNER (if not commenting on own post)
    if (post.user_id !== data.userId) {
      console.log('📡 Notifying post owner:', post.user_id);
      WebSocketEmitter.emitToUser(post.user_id, 'post:commented', {
        postId: data.postId,
        commentId: comment.comment_id,
        username: commenter?.username || 'Someone',
        content: comment.content.substring(0, 50),
        userId: data.userId,
        commentCount,
        notification: true // Flag for notification
      });
    }

    return {
      ...comment,
      user: {
        user_id: comment.user.user_id,
        username: comment.user.username,
        profile_picture_url: comment.user.profile?.profile_picture_url || null
      }
    };
  }

  // Get comments by post
  async getCommentsByPost(postId: number) {
    this.validateId(postId, 'Post ID');

    await this.checkNotDeleted(
      prisma.post,
      { post_id: postId },
      'Post'
    );

    const comments = await prisma.comment.findMany({
      where: { post_id: postId, deleted_at: null },
      include: { 
        user: { 
          select: { 
            user_id: true, 
            username: true,
            profile: {
              select: {
                profile_picture_url: true
              }
            }
          } 
        } 
      },
      orderBy: { created_at: 'asc' }
    });

    return comments.map(comment => ({
      ...comment,
      user: {
        user_id: comment.user.user_id,
        username: comment.user.username,
        profile_picture_url: comment.user.profile?.profile_picture_url || null
      }
    }));
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

    console.log('🔵 Backend: Toggle reaction', { postId, userId });

    const post = await this.checkNotDeleted(
      prisma.post,
      { post_id: postId },
      'Post'
    );

    return await this.executeTransaction(async (tx) => {
      const existing = await tx.like.findFirst({
        where: { post_id: postId, user_id: userId }
      });

      console.log('🔍 Existing like:', existing ? 'Found' : 'Not found', existing?.deleted_at ? '(soft deleted)' : '');

      let isLiked: boolean;

      if (!existing) {
        console.log('➕ Creating new like');
        await tx.like.create({
          data: { post_id: postId, user_id: userId }
        });
        isLiked = true;
      } else {
        console.log('🔄 Toggling existing like');
        const newDeletedAt = existing.deleted_at ? null : new Date();
        await tx.like.update({
          where: { like_id: existing.like_id },
          data: { deleted_at: newDeletedAt }
        });
        isLiked = newDeletedAt === null;
      }

      const [likeCount, liker] = await Promise.all([
        tx.like.count({ where: { post_id: postId, deleted_at: null } }),
        tx.user.findUnique({
          where: { user_id: userId },
          select: { username: true }
        })
      ]);

      const result = {
        isLiked,
        likeCount,
        postId,
        userId
      };

      console.log('✅ Backend result:', result);

      // 🔥 BROADCAST TO ALL CLIENTS - Like count updates everywhere
      WebSocketEmitter.broadcast('post:liked', {
        postId,
        username: liker?.username || 'Someone',
        likeCount,
        userId,
        isLiked
      });

      // 🔥 NOTIFY POST OWNER (only if user liked, not unliked, and not own post)
      if (post.user_id !== userId && isLiked) {
        console.log('📡 Notifying post owner about like:', post.user_id);
        WebSocketEmitter.emitToUser(post.user_id, 'post:liked', {
          postId,
          username: liker?.username || 'Someone',
          likeCount,
          userId,
          isLiked,
          notification: true // Flag for notification
        });
      }

      return result;
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