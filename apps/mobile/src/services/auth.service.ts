// apps/mobile/src/services/auth.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, AuthResponse, RegisterRequest, LoginRequest, User } from '../config/api';

class AuthService {
  private refreshPromise: Promise<string> | null = null;

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('Response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.slice(0, 200));
        throw new Error(`Expected JSON, got ${contentType}: ${text.slice(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error.message);
      throw error;
    }
  }

  private async makeAuthenticatedRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    let token = await this.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      return await this.makeRequest<T>(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      // If unauthorized, try to refresh token
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('Token expired, attempting refresh...');
        
        try {
          token = await this.refreshToken();
          return await this.makeRequest<T>(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await this.clearTokens();
          throw new Error('Session expired. Please log in again.');
        }
      }
      throw error;
    }
  }

  async register(payload: RegisterRequest): Promise<{ user: Partial<User> }> {
    return this.makeRequest<{ user: Partial<User> }>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{ data: AuthResponse }>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = await this.getRefreshToken();
    if (refreshToken) {
      try {
        await this.makeRequest(`${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
    }
  }

  async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = await this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest<{ data: { accessToken: string; refreshToken: string } }>(
      `${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    await this.saveTokens(accessToken, newRefreshToken);
    return accessToken;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.makeAuthenticatedRequest<{ data: User }>(`${API_ENDPOINTS.USER.PROFILE}`);
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.makeRequest<{ data: { message: string } }>(
      `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`,
      { method: 'GET' }
    );
    return response.data;
  }

  async requestEmailVerification(email: string) {
  console.log('Resend verification for:', email);

  const response = await this.makeRequest<{ message?: string }>(
    API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );

  return { message: response.message || 'Verification email sent' };
}

async forgotPassword(email: string) {
  console.log('Forgot password for:', email);

  const response = await this.makeRequest<{message?: string}>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );

  return { message: response.message || 'Forgot Password'}
}


async resetPassword(token: string, newPassword: string) {
  console.log('Resetting password');

  const response = await this.makeRequest<{message?: string}>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    {
      method: 'POST',
      body: JSON.stringify({ token, newPassword}),
    }
  )

  return { message: response.message || 'Reset Password' };
}

  async saveTokens(token: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('access_token', token),
        AsyncStorage.setItem('refresh_token', refreshToken),
      ]);
      console.log('Tokens saved successfully');
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem('access_token'),
        AsyncStorage.removeItem('refresh_token'),
      ]);
      console.log('Tokens cleared successfully');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    try {
      // Simple token validation - try to get current user
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();