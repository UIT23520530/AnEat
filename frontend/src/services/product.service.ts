import apiClient from '@/lib/api-client';

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  quantity: number;
  costPrice: number;
  prepTime: number;
  isAvailable: boolean;
  categoryId?: string;
  category?: {
    id: string;
    code: string;
    name: string;
  };
  branchId: string;
  branch?: {
    id: string;
    code: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  code: number;
  message: string;
  data: Product[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
}

export interface ProductResponse {
  success: boolean;
  code: number;
  message: string;
  data: Product;
}

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId?: string;
  quantity?: number;
  costPrice?: number;
  prepTime?: number;
  isAvailable?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  quantity?: number;
  costPrice?: number;
  prepTime?: number;
  isAvailable?: boolean;
}

export const productService = {
  // Get all products
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    categoryId?: string;
    isAvailable?: boolean;
  }): Promise<ProductsResponse> => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Create product
  createProduct: async (data: CreateProductDto): Promise<ProductResponse> => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, data: UpdateProductDto): Promise<ProductResponse> => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
