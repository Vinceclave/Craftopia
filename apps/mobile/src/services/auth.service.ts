// apps/mobile/src/services/auth.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_ENDPOINTS,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
  UserProfile,
  UserProfileResponse,
} from '../config/api';
import { apiService } from './base.service';

class AuthService {
  private refreshPromise: Promise<string> | null = null;

  async register(payload: RegisterRequest): Promise<{ user: Partial<User> }> {
    return apiService.request(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      data: payload,
    });
  }

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.request<{ data: AuthResponse }>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        data: payload,
      }
    );
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = await this.getRefreshToken();
    if (refreshToken) {
      try {
        await apiService.request(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          data: { refreshToken },
        });
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
    }
  }

   async getCurrentUser(): Promise<UserProfileResponse> {
    console.log('🔄 Fetching current user from API...');
    const response = await apiService.request<{ data: UserProfileResponse }>(
      API_ENDPOINTS.USER.PROFILE,
      { method: 'GET' }
    );
    
    console.log('📦 Raw API response:', JSON.stringify(response, null, 2));
    
    // The response should include both user data AND profile data
    const userData = response.data;
    
    // If the profile doesn't exist, create a default one
    if (!userData.profile) {
      console.log('⚠️ No profile found, creating default profile');
      userData.profile = {
        user_id: userData.user_id,
        full_name: '',
        bio: '',
        profile_picture_url: '',
        points: 0,
        home_dashboard_layout: null,
        location: '',
      };
    }
    
    console.log('✅ Processed user data:', JSON.stringify(userData, null, 2));
    return userData;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiService.request<{ data: { message: string } }>(
      `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`,
      { method: 'GET' }
    );
    return response.data;
  }

  async requestEmailVerification(email: string) {
    const response = await apiService.request<{ message?: string }>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      {
        method: 'POST',
        data: { email },
      }
    );
    return { message: response.message || 'Verification email sent' };
  }

  async forgotPassword(email: string) {
    const response = await apiService.request<{ message?: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      {
        method: 'POST',
        data: { email },
      }
    );
    return { message: response.message || 'Forgot Password' };
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await apiService.request<{ message?: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        method: 'POST',
        data: { token, newPassword },
      }
    );
    return { message: response.message || 'Reset Password' };
  }

  // ------------------ TOKEN HANDLING ------------------
  async refreshToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = this.performTokenRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await apiService.request<{
      data: { accessToken: string; refreshToken: string };
    }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      data: { refreshToken },
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    await this.saveTokens(accessToken, newRefreshToken);
    return accessToken;
  }

  async saveTokens(token: string, refreshToken: string): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem('access_token', token),
      AsyncStorage.setItem('refresh_token', refreshToken),
    ]);
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('access_token');
  }

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem('refresh_token');
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem('access_token'),
      AsyncStorage.removeItem('refresh_token'),
    ]);
  }

  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
