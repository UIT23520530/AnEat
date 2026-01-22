"use client";

import { PublicLayout } from "@/components/layouts/public-layout";
import { HeroSection } from "@/components/home/hero-section";
import { HotDealsSection } from "@/components/home/hot-deals-section";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { CheckCircle2 } from "lucide-react";
import Head from "next/head";

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
    <>
      <Head>
        <link rel="canonical" href="https://aneat.shop" />
      </Head>
      <PublicLayout>
        <div className="min-h-screen bg-orange-50">
          {/* SEO H1 - Hidden but crawlable */}
          <h1 className="sr-only">AnEat - Đặt Đồ Ăn Nhanh Online, Giao Hàng Tận Nơi Nhanh Chóng</h1>
          <HeroSection />
          <HotDealsSection onAddToCart={handleAddToCart} />
        </div>
      </PublicLayout>
    </>
  );
}
