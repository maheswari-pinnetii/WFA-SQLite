import axios from 'axios';
import axiosRetry from 'axios-retry';
import { STORAGE_KEYS } from '../shared/constants/constants';

let accessToken: string | null = (
  typeof window !== 'undefined' ? (
    sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || 
    localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || 
    null
  ) : null
);

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }
};

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const normalizedBaseUrl = rawBaseUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Configure automatic retries for idempotent requests (GET, PUT, DELETE, etc)
// And also retry on Network Errors or 5xx status codes
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ?? 0) >= 500;
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url && (
      originalRequest.url.includes('/auth/') ||
      originalRequest.url.includes('/login')
    );

    // Only attempt token refresh on 401 Unauthorized (expired access token), NOT on 403 Forbidden
    if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token: string) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${apiClient.defaults.baseURL || ''}/v1/auth/refresh`, {}, { withCredentials: true });
        if (res.data && res.data.success && res.data.data?.token) {
          const newToken = res.data.data.token;
          
          setAccessToken(newToken);
          
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          refreshQueue.forEach((callback) => callback(newToken));
          refreshQueue = [];
          
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.warn('[API Client] Auto-refresh failed, proceeding with rejected session.');
      } finally {
        isRefreshing = false;
        refreshQueue = [];
      }
    }

    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);
