"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { HeroSection } from "@/components/home/hero-section";
import { HotDealsSection } from "@/components/home/hot-deals-section";
import { AddToCartDialog } from "@/components/cart/add-to-cart-dialog";
import { Product } from "@/types";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  return (
    <PublicLayout>
      <HeroSection />
      <HotDealsSection onAddToCart={handleAddToCart} />
      <AddToCartDialog
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </PublicLayout>
  );
}
