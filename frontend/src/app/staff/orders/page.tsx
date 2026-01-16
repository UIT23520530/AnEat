"use client"

import { useState, useEffect } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ShoppingCart, FileText, Ticket, X, Trash2, DollarSign, Wallet, CreditCard, Users, UserPlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import staffOrderService, { OrderCategory, OrderProduct } from "@/services/staff-order.service"
import { staffCustomerService, CustomerDTO } from "@/services/staff-customer.service"
import { NoteModal } from "@/components/forms/staff/note-modal"
import { DiscountCodeModal } from "@/components/forms/staff/discount-code-modal"

interface CartItem extends OrderProduct {
  quantity: number
}

export default function StaffOrdersPage() {
  const [categories, setCategories] = useState<OrderCategory[]>([])
  const [products, setProducts] = useState<OrderProduct[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [orderType, setOrderType] = useState<"dine-in" | "take-away" | "delivery">("take-away")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerSearch, setCustomerSearch] = useState("")
  const [customers, setCustomers] = useState<CustomerDTO[]>([])
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [orderNote, setOrderNote] = useState("")
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load categories and products on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        setError(null)
        const [categoriesRes, productsRes] = await Promise.all([
          staffOrderService.getAllCategories(),
          staffOrderService.getProducts({ limit: 100 })
        ])
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
        setProducts(Array.isArray(productsRes.data?.products) ? productsRes.data.products : [])
      } catch (error) {
        console.error('Load data error:', error)
        setError('Không thể tải dữ liệu. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Search customers when dialog opens or search query changes
  useEffect(() => {
    if (isCustomerDialogOpen && customerSearch) {
      const searchCustomers = async () => {
        try {
          setLoadingCustomers(true)
          const response = await staffCustomerService.getList({
            search: customerSearch,
            limit: 10
          })
          setCustomers(response.data)
        } catch (error) {
          console.error('Search customers error:', error)
        } finally {
          setLoadingCustomers(false)
        }
      }
      const debounce = setTimeout(searchCustomers, 300)
      return () => clearTimeout(debounce)
    }
  }, [customerSearch, isCustomerDialogOpen])

  const handleSelectCustomer = (customer: CustomerDTO) => {
    setSelectedCustomer(customer)
    setIsCustomerDialogOpen(false)
    setCustomerSearch("")
  }

  const filteredProducts = (products || []).filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category?.id === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (item: OrderProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = appliedDiscount
  const vat = subtotal * 0.08
  const total = subtotal - discount + vat

  const handleCancelOrder = () => {
    if (confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      setCart([])
      setSelectedCustomer(null)
      setOrderNote("")
      setDiscountCode("")
      setAppliedDiscount(0)
    }
  }

  const handleApplyDiscount = () => {
    // Simple discount logic - you can customize this
    if (discountCode.toUpperCase() === "DISCOUNT10") {
      setAppliedDiscount(subtotal * 0.1)
      setIsDiscountModalOpen(false)
    } else if (discountCode.toUpperCase() === "DISCOUNT20") {
      setAppliedDiscount(subtotal * 0.2)
      setIsDiscountModalOpen(false)
    } else {
      alert("Mã giảm giá không hợp lệ")
    }
  }

  return (
    <StaffLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        <StaffHeader />
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 pr-[420px]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Thực Hiện Order</h1>
            <p className="text-sm text-gray-500 mt-1">Chọn món ăn cho khách hàng</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-gray-300"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Tải lại trang
              </Button>
            </div>
          ) : (
            <>
              {/* Categories */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "px-6 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                    selectedCategory === "all"
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
                  )}
                >
                  Tất Cả
                </button>
                {categories && categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "px-6 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                      selectedCategory === category.id
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Menu Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts && filteredProducts.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-gray-200"
                    onClick={() => addToCart(item)}
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="h-12 w-12" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{item.description || 'Không có mô tả'}</p>
                      <p className="text-orange-600 font-bold">{item.price.toLocaleString()}₫</p>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar - Order Summary */}
        <div className="w-[420px] min-w-[420px] bg-white border-l border-gray-200 flex flex-col fixed right-0 top-[73px] h-[calc(100vh-73px)] shadow-xl">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Đơn #2023-404</h2>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          {/* Customer Selection Button */}
          <div className="px-4 py-2.5 border-b border-gray-100">
            <button
              onClick={() => setIsCustomerDialogOpen(true)}
              className="w-full h-10 px-3 flex items-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left relative"
            >
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700 font-medium flex-1">
                {selectedCustomer ? selectedCustomer.name : "Nhập thông tin khách hàng"}
              </span>
              {selectedCustomer && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCustomer(null)
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </button>
          </div>

          {/* Order Type Tabs */}
          <div className="px-4 py-2.5 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setOrderType("dine-in")}
                className={cn(
                  "py-1.5 rounded-md text-xs font-medium transition-all",
                  orderType === "dine-in"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Tại bàn
              </button>
              <button
                onClick={() => setOrderType("take-away")}
                className={cn(
                  "py-1.5 rounded-md text-xs font-medium transition-all",
                  orderType === "take-away"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Mang về
              </button>
              <button
                onClick={() => setOrderType("delivery")}
                className={cn(
                  "py-1.5 rounded-md text-xs font-medium transition-all",
                  orderType === "delivery"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Ship
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p className="text-sm">Giỏ hàng trống</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-orange-600 font-semibold">{item.price.toLocaleString()}₫</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions Row */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button onClick={() => setIsNoteModalOpen(true)} className="flex flex-col items-center gap-0.5 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-[10px] text-gray-600">Ghi chú</span>
              </button>
              <button onClick={() => setIsDiscountModalOpen(true)} className="flex flex-col items-center gap-0.5 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Ticket className="h-4 w-4 text-gray-600" />
                <span className="text-[10px] text-gray-600">Mã giảm</span>
              </button>
              <button onClick={handleCancelOrder} className="flex flex-col items-center gap-0.5 py-2 hover:bg-red-50 rounded-lg transition-colors">
                <X className="h-4 w-4 text-red-600" />
                <span className="text-[10px] text-red-600">Hủy đơn</span>
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">{subtotal.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giảm giá</span>
                <span className="font-medium text-orange-600">{discount.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (8%)</span>
                <span className="font-medium">{vat.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Tổng cộng</span>
                <span className="text-orange-600">{total.toLocaleString()}₫</span>
              </div>
            </div>

            {/* Payment Method */}
            <p className="text-xs font-medium text-gray-700 mb-2">Phương thức thanh toán</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button className="flex items-center justify-center gap-1.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors">
                <DollarSign className="h-4 w-4" />
                Tiền mặt
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                <CreditCard className="h-4 w-4" />
                Chuyển khoản
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                <Wallet className="h-4 w-4" />
                Ví điện tử
              </button>
            </div>

            {/* Checkout Button */}
            <Button
              disabled={cart.length === 0}
              className="w-full h-10 bg-gray-400 hover:bg-gray-500 text-white font-bold text-xs disabled:opacity-50"
            >
              THANH TOÁN NGAY →
            </Button>
          </div>
        </div>

        <NoteModal
          isOpen={isNoteModalOpen}
          onOpenChange={setIsNoteModalOpen}
          value={orderNote}
          onChange={setOrderNote}
          onSave={() => {}}
        />

        <DiscountCodeModal
          isOpen={isDiscountModalOpen}
          onOpenChange={setIsDiscountModalOpen}
          code={discountCode}
          onCodeChange={setDiscountCode}
          appliedDiscount={appliedDiscount}
          onApply={handleApplyDiscount}
        />

        {/* Customer Selection Dialog */}
        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Chọn Khách Hàng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm tên hoặc số điện thoại..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Customer List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {loadingCustomers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  </div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        </div>
                        <span className="text-xs font-medium text-orange-600">{customer.points || 0} điểm</span>
                      </div>
                    </button>
                  ))
                ) : customerSearch ? (
                  <p className="text-sm text-gray-500 text-center py-4">Không tìm thấy khách hàng</p>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Nhập tên hoặc số điện thoại để tìm kiếm</p>
                )}
              </div>

              {/* Create New Customer Button */}
              <button className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Tạo khách hàng mới</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </StaffLayout>
  )
}