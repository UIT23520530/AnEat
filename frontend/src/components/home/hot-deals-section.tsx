"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/cart/product-card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import Link from "next/link";
import { UtensilsCrossed, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useBranch } from "@/contexts/branch-context";

interface FeaturedProductResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number; // Price in cents
  image: string | null;
  quantity: number;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
    code: string;
  } | null;
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
  unitsSold: number;
}

interface FeaturedProductsResponse {
  success: boolean;
  code: number;
  message: string;
  data: FeaturedProductResponse[];
}

// Fallback products nếu API fail
const fallbackProducts: Product[] = [
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

// Helper function để tạo slug từ name
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Map API response sang Product type
const mapToProduct = (apiProduct: FeaturedProductResponse): Product => {
  const basePrice = apiProduct.price; // Giá đã là VND
  const taxPercentage = 10; // Mặc định 10%
  const priceAfterTax = Math.round(basePrice * (1 + taxPercentage / 100));

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: createSlug(apiProduct.name),
    description: apiProduct.description || "",
    basePrice: basePrice,
    priceAfterTax: priceAfterTax,
    taxPercentage: taxPercentage,
    category: apiProduct.category?.name || "Khác",
    image: apiProduct.image || "/placeholder.svg",
    isAvailable: apiProduct.isAvailable && apiProduct.quantity > 0,
    isPromotion: false, // Featured products không phải promotion
  };
};

interface HotDealsSectionProps {
  onAddToCart: (product: Product) => void;
}

export function HotDealsSection({ onAddToCart }: HotDealsSectionProps) {
  const { selectedBranch } = useBranch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: any = {
          limit: 8,
        };

        if (selectedBranch?.id) {
          params.branchId = selectedBranch.id;
        }

        const response = await apiClient.get<FeaturedProductsResponse>("/home/featured-products", {
          params,
        });

        if (response.data.success && response.data.data) {
          const mappedProducts = response.data.data.map(mapToProduct);
          setProducts(mappedProducts);
        } else {
          setError("Không thể tải sản phẩm nổi bật");
          setProducts(fallbackProducts);
        }
      } catch (err: any) {
        console.error("Error fetching featured products:", err);
        setError("Đã xảy ra lỗi khi tải sản phẩm nổi bật");
        // Fallback to mock data
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [selectedBranch?.id]);

  const displayProducts = products.length > 0 ? products : fallbackProducts;

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && displayProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có sản phẩm nổi bật</p>
          </div>
        )}

        {/* View More Button */}
        {!loading && displayProducts.length > 0 && (
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
        )}
      </div>
    </section>
  );
}