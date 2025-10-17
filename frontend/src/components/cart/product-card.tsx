"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

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

  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full flex flex-col">
      <Link href={`/customer/product/${product.id}`} className="block">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.isPromotion && (
            <Badge className="absolute top-2 right-2 z-10 bg-destructive">
              Khuyến mãi
            </Badge>
          )}
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>
      <CardContent className="p-2 flex flex-col flex-1">
        <Link href={`/customer/product/${product.id}`} className="block">
          <h3 className="font-semibold mb-2 line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex-grow" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-primary">
            {product.basePrice.toLocaleString("vi-VN")}đ
          </span>
          <Button size="sm" onClick={handleAddToCartClick}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}