"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layouts/public-layout";
import { useCart } from "@/contexts/cart-context";
import { useCheckout } from "@/contexts/checkout-context";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Image as ImageIcon, Minus, Plus, Trash2, Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

export default function CheckoutInfoPage() {
  const router = useRouter();
  const { cartItems, closeCart } = useCart();
  const {
    items,
    setItems,
    store,
    setStore,
    notes,
    setNotes,
    addOns,
    setAddOns,
    subtotal,
    total,
    handleItemQuantityChange,
    handleItemRemove,
  } = useCheckout();

  // Auto close cart sidebar
  useEffect(() => {
    closeCart();
  }, [closeCart]);

  // Initialize items from cart
  useEffect(() => {
    if (cartItems.length > 0 && items.length === 0) {
      setItems(cartItems as any[]);
    }
  }, [cartItems, items.length, setItems]);

  const handleContinue = () => {
    if (store && items.length > 0) {
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
              <h2 className="text-xl font-bold">
                GIỎ HÀNG CỦA BẠN <span className="text-gray-600">({items.length} Sản phẩm)</span>
              </h2>
              <Link href="/customer/menu" className="text-orange-500 hover:text-orange-600 flex items-center gap-1">
                + Thêm món ăn
              </Link>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Giỏ hàng trống</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                      <p className="text-xs text-gray-500 my-1">
                        - 2 x {item.name.split(" ")[0]} (1 miếng)
                        <br />
                        - 1 x Khoai tây chiên
                        <br />- 1 x Pepsi (M)
                      </p>
                      <p className="text-orange-500 font-bold">{item.price.toLocaleString("vi-VN")} đ</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 p-0 rounded-md bg-orange-200 border-orange-300 hover:bg-orange-300"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0 rounded-md bg-orange-400 border-orange-500 hover:bg-orange-500"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleItemRemove(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ghi chú */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3">Ghi chú cho đơn hàng</h3>
                <Textarea
                  placeholder="Vui lòng thêm lưu ý cho cửa hàng"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Ngon hơn khi ăn kèm */}
            <div>
              <h3 className="font-bold text-lg mb-4">NGON HƠN KHI ĂN KÈM</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border shadow-sm hover:shadow-md transition cursor-pointer">
                    <CardContent className="p-3">
                      <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2"></div>
                      <p className="text-sm font-semibold text-center">Sản phẩm {i}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Delivery & Options */}
          <div className="space-y-4">
            {/* Giao hàng đến */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold mb-1">Giao hàng đến</h3>
                    <p className="text-sm font-semibold">{mockStores.find((s) => s.id === store)?.name}</p>
                    <p className="text-xs text-gray-600">{mockStores.find((s) => s.id === store)?.address}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-orange-500">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600">
                    Cửa hàng: <span className="font-semibold">GO DI AN</span>
                  </p>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <p className="text-xs text-gray-600">
                    Thời gian tiếp nhận đơn hàng trực tuyến từ 08:30 đến 20:30 hàng ngày
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tuỳ chọn */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-4">Tuỳ chọn</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="utensils" className="cursor-pointer text-sm">
                      Lấy dụng cụ ăn uống
                    </label>
                    <Checkbox
                      id="utensils"
                      checked={addOns.utensils}
                      onCheckedChange={(checked) => setAddOns({ ...addOns, utensils: !!checked })}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="sauce" className="cursor-pointer text-sm">
                      Lấy tương cà
                    </label>
                    <Checkbox
                      id="sauce"
                      checked={addOns.sauce}
                      onCheckedChange={(checked) => setAddOns({ ...addOns, sauce: !!checked })}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="napkins" className="cursor-pointer text-sm">
                      Lấy tương ớt
                    </label>
                    <Checkbox
                      id="napkins"
                      checked={addOns.napkins}
                      onCheckedChange={(checked) => setAddOns({ ...addOns, napkins: !!checked })}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thông tin tiền */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tạm tính</span>
                    <span className="font-semibold">{subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Tổng cộng</span>
                    <span className="font-bold">{total.toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!store || items.length === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-lg text-lg font-bold"
                >
                  Tiếp tục
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
