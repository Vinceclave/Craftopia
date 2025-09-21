// apps/mobile/src/services/post.service.ts
import { API_ENDPOINTS } from "~/config/api";
import { apiService } from "./base.service";

class PostService {
    async getPosts(page: number): Promise<any> {
        return apiService.request(`${API_ENDPOINTS.POSTS.LIST}?page=${page}`, {
           method: 'GET', 
        })
    }

    async createPost(payload: { content: string, imageUrl: string }): Promise<any> {
        return apiService.request(API_ENDPOINTS.POSTS.CREATE, {
            method: 'POST',
            data: payload,
        })
    }
}

// FIXED: Proper class instantiation
export const postService = new PostService();