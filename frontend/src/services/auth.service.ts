/**
 * Authentication Service
 * Handles user authentication and profile management
 */

import { apiClient } from '@/lib/api-client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'ADMIN_SYSTEM' | 'ADMIN_BRAND' | 'STAFF' | 'LOGISTICS_STAFF';
  avatar: string | null;
  branchId: string | null;
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface GetCurrentUserResponse {
  status: 'success';
  data: {
    user: UserProfile;
  };
}

const AUTH_BASE_URL = '/auth';

export class AuthService {
  /**
   * Get current authenticated user profile
   */
  static async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<GetCurrentUserResponse>(
      `${AUTH_BASE_URL}/me`
    );
    return response.data.data.user;
  }

  /**
   * Get user initials from name (for avatar fallback)
   */
  static getUserInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Get role display name in Vietnamese
   */
  static getRoleDisplayName(role: UserProfile['role']): string {
    const roleMap = {
      ADMIN_SYSTEM: 'Quản trị hệ thống',
      ADMIN_BRAND: 'Quản lý chi nhánh',
      STAFF: 'Nhân viên',
      LOGISTICS_STAFF: 'Nhân viên kho',
    };
    return roleMap[role] || role;
  }
}

export const authService = AuthService;
