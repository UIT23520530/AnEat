"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicLayout } from "@/components/layouts/public-layout";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const totalAmount = searchParams.get("total");
    
    if (orderId) setOrderNumber(orderId);
    if (totalAmount) setTotal(Number(totalAmount));
  }, [searchParams]);

  return (
    <PublicLayout>
      <CheckoutProgress currentStep={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt đơn thành công!</h2>
              <p className="text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng tại AnEat</p>

              <div className="bg-orange-50 p-4 rounded-lg mb-6 border border-orange-200">
                <p className="text-sm text-gray-600 mb-2">Mã đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800 mb-4">{orderNumber || "ORD-XXXXX"}</p>
                <p className="text-sm text-gray-600 mb-2">Tổng tiền</p>
                <p className="text-2xl font-bold text-orange-500">{total.toLocaleString("vi-VN")}đ</p>
              </div>

              <p className="text-gray-600 mb-6">
                Đơn hàng của bạn đã được xác nhận. Bạn sẽ nhận được thông báo cập nhật trạng thái.
              </p>

                <Link href="/customer/orders" className="block">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-lg text-lg font-bold">
                    Xem đơn hàng
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/customer/menu" className="block">
                  <Button
                    variant="outline"
                    className="w-full py-6 rounded-lg text-lg font-bold border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
