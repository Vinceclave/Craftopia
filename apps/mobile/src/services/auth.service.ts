// apps/mobile/src/services/auth.service.ts - SIMPLIFIED VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, AuthResponse, LoginRequest, RegisterRequest, User, UserProfile } from '~/config/api';
import { apiService } from './base.service';

class AuthService {
  // ✅ Simplified login - expects consistent response format
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔑 Attempting login for:', credentials.email);
      
      const response = await apiService.request<{ data: AuthResponse }>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: 'POST',
          data: credentials,
        }
      );
      
      console.log('📦 Login response received');
      
      // ✅ Expect { success: true, data: { accessToken, refreshToken, user } }
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }
      
      const { accessToken, refreshToken, user } = response.data;
      
      if (!accessToken || !refreshToken || !user) {
        throw new Error('Incomplete login response');
      }
      
      // Ensure profile exists with defaults
      const userData: User = {
        ...user,
        profile: user.profile || {
          user_id: user.id,
          full_name: user.username,
          bio: '',
          profile_picture_url: '',
          points: 0,
          location: '',
        }
      };
      
      console.log('✅ Login successful');
      return {
        accessToken,
        refreshToken,
        user: userData
      };
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
      throw new Error(error.message || 'Login failed');
    }
  }

  // ✅ Simplified register
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      const response = await apiService.request<{ message: string }>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          method: 'POST',
          data: userData,
        }
      );
      
      console.log('✅ Registration successful');
      return { message: response.message || 'Registration successful' };
    } catch (error: any) {
      console.error('❌ Register error:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  }

  // ✅ Simplified logout
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

  // ✅ Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.request<{ data: User }>(
        API_ENDPOINTS.USER.PROFILE
      );
      
      let user = response.data;
      
      // Normalize user data
      if (!user.id) {
        user.id = user.id;
      }
      
      // Ensure profile exists
      if (!user.profile) {
        user.profile = {
          user_id: user.id,
          full_name: user.username || '',
          bio: '',
          profile_picture_url: '',
          points: 0,
          location: '',
        };
      }
      
      return user;
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      
      // Clear tokens on auth error
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        await this.clearTokens();
      }
      
      throw error;
    }
  }

  // ✅ Update profile
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

  // ✅ Email verification
  async verifyEmail(token: string): Promise<{ message: string; alreadyVerified?: boolean }> {
    try {
      const response = await apiService.request<{ 
        data: { 
          verified: boolean;
          alreadyVerified?: boolean;
          user: any;
        };
        message: string;
      }>(
        `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`,
        { method: 'GET' }
      );
      
      return { 
        message: response.message || 'Email verified successfully',
        alreadyVerified: response.data?.alreadyVerified || false
      };
    } catch (error: any) {
      console.error('❌ Verify email error:', error);
      
      if (error.message?.includes('already verified')) {
        return {
          message: 'Email is already verified',
          alreadyVerified: true
        };
      }
      
      throw new Error(error.message || 'Email verification failed');
    }
  }

  // ✅ Resend verification
  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await apiService.request<{ message: string }>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        {
          method: 'POST',
          data: { email },
        }
      );
      
      return { 
        message: response.message || 'Verification email sent successfully' 
      };
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }
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