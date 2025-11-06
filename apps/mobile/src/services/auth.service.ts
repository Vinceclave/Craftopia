// apps/mobile/src/services/auth.service.ts - COMPLETE FIXED VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, AuthResponse, LoginRequest, RegisterRequest, User, UserProfile } from '~/config/api';
import { apiService } from './base.service';

// ✅ NEW: Helper to normalize user object (backend uses user_id, frontend uses id)
const normalizeUser = (rawUser: any): User => {
  if (!rawUser) return rawUser;
  
  console.log('🔄 [normalizeUser] Raw user:', {
    has_id: !!rawUser.id,
    has_user_id: !!rawUser.user_id,
    username: rawUser.username
  });
  
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
  
  console.log('✅ [normalizeUser] Normalized user:', {
    id: normalized.id,
    username: normalized.username
  });
  
  return normalized;
};

class AuthService {
  // ✅ FIXED: Login with user normalization
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔑 [AuthService] Attempting login for:', credentials.email);
      
      const response = await apiService.request<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: 'POST',
          data: credentials,
        }
      );
      
      console.log('📦 [AuthService] Login response received');
      console.log('🔍 [AuthService] Response structure:', {
        hasData: !!response.data,
        hasUser: !!response.data?.user || !!response.user,
        hasAccessToken: !!response.data?.accessToken || !!response.accessToken,
      });
      
      // ✅ Handle both response formats
      const authData = response.data || response;
      
      if (!authData.accessToken || !authData.refreshToken || !authData.user) {
        console.error('❌ [AuthService] Incomplete login response:', authData);
        throw new Error('Incomplete login response');
      }
      
      // ✅ Normalize user object
      const normalizedUser = normalizeUser(authData.user);
      
      console.log('✅ [AuthService] Login successful, user normalized');
      
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

  // ✅ FIXED: Register
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    try {
      console.log('📝 [AuthService] Attempting registration for:', userData.email);
      
      const response = await apiService.request<{ message: string }>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          method: 'POST',
          data: userData,
        }
      );
      
      console.log('✅ [AuthService] Registration successful');
      return { message: response.message || 'Registration successful' };
    } catch (error: any) {
      console.error('❌ [AuthService] Register error:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  }

  // ✅ Logout
  async logout(): Promise<void> {
    console.log('👋 [AuthService] Logging out...');
    
    const refreshToken = await this.getRefreshToken();
    
    if (refreshToken) {
      try {
        await apiService.request(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          data: { refreshToken },
        });
      } catch (error) {
        console.warn('⚠️ [AuthService] Backend logout failed:', error);
      }
    }
    
    await this.clearTokens();
    console.log('✅ [AuthService] Logged out successfully');
  }

  // ✅ FIXED: Get current user with normalization
  async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 [AuthService] Fetching current user...');
      
      const response = await apiService.request<any>(
        API_ENDPOINTS.USER.PROFILE
      );
      
      console.log('📦 [AuthService] User profile received');
      
      // Handle different response formats
      const userData = response.data || response;
      
      // ✅ Normalize user object
      const normalizedUser = normalizeUser(userData);
      
      console.log('✅ [AuthService] Current user normalized');
      
      return normalizedUser;
    } catch (error: any) {
      console.error('❌ [AuthService] Get current user error:', error);
      
      // Clear tokens on auth error
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        console.log('🔒 [AuthService] Clearing tokens due to auth error');
        await this.clearTokens();
      }
      
      throw error;
    }
  }

  // ✅ FIXED: Update profile with normalization
  async updateProfile(data: Partial<UserProfile>): Promise<User> {
    console.log('✏️ [AuthService] Updating profile...');
    
    const response = await apiService.request<any>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      {
        method: 'PUT',
        data,
      }
    );
    
    const userData = response.data || response;
    const normalizedUser = normalizeUser(userData);
    
    console.log('✅ [AuthService] Profile updated');
    return normalizedUser;
  }

  // ✅ Email verification
  async verifyEmail(token: string): Promise<{ message: string; alreadyVerified?: boolean }> {
    try {
      console.log('✉️ [AuthService] Verifying email...');
      
      const response = await apiService.request<any>(
        `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`,
        { method: 'GET' }
      );
      
      console.log('✅ [AuthService] Email verified');
      
      return { 
        message: response.message || 'Email verified successfully',
        alreadyVerified: response.data?.alreadyVerified || false
      };
    } catch (error: any) {
      console.error('❌ [AuthService] Verify email error:', error);
      
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
      console.log('📧 [AuthService] Resending verification email...');
      
      const response = await apiService.request<{ message: string }>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        {
          method: 'POST',
          data: { email },
        }
      );
      
      console.log('✅ [AuthService] Verification email sent');
      
      return { 
        message: response.message || 'Verification email sent successfully' 
      };
    } catch (error: any) {
      console.error('❌ [AuthService] Resend verification error:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }
  }

  // Password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    console.log('🔑 [AuthService] Requesting password reset...');
    
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
    console.log('🔑 [AuthService] Resetting password...');
    
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
    console.log('💾 [AuthService] Saving tokens...');
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
    console.log('🗑️ [AuthService] Clearing tokens...');
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  }

  async hasValidToken(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();