// apps/mobile/src/services/auth.service.ts - FIXED VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, AuthResponse, LoginRequest, RegisterRequest, User, UserProfile } from '~/config/api';
import { apiService } from './base.service';

class AuthService {
  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.request<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: 'POST',
          data: credentials,
        }
      );
      
      console.log('=== LOGIN RESPONSE DEBUG ===');
      console.log('Response type:', typeof response);
      
      // 🔧 FIX: Check if we got HTML instead of JSON
      if (typeof response === 'string') {
        if (response.includes('<!DOCTYPE html>') || response.includes('<html')) {
          throw new Error('Backend API not responding. Received HTML instead of JSON. Please check:\n1. Backend server is running on correct port\n2. API_BASE_URL is correct\n3. Backend health endpoint works');
        }
        throw new Error('Invalid response format: received string instead of object');
      }
      
      // Check if response is an object
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response: expected object, got ' + typeof response);
      }
      
      console.log('Response keys:', Object.keys(response));
      
      // 🔧 FIX: Handle different response structures
      let authData: AuthResponse;
      
      // Case 1: { success: true, data: { accessToken, refreshToken, user } }
      if (response.success && response.data) {
        console.log('✅ Case 1: success wrapper with data');
        authData = response.data;
      }
      // Case 2: { data: { accessToken, refreshToken, user } }
      else if (response.data && typeof response.data === 'object') {
        console.log('✅ Case 2: data wrapper');
        authData = response.data;
      }
      // Case 3: { accessToken, refreshToken, user } (no data wrapper)
      else if (response.accessToken && response.user) {
        console.log('✅ Case 3: direct response');
        authData = response;
      }
      else {
        console.error('❌ None of the cases matched!');
        console.error('Response structure:', JSON.stringify(response, null, 2));
        throw new Error('Invalid login response format');
      }
      
      console.log('Extracted authData:', {
        hasAccessToken: !!authData.accessToken,
        hasRefreshToken: !!authData.refreshToken,
        hasUser: !!authData.user,
      });
      
      // Validate required fields
      if (!authData.accessToken || !authData.refreshToken || !authData.user) {
        throw new Error('Incomplete login response: missing ' + 
          (!authData.accessToken ? 'accessToken ' : '') +
          (!authData.refreshToken ? 'refreshToken ' : '') +
          (!authData.user ? 'user' : ''));
      }
      
      // Ensure the user has a complete profile
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
      
      console.log('✅ Login successful');
      return authData;
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<{ user: Partial<User> }> {
    try {
      const response = await apiService.request<any>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          method: 'POST',
          data: userData,
        }
      );
      
      console.log('Register response:', JSON.stringify(response, null, 2));
      
      // Handle different response structures
      if (response.data && response.data.user) {
        return { user: response.data.user };
      } else if (response.user) {
        return { user: response.user };
      } else if (response.success) {
        return { user: {} }; // Registration successful, but no user data returned
      }
      
      return { user: {} };
    } catch (error: any) {
      console.error('Register error details:', error);
      throw new Error(error.message || 'Registration failed');
    }
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
          ...user.profile,
        };
      }
      
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

  // 🔧 FIX: Improved email verification
  async verifyEmail(token: string): Promise<{ message: string; alreadyVerified?: boolean }> {
    try {
      const response = await apiService.request<{ 
        data?: { 
          message: string; 
          alreadyVerified?: boolean;
          verified?: boolean;
        }; 
        message?: string;
        alreadyVerified?: boolean;
      }>(
        `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`,
        { 
          method: 'GET',
          // 🔧 FIX: Remove User-Agent header - browsers block it
          // The backend will detect mobile vs web based on Accept header
        }
      );
      
      return { 
        message: response.data?.message || response.message || 'Email verified successfully',
        alreadyVerified: response.data?.alreadyVerified || response.alreadyVerified || false
      };
    } catch (error: any) {
      console.error('Verify email error:', error);
      
      // 🔧 FIX: Better error messages
      if (error.message?.includes('already verified')) {
        return {
          message: 'Email is already verified',
          alreadyVerified: true
        };
      }
      
      if (error.message?.includes('expired')) {
        throw new Error('Verification link has expired. Please request a new one.');
      }
      
      if (error.message?.includes('Network error') || error.message?.includes('CORS')) {
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      
      throw new Error(error.message || 'Email verification failed');
    }
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await apiService.request<{ data?: { message: string }, message?: string }>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        {
          method: 'POST',
          data: { email },
        }
      );
      
      return { 
        message: response.data?.message || response.message || 'Verification email sent successfully' 
      };
    } catch (error: any) {
      console.error('Resend verification error:', error);
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