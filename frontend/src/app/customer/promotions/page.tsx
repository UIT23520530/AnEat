"use client";

import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import Image from "next/image";
import { PromotionCard } from "@/components/promotion/promotion-card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
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
    title: "Mỳ Ý Sốt Cay - Chiêu Mọi Ý",
    description: "Thưởng thức món mỳ Ý sốt cay đậm đà chỉ với 40,000đ/phần",
    image: "/promotions/my-y-sot-cay.jpg",
    discount: "40,000đ/phần",
    validFrom: "01/06/2025",
    validTo: "30/06/2025",
    isActive: true,
  },
  {
    id: "2",
    title: "Trà Chanh Hạt Chia Thanh Mát",
    description: "Giải nhiệt mùa hè với trà chanh hạt chia chỉ 19,000đ",
    image: "/promotions/tra-chanh.jpg",
    discount: "19,000đ",
    validFrom: "15/05/2025",
    validTo: "31/07/2025",
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
    // FIXED - value là số tiền tính theo cent
    const amount = value / 100; // Convert từ cent sang VND
    return `${amount.toLocaleString("vi-VN")}đ`;
  }
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
    const amount = apiPromotion.value / 100;
    description = `Giảm ${amount.toLocaleString("vi-VN")}đ cho đơn hàng của bạn`;
  }

  if (apiPromotion.minOrderAmount) {
    const minAmount = apiPromotion.minOrderAmount / 100;
    description += ` (áp dụng cho đơn từ ${minAmount.toLocaleString("vi-VN")}đ)`;
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
    image: "/promotions/default-promotion.jpg", // Placeholder image
    discount: formatDiscount(apiPromotion.type, apiPromotion.value),
    validFrom: validFrom,
    validTo: validTo,
    isActive: apiPromotion.isActive,
  };
};

export default function PromotionsPage() {
  const { toast } = useToast();
  const { addToCart } = useCart();
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

  const handleOrderClick = (promotion: Promotion) => {
    // Parse giá từ discount string (ví dụ: "40,000đ" -> 40000, "Giảm 20%" -> 0)
    const parsePrice = (discount: string): number => {
      // Nếu là phần trăm thì không có giá cụ thể
      if (discount.includes("%")) {
        return 0; // Hoặc có thể tính giá dựa trên logic khác
      }
      // Loại bỏ các ký tự không phải số
      const numbers = discount.replace(/[^\d]/g, "");
      return numbers ? parseInt(numbers, 10) : 0;
    };

    const price = parsePrice(promotion.discount);

    addToCart({
      id: `promotion-${promotion.id}`,
      name: promotion.title,
      price: price,
      quantity: 1,
      image: promotion.image || "/placeholder.svg",
    });

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${promotion.title} đã được thêm vào giỏ hàng của bạn`,
      className: "bg-green-50 border-green-200",
    });
  };

  const activePromotions = promotions.filter((promo) => promo.isActive);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-orange-50">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Banner */}
          <div className="relative mb-16 rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-orange-500 to-red-500">
              <Image
                src="/promotions/hero-banner.jpg"
                alt="Khuyến mãi đặc biệt"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="container mx-auto px-8">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    Khuyến Mãi Đặc Biệt
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl">
                    Khám phá những ưu đãi hấp dẫn và tiết kiệm chi phí cho bữa ăn của bạn
                  </p>
                </div>
              </div>
            </div>
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
                  onOrderClick={handleOrderClick}
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
