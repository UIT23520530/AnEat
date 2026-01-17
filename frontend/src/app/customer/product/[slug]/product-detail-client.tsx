"use client"

import { useState } from "react"
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

  // Helper function để extract group name từ description
  // Format: "Chọn Gà: 1 Miếng Gà Giòn" -> "Chọn Gà"
  const extractGroupName = (description: string): string => {
    if (!description) return "Tùy chọn";
    const match = description.match(/^(.+?):/);
    return match ? match[1].trim() : "Tùy chọn";
  };

  // Helper function để xác định xem nhóm có phải là single choice (chọn 1 trong nhiều) hay không
  const isSingleChoiceGroup = (groupName: string): boolean => {
    const lowerName = groupName.toLowerCase();
    // Các nhóm như "Chọn Gà", "Chọn Mì", "Nước Ngọt" là single choice
    return lowerName.includes("chọn") || lowerName.includes("nước ngọt");
  };

  // Lấy options từ product và nhóm chúng
  const allOptions = (product.options || [])
    .filter((opt) => opt.isAvailable) // Chỉ hiển thị options available
    .sort((a, b) => a.order - b.order) // Sort theo order
    .map((opt) => ({
      id: opt.id,
      name: opt.name,
      price: opt.price, // Đã được convert sang VND trong wrapper
      description: opt.description,
      isRequired: opt.isRequired,
      type: opt.type,
      groupName: extractGroupName(opt.description || ""),
    }));

  // Nhóm options theo groupName
  const groupedOptions = allOptions.reduce((acc, opt) => {
    const groupName = opt.groupName;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(opt);
    return acc;
  }, {} as Record<string, typeof allOptions>);

  // Tự động chọn các options bắt buộc (isRequired) hoặc option đầu tiên trong mỗi nhóm single choice
  const [selectedAddons, setSelectedAddons] = useState<string[]>(() => {
    const required = allOptions.filter((opt) => opt.isRequired).map((opt) => opt.id);
    
    // Tự động chọn option đầu tiên trong mỗi nhóm single choice nếu chưa có option nào được chọn
    const singleChoiceDefaults: string[] = [];
    Object.entries(groupedOptions).forEach(([groupName, options]) => {
      if (isSingleChoiceGroup(groupName) && options.length > 0) {
        // Chọn option đầu tiên (hoặc option có giá = 0 nếu có)
        const freeOption = options.find((opt) => opt.price === 0);
        if (freeOption) {
          singleChoiceDefaults.push(freeOption.id);
        } else {
          singleChoiceDefaults.push(options[0].id);
        }
      }
    });
    
    return [...required, ...singleChoiceDefaults];
  });

  const toggleAddon = (addonId: string, groupName: string) => {
    const addon = allOptions.find((a) => a.id === addonId);
    if (!addon) return;
    
    // Không cho phép bỏ chọn nếu option là required
    if (addon.isRequired) {
      return;
    }

    setSelectedAddons((prev) => {
      const isSelected = prev.includes(addonId);
      
      // Nếu là nhóm single choice, chỉ cho chọn 1 option trong nhóm
      if (isSingleChoiceGroup(groupName)) {
        // Bỏ chọn tất cả options khác trong cùng nhóm
        const otherOptionsInGroup = groupedOptions[groupName]
          .filter((opt) => opt.id !== addonId)
          .map((opt) => opt.id);
        
        if (isSelected) {
          // Nếu đang bỏ chọn, không cho phép nếu là option duy nhất trong nhóm
          const remainingInGroup = prev.filter((id) => !otherOptionsInGroup.includes(id));
          if (remainingInGroup.length === 0) {
            // Giữ lại option này nếu không còn option nào khác trong nhóm
            return prev;
          }
          return prev.filter((id) => id !== addonId);
        } else {
          // Chọn option mới, bỏ chọn các options khác trong nhóm
          return [...prev.filter((id) => !otherOptionsInGroup.includes(id)), addonId];
        }
      } else {
        // Multiple choice: toggle bình thường
        return isSelected 
          ? prev.filter((id) => id !== addonId)
          : [...prev, addonId];
      }
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

            {/* Add-ons - Nhóm theo từng thành phần */}
            {Object.keys(groupedOptions).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Tùy chọn</h3>
                <div className="space-y-4">
                  {Object.entries(groupedOptions).map(([groupName, options]) => (
                    <div key={groupName} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">{groupName}</h4>
                      <div className="space-y-2">
                        {options.map((addon) => {
                          const isSelected = selectedAddons.includes(addon.id);
                          const isRequired = addon.isRequired;
                          const isSingleChoice = isSingleChoiceGroup(groupName);
                          
                          return (
                            <Card
                              key={addon.id}
                              className={`transition-colors ${
                                isSelected ? "border-primary bg-primary/5" : "border-border"
                              } ${isRequired ? "" : "cursor-pointer hover:border-primary/50"}`}
                              onClick={() => !isRequired && toggleAddon(addon.id, groupName)}
                            >
                              <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {isSingleChoice && (
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        isSelected 
                                          ? "border-primary bg-primary" 
                                          : "border-muted-foreground"
                                      }`}>
                                        {isSelected && (
                                          <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                      </div>
                                    )}
                                    {!isSingleChoice && (
                                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        isSelected 
                                          ? "border-primary bg-primary" 
                                          : "border-muted-foreground"
                                      }`}>
                                        {isSelected && (
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                    )}
                                    <span className="font-medium">{addon.name}</span>
                                    {isRequired && (
                                      <Badge variant="outline" className="text-xs">
                                        Bắt buộc
                                      </Badge>
                                    )}
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
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Quantity</h3>
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
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-none" 
                  size="lg" 
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Link href="/customer/checkout" className="flex-1">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 bg-white"
                  >
                    Buy Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
