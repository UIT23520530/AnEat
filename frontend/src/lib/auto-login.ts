/**
 * Auto Login for Development
 * Tự động đăng nhập với tài khoản manager để test
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Development credentials (updated after database reset)
const DEV_CREDENTIALS = {
  email: 'manager1@aneat.com',
  password: 'password123',
};

/**
 * Auto login with manager account for development
 * Chỉ chạy khi chưa có token hoặc token hết hạn
 */
export async function autoLoginForDev(): Promise<boolean> {
  try {
    // Kiểm tra xem đã có token chưa
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      console.log('✅ Token already exists, skipping auto-login');
      return true;
    }

    console.log('🔐 Auto-logging in with dev account:', DEV_CREDENTIALS.email);

    // Gọi API system login (for manager/staff/admin)
    const response = await axios.post(`${API_BASE_URL}/auth/system/login`, {
      email: DEV_CREDENTIALS.email,
      password: DEV_CREDENTIALS.password,
    });

    // Backend trả về: { status: 'success', message: '...', data: { user, token } }
    if (response.data.status === 'success' && response.data.data?.token) {
      const { token, user } = response.data.data;
      
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      
      // Lưu user info
      if (user) {
        const userInfo = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          branchId: user.branchId,
          branchName: user.branchName,
        };
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        document.cookie = `user=${JSON.stringify(userInfo)}; path=/; max-age=86400`;
      }
      
      console.log('✅ Auto-login successful!');
      return true;
    }

    console.error('❌ Auto-login failed:', response.data.message);
    return false;
  } catch (error: any) {
    console.error('❌ Auto-login error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Clear tokens and force re-login
 */
export function clearDevTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  console.log('🗑️ Tokens cleared');
}
