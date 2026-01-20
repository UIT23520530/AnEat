"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useCart, CartItem } from "@/contexts/cart-context";
import { addItemToServerCart } from "@/lib/actions/cart.actions";
import { useToast } from "@/components/ui/use-toast";

interface ProductOption {
  name: string;
  items: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  options: ProductOption[];
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () =>
      product.options.reduce(
        (acc, option) => {
          acc[option.name] = option.items[0];
          return acc;
        },
        {} as Record<string, string>,
      ),
  );
  const [quantity, setQuantity] = useState(1);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    const optionsIdentifier = Object.values(selectedOptions).sort().join("-");
    const cartItemId = optionsIdentifier
      ? `${product.id}-${optionsIdentifier}`
      : product.id;

    const selectedOptionsText = Object.entries(selectedOptions)
      .map(([, value]) => value)
      .join(", ");

    const cartItem: CartItem = {
      id: product.id,
      cartItemId: cartItemId,
      name: selectedOptionsText
        ? `${product.name} (${selectedOptionsText})`
        : product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
    };

    // 1. Update client-side cart immediately
    addToCart(cartItem);

    // 2. Trigger server action without blocking UI
    startTransition(async () => {
      const result = await addItemToServerCart(cartItem);
      if (result.success) {
        toast({
          title: "Success!",
          description: "Item also added to server cart.",
        });
      } else {
        toast({
          title: "Server Error",
          description: "Could not add item to server cart.",
          variant: "destructive",
        });
      }
    });

    // 3. Show toast for client-side action
    toast({
      title: "Added to cart",
      description: `${quantity} x ${cartItem.name} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image Carousel */}
        <div className="flex items-center justify-center">
          <Carousel className="w-full max-w-md">
            <CarouselContent>
              {product.images.map((src, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Image
                      src={src}
                      alt={`${product.name} image ${index + 1}`}
                      width={500}
                      height={500}
                      className="rounded-lg object-cover w-full aspect-square"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-3">{product.name}</h1>
          <p className="text-muted-foreground text-lg mb-5">
            {product.description}
          </p>
          <p className="text-4xl font-bold text-red-600 mb-8">
            {product.price.toLocaleString("vi-VN")}₫
          </p>

          {/* Product Options */}
          <div className="space-y-6">
            {product.options.map((option) => (
              <div key={option.name}>
                <h3 className="font-semibold mb-3 text-xl">{option.name}</h3>
                <RadioGroup
                  value={selectedOptions[option.name]}
                  onValueChange={(value) =>
                    handleOptionChange(option.name, value)
                  }
                  className="space-y-2"
                >
                  {option.items.map((item) => (
                    <div key={item} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={item}
                        id={`${option.name}-${item}`}
                      />
                      <Label
                        htmlFor={`${option.name}-${item}`}
                        className="cursor-pointer text-base"
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 my-8">
            <h3 className="font-semibold text-xl">Số lượng:</h3>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <span className="text-2xl">-</span>
              </Button>
              <span className="w-16 text-center font-bold text-xl">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <span className="text-2xl">+</span>
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full text-lg py-6"
            onClick={handleAddToCart}
            disabled={isPending}
          >
            {isPending ? "Adding..." : "Thêm vào giỏ hàng"}
          </Button>
        </div>
      </div>
    </div>
  );
}
