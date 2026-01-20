"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layouts/public-layout";
import { useCart } from "@/contexts/cart-context";
import { useCheckout } from "@/contexts/checkout-context";
import { useBranch } from "@/contexts/branch-context";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Minus, Plus, Trash2, MapPin, Store as StoreIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  saveTempOrderToCookie,
  getTempOrderFromCookie,
} from "@/lib/temp-order-cookie";
import { homeService, Branch } from "@/services/home.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function CheckoutInfoPage() {
  const router = useRouter();
  const { cartItems, closeCart } = useCart();
  const { openBranchSelector, selectedBranch } = useBranch();
  const {
    items,
    setItems,
    store,
    setStore,
    deliveryAddress,
    setDeliveryAddress,
    phoneNumber,
    setPhoneNumber,
    orderType,
    setOrderType,
    notes,
    setNotes,
    subtotal,
    total,
    handleItemQuantityChange,
    handleItemRemove,
  } = useCheckout();

  // Đồng bộ store ID với chi nhánh đã chọn
  useEffect(() => {
    if (selectedBranch?.id && selectedBranch.id !== store) {
      setStore(selectedBranch.id);
    }
  }, [selectedBranch, store, setStore]);

  const [branchDetail, setBranchDetail] = useState<Branch | null>(null);
  const [isLoadingBranch, setIsLoadingBranch] = useState(false);

  // Fetch branch details
  useEffect(() => {
    const fetchBranch = async () => {
      if (store) {
        setIsLoadingBranch(true);
        try {
          const response = await homeService.getBranchById(store);
          if (response.success) {
            setBranchDetail(response.data);
          }
        } catch (error) {
          console.error("Error fetching branch details:", error);
        } finally {
          setIsLoadingBranch(false);
        }
      }
    };

    fetchBranch();
  }, [store]);

  // Auto close cart sidebar
  useEffect(() => {
    closeCart();
  }, [closeCart]);

  // Always sync items from cart on mount or when cart changes
  useEffect(() => {
    setItems(cartItems as any[]);
  }, [cartItems, setItems]);

  const handleContinue = () => {
    const isAddressValid = orderType === "PICKUP" || (orderType === "DELIVERY" && deliveryAddress);
    if (store && items.length > 0 && isAddressValid && phoneNumber) {
      router.push("/customer/checkout/payment");
    }
  };

  return (
    <PublicLayout>
      <CheckoutProgress currentStep={1} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Cart Items */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold uppercase">
                Giỏ hàng của bạn <span className="text-gray-500 font-normal">({items.length} món)</span>
              </h2>
              <Link href="/customer/menu" className="text-orange-500 hover:text-orange-600 text-sm font-semibold">
                + Thêm món khác
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Giỏ hàng trống</p>
              ) : (
                items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex gap-4 pb-4 ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      {item.options && item.options.length > 0 ? (
                        <div className="text-xs text-gray-500 my-1">
                          {item.options.map((opt) => (
                            <div key={opt.id} className="flex justify-between">
                              <span>- {opt.name}</span>
                              {opt.price > 0 && <span className="text-gray-400">+{opt.price.toLocaleString("vi-VN")}đ</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 my-1 italic">Không có tùy chọn</p>
                      )}
                      <p className="text-orange-500 font-bold mt-1">{item.price.toLocaleString("vi-VN")} đ</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 p-0 rounded-md bg-orange-50 border-orange-200 hover:bg-orange-100 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-orange-600" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0 rounded-md bg-orange-500 border-orange-600 hover:bg-orange-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleItemRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors h-8 w-8 p-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Delivery & Options */}
          <div className="space-y-4">
            {/* Địa chỉ nhận hàng */}
            <Card className="border-orange-100 shadow-sm overflow-hidden">
              <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-orange-900">Thông tin nhận hàng</h3>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                  <button
                    onClick={() => setOrderType("DELIVERY")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      orderType === "DELIVERY"
                        ? "bg-white text-orange-500 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Giao hàng
                  </button>
                  <button
                    onClick={() => setOrderType("PICKUP")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      orderType === "PICKUP"
                        ? "bg-white text-orange-500 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Đến lấy
                  </button>
                </div>

                {orderType === "DELIVERY" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Địa chỉ nhận hàng</label>
                    <Input
                      placeholder="Số nhà, tên đường, phường/xã..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl py-5"
                    />
                    <p className="text-[11px] text-red-500 italic">
                      * Vui lòng nhập địa chỉ chi tiết
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Số điện thoại nhận hàng</label>
                  <Input
                    placeholder="Nhập số điện thoại để nhận hàng..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl py-5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Ghi chú đơn hàng</label>
                  <Textarea
                    placeholder="Nhập ghi chú..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cửa hàng phục vụ */}
            <Card className="border-orange-100 shadow-sm overflow-hidden">
              <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <StoreIcon className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-orange-900">Cửa hàng phục vụ</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-100 h-8 font-semibold px-2" onClick={openBranchSelector}>
                  Thay đổi
                </Button>
              </div>
              <CardContent className="p-4">
                {isLoadingBranch ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ) : branchDetail ? (
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">{branchDetail.name}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{branchDetail.address}</p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed border-orange-100">
                      <p className="text-[11px] text-green-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Đang mở cửa
                      </p>
                      <p className="text-[11px] text-gray-400">08:30 - 20:30</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm italic">
                    Chưa chọn cửa hàng phục vụ
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thông tin tiền */}
            <Card className="border-orange-200 shadow-md">
              <CardContent className="p-4">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-gray-800">{subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t border-orange-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                    <span className="font-bold text-orange-500 text-2xl">{total.toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!store || items.length === 0 || (orderType === "DELIVERY" && !deliveryAddress) || !phoneNumber}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 rounded-2xl text-xl font-bold transition-all shadow-lg hover:shadow-orange-200 active:scale-[0.98]"
                >
                  THANH TOÁN NGAY
                </Button>
                
                {((orderType === "DELIVERY" && !deliveryAddress) || !phoneNumber) && items.length > 0 && (
                  <p className="text-center text-red-500 text-xs mt-3">
                    * Vui lòng nhập đầy đủ {orderType === "DELIVERY" ? "địa chỉ và số điện thoại" : "số điện thoại"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
