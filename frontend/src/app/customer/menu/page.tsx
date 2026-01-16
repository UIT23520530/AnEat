"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { ProductCard } from "@/components/cart/product-card";
import { CategoriesFilter } from "@/components/product/categories-filter";
import { Product } from "@/types";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { createSlug } from "@/lib/utils";
import { Truck, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: "all",
    name: "Tất cả",
    image: "🍽️",
  },
  {
    id: "combo",
    name: "Combo",
    image: "🍱",
  },
  {
    id: "ga-chien",
    name: "Gà chiên",
    image: "🍗",
  },
  {
    id: "my-y",
    name: "Mỳ ý",
    image: "🍝",
  },
  {
    id: "burger",
    name: "Burger",
    image: "🍔",
  },
  {
    id: "khoai-tay",
    name: "Khoai tây",
    image: "🍟",
  },
  {
    id: "kem",
    name: "Kem",
    image: "🍦",
  },
  {
    id: "thuc-uong",
    name: "Thức uống",
    image: "🥤",
  },
];

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Combo Gà Rán",
    slug: "combo-ga-ran",
    description: "2 miếng gà rán, 1 khoai tây chiên, 1 nước ngọt.",
    basePrice: 89000,
    priceAfterTax: 97900,
    taxPercentage: 10,
    category: "combo",
    image: `/assets/fried-chicken-combo.jpg`,
    isAvailable: true,
    isPromotion: true,
  },
  {
    id: "2",
    name: "Cánh Gà Cay",
    slug: "canh-ga-cay",
    description: "5 cánh gà chiên giòn với sốt cay đặc biệt.",
    basePrice: 79000,
    priceAfterTax: 86900,
    taxPercentage: 10,
    category: "ga-chien",
    image: `/assets/spicy-chicken-wings.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "3",
    name: "Burger Bò Cổ Điển",
    slug: "burger-bo-co-dien",
    description: "Burger với thịt bò, xà lách, cà chua và dưa chuột muối.",
    basePrice: 59000,
    priceAfterTax: 64900,
    taxPercentage: 10,
    category: "burger",
    image: `/assets/classic-burger.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "4",
    name: "Burger Phô Mai",
    slug: "burger-pho-mai",
    description: "Burger bò với một lớp phô mai Cheddar tan chảy.",
    basePrice: 69000,
    priceAfterTax: 75900,
    taxPercentage: 10,
    category: "burger",
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
    category: "my-y",
    image: `/assets/classic-carbonara.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "6",
    name: "Mỳ Ý Bolognese",
    slug: "my-y-bolognese",
    description: "Mỳ Ý với sốt cà chua và thịt bò bằm.",
    basePrice: 85000,
    priceAfterTax: 93500,
    taxPercentage: 10,
    category: "my-y",
    image: `/assets/bolognese-pasta.png`,
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
    category: "khoai-tay",
    image: `/assets/crispy-french-fries.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "8",
    name: "Nước Ngọt",
    slug: "nuoc-ngot",
    description: "Nước ngọt mát lạnh (Coca, Pepsi, 7Up).",
    basePrice: 20000,
    priceAfterTax: 22000,
    taxPercentage: 10,
    category: "thuc-uong",
    image: `/assets/refreshing-soft-drink.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "9",
    name: "Kem Vani",
    slug: "kem-vani",
    description: "Kem vani mát lạnh.",
    basePrice: 25000,
    priceAfterTax: 27500,
    taxPercentage: 10,
    category: "kem",
    image: `/assets/vanilla-ice-cream.png`,
    isAvailable: true,
    isPromotion: false,
  },
];

type SortOption = "newest" | "bestselling" | "low-price";

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleConfirmAddress = () => {
    if (deliveryAddress.trim()) {
      toast({
        title: "Đã xác nhận địa chỉ",
        description: `Địa chỉ giao hàng: ${deliveryAddress}`,
        className: "bg-green-50 border-green-200",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      quantity: 1,
      image: product.image || "/placeholder.svg",
    });
    
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng của bạn`,
      className: "bg-green-50 border-green-200",
    });
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PublicLayout>
      <div className="min-h-screen bg-orange-50">
        {/* Delivery Address Input - Sticky */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-4xl">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Truck className="h-5 w-5" />
                    <span className="font-semibold">Giao đến:</span>
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Nhập địa chỉ giao hàng của bạn..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleConfirmAddress();
                        }
                      }}
                      className="pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 w-full"
                    />
                  </div>
                  <Button
                    onClick={handleConfirmAddress}
                    className="bg-orange-500 text-white hover:bg-orange-600 rounded-lg px-6 py-2 font-semibold uppercase whitespace-nowrap"
                  >
                    Xác nhận
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Categories - Sticky */}
          <div className="sticky top-28 z-30 bg-orange-50 pb-4 mb-6">
            <CategoriesFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Search and Sort Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 w-full sm:w-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm món ăn yêu thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-2.5 rounded-full border-gray-200 bg-white focus:border-orange-500 focus:ring-orange-500 w-full"
                />
              </div>

              {/* Sort Buttons */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setSortOption("newest")}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                    sortOption === "newest"
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setSortOption("bestselling")}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                    sortOption === "bestselling"
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Bán chạy
                </button>
                <button
                  onClick={() => setSortOption("low-price")}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                    sortOption === "low-price"
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Giá mềm
                </button>
              </div>
            </div>
          </div>

          {/* Product Count */}
          {filteredProducts.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-600 text-sm">
                Tìm thấy <span className="font-semibold text-orange-500">{filteredProducts.length}</span> sản phẩm
                {selectedCategory !== "all" && (
                  <span className="ml-2">
                    trong danh mục <span className="font-semibold">{categories.find(c => c.id === selectedCategory)?.name}</span>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">
                    Không tìm thấy sản phẩm nào
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? (
                      <>Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</>
                    ) : (
                      <>Hãy thử chọn danh mục khác</>
                    )}
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
