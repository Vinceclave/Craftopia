// apps/web/src/lib/api.ts
import axios, { AxiosError } from 'axios';

// ===== TYPE DEFINITIONS =====
export interface IUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

const API_BASE =  'http://localhost:3001/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ error: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    
    const message = error.response?.data?.error || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getActivityLogs: (days = 7) => api.get(`/admin/dashboard/activity?days=${days}`),
  getTopUsers: (limit = 10) => api.get(`/admin/dashboard/top-users?limit=${limit}`),
  getRecentActivity: (limit = 20) => api.get(`/admin/dashboard/recent-activity?limit=${limit}`)
};

// User Management API
export const userAPI = {
  getAll: (params: Record<string, any>) => 
    api.get('/admin/management/users', { params }),
  
  getById: (userId: number) => 
    api.get(`/admin/management/users/${userId}`),
  
  getStats: (userId: number) => 
    api.get(`/admin/management/users/${userId}/stats`),
  
  toggleStatus: (userId: number) => 
    api.patch(`/admin/management/users/${userId}/status`),
  
  updateRole: (userId: number, role: string) => 
    api.patch(`/admin/management/users/${userId}/role`, { role }),
  
  delete: (userId: number) => 
    api.delete(`/admin/management/users/${userId}`)
};

// Content Moderation API
export const moderationAPI = {
  getContentForReview: (page = 1, limit = 20) => 
    api.get(`/admin/moderation/content/review?page=${page}&limit=${limit}`),
  
  deletePost: (postId: number, reason?: string) => 
    api.delete(`/admin/moderation/posts/${postId}`, { data: { reason } }),
  
  deleteComment: (commentId: number, reason?: string) => 
    api.delete(`/admin/moderation/comments/${commentId}`, { data: { reason } }),
  
  bulkDeletePosts: (postIds: number[], reason?: string) => 
    api.post('/admin/moderation/posts/bulk-delete', { postIds, reason }),
  
  restorePost: (postId: number) => 
    api.patch(`/admin/moderation/posts/${postId}/restore`),
  
  featurePost: (postId: number) => 
    api.patch(`/admin/moderation/posts/${postId}/feature`)
};

// Reports API
export const reportsAPI = {
  getAll: (params: Record<string, any>) => 
    api.get('/reports', { params }),
  
  getById: (reportId: number) => 
    api.get(`/reports/${reportId}`),
  
  updateStatus: (reportId: number, status: string, notes?: string) => 
    api.patch(`/reports/${reportId}/status`, { status, moderator_notes: notes }),
  
  getStats: () => 
    api.get('/reports/stats')
};

// Challenges API
export const challengesAPI = {
  getAll: (category?: string) => {
    const params = category ? { category } : {};
    return api.get('/challenges', { params });
  },
  
  create: (data: any) => 
    api.post('/challenges', data),
  
  generateAI: (category: string) => 
    api.post('/challenges/generate', { category }),
  
  getPendingVerifications: (page = 1, limit = 20) => 
    api.get(`/user-challenges/pending-verifications?page=${page}&limit=${limit}`)
};

export default api;