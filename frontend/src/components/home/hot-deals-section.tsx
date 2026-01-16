"use client";

import { ProductCard } from "@/components/cart/product-card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

const hotProducts: Product[] = [
  {
    id: "1",
    name: "Combo Gà Rán",
    slug: "combo-ga-ran",
    description: "2 miếng gà rán, 1 khoai tây chiên, 1 nước ngọt.",
    basePrice: 89000,
    priceAfterTax: 97900,
    taxPercentage: 10,
    category: "Gà rán",
    image: `/assets/fried-chicken-combo.jpg`,
    isAvailable: true,
    isPromotion: true,
  },
  {
    id: "4",
    name: "Burger Phô Mai",
    slug: "burger-pho-mai",
    description: "Burger bò với một lớp phô mai Cheddar tan chảy.",
    basePrice: 69000,
    priceAfterTax: 75900,
    taxPercentage: 10,
    category: "Burger",
    image: `/assets/cheese-burger.png`,
    isAvailable: true,
    isPromotion: true,
  },
  {
    id: "5",
    name: "Mỳ Ý Carbonara",
    slug: "my-y-carbonara",
    description: "Mỳ Ý với sốt kem, thịt xông khói và phô mai Parmesan.",
    basePrice: 85000,
    priceAfterTax: 93500,
    taxPercentage: 10,
    category: "Mỳ Ý",
    image: `/assets/classic-carbonara.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "7",
    name: "Khoai Tây Chiên",
    slug: "khoai-tay-chien",
    description: "Khoai tây chiên giòn rụm.",
    basePrice: 35000,
    priceAfterTax: 38500,
    taxPercentage: 10,
    category: "Món phụ",
    image: `/assets/crispy-french-fries.png`,
    isAvailable: true,
    isPromotion: false,
  },
];

interface HotDealsSectionProps {
  onAddToCart: (product: Product) => void;
}

export function HotDealsSection({ onAddToCart }: HotDealsSectionProps) {
  return (
    <section className="py-12 md:py-20 bg-orange-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Món ăn được yêu thích
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Khám phá những món ăn được yêu thích nhất tại AnEat
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {hotProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Link href="/customer/menu">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white border-orange-500 text-orange-500 rounded-full hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors duration-200 px-8 py-6 text-base font-semibold shadow-md hover:shadow-lg"
            >
              Xem thêm thực đơn
              <UtensilsCrossed className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}