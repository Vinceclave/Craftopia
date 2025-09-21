// apps/mobile/src/services/post.service.ts
import { API_ENDPOINTS } from "~/config/api";
import { apiService } from "./base.service";

class PostService {
    async getPosts(feedType: string, page: number): Promise<any> {
        return apiService.request(`${API_ENDPOINTS.POSTS.LIST}?feedType=${feedType}&page=${page}`, {
           method: 'GET', 
        })
    }

    async createPost(payload: {
        title: string;
        content: string;
        imageUrl: string;
        tags?: string[];
        category?: string;
        featured?: boolean;
    }): Promise<any> {
    return apiService.request(API_ENDPOINTS.POSTS.CREATE, {
        method: 'POST',
        data: payload,
    });
    }

    async getTrendingTags(): Promise<any> {
        return apiService.request(API_ENDPOINTS.POSTS.TRENDING, {
            method: 'GET',
        })
    }

   async toggleReaction(postId: string): Promise<any> {
        console.log('🔵 Frontend: Calling toggleReaction for postId:', postId);
        
        const response = await apiService.request(API_ENDPOINTS.POSTS.TOGGLE_REACTION(postId), {
            method: "POST",
        });
        
        console.log('🔵 Frontend: Toggle response:', response);
        return response;
    }
}

// FIXED: Proper class instantiation
export const postService = new PostService();