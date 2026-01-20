"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicLayout } from "@/components/layouts/public-layout";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api-client";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [total, setTotal] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(true);
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const totalAmount = searchParams.get("total");
    
    // Kiểm tra resultCode từ MoMo callback
    // resultCode = 0: thành công
    // resultCode != 0: thất bại (1006 = người dùng huỷ, 49 = timeout, etc.)
    const resultCode = searchParams.get("resultCode");
    const message = searchParams.get("message");

    if (orderId) setOrderNumber(orderId);
    if (totalAmount) setTotal(Number(totalAmount));
    
    // Nếu có resultCode từ MoMo, kiểm tra kết quả và cập nhật payment status
    if (resultCode !== null) {
      if (resultCode === "0") {
        setPaymentSuccess(true);
        setPaymentMessage("Thanh toán MoMo thành công!");
        
        // Gọi API cập nhật trạng thái thanh toán (backup cho IPN)
        if (orderId) {
          apiClient.post("/customer/payment/update-status", {
            orderNumber: orderId,
            paymentStatus: "PAID",
          }).catch(err => console.error("Failed to update payment status:", err));
        }
      } else {
        setPaymentSuccess(false);
        setPaymentMessage(message || "Thanh toán MoMo không thành công");
        
        // Cập nhật trạng thái thất bại
        if (orderId) {
          apiClient.post("/customer/payment/update-status", {
            orderNumber: orderId,
            paymentStatus: "FAILED",
          }).catch(err => console.error("Failed to update payment status:", err));
        }
      }
    }
  }, [searchParams]);

  return (
    <PublicLayout>
      <CheckoutProgress currentStep={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              {paymentSuccess ? (
                <>
                  <div className="mb-6 flex justify-center">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Đặt đơn thành công!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {paymentMessage || "Cảm ơn bạn đã đặt hàng tại AnEat"}
                  </p>

                  <div className="bg-orange-50 p-4 rounded-lg mb-6 border border-orange-200">
                    <p className="text-sm text-gray-600 mb-2">Mã đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-800 mb-4">
                      {orderNumber || "ORD-XXXXX"}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">Tổng tiền</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {total.toLocaleString("vi-VN")}đ
                    </p>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Đơn hàng của bạn đã được xác nhận. Bạn sẽ nhận được thông báo
                    cập nhật trạng thái.
                  </p>
                  
                  <div className="flex justify-center gap-4"> 
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
                </>
              ) : (
                <>
                  <div className="mb-6 flex justify-center">
                    <XCircle className="w-20 h-20 text-red-500" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Thanh toán không thành công
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {paymentMessage || "Giao dịch thanh toán MoMo đã bị hủy hoặc thất bại"}
                  </p>

                  <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
                    <p className="text-sm text-gray-600 mb-2">Mã đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-800 mb-4">
                      {orderNumber || "ORD-XXXXX"}
                    </p>
                    <p className="text-sm text-red-600">
                      Đơn hàng đã được tạo nhưng chưa thanh toán. Vui lòng thanh toán khi nhận hàng hoặc liên hệ hỗ trợ.
                    </p>
                  </div>

                  <div className="flex justify-center gap-4"> 
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
                </>
              )}
            </CardContent>  
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
