import prisma from "../config/prisma";

export const createPost = async ({
  user_id,
  content,
  imageUrl,
}: {
  user_id: number;
  content: string;
  imageUrl?: string;
}) => {
  return await prisma.post.create({
    data: {
      user_id,           // must be a valid user_id
      content,
      image_url: imageUrl || null,
    },
  });
};

export const getPosts = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where: { deleted_at: null },
    skip,
    take: limit,
    orderBy: { created_at: 'desc' },
    include: { user: true, comments: true, likes: true },
  });

  const total = await prisma.post.count({ where: { deleted_at: null } });

  return { data: posts, meta: { total, page, lastPage: Math.ceil(total / limit) } };
};

export const getPostById = async (postId: number) => {
  return await prisma.post.findUnique({
    where: { post_id: postId },
    include: { user: true, comments: true, likes: true },
  });
};

export const deletePost = async (postId: number) => {
  return await prisma.post.update({
    where: { post_id: postId },
    data: { deleted_at: new Date() },
  });
};


export const addComment = async (data: { postId: number; userId: number; content: string }) => {
  return await prisma.comment.create({
    data: {
      post_id: data.postId,
      user_id: data.userId,
      content: data.content,
    },
  });
};

export const getCommentsByPost = async (postId: number) => {
  return await prisma.comment.findMany({
    where: { post_id: postId, deleted_at: null },
    include: { user: true },
    orderBy: { created_at: 'asc' },
  });
};

export const deleteComment = async (commentId: number) => {
  return await prisma.comment.update({
    where: { comment_id: commentId },
    data: { deleted_at: new Date() },
  });
};


export const togglePostReaction = async (postId: number, userId: number) => {
  // 1️⃣ Check if the user already has a like record
  const existing = await prisma.like.findFirst({
    where: { post_id: postId, user_id: userId },
  });

  // 2️⃣ If no record exists → create a new like
  if (!existing) {
    return await prisma.like.create({
      data: { post_id: postId, user_id: userId },
    });
  }

  // 3️⃣ If record exists
  if (!existing.deleted_at) {
    // Already liked → unlike (soft delete)
    return await prisma.like.update({
      where: { like_id: existing.like_id },
      data: { deleted_at: new Date() }, // mark as deleted
    });
  } else {
    // Previously unliked → restore the like
    return await prisma.like.update({
      where: { like_id: existing.like_id },
      data: { deleted_at: null }, // mark as active
    });
  }
};


export const countReactions = async (postId: number) => {
  return await prisma.like.count({ where: { post_id: postId, deleted_at: null } });
};