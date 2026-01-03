import apiClient from '@/lib/api-client';

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface CategoriesResponse {
  success: boolean;
  code: number;
  message: string;
  data: Category[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  code: number;
  message: string;
  data: Category;
}

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export const categoryService = {
  // Get all categories
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<CategoriesResponse> => {
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  createCategory: async (data: CreateCategoryDto): Promise<CategoryResponse> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<CategoryResponse> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
