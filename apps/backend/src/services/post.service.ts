// apps/backend/src/services/post.service.ts - COMPLETE FIXED VERSION
import { Post, Comment, Category } from '../generated/prisma';
import prisma from '../config/prisma';
import { AppError } from '../utils/error';

// ============================================
// INLINE TYPE DEFINITIONS
// ============================================

// PostWithAuthor type - inline definition
interface PostWithAuthor {
  postId: number;
  title: string;
  content: string;
  imageUrl: string | null;
  tags: string[];
  category: Category;
  featured: boolean;
  createdAt: Date;
  userId: number;
  username: string;
  profilePictureUrl: string | null;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
}

// CommentWithAuthor type - inline definition
interface CommentWithAuthor {
  commentId: number;
  postId: number;
  content: string;
  createdAt: Date;
  userId: number;
  username: string;
  profilePictureUrl: string | null;
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
          include: {
            profile: true,
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

    return {
      postId: post.post_id,
      title: post.title,
      content: post.content,
      imageUrl: post.image_url,
      tags: post.tags,
      category: post.category,
      featured: post.featured,
      createdAt: post.created_at,
      userId: post.user.user_id,
      username: post.user.username,
      profilePictureUrl: post.user.profile?.profile_picture_url || null,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked: false,
    };
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
            include: {
              profile: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
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

    const postsWithAuthor = posts.map((post) => ({
      postId: post.post_id,
      title: post.title,
      content: post.content,
      imageUrl: post.image_url,
      tags: post.tags,
      category: post.category,
      featured: post.featured,
      createdAt: post.created_at,
      userId: post.user.user_id,
      username: post.user.username,
      profilePictureUrl: post.user.profile?.profile_picture_url || null,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked: userId ? (post.likes as any[]).length > 0 : false,
    }));

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
            include: {
              profile: true,
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

    const postsWithAuthor = posts.map((post) => ({
      postId: post.post_id,
      title: post.title,
      content: post.content,
      imageUrl: post.image_url,
      tags: post.tags,
      category: post.category,
      featured: post.featured,
      createdAt: post.created_at,
      userId: post.user.user_id,
      username: post.user.username,
      profilePictureUrl: post.user.profile?.profile_picture_url || null,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked: params.userId ? (post.likes as any[]).length > 0 : false,
    }));

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
          include: {
            profile: true,
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

    return {
      postId: post.post_id,
      title: post.title,
      content: post.content,
      imageUrl: post.image_url,
      tags: post.tags,
      category: post.category,
      featured: post.featured,
      createdAt: post.created_at,
      userId: post.user.user_id,
      username: post.user.username,
      profilePictureUrl: post.user.profile?.profile_picture_url || null,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked: false,
    };
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
          include: {
            profile: true,
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

    return {
      postId: updatedPost.post_id,
      title: updatedPost.title,
      content: updatedPost.content,
      imageUrl: updatedPost.image_url,
      tags: updatedPost.tags,
      category: updatedPost.category,
      featured: updatedPost.featured,
      createdAt: updatedPost.created_at,
      userId: updatedPost.user.user_id,
      username: updatedPost.user.username,
      profilePictureUrl: updatedPost.user.profile?.profile_picture_url || null,
      commentCount: updatedPost._count.comments,
      likeCount: updatedPost._count.likes,
      isLiked: false,
    };
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
          include: {
            profile: true,
          },
        },
      },
    });

    return {
      commentId: comment.comment_id,
      postId: comment.post_id,
      content: comment.content,
      createdAt: comment.created_at,
      userId: comment.user.user_id,
      username: comment.user.username,
      profilePictureUrl: comment.user.profile?.profile_picture_url || null,
    };
  }

  async getCommentsByPost(postId: number): Promise<CommentWithAuthor[]> {
    const comments = await prisma.comment.findMany({
      where: { post_id: postId, deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return comments.map((comment) => ({
      commentId: comment.comment_id,
      postId: comment.post_id,
      content: comment.content,
      createdAt: comment.created_at,
      userId: comment.user.user_id,
      username: comment.user.username,
      profilePictureUrl: comment.user.profile?.profile_picture_url || null,
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

  // FIXED: Using prisma.like (based on your schema: model Like)
  async togglePostReaction(postId: number, userId: number) {
    const post = await prisma.post.findUnique({
      where: { post_id: postId, deleted_at: null },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if like exists (using the unique constraint [post_id, user_id])
    const existingReaction = await prisma.like.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    if (existingReaction) {
      // Unlike: Delete the like
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
      // Like: Create new like
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
        isLiked: true,
        likeCount,
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