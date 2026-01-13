"use client";

import { useState } from "react";
import { createMoMoPayment } from "@/services/payment.service";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layouts/public-layout";
import { useCheckout } from "@/contexts/checkout-context";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Wallet, CreditCard, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const mockStores = [
  {
    id: "1",
    name: "Bcons City - Thắp Green Topaz",
    address: "Đường Tôn Thất Tùng, Đông Hòa, Dĩ An, Bình Dương",
  },
  {
    id: "2",
    name: "AnEat - Gò Dầu",
    address: "Gò Dầu, Thủ Dầu Một, Bình Dương",
  },
];

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const {
    items,
    store,
    notes,
    paymentMethod,
    setPaymentMethod,
    discountCode,
    setDiscountCode,
    appliedDiscount,
    subtotal,
    total,
    handleApplyDiscount,
  } = useCheckout();

  const [isLoading, setIsLoading] = useState(false);

  const paymentMethods = [
    {
      id: "cash",
      name: "Tiền mặt",
      icon: DollarSign,
      description: "Thanh toán khi nhận hàng",
    },
    {
      id: "e-wallet",
      name: "Momo",
      icon: Wallet,
      description: "Thanh toán bằng ví điện tử momo",
    },
  ];

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      if (paymentMethod === "e-wallet") {
        // Gọi API backend để lấy link MoMo
        const data = await createMoMoPayment({
          amount: total,
          orderInfo: `Thanh toán đơn hàng tại AnEat (${store})`,
        });
        if (data?.data?.payUrl) {
          window.location.href = data.data.payUrl;
          return;
        } else {
          alert("Không lấy được link thanh toán MoMo!");
        }
      } else {
        // Thanh toán tiền mặt/thẻ: chuyển sang trang thành công
        const newOrderNumber = `ORD-${Date.now()}`;
        router.push(`/customer/checkout/success?orderId=${newOrderNumber}&total=${total}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi khi thanh toán!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <CheckoutProgress currentStep={2} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Info Cards */}
          <div className="space-y-4">
            {/* Địa chỉ giao hàng */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">
                    1
                  </div>
                  Địa chỉ giao hàng
                </h3>
                <div className="pl-8">
                  <p className="text-sm font-semibold">{mockStores.find((s) => s.id === store)?.name}</p>
                  <p className="text-xs text-gray-600">{mockStores.find((s) => s.id === store)?.address}</p>
                  {notes && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-600">Ghi chú: {notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Danh sách món ăn */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">
                    2
                  </div>
                  Danh sách món ăn ({items.length} món)
                </h3>
                <div className="pl-8 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">Số lượng: {item.quantity}</p>
                        <p className="text-orange-500 font-bold text-sm">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tổng tiền */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tạm tính</span>
                    <span className="font-semibold">{subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Giảm giá</span>
                      <span className="font-semibold text-green-600">-{appliedDiscount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Tổng cộng</span>
                    <span className="font-bold text-orange-500 text-lg">{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Details */}
          <div className="space-y-4">
            {/* Phương thức thanh toán */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-4">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as "cash" | "e-wallet")}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                          paymentMethod === method.id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 p-2 rounded-lg ${
                            paymentMethod === method.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{method.name}</p>
                          <p className="text-xs text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Mã khuyến mãi */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-4">Mã khuyến mãi</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã khuyến mãi (nếu có)"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="border-gray-300 rounded-lg flex-1"
                  />
                  <Button onClick={handleApplyDiscount} className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white">
                    Áp dụng
                  </Button>
                </div>
                {appliedDiscount > 0 && (
                  <p className="text-xs text-green-600 mt-2">✓ Đã áp dụng mã giảm giá {discountCode.toUpperCase()}</p>
                )}
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/customer/checkout")}
                disabled={isLoading}
                className="flex-1 py-6 rounded-lg text-lg font-bold border-orange-500 text-orange-500 hover:bg-orange-50"
              >
                Quay lại
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-lg text-lg font-bold"
              >
                {isLoading ? "Đang xử lý..." : "Thanh toán"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
