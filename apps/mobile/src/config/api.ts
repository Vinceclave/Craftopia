// apps/mobile/src/config/api.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.9:3001' // Replace with YOUR computer's IP address
  : 'https://your-production-api.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    RESEND_VERIFICATION: '/api/v1/auth/resend-verification',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  USER: {
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
    STATS: 'api/v1/users/stats'

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
    CHATBOT: `${API_BASE_URL}/api/v1/ai/chatbot/chat`,

    DETECT_MATERIALS: `${API_BASE_URL}/api/v1/ai/material/detect`,
    GENERATE_PROJECTS: `${API_BASE_URL}/api/v1/ai/material/generate-projects`,
    ANALYZE_AND_GENERATE: `${API_BASE_URL}/api/v1/ai/material/analyze`,
  },
  CHALLENGES: {
    LIST: `/api/v1/challenges`,
    CREATE: `/api/v1/challenges`,
    GENERATE: `/api/v1/challenges/generate`,
    BY_ID: (id: number) => `/api/v1/challenges/${id}`,
  },
  USER_CHALLENGES: {
    JOIN: `${API_BASE_URL}/api/v1/user-challenges/join`,
    BY_CHALLENGE_ID: (challengeId: number) => `${API_BASE_URL}/api/v1/user-challenges/${challengeId}`,
    COMPLETE: (id: string) => `${API_BASE_URL}/api/v1/user-challenges/${id}/complete`,
    VERIFY: (id: number | undefined) => `${API_BASE_URL}/api/v1/user-challenges/${id}/verify`,
    USER_LIST: (userId?: number) => `${API_BASE_URL}/api/v1/user-challenges/user${userId ? `/${userId}` : ''}`,
    LEADERBOARD: `${API_BASE_URL}/api/v1/user-challenges/leaderboard`,
    PENDING: `${API_BASE_URL}/api/v1/user-challenges/pending-verifications`,
  },
  POSTS: {
    LIST: `${API_BASE_URL}/api/v1/posts`,
    TRENDING: `${API_BASE_URL}/api/v1/posts/trending`,
    SEARCH: '/api/v1/posts/search', // NEW
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
export interface User {
  id: number;
  username: string;
  email: string;
  is_email_verified: boolean;
  role: 'user' | 'admin';
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  user_id: number;
  full_name?: string;
  bio?: string;
  profile_picture_url?: string;
  points: number;
  location?: string;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
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


export interface DetectedMaterial {
  name: string;
  materialType: 'plastic' | 'paper' | 'glass' | 'metal' | 'electronics' | 'organic' | 'textile' | 'mixed';
  quantity: number;
  condition: 'good' | 'fair' | 'poor';
  characteristics: {
    color: string;
    size: 'small' | 'medium' | 'large';
    shape: string;
  };
}

export interface MaterialDetectionResult {
  detectedMaterials: DetectedMaterial[];
  imageDescription: string;
  totalItemsDetected: number;
  confidenceScore: number;
  upcyclingPotential: 'high' | 'medium' | 'low';
  suggestedCategories: string[];
  notes: string;
}

export interface DIYProject {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  materials: Array<{
    name: string;
    quantity: string;
    fromDetected: boolean;
  }>;
  additionalMaterials: Array<{
    name: string;
    quantity: string;
    optional: boolean;
  }>;
  steps: string[];
  tips: string[];
  outcome: string;
  sustainabilityImpact: string;
  tags: string[];
}
// Common headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;