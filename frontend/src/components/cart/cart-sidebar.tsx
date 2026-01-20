"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";

export function CartSidebar() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Giỏ hàng của bạn</SheetTitle>
        </SheetHeader>
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
            <Button onClick={closeCart} className="mt-4 text-white bg-orange-500 hover:bg-orange-600">
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 my-4 max-h-[calc(100vh-250px)]">
              <div className="space-y-4 pr-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.price.toLocaleString("vi-VN")}đ
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span>{total.toLocaleString("vi-VN")}đ</span>
                </div>
                <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/customer/checkout">Thanh toán</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}