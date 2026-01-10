"use client";

import { ProductCard } from "@/components/cart/product-card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import Link from "next/link";

const hotProducts: Product[] = [
  {
    id: "1",
    name: "Combo Gà Rán",
    description: "2 miếng gà rán, 1 khoai tây chiên, 1 nước ngọt.",
    basePrice: 89000,
    priceAfterTax: 97900,
    taxPercentage: 10,
    category: "Gà rán",
    image: "assets/fried-chicken-combo.jpg",
    isAvailable: true,
    isPromotion: true,
  },
  {
    id: "4",
    name: "Burger Phô Mai",
    description: "Burger bò với một lớp phô mai Cheddar tan chảy.",
    basePrice: 69000,
    priceAfterTax: 75900,
    taxPercentage: 10,
    category: "Burger",
    image: "/assets/cheese-burger.png",
    isAvailable: true,
    isPromotion: true,
  },
  {
    id: "5",
    name: "Mỳ Ý Carbonara",
    description: "Mỳ Ý với sốt kem, thịt xông khói và phô mai Parmesan.",
    basePrice: 85000,
    priceAfterTax: 93500,
    taxPercentage: 10,
    category: "Mỳ Ý",
    image: "/assets/classic-carbonara.png",
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "7",
    name: "Khoai Tây Chiên",
    description: "Khoai tây chiên giòn rụm.",
    basePrice: 35000,
    priceAfterTax: 38500,
    taxPercentage: 10,
    category: "Món phụ",
    image: "/assets/crispy-french-fries.png",
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
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Món ăn được yêu thích
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-orange-600"
          >
            <Link href="/customer/menu">Xem tất cả thực đơn</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}