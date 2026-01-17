import apiClient from '@/lib/api-client';

export interface Branch {
    id: string;
    code: string;
    name: string;
    address: string;
    phone: string;
    email?: string;
    createdAt: string;
}

export interface BranchResponse {
    success: boolean;
    code: number;
    message?: string;
    data: Branch;
}

export interface BranchesResponse {
    success: boolean;
    code: number;
    message?: string;
    data: Branch[];
    meta: {
        currentPage: number;
        totalPages: number;
        limit: number;
        totalItems: number;
    };
}

export const homeService = {
    // Get all branches (public)
    getBranches: async (params?: { page?: number; limit?: number; search?: string; sort?: string }): Promise<BranchesResponse> => {
        const response = await apiClient.get('/home/branches', { params });
        return response.data;
    },

    // Get single branch by ID (public)
    getBranchById: async (id: string): Promise<BranchResponse> => {
        const response = await apiClient.get(`/home/branches/${id}`);
        return response.data;
    },

    // Get banners
    getBanners: async () => {
        const response = await apiClient.get('/home/banners');
        return response.data;
    },

    // Get featured products
    getFeaturedProducts: async (params?: { limit?: number; branchId?: string }) => {
        const response = await apiClient.get('/home/featured-products', { params });
        return response.data;
    },
};
