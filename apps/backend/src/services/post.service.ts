import prisma from "../config/prisma";
import { AppError } from '../utils/error';

export const createPost = async ({
  user_id,
  title,
  content,
  imageUrl,
  tags,
  category,
  featured,
  points,
}: {
  user_id: number;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  category: 'Social' | 'Tutorial' | 'Challenge' | 'Marketplace' | 'Other';
  featured?: boolean;
  points?: number;
}) => {
  if (!title?.trim()) throw new AppError('Post title cannot be empty', 400);
  if (!content?.trim()) throw new AppError('Post content cannot be empty', 400);
  if (content.length > 1000) throw new AppError('Post content cannot exceed 1000 characters', 400);

  return prisma.post.create({
    data: {
      user_id,
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl || null,
      tags: tags || [],
      category,
      featured: featured || false,
    },
    include: {
      user: {
        select: { user_id: true, username: true }
      }
    }
  });
};

export const getPosts = async (
  feedType?: 'all' | 'trending' | 'popular' | 'featured',
  page = 1,
  limit = 10
) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  const skip = (page - 1) * limit;

  // Define dynamic filters & sorting based on feedType
  let where: any = { deleted_at: null };
  let orderBy: any = { created_at: 'desc' };

  switch (feedType) {
    case 'all':
      // Show ALL posts chronologically (newest first)
      where = { deleted_at: null };
      orderBy = { created_at: 'desc' };
      break;

    case 'trending':
      // Posts with most engagement (tags, comments, likes combined)
      // Calculate trending score based on engagement
      orderBy = [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { created_at: 'desc' }
      ];
      break;

    case 'popular':
      // Posts with most likes overall (all time popular)
      orderBy = [
        { likes: { _count: 'desc' } },
        { created_at: 'desc' }
      ];
      break;

    case 'featured':
      // Show ALL featured posts
      where.featured = true;
      orderBy = { created_at: 'desc' };
      break;

    default:
      // Default to all posts
      orderBy = { created_at: 'desc' };
      break;
  }

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
            username: true 
          } 
        },
        comments: { 
          where: { deleted_at: null }, 
          select: { comment_id: true } 
        },
        likes: { 
          where: { deleted_at: null }, 
          select: { like_id: true, user_id: true } 
        },
      },
    }),
    prisma.post.count({ where })
  ]);

  // Transform the data to match frontend expectations
  const transformedPosts = posts.map(post => {
    // Calculate trending score based on tags, comments, and likes
    const tagScore = post.tags.length * 1; // 1 point per tag
    const commentScore = post.comments.length * 2; // 2 points per comment
    const likeScore = post.likes.length * 1; // 1 point per like
    const trendingScore = tagScore + commentScore + likeScore;

    return {
      ...post,
      commentCount: post.comments.length,
      likeCount: post.likes.length,
      trendingScore, // Add trending score for sorting
      isLiked: false, // You'll need to check this based on current user
      comments: undefined, // Remove to reduce payload
      likes: undefined, // Remove to reduce payload
    };
  });

  // For trending, sort by trending score after fetching
  if (feedType === 'trending') {
    transformedPosts.sort((a, b) => {
      // Primary sort: trending score (higher is better)
      if (b.trendingScore !== a.trendingScore) {
        return b.trendingScore - a.trendingScore;
      }
      // Secondary sort: newer posts first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  return {
    data: transformedPosts,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
      limit
    }
  };
};

export const getTrendingTags = async () => {
  // Fetch all posts (or limit to last N days for trending)
  const posts = await prisma.post.findMany({
    where: { deleted_at: null },
    select: { tags: true },
  })

  // Flatten tags and count occurrences
  const tagCounts: Record<string, number> = {}
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  // Convert to array and sort by count descending
  const trendingTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // top 10 tags

  return trendingTags
}


export const getPostById = async (postId: number) => {
  if (!postId || postId <= 0) throw new AppError('Invalid post ID', 400);

  const post = await prisma.post.findFirst({
    where: { post_id: postId, deleted_at: null },
    include: {
      user: { select: { user_id: true, username: true } },
      comments: {
        where: { deleted_at: null },
        include: { user: { select: { user_id: true, username: true } } },
        orderBy: { created_at: 'asc' }
      },
      likes: {
        where: { deleted_at: null },
        include: { user: { select: { user_id: true, username: true } } }
      }
    }
  });

  if (!post) throw new AppError('Post not found', 404);
  return post;
};

export const deletePost = async (postId: number, userId: number) => {
  if (!postId || postId <= 0) throw new AppError('Invalid post ID', 400);

  const post = await prisma.post.findFirst({
    where: { post_id: postId, deleted_at: null }
  });
  if (!post) throw new AppError('Post not found', 404);
  if (post.user_id !== userId) throw new AppError('You can only delete your own posts', 403);

  return prisma.post.update({
    where: { post_id: postId },
    data: { deleted_at: new Date() },
  });
};

export const addComment = async ({ postId, userId, content }: { postId: number; userId: number; content: string }) => {
  if (!content?.trim()) throw new AppError('Comment content cannot be empty', 400);
  if (content.length > 500) throw new AppError('Comment cannot exceed 500 characters', 400);

  const post = await prisma.post.findFirst({ where: { post_id: postId, deleted_at: null } });
  if (!post) throw new AppError('Post not found', 404);

  return prisma.comment.create({
    data: { post_id: postId, user_id: userId, content: content.trim() },
    include: { user: { select: { user_id: true, username: true } } }
  });
};

export const getCommentsByPost = async (postId: number) => {
  if (!postId || postId <= 0) throw new AppError('Invalid post ID', 400);

  const post = await prisma.post.findFirst({ where: { post_id: postId, deleted_at: null } });
  if (!post) throw new AppError('Post not found', 404);

  return prisma.comment.findMany({
    where: { post_id: postId, deleted_at: null },
    include: { user: { select: { user_id: true, username: true } } },
    orderBy: { created_at: 'asc' }
  });
};

export const deleteComment = async (commentId: number, userId: number) => {
  if (!commentId || commentId <= 0) throw new AppError('Invalid comment ID', 400);

  const comment = await prisma.comment.findFirst({ where: { comment_id: commentId, deleted_at: null } });
  if (!comment) throw new AppError('Comment not found', 404);
  if (comment.user_id !== userId) throw new AppError('You can only delete your own comments', 403);

  return prisma.comment.update({ where: { comment_id: commentId }, data: { deleted_at: new Date() } });
};

export const togglePostReaction = async (postId: number, userId: number) => {
  if (!postId || postId <= 0) throw new AppError('Invalid post ID', 400);

  const post = await prisma.post.findFirst({ where: { post_id: postId, deleted_at: null } });
  if (!post) throw new AppError('Post not found', 404);

  const existing = await prisma.like.findFirst({ where: { post_id: postId, user_id: userId } });

  if (!existing) return prisma.like.create({ data: { post_id: postId, user_id: userId } });

  return prisma.like.update({
    where: { like_id: existing.like_id },
    data: { deleted_at: existing.deleted_at ? null : new Date() }
  });
};

export const countReactions = async (postId: number) => {
  if (!postId || postId <= 0) throw new AppError('Invalid post ID', 400);
  return prisma.like.count({ where: { post_id: postId, deleted_at: null } });
};
