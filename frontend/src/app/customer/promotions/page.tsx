"use client";

import { PublicLayout } from "@/components/layouts/public-layout";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Tag } from "lucide-react";

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
  return (
    <PublicLayout>
      <div className="bg-[#FFF9F2] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Banner */}
          <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative h-[400px] bg-gradient-to-r from-orange-500 to-red-500">
              <Image
                src="/promotions/hero-banner.jpg"
                alt="Khuyến mãi đặc biệt"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="container mx-auto px-8">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                    Khuyến Mãi Đặc Biệt
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
                    Khám phá những ưu đãi hấp dẫn và tiết kiệm chi phí cho bữa ăn của bạn
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Promotions */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Tag className="text-orange-500" />
              Khuyến Mãi Đang Diễn Ra
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promotions
                .filter((promo) => promo.isActive)
                .map((promotion) => (
                  <Card
                    key={promotion.id}
                    className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative h-56">
                      <Image
                        src={promotion.image}
                        alt={promotion.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-4 right-4 bg-red-500 text-white font-bold text-lg px-4 py-2">
                        {promotion.discount}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{promotion.title}</CardTitle>
                      <CardDescription className="text-base">
                        {promotion.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Từ {promotion.validFrom} đến {promotion.validTo}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        Đặt Ngay
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
