// apps/web/src/lib/api.ts - COMPLETE WITH REFRESH TOKEN
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001/api/v1'
  : (import.meta.env.VITE_API_BASE_URL || 'https://your-production-api.com/api/v1');

console.log('🔌 API Base URL:', API_BASE_URL);

// ===== TYPE DEFINITIONS =====
export interface IUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  profile?: {
    points: number;
    profile_picture_url?: string;
  };
  _count?: {
    posts: number;
    comments: number;
    userChallenges: number;
  };
}

export interface Post {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  image_url?: string;
  tags: string[];
  category: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  user: {
    user_id: number;
    username: string;
  };
  _count?: {
    reports: number;
    likes: number;
    comments: number;
  };
}

export interface Comment {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user: {
    user_id: number;
    username: string;
  };
  post?: {
    post_id: number;
    title: string;
  };
}

export interface Report {
  report_id: number;
  reporter_id: number;
  reported_post_id?: number;
  reported_comment_id?: number;
  reason: string;
  status: 'pending' | 'in_review' | 'resolved';
  moderator_notes?: string;
  created_at: string;
  resolved_at?: string;
  reporter: {
    user_id: number;
    username: string;
  };
  reported_post?: {
    post_id: number;
    content: string;
  };
  reported_comment?: {
    comment_id: number;
    content: string;
  };
}

export interface Challenge {
  challenge_id: number;
  title: string;
  description: string;
  points_reward: number;
  material_type: string;
  category: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  source: 'admin' | 'ai';
  created_at: string;
  expires_at?: string;
  _count?: {
    participants: number;
  };
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    verified: number;
  };
  content: {
    totalPosts: number;
    totalComments: number;
    totalCrafts: number;
    postsToday: number;
  };
  challenges: {
    total: number;
    active: number;
    completed: number;
    pendingVerification: number;
  };
  reports: {
    total: number;
    pending: number;
    in_review: number;
    resolved: number;
  };
  engagement: {
    totalLikes: number;
    avgPostsPerUser: number;
    avgChallengesPerUser: number;
  };
}

// ===== TOKEN REFRESH LOGIC =====
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('🔄 Refreshing access token...');

    const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // Save new tokens
    localStorage.setItem('adminToken', accessToken);
    localStorage.setItem('adminRefreshToken', newRefreshToken);

    console.log('✅ Token refreshed successfully');
    return accessToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    
    // Clear tokens and redirect to login
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
    
    throw error;
  }
};

// ===== AXIOS INSTANCE =====
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// ===== REQUEST INTERCEPTOR =====
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('adminToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR WITH REFRESH TOKEN =====
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      hasData: !!response.data
    });
    
    return response.data;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    console.error('❌ Response Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // Check if this is a login or refresh-token endpoint (don't retry these)
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/refresh-token')) {
        console.warn('🔐 Auth endpoint failed - redirecting to login');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }

      // If already refreshing, wait for the new token
      if (isRefreshing) {
        console.log('⏳ Waiting for token refresh...');
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      // Mark as retrying and start refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        
        // Notify all waiting requests
        onTokenRefreshed(newToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      }
    }
    
    const message = 
      error.response?.data?.error || 
      error.response?.data?.message ||
      error.message || 
      'An error occurred';
    
    return Promise.reject(new Error(message));
  }
);

// ===== AUTH API =====
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log('🔑 Attempting login for:', email);
      
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { 
        email, 
        password 
      });
      
      console.log('📦 Login response received');
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }
      
      const { accessToken, refreshToken, user } = response.data;
      
      if (!accessToken || !refreshToken || !user) {
        throw new Error('Incomplete login response');
      }
      
      // ✅ Save both tokens
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);
      
      console.log('✅ Login successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken');
      
      if (refreshToken) {
        console.log('👋 Logging out from backend...');
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.warn('⚠️ Backend logout failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
    }
  },
  
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<ApiResponse<RefreshTokenResponse>>(
      '/auth/refresh-token',
      { refreshToken }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to refresh token');
    }

    return response.data;
  },
  
  getCurrentUser: (): IUser | null => {
    try {
      const user = localStorage.getItem('adminUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  },
  
  hasValidToken: (): boolean => {
    return !!localStorage.getItem('adminToken');
  }
};

// ===== DASHBOARD API =====
export const dashboardAPI = {
  getStats: (): Promise<ApiResponse<DashboardStats>> => 
    api.get('/admin/dashboard/stats'),
  
  getActivityLogs: (days = 7): Promise<ApiResponse<any>> => 
    api.get(`/admin/dashboard/activity`, { params: { days } }),
  
  getTopUsers: (limit = 10): Promise<ApiResponse<any>> => 
    api.get(`/admin/dashboard/top-users`, { params: { limit } }),
  
  getRecentActivity: (limit = 20): Promise<ApiResponse<any>> => 
    api.get(`/admin/dashboard/recent-activity`, { params: { limit } })
};

// ===== USER API =====
export const userAPI = {
  getAll: (params: Record<string, any>): Promise<ApiResponse<PaginatedResponse<User>>> => 
    api.get('/admin/management/users', { params }),
  
  getById: (userId: number): Promise<ApiResponse<User>> => 
    api.get(`/admin/management/users/${userId}`),
  
  getStats: (userId: number): Promise<ApiResponse<any>> => 
    api.get(`/admin/management/users/${userId}/stats`),
  
  toggleStatus: (userId: number): Promise<ApiResponse<User>> => 
    api.patch(`/admin/management/users/${userId}/status`),
  
  updateRole: (userId: number, role: string): Promise<ApiResponse<User>> => 
    api.patch(`/admin/management/users/${userId}/role`, { role }),
  
  delete: (userId: number): Promise<ApiResponse<any>> => 
    api.delete(`/admin/management/users/${userId}`)
};

// ===== MODERATION API =====
export const moderationAPI = {
  getContentForReview: async (page = 1, limit = 20): Promise<ApiResponse<{ posts: Post[]; comments: Comment[]; meta: any }>> => {
    console.log('🔍 Fetching content for review:', { page, limit });
    try {
      const response = await api.get('/admin/moderation/content/review', { 
        params: { page, limit } 
      });
      console.log('✅ Content review response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Content review error:', error);
      throw error;
    }
  },
  
  deletePost: async (postId: number, reason?: string): Promise<ApiResponse<any>> => {
    console.log('🗑️ Deleting post:', { postId, reason });
    try {
      const response = await api.delete(`/admin/moderation/posts/${postId}`, { 
        data: { reason } 
      });
      console.log('✅ Post deleted:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Delete post error:', error);
      throw error;
    }
  },
  
  deleteComment: async (commentId: number, reason?: string): Promise<ApiResponse<any>> => {
    console.log('🗑️ Deleting comment:', { commentId, reason });
    try {
      const response = await api.delete(`/admin/moderation/comments/${commentId}`, { 
        data: { reason } 
      });
      console.log('✅ Comment deleted:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Delete comment error:', error);
      throw error;
    }
  },
  
  bulkDeletePosts: async (postIds: number[], reason?: string): Promise<ApiResponse<any>> => {
    console.log('🗑️ Bulk deleting posts:', { postIds, reason });
    try {
      const response = await api.post('/admin/moderation/posts/bulk-delete', { 
        postIds, 
        reason 
      });
      console.log('✅ Bulk delete successful:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Bulk delete error:', error);
      throw error;
    }
  },
  
  restorePost: async (postId: number): Promise<ApiResponse<Post>> => {
    console.log('♻️ Restoring post:', postId);
    try {
      const response = await api.patch(`/admin/moderation/posts/${postId}/restore`);
      console.log('✅ Post restored:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Restore post error:', error);
      throw error;
    }
  },
  
  featurePost: async (postId: number): Promise<ApiResponse<Post>> => {
    console.log('⭐ Featuring post:', postId);
    try {
      const response = await api.patch(`/admin/moderation/posts/${postId}/feature`);
      console.log('✅ Post feature toggled:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Feature post error:', error);
      throw error;
    }
  }
};

// ===== REPORTS API =====
export const reportsAPI = {
  getAll: (params: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Report>>> => 
    api.get('/reports', { params }),
  
  getById: (reportId: number): Promise<ApiResponse<Report>> => 
    api.get(`/reports/${reportId}`),
  
  updateStatus: (reportId: number, status: string, notes?: string): Promise<ApiResponse<Report>> => 
    api.patch(`/reports/${reportId}/status`, { status, moderator_notes: notes }),
  
  getStats: (): Promise<ApiResponse<any>> => 
    api.get('/reports/stats')
};

// ===== CHALLENGES API =====
export const challengesAPI = {
  getAll: (category?: string): Promise<ApiResponse<PaginatedResponse<Challenge>>> => {
    const params = category ? { category } : {};
    return api.get('/challenges', { params });
  },
  
  create: (data: any): Promise<ApiResponse<Challenge>> => 
    api.post('/challenges', data),
  
  generateAI: (category: string): Promise<ApiResponse<Challenge>> => 
    api.post('/challenges/generate', { category }),
  
  getPendingVerifications: (page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<any>>> => 
    api.get(`/user-challenges/pending-verifications`, { params: { page, limit } })
};

// ===== HEALTH CHECK =====
export const healthCheck = async (): Promise<boolean> => {
  try {
    console.log('🏥 Checking API health...');
    const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/api/v1/health`, {
      timeout: 5000
    });
    console.log('✅ API is healthy:', response.data);
    return response.data?.success === true;
  } catch (error) {
    console.error('❌ API health check failed:', error);
    return false;
  }
};

export default api;