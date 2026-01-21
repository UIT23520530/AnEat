"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layouts/public-layout";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { useCart } from "@/contexts/cart-context";

export default function CheckoutSuccessPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}

function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { removeFromCart } = useCart();
  const [orderNumber, setOrderNumber] = useState("");
  const [total, setTotal] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    // Tránh xử lý nhiều lần
    if (processedRef.current) return;

    const handleMoMoCallback = async () => {
      const orderId = searchParams.get("orderId");
      const totalAmount = searchParams.get("total");
      const resultCode = searchParams.get("resultCode");
      const message = searchParams.get("message");
      const momoAmount = searchParams.get("amount");

      // Trường hợp COD (không có resultCode)
      if (resultCode === null) {
        if (orderId) setOrderNumber(orderId);
        if (totalAmount) setTotal(Number(totalAmount));
        setPaymentSuccess(true);
        return;
      }

      processedRef.current = true;

      // Trường hợp MoMo callback
      if (resultCode === "0") {
        // MoMo thanh toán thành công - tạo đơn hàng
        setIsProcessing(true);
        try {
          const pendingOrderData = sessionStorage.getItem("pendingOrderData");
          const pendingCartItemIds = sessionStorage.getItem("pendingCartItemIds");

          if (!pendingOrderData) {
            setPaymentSuccess(false);
            setPaymentMessage("Không tìm thấy thông tin đơn hàng");
            return;
          }

          const orderData = JSON.parse(pendingOrderData);
          // Đánh dấu đã thanh toán MoMo
          orderData.momoPaymentStatus = "PAID";

          // Tạo đơn hàng
          const orderResponse = await apiClient.post("/customer/orders", orderData);

          if (!orderResponse.data?.success || !orderResponse.data?.data?.order) {
            throw new Error(orderResponse.data?.message || "Không thể tạo đơn hàng");
          }

          const createdOrder = orderResponse.data.data.order;
          setOrderNumber(createdOrder.orderNumber);
          setTotal(momoAmount ? Number(momoAmount) : Number(totalAmount) || 0);
          setPaymentSuccess(true);
          setPaymentMessage("Thanh toán MoMo thành công!");

          // Xóa giỏ hàng
          if (pendingCartItemIds) {
            const itemIds = JSON.parse(pendingCartItemIds);
            itemIds.forEach((id: string) => removeFromCart(id));
          }

          // Xóa dữ liệu tạm
          sessionStorage.removeItem("pendingOrderData");
          sessionStorage.removeItem("pendingCartItemIds");
        } catch (error: any) {
          console.error("Error creating order after MoMo payment:", error);
          setPaymentSuccess(false);
          setPaymentMessage(error.message || "Có lỗi khi tạo đơn hàng");
        } finally {
          setIsProcessing(false);
        }
      } else {
        // MoMo thanh toán thất bại - không tạo đơn, giữ giỏ hàng
        setPaymentSuccess(false);
        setPaymentMessage(message || "Thanh toán MoMo không thành công. Đơn hàng chưa được tạo.");
        // Không xóa pendingOrderData để user có thể thử lại
      }
    };

    handleMoMoCallback();
  }, [searchParams, removeFromCart]);

  const handleRetryPayment = () => {
    // Quay lại trang thanh toán để thử lại
    router.push("/customer/checkout/payment");
  };

  // Đang xử lý
  if (isProcessing || paymentSuccess === null) {
    return (
      <PublicLayout>
        <CheckoutProgress currentStep={3} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <Loader2 className="w-20 h-20 text-orange-500 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Đang xử lý đơn hàng...
                </h2>
                <p className="text-gray-600">
                  Vui lòng chờ trong giây lát
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

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
                    <p className="text-sm text-gray-600 mb-2">Thông báo</p>
                    <p className="text-sm text-red-600">
                      Đơn hàng chưa được tạo. Các món trong giỏ hàng vẫn được giữ nguyên.
                    </p>
                  </div>

                  <div className="flex justify-center gap-4"> 
                    <Button 
                      onClick={handleRetryPayment}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-lg text-lg font-bold"
                    >
                      Thử lại thanh toán
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
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
