"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Product } from "@/types";

interface AddToCartDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToCartDialog({
  product,
  isOpen,
  onClose,
}: AddToCartDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, openCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      quantity,
      image: product.image,
    });
    onClose();
    setQuantity(1);
    openCart();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="relative w-full h-48 mb-4">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <p className="text-muted-foreground mb-4">{product.description}</p>
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xl font-bold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Hủy
          </Button>
          <Button onClick={handleAddToCart}>
            Thêm {quantity} vào giỏ -{" "}
            {(product.basePrice * quantity).toLocaleString("vi-VN")}đ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}