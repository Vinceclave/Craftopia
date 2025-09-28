import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '~/config/api';

class ApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
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

    // Response interceptor - Handle token refresh
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (!refreshToken) throw new Error('No refresh token');

            const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) throw new Error('Refresh failed');

            const data = await response.json();
            const newToken = data.data?.accessToken || data.accessToken;

            if (newToken) {
              await AsyncStorage.setItem('access_token', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axios(originalRequest);
            }
          } catch (refreshError) {
            // Clear tokens and redirect to login
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            // You can emit an event here to trigger logout in your app
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
      const message = error.response?.data?.error || error.message || 'Request failed';
      throw new Error(message);
    }
  }
}

export const apiService = new ApiService();