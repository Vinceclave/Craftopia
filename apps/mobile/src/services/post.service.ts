// apps/mobile/src/services/post.service.ts - FIXED & IMPROVED
import { API_ENDPOINTS } from "~/config/api";
import { apiService } from "./base.service";

// ✅ IMPROVED: Standardized response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

class PostService {
  async getPosts(feedType: string, page: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiService.request<ApiResponse<any[]>>(
        `${API_ENDPOINTS.POSTS.LIST}?feedType=${feedType}&page=${page}`,
        { method: 'GET' }
      );
      
      // ✅ FIXED: Handle different response structures
      return {
        success: true,
        data: response.data || response || [],
        meta: response.meta
      };
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch posts');
    }
  }

  async createPost(payload: {
    title: string;
    content: string;
    imageUrl?: string;
    tags?: string[];
    category?: string;
    featured?: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.request<ApiResponse<any>>(
        API_ENDPOINTS.POSTS.CREATE,
        {
          method: 'POST',
          data: payload,
        }
      );
      
      return {
        success: true,
        data: response.data || response
      };
    } catch (error: any) {
      console.error('Error creating post:', error);
      throw new Error(error.response?.data?.error || 'Failed to create post');
    }
  }

  async getTrendingTags(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiService.request<ApiResponse<any[]>>(
        API_ENDPOINTS.POSTS.TRENDING,
        { method: 'GET' }
      );
      
      return {
        success: true,
        data: response.data || response || []
      };
    } catch (error: any) {
      console.error('Error fetching trending tags:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch trending tags');
    }
  }

  async toggleReaction(postId: string): Promise<ApiResponse<{ isLiked: boolean; likeCount: number }>> {
    try {
      console.log('🔵 PostService: Calling toggleReaction for postId:', postId);
      
      const response = await apiService.request<any>(
        API_ENDPOINTS.POSTS.TOGGLE_REACTION(postId),
        { method: "POST" }
      );
      
      console.log('🔵 PostService: Toggle response:', response);
      
      // ✅ FIXED: Handle different response structures
      const data = response.data || response;
      return {
        success: true,
        data: {
          isLiked: data.isLiked ?? !data.wasLiked, // Handle different field names
          likeCount: data.likeCount ?? data.totalLikes ?? 0
        }
      };
    } catch (error: any) {
      console.error('❌ PostService: Toggle reaction failed:', error);
      
      // ✅ IMPROVED: Better error handling for different scenarios
      if (error.response?.status === 404) {
        throw new Error('Post not found');
      } else if (error.response?.status === 401) {
        throw new Error('Please log in to like posts');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to like this post');
      } else {
        throw new Error(error.response?.data?.error || 'Failed to toggle reaction');
      }
    }
  }

  async getReactionCount(postId: string): Promise<ApiResponse<{ total: number }>> {
    try {
      console.log('🔵 PostService: Getting reaction count for postId:', postId);
      
      const response = await apiService.request<any>(
        API_ENDPOINTS.POSTS.REACTION_COUNT(postId),
        { method: "GET" }
      );
      
      console.log('🔵 PostService: Reaction count response:', response);
      
      const data = response.data || response;
      return {
        success: true,
        data: { total: data.total ?? data.count ?? 0 }
      };
    } catch (error: any) {
      console.error('❌ PostService: Get reaction count failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to get reaction count');
    }
  }

  async getPostById(postId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.request<any>(
        API_ENDPOINTS.POSTS.BY_ID(postId),
        { method: 'GET' }
      );
      
      return {
        success: true,
        data: response.data || response
      };
    } catch (error: any) {
      console.error('Error fetching post:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch post');
    }
  }

  async addComment(payload: {
    postId: number;
    content: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.request<any>(
        API_ENDPOINTS.POSTS.ADD_COMMENT,
        {
          method: 'POST',
          data: payload,
        }
      );
      
      return {
        success: true,
        data: response.data || response
      };
    } catch (error: any) {
      console.error('Error adding comment:', error);
      throw new Error(error.response?.data?.error || 'Failed to add comment');
    }
  }

  async getComments(postId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiService.request<any>(
        API_ENDPOINTS.POSTS.COMMENTS(postId),
        { method: 'GET' }
      );
      
      return {
        success: true,
        data: response.data || response || []
      };
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch comments');
    }
  }

  async deletePost(postId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.request<any>(
        API_ENDPOINTS.POSTS.DELETE(postId),
        { method: 'DELETE' }
      );
      
      return {
        success: true,
        data: response.data || response
      };
    } catch (error: any) {
      console.error('Error deleting post:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete post');
    }
  }

  // ✅ IMPROVED: Check if user has liked a post
  async checkUserReaction(postId: string): Promise<boolean> {
    try {
      const post = await this.getPostById(postId);
      return post.data?.isLiked || false;
    } catch (error) {
      console.error('Error checking user reaction:', error);
      return false;
    }
  }
}

export const postService = new PostService();