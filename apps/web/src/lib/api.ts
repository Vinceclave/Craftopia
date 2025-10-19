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

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

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

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      hasData: !!response.data
    });
    
    return response.data;
  },
  (error: AxiosError<ApiResponse>) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized - Clearing auth and redirecting to login');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    
    const message = 
      error.response?.data?.error || 
      error.response?.data?.message ||
      error.message || 
      'An error occurred';
    
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    try {
      console.log('🔑 Attempting login for:', email);
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { 
        email, 
        password 
      });
      
      if (response.success && response.data) {
        console.log('✅ Login successful');
        return response;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    console.log('👋 Logging out');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  
  getCurrentUser: (): IUser | null => {
    try {
      const user = localStorage.getItem('adminUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }
};

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

export const moderationAPI = {
  getContentForReview: (page = 1, limit = 20): Promise<ApiResponse<{ posts: Post[]; comments: Comment[]; meta: any }>> => 
    api.get(`/admin/moderation/content/review`, { params: { page, limit } }),
  
  deletePost: (postId: number, reason?: string): Promise<ApiResponse<any>> => 
    api.delete(`/admin/moderation/posts/${postId}`, { data: { reason } }),
  
  deleteComment: (commentId: number, reason?: string): Promise<ApiResponse<any>> => 
    api.delete(`/admin/moderation/comments/${commentId}`, { data: { reason } }),
  
  bulkDeletePosts: (postIds: number[], reason?: string): Promise<ApiResponse<any>> => 
    api.post('/admin/moderation/posts/bulk-delete', { postIds, reason }),
  
  restorePost: (postId: number): Promise<ApiResponse<Post>> => 
    api.patch(`/admin/moderation/posts/${postId}/restore`),
  
  featurePost: (postId: number): Promise<ApiResponse<Post>> => 
    api.patch(`/admin/moderation/posts/${postId}/feature`)
};

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
