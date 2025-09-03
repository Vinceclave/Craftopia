// apps/mobile/src/config/api.ts
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.10:5000' // Replace with YOUR computer's IP address
  : 'https://your-production-api.com';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
  },
};

// Types remain the same...

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  is_email_verified: boolean;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  token: string;
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