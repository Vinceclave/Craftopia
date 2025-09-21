// apps/mobile/src/services/auth.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_ENDPOINTS,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
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
      { method: 'POST', data: payload }
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
      } catch (err) {
        console.warn('Backend logout failed:', err);
      }
    }
    await this.clearTokens();
  }

  // ADD MISSING refreshToken method
  async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.request<{ data: { accessToken: string } }>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        {
          method: 'POST',
          data: { refreshToken },
        }
      );

      const newAccessToken = response.data.accessToken;
      await AsyncStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      return null;
    }
  }

  async getCurrentUser(token?: string): Promise<UserProfileResponse> {
    const accessToken = token || (await this.getToken());
    if (!accessToken) throw new Error('No access token available');

    const response = await apiService.request<{ data: UserProfileResponse }>(
      API_ENDPOINTS.USER.PROFILE,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const userData = response.data;

    if (!userData.profile) {
      userData.profile = {
        user_id: userData.user_id,
        full_name: '',
        bio: '',
        profile_picture_url: '',
        points: 0,
        home_dashboard_layout: null as any,
        location: '',
      };
    }

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
    const token = await this.getToken();
    const response = await apiService.request<{ message?: string }>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      {
        method: 'POST',
        data: { email },
        headers: token
          ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
      }
    );
    return { message: response.data.message || 'Verification email sent' };
  }

  async forgotPassword(email: string) {
    const response = await apiService.request<{message?: string}>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      {
        method: 'POST',
        data: { email }
      }
    )

    return { message: response.message || 'Forgot Password' };
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await apiService.request<{ message?:string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        method: 'POST',
        data: { token, newPassword },
      },
    )

    return { message: response.message || 'Reset Password'}
  }

  // ------------------ TOKEN HANDLING ------------------
  async saveTokens(token: string, refreshToken: string): Promise<void> {
    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem('refresh_token', refreshToken);
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('access_token');
  }

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem('refresh_token');
  }

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  }
}

export const authService = new AuthService();