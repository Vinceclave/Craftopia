// apps/mobile/src/services/base.service.ts - Enhanced version with WebSocket support
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '~/config/api';

class ApiService {
  private axios: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Default 30s timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.axios.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - Handle token refresh with queue
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          // If already refreshing, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.axios(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (!refreshToken) throw new Error('SESSION_EXPIRED');

            const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.log('❌ Refresh failed:', errorData);
              
              // More specific error handling
              if (errorData.error?.includes('Invalid or expired')) {
                throw new Error('SESSION_EXPIRED');
              }
              throw new Error('REFRESH_FAILED');
            }

            const data = await response.json();
            const newAccessToken = data.data?.accessToken || data.accessToken;
            const newRefreshToken = data.data?.refreshToken || data.refreshToken;

            if (!newAccessToken || !newRefreshToken) {
              throw new Error('INVALID_REFRESH_RESPONSE');
            }

            // Update BOTH tokens
            await AsyncStorage.multiSet([
              ['access_token', newAccessToken],
              ['refresh_token', newRefreshToken],
            ]);

            console.log('✅ Tokens refreshed successfully');
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Process all queued requests
            this.failedQueue.forEach((promise) => promise.resolve());
            this.failedQueue = [];

            return this.axios(originalRequest);
          } catch (refreshError: any) {
            console.log('❌ Auth refresh error:', refreshError.message);
            
            // Reject all queued requests
            this.failedQueue.forEach((promise) => promise.reject(refreshError));
            this.failedQueue = [];
            
            // Only clear tokens on specific errors
            if (refreshError.message === 'SESSION_EXPIRED' || refreshError.message === 'REFRESH_FAILED') {
              await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
              console.log('🔒 Tokens cleared - session expired');
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async request<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.axios({ url, ...config });
      return response.data;
    } catch (error: any) {
      // Enhanced error handling for different status codes
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        let errorMessage: string;
        
        switch (status) {
          case 404:
            errorMessage = errorData?.error || 'Resource not found';
            break;
          case 400:
            errorMessage = errorData?.error || 'Bad request';
            break;
          case 401:
            errorMessage = errorData?.error || 'Unauthorized';
            break;
          case 403:
            errorMessage = errorData?.error || 'Forbidden';
            break;
          case 409:
            errorMessage = errorData?.error || 'Conflict';
            break;
          case 422:
            errorMessage = errorData?.error || 'Validation error';
            break;
          case 500:
            errorMessage = errorData?.error || 'Internal server error';
            break;
          default:
            errorMessage = errorData?.error || `Request failed with status ${status}`;
        }
        
        const enhancedError = new Error(errorMessage) as any;
        enhancedError.status = status;
        enhancedError.data = errorData;
        throw enhancedError;
      } else if (error.request) {
        // Network error
        const networkError = new Error('Network error. Please check your connection.') as any;
        networkError.isNetworkError = true;
        throw networkError;
      } else {
        // Other error
        throw new Error(error.message || 'Request failed');
      }
    }
  }

  // ✅ NEW: Special method for AI requests with extended timeout
  async postAI<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      console.log('🤖 AI Request:', {
        url,
        hasData: !!data,
        dataSize: data ? JSON.stringify(data).length : 0,
      });

      const response = await this.axios({
        url,
        method: 'POST',
        data,
        ...config,
        timeout: 120000, // 120 seconds for AI requests (image generation takes time)
      });

      console.log('✅ AI Response:', { url, success: true });
      return response.data;
    } catch (error: any) {
      console.error('❌ AI Request Error:', { url, error: error.message });
      
      // Enhanced error handling
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMessage = errorData?.error || `AI request failed with status ${status}`;
        
        const enhancedError = new Error(errorMessage) as any;
        enhancedError.status = status;
        enhancedError.data = errorData;
        throw enhancedError;
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('AI request timed out. Please try again.');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'AI request failed');
      }
    }
  }

  // Convenience methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'POST', data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PUT', data });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PATCH', data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  // Utility methods
  getInstance(): AxiosInstance {
    return this.axios;
  }

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  }
}

export const apiService = new ApiService();