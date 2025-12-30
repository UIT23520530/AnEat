/**
 * Staff Types - Frontend
 * Types cho Staff management từ backend API
 */

// Backend response types
export interface StaffDTO {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'STAFF' | 'ADMIN_BRAND' | 'ADMIN_SYSTEM' | 'CUSTOMER';
  avatar: string | null;
  branchId: string | null;
  branch?: {
    id: string;
    name: string;
    code: string;
  } | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffListResponse {
  success: boolean;
  code: number;
  message: string;
  data: StaffDTO[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
}

export interface StaffDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: StaffDTO;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  avatar?: string;
  isActive?: boolean;
}

export interface UpdateStaffRequest {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

// Query parameters cho GET list
export interface StaffQueryParams {
  page?: number;
  limit?: number;
  sort?: string; // e.g., "-createdAt", "name"
  status?: 'active' | 'inactive'; // Backend expects 'status' not 'isActive'
  search?: string;
}

// API Error Response
export interface ApiErrorResponse {
  success: false;
  code: number;
  message: string;
  errors?: any;
}

// Frontend display types (extended từ backend)
export interface StaffDisplayData extends StaffDTO {
  // Thêm các field cho UI display
  displayStatus: 'active' | 'inactive' | 'on-leave';
  lastActiveFormatted: string;
}
