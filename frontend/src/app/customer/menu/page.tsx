"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddToCartDialog } from "@/components/cart/add-to-cart-dialog";
import { ProductCard } from "@/components/cart/product-card";
import { Product } from "@/types";

const categories = [
  "Tất cả",
  "Gà rán",
  "Burger",
  "Mỳ Ý",
  "Món phụ",
  "Đồ uống",
];

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Combo Gà Rán",
    description: "2 miếng gà rán, 1 khoai tây chiên, 1 nước ngọt.",
    basePrice: 89000,
    priceAfterTax: 97900,
    taxPercentage: 10,
    category: "Gà rán",
    image: "/fried-chicken-combo.jpg",
    isAvailable: true,
    isPromotion: true,
  },
  {
    id: "2",
    name: "Cánh Gà Cay",
    description: "5 cánh gà chiên giòn với sốt cay đặc biệt.",
    basePrice: 79000,
    priceAfterTax: 86900,
    taxPercentage: 10,
    category: "Gà rán",
    image: "/spicy-chicken-wings.png",
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "3",
    name: "Burger Bò Cổ Điển",
    description: "Burger với thịt bò, xà lách, cà chua và dưa chuột muối.",
    basePrice: 59000,
    priceAfterTax: 64900,
    taxPercentage: 10,
    category: "Burger",
    image: "/classic-burger.png",
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "4",
    name: "Burger Phô Mai",
    description: "Burger bò với một lớp phô mai Cheddar tan chảy.",
    basePrice: 69000,
    priceAfterTax: 75900,
    taxPercentage: 10,
    category: "Burger",
    image: "/cheese-burger.png",
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
    image: "/classic-carbonara.png",
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "6",
    name: "Mỳ Ý Bolognese",
    description: "Mỳ Ý với sốt cà chua và thịt bò bằm.",
    basePrice: 85000,
    priceAfterTax: 93500,
    taxPercentage: 10,
    category: "Mỳ Ý",
    image: "/bolognese-pasta.png",
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
    image: "/crispy-french-fries.png",
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "8",
    name: "Nước Ngọt",
    description: "Nước ngọt mát lạnh (Coca, Pepsi, 7Up).",
    basePrice: 20000,
    priceAfterTax: 22000,
    taxPercentage: 10,
    category: "Đồ uống",
    image: "/refreshing-soft-drink.png",
    isAvailable: true,
    isPromotion: false,
  },
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Thực đơn của chúng tôi</h1>
          <p className="text-muted-foreground text-lg">
            Khám phá các món ăn nhanh yêu thích của chúng tôi
          </p>
        </div>
        {/* Search */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Không tìm thấy sản phẩm nào
            </p>
          </div>
        )}
      </div>
      <AddToCartDialog
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </PublicLayout>
  );
}
