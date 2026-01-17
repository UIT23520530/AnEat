"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicLayout } from "@/components/layouts/public-layout";
import { useCheckout } from "@/contexts/checkout-context";
import { useBranch } from "@/contexts/branch-context";
import { useCart } from "@/contexts/cart-context";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Wallet, Image as ImageIcon, MapPin } from "lucide-react";
import apiClient from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth";
import { clearTempOrderCookie } from "@/lib/temp-order-cookie";
import { homeService, Branch } from "@/services/home.service";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createMoMoPayment } from "@/services/payment.service";

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
    deliveryAddress,
    phoneNumber,
    orderType,
  } = useCheckout();
  const { selectedBranch } = useBranch();
  const { cartItems, removeFromCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [branchDetail, setBranchDetail] = useState<Branch | null>(null);

  // Fetch branch details
  useEffect(() => {
    const fetchBranch = async () => {
      if (store) {
        try {
          const response = await homeService.getBranchById(store);
          if (response.success) {
            setBranchDetail(response.data);
          }
        } catch (error) {
          console.error("Error fetching branch details:", error);
        }
      }
    };

    fetchBranch();
  }, [store]);

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
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Vui lòng đăng nhập để đặt hàng!");
      router.push("/auth/login");
      return;
    }

    if (!store) {
      alert("Vui lòng chọn cửa hàng!");
      return;
    }

    if (items.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    const isAddressValid = orderType === "PICKUP" || (orderType === "DELIVERY" && deliveryAddress);
    if (!isAddressValid || !phoneNumber) {
      alert("Vui lòng nhập đầy đủ thông tin nhận hàng!");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        branchId: store,
        items: items.map((item) => {
          const cartItem = cartItems.find((ci) => ci.id === item.id);
          return {
            productId: item.id,
            quantity: item.quantity,
            price: item.price * 100,
            options: cartItem?.options?.map((opt) => ({
              optionId: opt.id,
              optionName: opt.name,
              optionPrice: opt.price * 100,
            })) || [],
          };
        }),
        deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : "Lấy tại cửa hàng",
        deliveryPhone: phoneNumber,
        orderType,
        paymentMethod,
        notes: notes || undefined,
      };

      const orderResponse = await apiClient.post("/customer/orders", orderData);

      if (!orderResponse.data?.success || !orderResponse.data?.data?.order) {
        throw new Error(orderResponse.data?.message || "Không thể tạo đơn hàng");
      }

      const createdOrder = orderResponse.data.data.order;
      const orderNumber = createdOrder.orderNumber;

      // Xóa giỏ hàng
      items.forEach((item) => {
        removeFromCart(item.id);
      });

      clearTempOrderCookie();

      if (paymentMethod === "e-wallet") {
        const data = await createMoMoPayment({
          amount: total,
          orderInfo: `Thanh toán đơn hàng tại AnEat - ${orderNumber}`,
        });
        if (data?.data?.payUrl) {
          window.location.href = data.data.payUrl;
          return;
        } else {
          alert("Không lấy được link thanh toán MoMo!");
        }
      } else {
        router.push(`/customer/checkout/success?orderId=${orderNumber}&total=${total}`);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi khi thanh toán!";
      alert(errorMessage);
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
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">
                    1
                  </div>
                  Thông tin nhận hàng
                </h3>
                <div className="pl-8 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50 px-3 py-1 text-xs">
                      {orderType === "DELIVERY" ? "Giao hàng tận nơi" : "Đến lấy tại cửa hàng"}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-white">
                    {orderType === "DELIVERY" && (
                      <div>
                        <p className="text-xs font-bold text-orange-600 uppercase mb-1">Địa chỉ nhận hàng</p>
                        <p className="text-sm text-gray-800 font-medium">{deliveryAddress || "Chưa nhập địa chỉ"}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-orange-600 uppercase mb-1">Số điện thoại</p>
                      <p className="text-sm text-gray-800 font-medium">{phoneNumber || "Chưa nhập số điện thoại"}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-dashed border-gray-100">
                    <p className="text-xs font-bold text-orange-600 uppercase mb-1">Cửa hàng phục vụ</p>
                    {branchDetail ? (
                      <>
                        <p className="text-sm font-semibold text-gray-700">{branchDetail.name}</p>
                        <p className="text-[11px] text-gray-500">{branchDetail.address}</p>
                      </>
                    ) : (
                      <Skeleton className="h-4 w-1/2" />
                    )}
                  </div>

                  {notes && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-600 italic">Ghi chú: {notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Danh sách món ăn */}
            <Card>
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
            <Card>
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
            <Card>
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
            <Card>
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
