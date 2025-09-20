// apps/mobile/src/services/api.service.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosRequestHeaders,
} from 'axios';
import { API_BASE_URL, DEFAULT_HEADERS, HTTP_STATUS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth.service';

class ApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: DEFAULT_HEADERS,
      timeout: 10000,
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

    // Refresh token on 401
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
            const newToken = await authService.refreshToken();
            if (newToken) {
              await AsyncStorage.setItem('access_token', newToken);
              (originalRequest.headers as AxiosRequestHeaders).Authorization =
                `Bearer ${newToken}`;
              return this.axios(originalRequest);
            }
          } catch {
            await authService.clearTokens();
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
