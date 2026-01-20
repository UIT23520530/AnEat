"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { placeOrder } from "@/lib/actions/order.actions";
import { CustomerInfoStep } from "../checkout/CustomerInfoStep";
import { PaymentStep } from "../checkout/PaymentStep";

const checkoutSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ."),
  address: z.string().min(10, "Địa chỉ quá ngắn."),
  paymentMethod: z.enum(["cod", "card"], {
    required_error: "Vui lòng chọn phương thức thanh toán.",
  }),
  promoCode: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type Step = "info" | "payment";

export default function CheckoutForm() {
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart } =
    useCart();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [isPending, startTransition] = useTransition();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cod",
      promoCode: "",
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await placeOrder(data);
      if (result.success) {
        toast({
          title: "Đặt hàng thành công!",
          description: `Cảm ơn ${data.name}. Mã đơn hàng của bạn là ${result.orderId}.`,
        });
        // Here you would typically clear the cart and redirect the user.
        // clearCart();
        // router.push(`/order-confirmation/${result.orderId}`);
      } else {
        toast({
          title: "Lỗi đặt hàng",
          description:
            result.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
          variant: "destructive",
        });
      }
    });
  };

  const handleNextStep = async () => {
    const isValid = await form.trigger(["name", "phone", "address"]);
    if (isValid) {
      setCurrentStep("payment");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
      >
        {/* Left Side: Form Steps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === "info"
                  ? "1. Thông tin giao hàng"
                  : "2. Thanh toán"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === "info" && <CustomerInfoStep form={form} />}
              {currentStep === "payment" && <PaymentStep form={form} />}
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              {currentStep === "payment" && (
                <Button variant="outline" onClick={() => setCurrentStep("info")}>
                  Quay lại
                </Button>
              )}
              {currentStep === "info" && (
                <Button onClick={handleNextStep}>Tiếp tục</Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Cart Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng ({totalItems})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex items-start gap-4">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-grow">
                      <p className="font-medium leading-tight">{item.name}</p>
                      {item.options && item.options.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {item.options.map(opt => opt.name).join(", ")}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <span className="font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-semibold">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs text-red-500 mt-1"
                        onClick={() => removeFromCart(item.cartItemId)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 border-t">
              <div className="w-full flex justify-between font-bold text-xl">
                <span>Tổng cộng</span>
                <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
              </div>
              <Button
                type="submit"
                className="w-full text-lg py-6"
                disabled={cartItems.length === 0 || isPending}
              >
                {isPending ? "Đang xử lý..." : "Đặt hàng"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
