/**
 * Development Authentication Helper
 * ONLY USE IN DEVELOPMENT MODE
 */

export const DEV_ACCOUNTS = {
  manager1: {
    email: 'manager1@aneat.com',
    password: 'password123',
    name: 'Trần Quản Lý 1',
    role: 'ADMIN_BRAND',
    branch: 'AnEat - Hoàn Kiếm (Hà Nội)'
  },
  manager2: {
    email: 'manager2@aneat.com',
    password: 'password123',
    name: 'Phạm Quản Lý 2',
    role: 'ADMIN_BRAND',
    branch: 'AnEat - Tây Hồ (Hà Nội)'
  },
  staff1: {
    email: 'staff.BR001.0@aneat.com',
    password: 'password123',
    name: 'Nhân viên 1 - BR001',
    role: 'STAFF',
    branch: 'AnEat - Hoàn Kiếm (Hà Nội)'
  },
  staff2: {
    email: 'staff.BR001.1@aneat.com',
    password: 'password123',
    name: 'Nhân viên 2 - BR001',
    role: 'STAFF',
    branch: 'AnEat - Hoàn Kiếm (Hà Nội)'
  }
} as const;

/**
 * Quick login helper for development
 * Usage in browser console:
 * 
 * import { devLogin } from '@/lib/dev-auth';
 * await devLogin('manager1');
 */
export async function devLogin(accountKey: keyof typeof DEV_ACCOUNTS) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Dev login is not available in production!');
    return;
  }

  const account = DEV_ACCOUNTS[accountKey];
  if (!account) {
    console.error(`❌ Account "${accountKey}" not found`);
    return;
  }

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(`${API_URL}/auth/system/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: account.email,
        password: account.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      console.log('✅ Login successful!');
      console.log('👤 User:', data.data.user.name);
      console.log('📧 Email:', data.data.user.email);
      console.log('🔑 Role:', data.data.user.role);
      console.log('🏪 Branch:', account.branch);
      console.log('\n🔄 Reloading page...');
      
      setTimeout(() => window.location.reload(), 500);
      
      return data.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

/**
 * Set token directly (useful when you already have a token)
 */
export function setDevToken(token: string) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Dev helpers are not available in production!');
    return;
  }

  localStorage.setItem('token', token);
  console.log('✅ Token set successfully!');
  console.log('🔄 Reloading page...');
  setTimeout(() => window.location.reload(), 500);
}

/**
 * Clear authentication
 */
export function devLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('✅ Logged out successfully!');
  console.log('🔄 Reloading page...');
  setTimeout(() => window.location.reload(), 500);
}

/**
 * Show current authentication status
 */
export function devAuthStatus() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token) {
    console.log('❌ Not authenticated');
    console.log('\n💡 Quick login:');
    console.log('   devLogin("manager1") - Manager account');
    console.log('   devLogin("staff1") - Staff account');
    return;
  }

  console.log('✅ Authenticated');
  if (user) {
    const userData = JSON.parse(user);
    console.log('👤 User:', userData.name);
    console.log('📧 Email:', userData.email);
    console.log('🔑 Role:', userData.role);
    console.log('🏪 Branch:', userData.branchName || 'N/A');
  }
  console.log('🎫 Token:', token.substring(0, 50) + '...');
}

// Make functions available in browser console for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).devLogin = devLogin;
  (window as any).setDevToken = setDevToken;
  (window as any).devLogout = devLogout;
  (window as any).devAuthStatus = devAuthStatus;
  (window as any).DEV_ACCOUNTS = DEV_ACCOUNTS;
}
