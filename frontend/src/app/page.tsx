"use client";

import { PublicLayout } from "@/components/layouts/public-layout";
import { HeroSection } from "@/components/home/hero-section";
import { HotDealsSection } from "@/components/home/hot-deals-section";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  const { addToCart } = useCart();
  const { toast } = useToast();

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

  return (
    <PublicLayout>
      <HeroSection />
      <HotDealsSection onAddToCart={handleAddToCart} />
    </PublicLayout>
  );
}
