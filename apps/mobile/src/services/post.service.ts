// apps/mobile/src/services/post.service.ts - ENHANCED WITH UPDATE
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
   * Validate and normalize post data
   */
  private normalizePost(post: any): Post {
    console.log('🔍 Normalizing post:', {
      post_id: post.post_id,
      has_user: !!post.user,
      user_data: post.user,
      user_id: post.user_id
    });

    let user = post.user;
    
    if (!user) {
      console.warn('⚠️ Post missing user object, creating from user_id');
      user = {
        user_id: post.user_id,
        username: `User ${post.user_id}`
      };
    }
    
    if (user && (!user.username || user.username === '')) {
      console.warn('⚠️ User missing username, using fallback');
      user.username = `User ${user.user_id || post.user_id}`;
    }

    const normalized = {
      post_id: post.post_id,
      user_id: post.user_id,
      title: post.title || '',
      content: post.content || '',
      image_url: post.image_url,
      category: post.category || 'Other',
      tags: Array.isArray(post.tags) ? post.tags : [],
      featured: post.featured || false,
      commentCount: post.commentCount || 0,
      likeCount: post.likeCount || 0,
      isLiked: post.isLiked || false,
      created_at: post.created_at,
      updated_at: post.updated_at,
      deleted_at: post.deleted_at,
      user: {
        user_id: user.user_id || post.user_id,
        username: user.username
      }
    };

    console.log('✅ Normalized post:', {
      post_id: normalized.post_id,
      username: normalized.user.username
    });

    return normalized;
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
      console.log('📡 Fetching posts:', { feedType, page, limit });
      
      const response = await apiService.get<PaginatedResponse<Post>>(
        `${API_ENDPOINTS.POSTS.LIST}?feedType=${feedType}&page=${page}&limit=${limit}`
      );

      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map((post) => this.normalizePost(post));
      }

      console.log('✅ Posts fetched and normalized:', response.data?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch posts:', error);
      throw error;
    }
  }

  /**
   * Search posts with filters
   */
  async searchPosts(params: SearchPostsParams): Promise<PaginatedResponse<Post>> {
    try {
      console.log('🔍 Searching posts:', params);
      
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

      console.log('✅ Search results:', response.data?.length || 0);
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
      console.log('📡 Fetching post:', postId);
      
      const response = await apiService.get<ApiResponse<Post>>(
        API_ENDPOINTS.POSTS.BY_ID(postId)
      );

      if (response.data) {
        response.data = this.normalizePost(response.data);
      }

      console.log('✅ Post normalized:', response.data);
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

      console.log('✅ Post created successfully');
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
      console.log('✏️ Updating post:', postId, payload);
      
      const response = await apiService.put<ApiResponse<Post>>(
        API_ENDPOINTS.POSTS.BY_ID(postId),
        payload
      );
      
      if (response.data) {
        response.data = this.normalizePost(response.data);
      }

      console.log('✅ Post updated successfully');
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
      console.log('✅ Post deleted successfully');
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
      console.log('🔵 Service: Toggling reaction for post:', postId);
      const response = await apiService.post<ApiResponse<ReactionResponse>>(
        API_ENDPOINTS.POSTS.TOGGLE_REACTION(postId)
      );
      console.log('🔵 Service: Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Failed to toggle reaction for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's reaction status for a post
   */
  async getReactionStatus(postId: string): Promise<ApiResponse<{ isLiked: boolean; postId: number; userId: number }>> {
    try {
      return await apiService.get<ApiResponse<{ isLiked: boolean; postId: number; userId: number }>>(
        `${API_ENDPOINTS.POSTS.BY_ID(postId)}/reaction/status`
      );
    } catch (error) {
      console.error(`Failed to fetch reaction status for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Get reaction count for a post
   */
  async getReactionCount(postId: string): Promise<ApiResponse<{ total: number }>> {
    try {
      return await apiService.get<ApiResponse<{ total: number }>>(
        API_ENDPOINTS.POSTS.REACTION_COUNT(postId)
      );
    } catch (error) {
      console.error(`Failed to fetch reaction count for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    try {
      return await apiService.get<ApiResponse<Comment[]>>(
        API_ENDPOINTS.POSTS.COMMENTS(postId)
      );
    } catch (error) {
      console.error(`Failed to fetch comments for post ${postId}:`, error);
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
      console.log('✅ Comment added successfully');
      return response;
    } catch (error) {
      console.error('Failed to add comment:', error);
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
      console.log('✅ Comment deleted successfully');
      return response;
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw error;
    }
  }
}

export const postService = new PostService();