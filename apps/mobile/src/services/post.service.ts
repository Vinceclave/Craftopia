// apps/mobile/src/services/post.service.ts - FIXED VERSION
import { API_ENDPOINTS } from "~/config/api";
import { apiService } from "./base.service";

class PostService {
    async getPosts(feedType: string, page: number): Promise<any> {
        try {
            return await apiService.request(`${API_ENDPOINTS.POSTS.LIST}?feedType=${feedType}&page=${page}`, {
                method: 'GET', 
            });
        } catch (error: any) {
            console.error('Error fetching posts:', error);
            throw new Error(error.response?.data?.error || 'Failed to fetch posts');
        }
    }

    async createPost(payload: {
        title: string;
        content: string;
        imageUrl: string;
        tags?: string[];
        category?: string;
        featured?: boolean;
    }): Promise<any> {
        try {
            return await apiService.request(API_ENDPOINTS.POSTS.CREATE, {
                method: 'POST',
                data: payload,
            });
        } catch (error: any) {
            console.error('Error creating post:', error);
            throw new Error(error.response?.data?.error || 'Failed to create post');
        }
    }

    async getTrendingTags(): Promise<any> {
        try {
            return await apiService.request(API_ENDPOINTS.POSTS.TRENDING, {
                method: 'GET',
            });
        } catch (error: any) {
            console.error('Error fetching trending tags:', error);
            throw new Error(error.response?.data?.error || 'Failed to fetch trending tags');
        }
    }

    async toggleReaction(postId: string): Promise<any> {
        try {
            console.log('🔵 PostService: Calling toggleReaction for postId:', postId);
            
            const response = await apiService.request(API_ENDPOINTS.POSTS.TOGGLE_REACTION(postId), {
                method: "POST",
            });
            
            console.log('🔵 PostService: Toggle response:', response);
            return response;
        } catch (error: any) {
            console.error('❌ PostService: Toggle reaction failed:', error);
            
            // Better error handling for different scenarios
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

    // NEW: Get reaction count for a specific post
    async getReactionCount(postId: string): Promise<any> {
        try {
            console.log('🔵 PostService: Getting reaction count for postId:', postId);
            
            const response = await apiService.request(API_ENDPOINTS.POSTS.REACTION_COUNT(postId), {
                method: "GET",
            });
            
            console.log('🔵 PostService: Reaction count response:', response);
            return response;
        } catch (error: any) {
            console.error('❌ PostService: Get reaction count failed:', error);
            throw new Error(error.response?.data?.error || 'Failed to get reaction count');
        }
    }

    // NEW: Get post details by ID
    async getPostById(postId: string): Promise<any> {
        try {
            return await apiService.request(API_ENDPOINTS.POSTS.BY_ID(postId), {
                method: 'GET',
            });
        } catch (error: any) {
            console.error('Error fetching post:', error);
            throw new Error(error.response?.data?.error || 'Failed to fetch post');
        }
    }

    // NEW: Add comment to post
    async addComment(payload: {
        postId: number;
        content: string;
    }): Promise<any> {
        try {
            return await apiService.request(API_ENDPOINTS.POSTS.ADD_COMMENT, {
                method: 'POST',
                data: payload,
            });
        } catch (error: any) {
            console.error('Error adding comment:', error);
            throw new Error(error.response?.data?.error || 'Failed to add comment');
        }
    }

    // NEW: Get comments for a post
    async getComments(postId: string): Promise<any> {
        try {
            return await apiService.request(API_ENDPOINTS.POSTS.COMMENTS(postId), {
                method: 'GET',
            });
        } catch (error: any) {
            console.error('Error fetching comments:', error);
            throw new Error(error.response?.data?.error || 'Failed to fetch comments');
        }
    }

    // NEW: Delete post
    async deletePost(postId: string): Promise<any> {
        try {
            return await apiService.request(API_ENDPOINTS.POSTS.DELETE(postId), {
                method: 'DELETE',
            });
        } catch (error: any) {
            console.error('Error deleting post:', error);
            throw new Error(error.response?.data?.error || 'Failed to delete post');
        }
    }

    // NEW: Check if user has liked a post (useful for initial state)
    async checkUserReaction(postId: string): Promise<boolean> {
        try {
            const post = await this.getPostById(postId);
            // This would need to be implemented in your backend API
            // to return whether the current user has liked the post
            return post.data?.isLiked || false;
        } catch (error) {
            console.error('Error checking user reaction:', error);
            return false;
        }
    }

    // Utility method to handle API errors consistently
    private handleApiError(error: any, defaultMessage: string): never {
        const message = error.response?.data?.error || 
                       error.response?.data?.message || 
                       error.message || 
                       defaultMessage;
        throw new Error(message);
    }
}

// FIXED: Proper class instantiation
export const postService = new PostService();