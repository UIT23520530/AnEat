"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";
import { useBranch } from "@/contexts/branch-context";
import apiClient from "@/lib/api-client";

interface ProductResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number; // Price in cents
  image: string | null;
  quantity: number;
  isAvailable: boolean;
  categoryId: string | null;
  category: {
    id: string;
    code: string;
    name: string;
  } | null;
  branchId: string;
  branch: {
    id: string;
    code: string;
    name: string;
  };
  options?: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    type: string;
    isRequired: boolean;
    isAvailable: boolean;
    order: number;
  }>;
  stockStatus?: string;
  canOrder?: boolean;
}

interface ProductDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: ProductResponse;
}

// Helper function để tạo slug từ name
function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Map API response sang Product format cho ProductDetailClient
function mapToProduct(apiProduct: ProductResponse, slug: string) {
  const basePrice = apiProduct.price / 100; // Convert từ cent sang VND
  const taxPercentage = 10; // Mặc định 10%
  const priceAfterTax = Math.round(basePrice * (1 + taxPercentage / 100));

  // Map category name to slug
  const categorySlug = apiProduct.category?.name
    ? createSlugFromName(apiProduct.category.name)
    : "all";

  // Map options từ API sang format cho UI
  const options = (apiProduct.options || []).map((option) => ({
    id: option.id,
    name: option.name,
    description: option.description || "",
    price: option.price / 100, // Convert từ cent sang VND
    type: option.type,
    isRequired: option.isRequired,
    isAvailable: option.isAvailable,
    order: option.order,
  }));

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: slug,
    description: apiProduct.description || "",
    basePrice: basePrice,
    priceAfterTax: priceAfterTax,
    taxPercentage: taxPercentage,
    category: categorySlug,
    image: apiProduct.image || "/placeholder.svg",
    isAvailable: apiProduct.isAvailable && apiProduct.quantity > 0,
    isPromotion: false, // Có thể thêm logic để xác định promotion
    originalPrice: undefined,
    options: options, // Thêm options vào product
  };
}

export function ProductDetailWrapper({ slug }: { slug: string }) {
  const { selectedBranch } = useBranch();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!selectedBranch?.id) {
        setError("Vui lòng chọn cửa hàng");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<ProductDetailResponse>(
          `/home/products/slug/${slug}`,
          {
            params: {
              branchId: selectedBranch.id,
            },
          }
        );

        if (response.data.success && response.data.data) {
          const mappedProduct = mapToProduct(response.data.data, slug);
          setProduct(mappedProduct);
        } else {
          setError("Không tìm thấy sản phẩm");
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        if (err.response?.status === 404) {
          setError("Không tìm thấy sản phẩm");
        } else {
          setError("Đã xảy ra lỗi khi tải sản phẩm");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, selectedBranch?.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
