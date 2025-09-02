// apps/mobile/src/services/auth.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  API_ENDPOINTS, 
  AuthResponse, 
  RegisterRequest, 
  LoginRequest 
} from '../config/api';

class AuthService {
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async register(payload: RegisterRequest): Promise<{ user: Partial<any> }> {
    return this.makeRequest<{ user: Partial<any> }>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`,
      { method: 'GET' }
    );
  }

  // Token management
  async saveTokens(token: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('access_token', token);
      await AsyncStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
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

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }
}

export const authService = new AuthService();