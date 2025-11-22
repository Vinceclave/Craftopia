// apps/backend/src/services/post.service.ts - FIXED VERSION WITH USER DATA
import { Post, Comment, Category } from '../generated/prisma';
import prisma from '../config/prisma';
import { AppError } from '../utils/error';

// ============================================
// INLINE TYPE DEFINITIONS
// ============================================

// PostWithAuthor type - inline definition
interface PostWithAuthor {
  post_id: number;
  title: string;
  content: string;
  image_url: string | null;
  tags: string[];
  category: Category;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  user: {
    user_id: number;
    username: string;
    profile_picture_url?: string | null;
  };
  comment_count: number;
  like_count: number;
  is_liked: boolean;
}

// CommentWithAuthor type - inline definition
interface CommentWithAuthor {
  comment_id: number;
  post_id: number;
  content: string;
  created_at: Date;
  user_id: number;
  user: {
    user_id: number;
    username: string;
    profile_picture_url?: string | null;
  };
}

// Input types
interface CreatePostInput {
  user_id: number;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  category: string;
  featured?: boolean;
}

interface UpdatePostInput {
  title?: string;
  content?: string;
  tags?: string[];
  imageUrl?: string | null;
  category?: string;
}

interface SearchPostsParams {
  search?: string;
  category?: string;
  tag?: string;
  page: number;
  limit: number;
  userId?: number;
}

// ============================================
// HELPER FUNCTION TO TRANSFORM POSTS
// ============================================

function transformPostToResponse(post: any, userId?: number): PostWithAuthor {
  return {
    post_id: post.post_id,
    title: post.title,
    content: post.content,
    image_url: post.image_url,
    tags: post.tags,
    category: post.category,
    featured: post.featured,
    created_at: post.created_at,
    updated_at: post.updated_at,
    user_id: post.user.user_id,
    user: {
      user_id: post.user.user_id,
      username: post.user.username,
      profile_picture_url: post.user.profile?.profile_picture_url || null,
    },
    comment_count: post._count?.comments || 0,
    like_count: post._count?.likes || 0,
    is_liked: userId ? (post.likes as any[]).length > 0 : false,
  };
}

// ============================================
// POST SERVICE CLASS
// ============================================

export class PostService {
  
  private validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new AppError('Page number must be greater than 0', 400);
    }
    if (limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400);
    }
  }

  async createPost(data: CreatePostInput): Promise<PostWithAuthor> {
    const post = await prisma.post.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        content: data.content,
        image_url: data.imageUrl || null,
        tags: data.tags || [],
        category: data.category as Category,
        featured: data.featured || false,
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return transformPostToResponse({ ...post, likes: [] });
  }

  async getPosts(
  feedType: 'all' | 'trending' | 'popular' | 'featured',
  page: number,
  limit: number,
  userId?: number
) {
  this.validatePagination(page, limit);
  const skip = (page - 1) * limit;

  let orderBy: any = { created_at: 'desc' };
  let where: any = { deleted_at: null };

  if (feedType === 'trending') {
    orderBy = { created_at: 'desc' };
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    where.created_at = { gte: sevenDaysAgo };
  } else if (feedType === 'popular') {
    orderBy = { likes: { _count: 'desc' } };
  } else if (feedType === 'featured') {
    where.featured = true;
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            profile: {
              select: {
                profile_picture_url: true,
              }
            },
          },
        },
        _count: {
          select: {
            comments: true, // ✅ CRITICAL: Must include this
            likes: true,    // ✅ CRITICAL: Must include this
          },
        },
        likes: userId ? {
          where: { user_id: userId },
          select: { user_id: true },
        } : false,
      },
    }),
    prisma.post.count({ where }),
  ]);

  console.log('📊 Posts fetched with counts:', posts.map(p => ({
    id: p.post_id,
    comments: p._count.comments,
    likes: p._count.likes
  })));

  const postsWithAuthor = posts.map((post) => transformPostToResponse(post, userId));

  return {
    data: postsWithAuthor,
    meta: {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    },
  };
}

  async searchPosts(params: SearchPostsParams) {
    this.validatePagination(params.page, params.limit);
    const skip = (params.page - 1) * params.limit;

    const where: any = { deleted_at: null };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.category) {
      where.category = params.category as Category;
    }

    if (params.tag) {
      where.tags = { has: params.tag };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: params.limit,
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          likes: params.userId ? {
            where: { user_id: params.userId },
            select: { user_id: true },
          } : false,
        },
      }),
      prisma.post.count({ where }),
    ]);

    const postsWithAuthor = posts.map((post) => transformPostToResponse(post, params.userId));

    return {
      data: postsWithAuthor,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        lastPage: Math.ceil(total / params.limit),
      },
    };
  }

  async getTrendingTags(): Promise<string[]> {
    const posts = await prisma.post.findMany({
      where: { deleted_at: null },
      select: { tags: true },
    });

    const tagCount = new Map<string, number>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  async getPostById(postId: number): Promise<PostWithAuthor> {
    const post = await prisma.post.findUnique({
      where: { post_id: postId, deleted_at: null },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            profile: {
              select: {
                profile_picture_url: true,
              }
            },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return transformPostToResponse({ ...post, likes: [] });
  }

  async updatePost(
    postId: number,
    userId: number,
    data: UpdatePostInput
  ): Promise<PostWithAuthor> {
    const existingPost = await prisma.post.findUnique({
      where: { post_id: postId, deleted_at: null },
    });

    if (!existingPost) {
      throw new AppError('Post not found', 404);
    }

    if (existingPost.user_id !== userId) {
      throw new AppError('You are not authorized to update this post', 403);
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.category !== undefined) updateData.category = data.category as Category;

    const updatedPost = await prisma.post.update({
      where: { post_id: postId },
      data: updateData,
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            profile: {
              select: {
                profile_picture_url: true,
              }
            },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return transformPostToResponse({ ...updatedPost, likes: [] });
  }

  async deletePost(postId: number, userId: number): Promise<Post> {
    const post = await prisma.post.findUnique({
      where: { post_id: postId, deleted_at: null },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.user_id !== userId) {
      throw new AppError('You are not authorized to delete this post', 403);
    }

    return await prisma.post.update({
      where: { post_id: postId },
      data: { deleted_at: new Date() },
    });
  }

  async addComment(data: {
    postId: number;
    userId: number;
    content: string;
  }): Promise<CommentWithAuthor> {
    const post = await prisma.post.findUnique({
      where: { post_id: data.postId, deleted_at: null },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const comment = await prisma.comment.create({
      data: {
        post_id: data.postId,
        user_id: data.userId,
        content: data.content,
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
             profile: {
              select: {
                profile_picture_url: true,
              }
            },
          },
        },
      },
    });

    return {
      comment_id: comment.comment_id,
      post_id: comment.post_id,
      content: comment.content,
      created_at: comment.created_at,
      user_id: comment.user.user_id,
      user: {
        user_id: comment.user.user_id,
        username: comment.user.username,
        profile_picture_url: comment.user.profile?.profile_picture_url || null,
      },
    };
  }

  async getCommentsByPost(postId: number): Promise<CommentWithAuthor[]> {
    const comments = await prisma.comment.findMany({
      where: { post_id: postId, deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            profile: {
              select: {
                profile_picture_url: true,
              }
            }
          },
        },
      },
    });

    return comments.map(( comment) => ({
      comment_id: comment.comment_id,
      post_id: comment.post_id,
      content: comment.content,
      created_at: comment.created_at,
      user_id: comment.user.user_id,
      user: {
        user_id: comment.user.user_id,
        username: comment.user.username,
      },
    }));
  }

  async deleteComment(commentId: number, userId: number): Promise<Comment> {
    const comment = await prisma.comment.findUnique({
      where: { comment_id: commentId, deleted_at: null },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.user_id !== userId) {
      throw new AppError('You are not authorized to delete this comment', 403);
    }

    return await prisma.comment.update({
      where: { comment_id: commentId },
      data: { deleted_at: new Date() },
    });
  }

  async togglePostReaction(postId: number, userId: number) {
    const post = await prisma.post.findUnique({
      where: { post_id: postId, deleted_at: null },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const existingReaction = await prisma.like.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    if (existingReaction) {
      await prisma.like.delete({
        where: {
          post_id_user_id: {
            post_id: postId,
            user_id: userId,
          },
        },
      });

      const likeCount = await prisma.like.count({
        where: { post_id: postId },
      });

      return {
        isLiked: false,
        likeCount,
        postId,
        userId,
      };
    } else {
      await prisma.like.create({
        data: {
          post_id: postId,
          user_id: userId,
        },
      });

      const likeCount = await prisma.like.count({
        where: { post_id: postId },
      });


      return {
        isLiked: !existingReaction, // or true if created
        likeCount, // ✅ Real count from DB
        postId,
        userId,
      };
    }
  }

  async countReactions(postId: number): Promise<number> {
    return await prisma.like.count({
      where: { post_id: postId },
    });
  }

  async getUserReactionStatus(postId: number, userId: number): Promise<boolean> {
    const reaction = await prisma.like.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    return !!reaction;
  }
}

export const postService = new PostService();

// Export individual methods for backward compatibility
export const createPost = (data: CreatePostInput) => postService.createPost(data);
export const getPosts = (feedType: 'all' | 'trending' | 'popular' | 'featured', page: number, limit: number, userId?: number) => 
  postService.getPosts(feedType, page, limit, userId);
export const searchPosts = (params: SearchPostsParams) => postService.searchPosts(params);
export const getTrendingTags = () => postService.getTrendingTags();
export const getPostById = (postId: number) => postService.getPostById(postId);
export const updatePost = (postId: number, userId: number, data: UpdatePostInput) => 
  postService.updatePost(postId, userId, data);
export const deletePost = (postId: number, userId: number) => postService.deletePost(postId, userId);
export const addComment = (data: { postId: number; userId: number; content: string }) => 
  postService.addComment(data);
export const getCommentsByPost = (postId: number) => postService.getCommentsByPost(postId);
export const deleteComment = (commentId: number, userId: number) => 
  postService.deleteComment(commentId, userId);
export const togglePostReaction = (postId: number, userId: number) => 
  postService.togglePostReaction(postId, userId);
export const countReactions = (postId: number) => postService.countReactions(postId);
export const getUserReactionStatus = (postId: number, userId: number) => 
  postService.getUserReactionStatus(postId, userId);