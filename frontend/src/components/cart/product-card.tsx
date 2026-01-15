"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { createSlug } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  // Tạo slug từ tên sản phẩm nếu chưa có
  const productSlug = product.slug || createSlug(product.name);
  const productUrl = `/customer/product/${productSlug}`;

  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full flex flex-col bg-white rounded-3xl border-0">
      <Link href={productUrl} className="block">
        <div className="aspect-video relative overflow-hidden rounded-t-3xl flex items-center justify-center">
          {product.isPromotion && (
            <Badge className="absolute top-3 right-3 z-10 bg-red-400">
              Khuyến mãi
            </Badge>
          )}
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>
      <CardContent className="p-4 flex flex-col flex-1">
        <Link href={productUrl} className="block">
          <h3 className="font-bold text-lg mb-2 line-clamp-1 text-gray-700">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex-grow" />
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-red-400">
              {product.basePrice.toLocaleString("vi-VN")}đ
            </span>
            <span className="text-sm text-red-300 line-through">
              {product.priceAfterTax.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <Button
            size="lg"
            onClick={handleAddToCartClick}
            className="bg-red-300 hover:bg-red-400 h-12 w-12 p-0 rounded-xl"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}