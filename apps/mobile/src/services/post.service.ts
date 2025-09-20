import { API_ENDPOINTS } from "~/config/api";
import { apiService } from "./base.service";

class PostService {
    async createPost(payload:{ content: string, imageUrl: string }): Promise<any> {
        return apiService.request(API_ENDPOINTS.POSTS.CREATE, {
            method: 'POST',
            data: payload,
        })
    }
}

export const postService = PostService();