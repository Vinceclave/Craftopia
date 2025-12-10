// apps/mobile/src/services/post.service.ts - ENSURE PROFILE PHOTOS IN RESPONSES
import { apiService } from './base.service';
import { API_ENDPOINTS, ApiResponse, PaginatedResponse } from '~/config/api';

export interface Post {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  image_url?: string;
  category: string;
  tags: string[];
  featured: boolean;
  commentCount: number;
  likeCount: number;
  isLiked?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user: {
    user_id: number;
    username: string;
    profile_picture_url?: string; // ✅ Added for profile photos
  };
}

export interface Comment {
  comment_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user: {
    user_id: number;
    username: string;
    profile_picture_url?: string; // ✅ Added for profile photos
  };
}

export interface TrendingTag {
  tag: string;
  count: number;
  growth?: number;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  category?: 'Social' | 'Tutorial' | 'Challenge' | 'Marketplace' | 'Other';
  featured?: boolean;
}

export interface UpdatePostPayload {
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
  category?: 'Social' | 'Tutorial' | 'Challenge' | 'Marketplace' | 'Other';
}

export interface ReactionResponse {
  isLiked: boolean;
  likeCount: number;
  postId: number;
  userId: number;
}

export interface SearchPostsParams {
  query?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

class PostService {
  /**
   * Normalize post data and ensure user has profile_picture_url
   */
  private normalizePost(post: any): Post {
    let user = post.user;

    if (!user) {
      user = {
        user_id: post.user_id,
        username: `User ${post.user_id}`,
        profile_picture_url: undefined,
      };
    }

    if (user && (!user.username || user.username === '')) {
      user.username = `User ${user.user_id || post.user_id}`;
    }

    // ✅ Ensure profile_picture_url is included
    if (user && !user.profile_picture_url) {
      user.profile_picture_url = undefined; // Explicitly set to undefined for fallback
    }

    const commentCount = post.commentCount ?? post.comment_count ?? 0;
    const likeCount = post.likeCount ?? post.like_count ?? 0;
    const isLiked = post.isLiked ?? post.is_liked ?? false;

    const normalized = {
      post_id: post.post_id,
      user_id: post.user_id,
      title: post.title || '',
      content: post.content || '',
      image_url: post.image_url,
      category: post.category || 'Other',
      tags: Array.isArray(post.tags) ? post.tags : [],
      featured: post.featured || false,
      commentCount,
      likeCount,
      isLiked,
      created_at: post.created_at,
      updated_at: post.updated_at,
      deleted_at: post.deleted_at,
      user: {
        user_id: user.user_id || post.user_id,
        username: user.username,
        profile_picture_url: user.profile_picture_url, // ✅ Include profile photo
      }
    };

    return normalized;
  }

  /**
   * Normalize comment data and ensure user has profile_picture_url
   */
  private normalizeComment(comment: any): Comment {
    return {
      comment_id: comment.comment_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      user: {
        user_id: comment.user?.user_id || comment.user_id,
        username: comment.user?.username || `User ${comment.user_id}`,
        profile_picture_url: comment.user?.profile_picture_url, // ✅ Include profile photo
      }
    };
  }

  /**
   * Get posts with feed type and pagination
   */
  async getPosts(
    feedType: 'all' | 'trending' | 'popular' | 'featured' = 'all',
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Post>> {
    try {

      const response = await apiService.get<PaginatedResponse<Post>>(
        `${API_ENDPOINTS.POSTS.LIST}?feedType=${feedType}&page=${page}&limit=${limit}`
      );

      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map((post) => this.normalizePost(post));
      }

      // ✅ Compatibility fix: Handle both 'meta' (old) and 'pagination' (new) keys
      if (!response.pagination && (response as any).meta) {
        response.pagination = (response as any).meta;
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search posts with filters
   */
  async searchPosts(params: SearchPostsParams): Promise<PaginatedResponse<Post>> {
    try {

      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('search', params.query);
      if (params.category) queryParams.append('category', params.category);
      if (params.tag) queryParams.append('tag', params.tag);
      queryParams.append('page', String(params.page || 1));
      queryParams.append('limit', String(params.limit || 10));

      const response = await apiService.get<PaginatedResponse<Post>>(
        `${API_ENDPOINTS.POSTS.SEARCH}?${queryParams.toString()}`
      );

      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map((post) => this.normalizePost(post));
      }

      // ✅ Compatibility fix
      if (!response.pagination && (response as any).meta) {
        response.pagination = (response as any).meta;
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to search posts:', error);
      throw error;
    }
  }

  /**
   * Get single post by ID
   */
  async getPostById(postId: string): Promise<ApiResponse<Post>> {
    try {

      const response = await apiService.get<ApiResponse<Post>>(
        API_ENDPOINTS.POSTS.BY_ID(postId)
      );

      if (response.data) {
        response.data = this.normalizePost(response.data);
      }

      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Get trending tags
   */
  async getTrendingTags(): Promise<ApiResponse<TrendingTag[]>> {
    try {
      return await apiService.get<ApiResponse<TrendingTag[]>>(
        API_ENDPOINTS.POSTS.TRENDING
      );
    } catch (error) {
      console.error('Failed to fetch trending tags:', error);
      throw error;
    }
  }

  /**
   * Create new post
   */
  async createPost(payload: CreatePostPayload): Promise<ApiResponse<Post>> {
    try {
      const response = await apiService.post<ApiResponse<Post>>(
        API_ENDPOINTS.POSTS.CREATE,
        payload
      );

      if (response.data) {
        response.data = this.normalizePost(response.data);
      }

      return response;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  /**
   * Update existing post
   */
  async updatePost(postId: string, payload: UpdatePostPayload): Promise<ApiResponse<Post>> {
    try {

      const response = await apiService.put<ApiResponse<Post>>(
        API_ENDPOINTS.POSTS.BY_ID(postId),
        payload
      );

      if (response.data) {
        response.data = this.normalizePost(response.data);
      }

      return response;
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  }

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiService.delete<ApiResponse<null>>(
        API_ENDPOINTS.POSTS.DELETE(postId)
      );
      return response;
    } catch (error) {
      console.error(`Failed to delete post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Toggle post reaction (like/unlike)
   */
  async toggleReaction(postId: string): Promise<ApiResponse<ReactionResponse>> {
    try {
      const response = await apiService.post<ApiResponse<ReactionResponse>>(
        API_ENDPOINTS.POSTS.TOGGLE_REACTION(postId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await apiService.get<ApiResponse<Comment[]>>(
        API_ENDPOINTS.POSTS.COMMENTS(postId)
      );

      // ✅ Normalize comments to include profile pictures
      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map((comment) => this.normalizeComment(comment));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add comment to post
   */
  async addComment(data: { postId: number; content: string }): Promise<ApiResponse<Comment>> {
    try {
      const response = await apiService.post<ApiResponse<Comment>>(
        API_ENDPOINTS.POSTS.ADD_COMMENT,
        data
      );

      // ✅ Normalize comment to include profile picture
      if (response.data) {
        response.data = this.normalizeComment(response.data);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiService.delete<ApiResponse<null>>(
        API_ENDPOINTS.POSTS.DELETE_COMMENT(commentId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const postService = new PostService();