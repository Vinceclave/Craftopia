// apps/mobile/src/services/base.service.ts - SIMPLE FIX
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosRequestHeaders,
} from 'axios';
import { API_BASE_URL, DEFAULT_HEADERS, HTTP_STATUS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: DEFAULT_HEADERS,
      timeout: 30000,
    });

    // Attach access token
    this.axios.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers = {
          ...(config.headers as AxiosRequestHeaders),
          Authorization: `Bearer ${token}`,
        } as AxiosRequestHeaders;
      }
      return config;
    });

    // 🔧 FIXED: Simple refresh token logic
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          
          try {
            // 🔧 Direct refresh call without circular import
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (!refreshToken) throw new Error('No refresh token');

            // 🔧 Use direct fetch to avoid interceptor loops
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) throw new Error('Refresh failed');

            const data = await response.json();
            
            // 🔧 Try different response structures
            const newToken = data.data?.accessToken || data.accessToken;
            
            if (newToken) {
              await AsyncStorage.setItem('access_token', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axios(originalRequest);
            }
          } catch (refreshError) {
            // 🔧 Clear tokens and let user re-login
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            console.log('Token refresh failed, please login again');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async request<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.axios({ url, ...options });
    return response.data;
  }
}

export const apiService = new ApiService();