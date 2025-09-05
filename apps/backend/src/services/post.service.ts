import prisma from "../config/prisma";
import { AppError } from '../utils/error';

export const createPost = async ({
  user_id,
  content,
  imageUrl,
}: {
  user_id: number;
  content: string;
  imageUrl?: string;
}) => {
  if (!content?.trim()) {
    throw new AppError('Post content cannot be empty', 400);
  }

  if (content.length > 1000) {
    throw new AppError('Post content cannot exceed 1000 characters', 400);
  }

  return await prisma.post.create({
    data: {
      user_id,
      content: content.trim(),
      image_url: imageUrl || null,
    },
    include: {
      user: {
        select: { user_id: true, username: true, email: true }
      }
    }
  });
};

export const getPosts = async (page = 1, limit = 10) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { deleted_at: null },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { 
        user: {
          select: { user_id: true, username: true }
        },
        comments: {
          where: { deleted_at: null },
          select: { comment_id: true }
        },
        likes: {
          where: { deleted_at: null },
          select: { like_id: true }
        }
      },
    }),
    prisma.post.count({ where: { deleted_at: null } })
  ]);

  return { 
    data: posts.map(post => ({
      ...post,
      commentCount: post.comments.length,
      likeCount: post.likes.length,
      comments: undefined,
      likes: undefined
    })),
    meta: { 
      total, 
      page, 
      lastPage: Math.ceil(total / limit),
      limit
    } 
  };
};

export const getPostById = async (postId: number) => {
  if (!postId || postId <= 0) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await prisma.post.findFirst({
    where: { 
      post_id: postId,
      deleted_at: null 
    },
    include: { 
      user: {
        select: { user_id: true, username: true }
      },
      comments: {
        where: { deleted_at: null },
        include: {
          user: {
            select: { user_id: true, username: true }
          }
        },
        orderBy: { created_at: 'asc' }
      },
      likes: {
        where: { deleted_at: null },
        include: {
          user: {
            select: { user_id: true, username: true }
          }
        }
      }
    },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return post;
};

export const deletePost = async (postId: number, userId: number) => {
  if (!postId || postId <= 0) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await prisma.post.findFirst({
    where: { 
      post_id: postId,
      deleted_at: null 
    }
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.user_id !== userId) {
    throw new AppError('You can only delete your own posts', 403);
  }

  return await prisma.post.update({
    where: { post_id: postId },
    data: { deleted_at: new Date() },
  });
};

export const addComment = async (data: { postId: number; userId: number; content: string }) => {
  if (!data.content?.trim()) {
    throw new AppError('Comment content cannot be empty', 400);
  }

  if (data.content.length > 500) {
    throw new AppError('Comment cannot exceed 500 characters', 400);
  }

  // Verify post exists
  const post = await prisma.post.findFirst({
    where: { 
      post_id: data.postId,
      deleted_at: null 
    }
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return await prisma.comment.create({
    data: {
      post_id: data.postId,
      user_id: data.userId,
      content: data.content.trim(),
    },
    include: {
      user: {
        select: { user_id: true, username: true }
      }
    }
  });
};

export const getCommentsByPost = async (postId: number) => {
  if (!postId || postId <= 0) {
    throw new AppError('Invalid post ID', 400);
  }

  // Verify post exists
  const post = await prisma.post.findFirst({
    where: { 
      post_id: postId,
      deleted_at: null 
    }
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return await prisma.comment.findMany({
    where: { 
      post_id: postId, 
      deleted_at: null 
    },
    include: { 
      user: {
        select: { user_id: true, username: true }
      }
    },
    orderBy: { created_at: 'asc' },
  });
};

export const deleteComment = async (commentId: number, userId: number) => {
  if (!commentId || commentId <= 0) {
    throw new AppError('Invalid comment ID', 400);
  }

  const comment = await prisma.comment.findFirst({
    where: { 
      comment_id: commentId,
      deleted_at: null 
    }
  });

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (comment.user_id !== userId) {
    throw new AppError('You can only delete your own comments', 403);
  }

  return await prisma.comment.update({
    where: { comment_id: commentId },
    data: { deleted_at: new Date() },
  });
};

export const togglePostReaction = async (postId: number, userId: number) => {
  if (!postId || postId <= 0) {
    throw new AppError('Invalid post ID', 400);
  }

  // Verify post exists
  const post = await prisma.post.findFirst({
    where: { 
      post_id: postId,
      deleted_at: null 
    }
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const existing = await prisma.like.findFirst({
    where: { post_id: postId, user_id: userId },
  });

  if (!existing) {
    return await prisma.like.create({
      data: { post_id: postId, user_id: userId },
    });
  }

  if (!existing.deleted_at) {
    return await prisma.like.update({
      where: { like_id: existing.like_id },
      data: { deleted_at: new Date() },
    });
  } else {
    return await prisma.like.update({
      where: { like_id: existing.like_id },
      data: { deleted_at: null },
    });
  }
};

export const countReactions = async (postId: number) => {
  if (!postId || postId <= 0) {
    throw new AppError('Invalid post ID', 400);
  }

  return await prisma.like.count({ 
    where: { 
      post_id: postId, 
      deleted_at: null 
    } 
  });
};