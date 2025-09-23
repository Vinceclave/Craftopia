// apps/mobile/src/config/api.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.6:3001' // Replace with YOUR computer's IP address
  : 'https://your-production-api.com';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`, // FIXED: removed extra space
    REFRESH_TOKEN: `${API_BASE_URL}/api/v1/auth/refresh-token`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/v1/auth/verify-email`,
    RESEND_VERIFICATION: `${API_BASE_URL}/api/v1/auth/resend-verification`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/v1/auth/change-password`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/v1/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/v1/auth/reset-password`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/api/v1/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/v1/users/profile`,
    STATS: `${API_BASE_URL}/api/v1/users/stats`,
    LEADERBOARD: `${API_BASE_URL}/api/v1/users/leaderboard`,
  },
  CRAFTS: {
    LIST: `${API_BASE_URL}/api/v1/crafts`,
    CREATE: `${API_BASE_URL}/api/v1/crafts`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/crafts/${id}`,
    BY_USER: (userId: string) => `${API_BASE_URL}/api/v1/crafts/user/${userId}`,
    RECENT: `${API_BASE_URL}/api/v1/crafts/stats/recent`,
    COUNT: `${API_BASE_URL}/api/v1/crafts/stats/count`,
  },
  AI: {
    GENERATE_CRAFT: `${API_BASE_URL}/api/v1/ai/generate`,
    GENERATE_CHALLENGE: `${API_BASE_URL}/api/v1/craft/generate-challenge`,
    ANALYZE_IMAGE: `${API_BASE_URL}/api/v1/image/analyze`,
  },
  CHALLENGES: {
    LIST: `${API_BASE_URL}/api/v1/challenges`,
    CREATE: `${API_BASE_URL}/api/v1/challenges`,
    GENERATE: `${API_BASE_URL}/api/v1/challenges/generate`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/challenges/${id}`,
  },
  USER_CHALLENGES: {
    JOIN: `${API_BASE_URL}/api/v1/user-challenges/join`,
    COMPLETE: (id: string) => `${API_BASE_URL}/api/v1/user-challenges/${id}/complete`,
    VERIFY: (id: string) => `${API_BASE_URL}/api/v1/user-challenges/${id}/verify`,
    USER_LIST: (userId?: string) => `${API_BASE_URL}/api/v1/user-challenges/user${userId ? `/${userId}` : ''}`,
    LEADERBOARD: `${API_BASE_URL}/api/v1/user-challenges/leaderboard`,
    PENDING: `${API_BASE_URL}/api/v1/user-challenges/pending-verifications`,
  },
  POSTS: {
    LIST: `${API_BASE_URL}/api/v1/posts`,
    TRENDING: `${API_BASE_URL}/api/v1/posts/trending`,
    CREATE: `${API_BASE_URL}/api/v1/posts`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/posts/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/v1/posts/${id}`,
    COMMENTS: (postId: string) => `${API_BASE_URL}/api/v1/posts/${postId}/comments`,
    TOGGLE_REACTION: (postId: string) => `${API_BASE_URL}/api/v1/posts/${postId}/reaction/toggle`,
    REACTION_COUNT: (postId: string) => `${API_BASE_URL}/api/v1/posts/${postId}/reaction/count`,
    ADD_COMMENT: `${API_BASE_URL}/api/v1/posts/comment`,
    DELETE_COMMENT: (commentId: string) => `${API_BASE_URL}/api/v1/posts/comment/${commentId}`,
  },
  ANNOUNCEMENTS: {
    LIST: `${API_BASE_URL}/api/v1/announcements`,
    ACTIVE: `${API_BASE_URL}/api/v1/announcements/active`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/announcements/${id}`,
  },
  REPORTS: {
    CREATE: `${API_BASE_URL}/api/v1/reports`,
    MY_REPORTS: `${API_BASE_URL}/api/v1/reports/my-reports`,
  },
};

// Types
export interface UserProfile {
  user_id: number;
  bio?: string;
  profile_picture_url?: string;
  points: number;
  home_dashboard_layout?: object;
  full_name?: string;
  location?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_email_verified: boolean;
  role: 'user' | 'admin';
  created_at: string;
  
  // Add profile data
  profile?: UserProfile;
  
  // Keep for backward compatibility
  isEmailVerified?: boolean;
}

// If you're getting the user profile from getCurrentUser, the response looks like this:
export interface UserProfileResponse {
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_email_verified: boolean;
  created_at: string;
  profile?: {
    user_id: number;
    full_name?: string;
    bio?: string;
    profile_picture_url?: string;
    points: number;
    home_dashboard_layout?: object;
    location?: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
  timestamp: string;
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Common headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;