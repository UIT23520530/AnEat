/**
 * API Client Configuration
 * Axios instance với base configuration và interceptors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL từ environment variable hoặc default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Tạo axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Thêm token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Không redirect nếu đang ở trang login/register (lỗi 401 là do sai credentials)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/system/login');

    // Handle 401 Unauthorized - Clear token and redirect to login
    // Chỉ redirect nếu KHÔNG phải đang đăng nhập/đăng ký
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      // Clear all auth data
      console.log('Authentication failed - Token invalid or expired. Logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
