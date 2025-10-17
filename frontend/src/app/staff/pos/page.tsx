"use client"

import { useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Minus, X, CreditCard, Banknote, Smartphone, Utensils, Package, Bike } from "lucide-react"
import { categories, products } from "@/lib/menu-data"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [orderType, setOrderType] = useState<"dine-in" | "take-away" | "delivery">("dine-in")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "e-wallet">("cash")

  const allCategories = [
    { id: "all", name: "Tất cả" },
    ...categories
  ]

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: typeof products[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1,
        image: product.image 
      }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
      return updated
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName("")
    setTableNumber("")
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const discount = 0
  const total = subtotal + tax - discount

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống!")
      return
    }
    alert(`Đặt hàng thành công!\nTổng cộng: ${total.toLocaleString()} VND`)
    clearCart()
  }

  return (
    <StaffLayout>
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">POS Dashboard</h1>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Chọn danh mục</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all",
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200"
                      : "bg-white text-white-700 border border-gray-200 hover:border-orange-300 hover:text-orange-600"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-gray-100 hover:border-orange-300 group overflow-hidden"
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square bg-gradient-to-br from-orange-50 to-white relative overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-800 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-orange-600 font-bold text-lg">
                      {product.price.toLocaleString()}đ
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col shadow-xl">
          <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500">
            <h2 className="text-xl font-bold text-white mb-1">Đơn hàng hiện tại</h2>
            <p className="text-orange-100 text-sm">
              {cart.length} món - {cart.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
            </p>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Loại đơn hàng</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setOrderType("dine-in")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  orderType === "dine-in"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-orange-300 text-gray-600"
                )}
              >
                <Utensils className="h-5 w-5" />
                <span className="text-xs font-medium">Tại bàn</span>
              </button>
              <button
                onClick={() => setOrderType("take-away")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  orderType === "take-away"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-orange-300 text-gray-600"
                )}
              >
                <Package className="h-5 w-5" />
                <span className="text-xs font-medium">Mang đi</span>
              </button>
              <button
                onClick={() => setOrderType("delivery")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  orderType === "delivery"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-orange-300 text-gray-600"
                )}
              >
                <Bike className="h-5 w-5" />
                <span className="text-xs font-medium">Giao hàng</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <Input
                placeholder="Tên khách hàng"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />

              {orderType ==="delivery" && (
                <Input
                placeholder="Địa chỉ giao hàng"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
              )}

              {orderType === "dine-in" && (
                <Input
                  placeholder="Số bàn"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                />
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-12 w-12" />
                </div>
                <p className="text-sm font-medium">Chưa có món nào</p>
                <p className="text-xs">Chọn món từ menu bên trái</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromCart(item.id)
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-orange-600 font-bold text-sm mb-3">
                          {item.price.toLocaleString()}đ
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateQuantity(item.id, -1)
                            }}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-orange-400 hover:text-orange-600 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold text-gray-800 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateQuantity(item.id, 1)
                            }}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-orange-400 hover:text-orange-600 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <span className="ml-auto font-bold text-gray-800">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Phương thức thanh toán
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      paymentMethod === "cash"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300 text-gray-600"
                    )}
                  >
                    <Banknote className="h-5 w-5" />
                    <span className="text-xs font-medium">Tiền mặt</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      paymentMethod === "card"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300 text-gray-600"
                    )}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs font-medium">Thẻ</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("e-wallet")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      paymentMethod === "e-wallet"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300 text-gray-600"
                    )}
                  >
                    <Smartphone className="h-5 w-5" />
                    <span className="text-xs font-medium">Ví điện tử</span>
                  </button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>VAT (10%)</span>
                  <span className="font-medium">{tax.toLocaleString()}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span className="font-medium">-{discount.toLocaleString()}đ</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Tổng cộng</span>
                  <span className="text-orange-600">{total.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-base shadow-lg shadow-orange-200"
                >
                  Thanh toán
                </Button>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Hủy đơn
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  )
}
