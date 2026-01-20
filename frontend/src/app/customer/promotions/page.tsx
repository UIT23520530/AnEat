"use client";

import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import Image from "next/image";
import { PromotionCard } from "@/components/promotion/promotion-card";
import { Tag, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

interface PromotionResponse {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number; // Giá trị giảm giá (phần trăm hoặc số tiền cố định - tính theo cent)
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiryDate: string | null;
  minOrderAmount: number | null; // Số tiền tối thiểu (tính theo cent)
  applicableProducts: string | null; // JSON array của product IDs
  createdAt: string;
  updatedAt: string;
}

interface PromotionsResponse {
  success: boolean;
  code: number;
  message: string;
  data: PromotionResponse[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

// Fallback promotions nếu API fail
const fallbackPromotions: Promotion[] = [
  {
    id: "1",
    title: "Giảm 20% Đơn Hàng",
    description: "Giảm 20% cho đơn hàng từ 100,000đ",
    image: "/promotions/sale20.svg",
    discount: "Giảm 20%",
    validFrom: "01/01/2026",
    validTo: "31/03/2026",
    isActive: true,
  },
  {
    id: "2",
    title: "Giảm 30% Combo",
    description: "Giảm 30% khi mua combo gà rán",
    image: "/promotions/sale30.svg",
    discount: "Giảm 30%",
    validFrom: "01/01/2026",
    validTo: "28/02/2026",
    isActive: true,
  },
];

// Helper function để format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Helper function để format discount string
const formatDiscount = (type: string, value: number): string => {
  if (type === "PERCENTAGE") {
    return `Giảm ${value}%`;
  } else {
    // FIXED - value là số tiền VND
    return `${value.toLocaleString("vi-VN")}đ`;
  }
};

// Helper function để chọn ảnh dựa trên giá trị giảm giá
const getPromotionImage = (type: string, value: number): string => {
  if (type === "PERCENTAGE") {
    if (value >= 30) return "/promotions/sale30.svg";
    if (value >= 20) return "/promotions/sale20.svg";
    return "/promotions/sale20.svg";
  }
  // FIXED type - dùng sale90.svg cho combo 50k
  if (value >= 50000) return "/promotions/sale90.svg";
  return "/promotions/banner.svg";
};

// Map API response sang Promotion format
const mapToPromotion = (apiPromotion: PromotionResponse): Promotion => {
  // Tạo title từ code (có thể format lại cho đẹp)
  const title = apiPromotion.code
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Tạo description dựa trên type và value
  let description = "";
  if (apiPromotion.type === "PERCENTAGE") {
    description = `Giảm ${apiPromotion.value}% cho đơn hàng của bạn`;
  } else {
    description = `Giảm ${apiPromotion.value.toLocaleString("vi-VN")}đ cho đơn hàng của bạn`;
  }

  if (apiPromotion.minOrderAmount) {
    description += ` (áp dụng cho đơn từ ${apiPromotion.minOrderAmount.toLocaleString("vi-VN")}đ)`;
  }

  // Format dates
  const validFrom = formatDate(apiPromotion.createdAt);
  const validTo = apiPromotion.expiryDate
    ? formatDate(apiPromotion.expiryDate)
    : "Không giới hạn";

  return {
    id: apiPromotion.id,
    title: title,
    description: description,
    image: getPromotionImage(apiPromotion.type, apiPromotion.value),
    discount: formatDiscount(apiPromotion.type, apiPromotion.value),
    validFrom: validFrom,
    validTo: validTo,
    isActive: apiPromotion.isActive,
  };
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch promotions from API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<PromotionsResponse>("/home/promotions", {
          params: {
            page: 1,
            limit: 50,
          },
        });

        if (response.data.success && response.data.data) {
          const mappedPromotions = response.data.data.map(mapToPromotion);
          setPromotions(mappedPromotions);
        } else {
          setError("Không thể tải khuyến mãi");
          setPromotions(fallbackPromotions);
        }
      } catch (err: any) {
        console.error("Error fetching promotions:", err);
        setError("Đã xảy ra lỗi khi tải khuyến mãi");
        // Fallback to mock data
        setPromotions(fallbackPromotions);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const activePromotions = promotions.filter((promo) => promo.isActive);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-orange-50">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Banner */}
          <div className="relative mb-16 rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/promotions/banner.svg"
              alt="Khuyến mãi đặc biệt"
              width={1920}
              height={600}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Tag className="h-6 w-6 text-orange-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Khuyến Mãi Đang Diễn Ra
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
              {loading ? "Đang tải..." : `${activePromotions.length} khuyến mãi đang áp dụng`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Promotions Grid */}
          {!loading && activePromotions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activePromotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                />
              ))}
            </div>
          ) : !loading && activePromotions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <Tag className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">
                    Hiện không có khuyến mãi nào
                  </p>
                  <p className="text-gray-500 text-sm">
                    Vui lòng quay lại sau để xem các ưu đãi mới
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </PublicLayout>
  );
}
