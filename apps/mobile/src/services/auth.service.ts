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
    
    // Ensure the user has a complete profile
    const authData = response.data;
    if (authData.user && !authData.user.profile) {
      authData.user.profile = {
        user_id: authData.user.id,
        full_name: authData.user.username,
        bio: '',
        profile_picture_url: '',
        points: 0,
        location: '',
      };
    }
    
    return authData;
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
    try {
      const response = await apiService.request<{ data: User }>(
        API_ENDPOINTS.USER.PROFILE
      );
      
      let user = response.data;
      
      // Handle different response structures
      if (!user && response) {
        user = response as any;
      }
      
      // Ensure user has required properties
      if (!user.id && user.user_id) {
        user.id = user.user_id;
      }
      
      // Ensure profile exists with default values
      if (!user.profile) {
        user.profile = {
          user_id: user.id,
          full_name: user.username || '',
          bio: '',
          profile_picture_url: '',
          points: 0,
          location: '',
        };
      } else {
        // Ensure profile has all required fields
        user.profile = {
          user_id: user.profile.user_id || user.id,
          full_name: user.profile.full_name || user.username || '',
          bio: user.profile.bio || '',
          profile_picture_url: user.profile.profile_picture_url || '',
          points: user.profile.points || 0,
          location: user.profile.location || '',
          ...user.profile, // Keep any additional fields
        };
      }
      
      console.log('AuthService getCurrentUser result:', user);
      return user;
    } catch (error: any) {
      console.error('AuthService getCurrentUser error:', error);
      
      // If it's an auth error, clear tokens
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        await this.clearTokens();
      }
      
      throw error;
    }
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

  // Helper method to check if user data is complete
  isUserDataComplete(user: User): boolean {
    return !!(
      user &&
      user.id &&
      user.username &&
      user.email &&
      user.profile
    );
  }
}

export const authService = new AuthService();