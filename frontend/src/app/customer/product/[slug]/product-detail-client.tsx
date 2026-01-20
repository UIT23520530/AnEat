"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart, CartItemOption } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

interface ProductOption {
  id: string
  name: string
  description: string
  price: number // Price in VND
  type: string
  isRequired: boolean
  isAvailable: boolean
  order: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  priceAfterTax: number
  taxPercentage: number
  category: string
  image: string
  isAvailable: boolean
  isPromotion: boolean
  originalPrice?: number
  options?: ProductOption[] // Options từ API
}

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()
  const { addToCart } = useCart()
  const { toast } = useToast()

  // Mapping category slug thành tên category đẹp
  const categoryNames: { [key: string]: string } = {
    combo: "Combo",
    "ga-chien": "Gà Chiên",
    burger: "Burger",
    "my-y": "Mỳ Ý",
    "khoai-tay": "Khoai Tây",
    "thuc-uong": "Thức Uống",
    kem: "Kem",
  }

  // Helper function để extract sub-group name từ name
  // Format: "Chọn Gà 1: Gà Giòn" -> subGroup = "Chọn Gà 1", displayName = "Gà Giòn"
  // Format: "Nước Ngọt 2: Pepsi Thường" -> subGroup = "Nước Ngọt 2", displayName = "Pepsi Thường"
  const parseOptionName = (name: string): { subGroup: string; displayName: string } => {
    const match = name.match(/^(.+?):\s*(.+)$/);
    if (match) {
      return { subGroup: match[1].trim(), displayName: match[2].trim() };
    }
    return { subGroup: "", displayName: name };
  };

  // Helper function để extract main group từ type
  const getMainGroupName = (type: string): string => {
    const typeMap: Record<string, string> = {
      CHICKEN: "Gà",
      PASTA: "Mì Ý", 
      DRINK: "Nước ngọt",
      ADDON: "Thêm",
      SIZE: "Kích cỡ",
    };
    return typeMap[type] || type || "Tùy chọn";
  };

  // Lấy options từ product và parse chúng
  const allOptions = (product.options || [])
    .filter((opt) => opt.isAvailable)
    .sort((a, b) => a.order - b.order)
    .map((opt) => {
      const parsed = parseOptionName(opt.name);
      return {
        id: opt.id,
        name: opt.name,
        displayName: parsed.displayName,
        subGroup: parsed.subGroup, // "Chọn Gà 1", "Nước Ngọt 2", etc.
        price: opt.price,
        description: opt.description,
        isRequired: opt.isRequired,
        type: opt.type,
        mainGroup: getMainGroupName(opt.type),
      };
    });

  // Nhóm options theo mainGroup -> subGroup
  // Structure: { "Gà": { "Chọn Gà 1": [...], "Chọn Gà 2": [...] }, ... }
  const groupedByMain = allOptions.reduce((acc, opt) => {
    const main = opt.mainGroup;
    const sub = opt.subGroup || "default";
    
    if (!acc[main]) acc[main] = {};
    if (!acc[main][sub]) acc[main][sub] = [];
    acc[main][sub].push(opt);
    
    return acc;
  }, {} as Record<string, Record<string, typeof allOptions>>);

  // Tự động chọn option đầu tiên (hoặc option miễn phí) trong mỗi subGroup
  const [selectedAddons, setSelectedAddons] = useState<string[]>(() => {
    const defaults: string[] = [];
    
    Object.values(groupedByMain).forEach((subGroups) => {
      Object.values(subGroups).forEach((options) => {
        if (options.length > 0) {
          // Ưu tiên chọn option miễn phí, nếu không có thì chọn option đầu tiên
          const freeOption = options.find((opt) => opt.price === 0);
          defaults.push(freeOption ? freeOption.id : options[0].id);
        }
      });
    });
    
    return defaults;
  });

  const toggleAddon = (addonId: string, subGroup: string, mainGroup: string) => {
    setSelectedAddons((prev) => {
      // Lấy tất cả options trong cùng subGroup
      const optionsInSubGroup = groupedByMain[mainGroup]?.[subGroup] || [];
      const otherIdsInSubGroup = optionsInSubGroup
        .filter((opt) => opt.id !== addonId)
        .map((opt) => opt.id);
      
      // Single choice trong mỗi subGroup: bỏ các options khác, chọn option mới
      // Không cho bỏ chọn nếu là option duy nhất đang được chọn trong subGroup
      const isSelected = prev.includes(addonId);
      if (isSelected) {
        // Không cho bỏ chọn - phải luôn có 1 option được chọn trong mỗi subGroup
        return prev;
      }
      
      // Chọn option mới, bỏ chọn các options khác trong cùng subGroup
      return [...prev.filter((id) => !otherIdsInSubGroup.includes(id)), addonId];
    });
  }

  const handleAddToCart = () => {
    // Tính tổng giá bao gồm options đã chọn
    const optionsPrice = selectedAddons.reduce(
      (sum, id) => sum + (allOptions.find((a) => a.id === id)?.price || 0),
      0
    );
    const totalPrice = product.basePrice + optionsPrice;

    // Lấy thông tin options đã chọn
    const selectedOptions = selectedAddons
      .map((id) => {
        const opt = allOptions.find((a) => a.id === id);
        return opt
          ? {
              id: opt.id,
              name: opt.name,
              price: opt.price, // Price in VND
            }
          : null;
      })
      .filter((opt): opt is { id: string; name: string; price: number } => opt !== null);

    addToCart({
      id: product.id,
      name: product.name,
      price: totalPrice, // Giá đã bao gồm options
      quantity,
      image: product.image || "/placeholder.svg",
      options: selectedOptions.length > 0 ? selectedOptions : undefined,
    });

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng của bạn`,
      className: "bg-green-50 border-green-200",
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/customer/checkout");
  };

  const totalPrice =
    product.basePrice * quantity +
    selectedAddons.reduce((sum, id) => sum + (allOptions.find((a) => a.id === id)?.price || 0) * quantity, 0)

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.isPromotion && <Badge className="absolute top-4 right-4 z-10 bg-destructive">Sale</Badge>}
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover w-full h-full"
              quality={90}
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">
                {categoryNames[product.category] || product.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{product.basePrice.toLocaleString("vi-VN")}đ</span>
                {product.isPromotion && product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
            </div>

            {/* Add-ons - Chỉ hiển thị subGroup */}
            {Object.keys(groupedByMain).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Tùy chọn</h3>
                <div className="space-y-4">
                  {Object.entries(groupedByMain).flatMap(([mainGroup, subGroups]) =>
                    Object.entries(subGroups).map(([subGroup, options]) => (
                      <div key={`${mainGroup}-${subGroup}`} className="space-y-2">
                        {subGroup !== "default" && (
                          <p className="text-sm font-medium text-muted-foreground">{subGroup}</p>
                        )}
                        <div className="space-y-1">
                          {options.map((addon) => {
                            const isSelected = selectedAddons.includes(addon.id);
                            
                            return (
                              <Card
                                key={addon.id}
                                className={`transition-colors cursor-pointer ${
                                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => toggleAddon(addon.id, subGroup, mainGroup)}
                              >
                                <CardContent className="p-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        isSelected 
                                          ? "border-primary bg-primary" 
                                          : "border-muted-foreground"
                                      }`}>
                                        {isSelected && (
                                          <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                      </div>
                                      <span className="font-medium">{addon.displayName}</span>
                                    </div>
                                  </div>
                                  <span className="text-sm text-muted-foreground ml-4 whitespace-nowrap">
                                    {addon.price > 0 ? `+${addon.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                                  </span>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Số lượng</h3>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total & Actions */}
            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-none" 
                  size="lg" 
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Thêm vào giỏ
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleBuyNow}
                  className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 bg-white"
                >
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
