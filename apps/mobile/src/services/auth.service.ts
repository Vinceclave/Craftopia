import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, AuthResponse, LoginRequest, RegisterRequest, User, UserProfile } from '~/config/api';
import { apiService } from './base.service';

class AuthService {
  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.request<{ data: AuthResponse }>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        data: credentials,
      }
    );
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<{ user: Partial<User> }> {
    return apiService.request(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      data: userData,
    });
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
    
    await this.clearTokens();
  }

  // User data methods
  async getCurrentUser(): Promise<User> {
    const response = await apiService.request<{ data: User }>(
      API_ENDPOINTS.USER.PROFILE
    );
    
    const user = response.data;
    
    // Ensure profile exists
    if (!user.profile) {
      user.profile = {
        user_id: user.id,
        full_name: '',
        bio: '',
        profile_picture_url: '',
        points: 0,
        location: '',
      };
    }
    
    return user;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<User> {
    const response = await apiService.request<{ data: User }>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      {
        method: 'PUT',
        data,
      }
    );
    return response.data;
  }

  // Email verification
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiService.request<{ data: { message: string } }>(
      `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`
    );
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await apiService.request<{ message: string }>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      {
        method: 'POST',
        data: { email },
      }
    );
    return { message: response.message || 'Verification email sent' };
  }

  // Password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiService.request<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      {
        method: 'POST',
        data: { email },
      }
    );
    return { message: response.message || 'Reset email sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.request<{ message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        method: 'POST',
        data: { token, newPassword },
      }
    );
    return { message: response.message || 'Password reset successful' };
  }

  // Token management
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      ['access_token', accessToken],
      ['refresh_token', refreshToken],
    ]);
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

  async hasValidToken(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();