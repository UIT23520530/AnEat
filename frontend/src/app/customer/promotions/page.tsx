"use client";

import { PublicLayout } from "@/components/layouts/public-layout";
import Image from "next/image";
import { PromotionCard } from "@/components/promotion/promotion-card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { Tag } from "lucide-react";

const promotions = [
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
  {
    id: "3",
    title: "Combo Sinh Nhật Thả Ga",
    description: "Combo đặc biệt dành cho bữa tiệc sinh nhật chỉ 329k",
    image: "/promotions/combo-sinh-nhat.jpg",
    discount: "329,000đ",
    validFrom: "01/06/2025",
    validTo: "31/08/2025",
    isActive: true,
  },
  {
    id: "4",
    title: "Đặt Qua App Nhận Quà Liền Tay",
    description: "Giảm ngay 20% khi đặt hàng qua ứng dụng AnEat",
    image: "/promotions/app-promotion.jpg",
    discount: "Giảm 20%",
    validFrom: "01/05/2025",
    validTo: "31/12/2025",
    isActive: true,
  },
  {
    id: "5",
    title: "Combo Gà Rán Giá Sốc",
    description: "2 miếng gà + khoai tây + nước ngọt chỉ 79,000đ",
    image: "/promotions/combo-ga-ran.jpg",
    discount: "79,000đ",
    validFrom: "10/06/2025",
    validTo: "30/06/2025",
    isActive: true,
  },
  {
    id: "6",
    title: "Burger Phô Mai Đặc Biệt",
    description: "Mua 1 tặng 1 cho burger phô mai mỗi thứ 3",
    image: "/promotions/burger-deal.jpg",
    discount: "Mua 1 tặng 1",
    validFrom: "01/06/2025",
    validTo: "31/12/2025",
    isActive: true,
  },
];

export default function PromotionsPage() {
  const { toast } = useToast();
  const { addToCart } = useCart();

  const handleOrderClick = (promotion: typeof promotions[0]) => {
    // Parse giá từ discount string (ví dụ: "40,000đ/phần" -> 40000)
    const parsePrice = (discount: string): number => {
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
              {activePromotions.length} khuyến mãi đang áp dụng
            </p>
          </div>

          {/* Promotions Grid */}
          {activePromotions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activePromotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  onOrderClick={handleOrderClick}
                />
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
