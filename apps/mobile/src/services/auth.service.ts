// apps/mobile/src/services/auth.service.ts - COMPLETE FIXED VERSION WITH CHANGE PASSWORD
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, AuthResponse, LoginRequest, RegisterRequest, User, UserProfile } from '~/config/api';
import { apiService } from './base.service';

// ✅ Helper to normalize user object (backend uses user_id, frontend uses id)
const normalizeUser = (rawUser: any): User => {
  if (!rawUser) return rawUser;
  
  const normalized: User = {
    id: rawUser.id || rawUser.user_id, // ✅ Support both formats
    username: rawUser.username,
    email: rawUser.email,
    is_email_verified: rawUser.is_email_verified || rawUser.isEmailVerified,
    role: rawUser.role || 'user',
    created_at: rawUser.created_at || rawUser.createdAt || new Date().toISOString(),
    profile: rawUser.profile ? {
      user_id: rawUser.profile.user_id || rawUser.id || rawUser.user_id,
      full_name: rawUser.profile.full_name,
      bio: rawUser.profile.bio,
      profile_picture_url: rawUser.profile.profile_picture_url,
      points: rawUser.profile.points || 0,
      location: rawUser.profile.location,
    } : {
      user_id: rawUser.id || rawUser.user_id,
      full_name: rawUser.username || '',
      bio: '',
      profile_picture_url: '',
      points: 0,
      location: '',
    }
  };

  return normalized;
};

class AuthService {
  // ✅ Login with user normalization
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      
      const response = await apiService.request<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: 'POST',
          data: credentials,
        }
      );
      
      // ✅ Handle both response formats
      const authData = response.data || response;
      
      if (!authData.accessToken || !authData.refreshToken || !authData.user) {
        console.error('❌ [AuthService] Incomplete login response:', authData);
        throw new Error('Incomplete login response');
      }
      
      // ✅ Normalize user object
      const normalizedUser = normalizeUser(authData.user);
      
      return {
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        user: normalizedUser
      };
    } catch (error: any) {
      console.error('❌ [AuthService] Login error:', error.message);
      throw new Error(error.message || 'Login failed');
    }
  }

  // ✅ Register
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    try {
      
      const response = await apiService.request<{ message: string }>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          method: 'POST',
          data: userData,
        }
      );
      
      return { message: response.message || 'Registration successful' };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // ✅ Logout
  async logout(): Promise<void> {
    
    const refreshToken = await this.getRefreshToken();
    
    if (refreshToken) {
      try {
        await apiService.request(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          data: { refreshToken },
        });
      } catch (error) {
        throw error;
      }
    }
    
    await this.clearTokens();
  }

  // ✅ Get current user with normalization
  async getCurrentUser(): Promise<User> {
    try {
      
      const response = await apiService.request<any>(
        API_ENDPOINTS.USER.PROFILE
      );
      
      // Handle different response formats
      const userData = response.data || response;
      
      // ✅ Normalize user object
      const normalizedUser = normalizeUser(userData);
      
      return normalizedUser;
    } catch (error: any) {
      // Clear tokens on auth error
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        await this.clearTokens();
      }
      
      throw error;
    }
  }

  // ✅ Update profile with normalization
  async updateProfile(data: Partial<UserProfile>): Promise<User> {
    
    const response = await apiService.request<any>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      {
        method: 'PUT',
        data,
      }
    );
    
    const userData = response.data || response;
    const normalizedUser = normalizeUser(userData);
    
    return normalizedUser;
  }

  // ✅ Email verification
  async verifyEmail(token: string): Promise<{ message: string; alreadyVerified?: boolean }> {
    try {
      
      const response = await apiService.request<any>(
        `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`,
        { method: 'GET' }
      );
      
      return { 
        message: response.message || 'Email verified successfully',
        alreadyVerified: response.data?.alreadyVerified || false
      };
    } catch (error: any) {
      
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
      throw new Error(error.message || 'Failed to send verification email');
    }
  }

  // ✅ NEW: Change password (for logged-in users)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    
    const response = await apiService.request<{ message: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      {
        method: 'POST',
        data: { currentPassword, newPassword },
      }
    );
    
    return { message: response.message || 'Password changed successfully' };
  }

  // Forgot password (for password reset flow)
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

  // Reset password (using token from email)
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