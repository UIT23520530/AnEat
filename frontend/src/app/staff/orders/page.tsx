"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ShoppingCart, FileText, Ticket, X, DollarSign, Wallet, CreditCard, Users, UserPlus, Loader2, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import staffOrderService, { OrderCategory, OrderProduct, ProductOption } from "@/services/staff-order.service"
import { staffCustomerService, CustomerDTO } from "@/services/staff-customer.service"
import { NoteModal } from "@/components/forms/staff/note-modal"
import { CreateCustomerForm } from "@/components/forms/staff/create-customer-form"
import { ProductOptionsModal } from "@/components/forms/staff/product-options-modal"
import { createMoMoPayment, createMoMoPosPayment } from "@/services/payment.service"
import { toast } from "sonner"

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  options?: string
  image?: string | null
}

export default function StaffOrdersPage() {
  const router = useRouter()
  
  // Data states
  const [categories, setCategories] = useState<OrderCategory[]>([])
  const [products, setProducts] = useState<OrderProduct[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Order states
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY" | "DELIVERY">("TAKEAWAY")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "E_WALLET" | "CARD">("CASH")
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderNote, setOrderNote] = useState("")
  
  // Customer states
  const [customerSearch, setCustomerSearch] = useState("")
  const [customers, setCustomers] = useState<CustomerDTO[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false)
  
  // Product options
  const [selectedProduct, setSelectedProduct] = useState<OrderProduct | null>(null)
  const [isProductOptionsOpen, setIsProductOptionsOpen] = useState(false)
  
  // Discount states
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [discountInfo, setDiscountInfo] = useState<{
    code: string
    type: string
    value: number
  } | null>(null)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState<string | null>(null)
  
  // UI states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [barcode, setBarcode] = useState("")

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

  const handleCustomerCreated = (customer: CustomerDTO) => {
    setSelectedCustomer(customer)
    setIsCreateCustomerOpen(false)
    setIsCustomerDialogOpen(false)
    toast.success("Tạo khách hàng thành công!")
  }

  const filteredProducts = (products || []).filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category?.id === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleProductClick = (product: OrderProduct) => {
    // If product has options, show the modal
    if (product.options && product.options.length > 0) {
      setSelectedProduct(product)
      setIsProductOptionsOpen(true)
    } else {
      // Add directly to cart
      addToCart({
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.promotionPrice || product.price,
        quantity: 1,
        image: product.image
      })
    }
  }

  const handleAddToCartWithOptions = (
    product: OrderProduct,
    quantity: number,
    selectedOptions: ProductOption[],
    notes: string
  ) => {
    let totalPrice = product.promotionPrice || product.price
    const optionNames: string[] = []

    selectedOptions.forEach(opt => {
      totalPrice += opt.price
      optionNames.push(opt.name)
    })

    const optionsStr = optionNames.length > 0 
      ? optionNames.join(", ") + (notes ? ` - ${notes}` : "")
      : notes || undefined

    addToCart({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: totalPrice,
      quantity,
      options: optionsStr,
      image: product.image
    })
  }

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item])
    
    // Generate order number if this is the first item
    if (cart.length === 0 && !orderNumber) {
      const now = new Date()
      const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '')
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      setOrderNumber(`ORD-${dateStr}-${randomNum}`)
    }
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
  const vat = Math.round((subtotal - discount) * 0.08)
  const total = subtotal - discount + vat

  // Display values (convert from cents to VND)
  const displaySubtotal = subtotal / 100
  const displayDiscount = discount / 100
  const displayVat = vat / 100
  const displayTotal = total / 100

  const handleCancelOrder = () => {
    if (confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      setCart([])
      setSelectedCustomer(null)
      setOrderNote("")
      setDiscountCode("")
      setAppliedDiscount(0)
      setDiscountInfo(null)
      setOrderNumber(null)
    }
  }

  // Validate discount from database
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Vui lòng nhập mã giảm giá")
      return
    }

    try {
      setIsValidatingDiscount(true)
      setDiscountError(null)

      const response = await staffOrderService.validatePromotion(discountCode.trim().toUpperCase(), subtotal)

      if (response.success && response.data) {
        setAppliedDiscount(response.data.discountAmount)
        setDiscountInfo({
          code: response.data.code,
          type: response.data.type,
          value: response.data.value
        })
        setIsDiscountModalOpen(false)
        toast.success(`Áp dụng mã ${response.data.code} thành công!`)
      } else {
        setDiscountError(response.message || "Mã giảm giá không hợp lệ")
      }
    } catch (err: any) {
      console.error('Validate discount error:', err)
      setDiscountError(err?.response?.data?.message || "Không thể kiểm tra mã giảm giá")
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    setDiscountCode("")
    setAppliedDiscount(0)
    setDiscountInfo(null)
  }

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống!")
      return
    }

    try {
      setIsLoading(true)

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          options: item.options
        })),
        customerId: selectedCustomer?.id,
        promotionCode: discountInfo?.code,
        paymentMethod: paymentMethod === "E_WALLET" ? "E_WALLET" as const : paymentMethod === "CARD" ? "CARD" as const : "CASH" as const,
        notes: orderNote || undefined,
        orderType: orderType
      }

      // Create order in database
      const orderResponse = await staffOrderService.createOrder(orderData)

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Không thể tạo đơn hàng")
      }

      const createdOrder = orderResponse.data

      // Handle payment based on method
      if (paymentMethod === "E_WALLET") {
        // MoMo payment
        const data = await createMoMoPayment({
          amount: total,
          orderInfo: `Thanh toán đơn hàng ${createdOrder.orderNumber} tại AnEat`,
        })

        if (data?.data?.payUrl) {
          // Update payment status will be handled by MoMo callback
          window.location.href = data.data.payUrl
          return
        } else {
          // Update payment status to FAILED
          await staffOrderService.updatePaymentStatus(createdOrder.id, "FAILED")
          throw new Error("Không lấy được link thanh toán MoMo!")
        }
      } else if (paymentMethod === "CARD") {
        // MoMo POS payment
        if (!barcode) {
          toast.error("Vui lòng quét mã thanh toán (barcode)!")
          setIsLoading(false)
          return
        }

        const data = await createMoMoPosPayment({
          amount: total,
          orderInfo: `Thanh toán đơn hàng ${createdOrder.orderNumber} tại AnEat (POS)`,
          paymentCode: barcode.trim(),
        })

        if (data?.data?.payUrl) {
          window.location.href = data.data.payUrl
          return
        } else {
          await staffOrderService.updatePaymentStatus(createdOrder.id, "FAILED")
          throw new Error("Không lấy được link thanh toán MoMo POS!")
        }
      } else {
        // Cash payment - already marked as PAID in createOrder
        toast.success(`Tạo đơn hàng ${createdOrder.orderNumber} thành công!`)
        
        // Reset form
        setCart([])
        setSelectedCustomer(null)
        setOrderNote("")
        setDiscountCode("")
        setAppliedDiscount(0)
        setDiscountInfo(null)
        setOrderNumber(null)
        setBarcode("")

        // Redirect to staff success page
        router.push(`/staff/checkout/success?orderId=${createdOrder.id}&orderNumber=${createdOrder.orderNumber}&total=${total}`)
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      toast.error(error.message || "Có lỗi khi tạo đơn hàng!")
      
      // Redirect to failure page
      router.push(`/staff/checkout/failure?orderNumber=${orderNumber}&total=${total}&message=${encodeURIComponent(error.message || "Có lỗi xảy ra")}`)
    } finally {
      setIsLoading(false)
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
                      className="cursor-pointer hover:shadow-lg transition-shadow border-gray-200 overflow-hidden"
                      onClick={() => handleProductClick(item)}
                    >
                      <div className="aspect-square bg-gray-100 relative">
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="h-12 w-12" />
                          </div>
                        )}
                        {/* Promotion badge */}
                        {item.promotionPrice && item.promotionPrice < item.price && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{Math.round((1 - item.promotionPrice / item.price) * 100)}%
                          </div>
                        )}
                        {/* Out of stock badge */}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold">Hết hàng</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-gray-900 mb-1 truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description || 'Không có mô tả'}</p>
                        <div className="flex items-center gap-2">
                          {item.promotionPrice && item.promotionPrice < item.price ? (
                            <>
                              <span className="text-orange-600 font-bold">{(item.promotionPrice / 100).toLocaleString()}₫</span>
                              <span className="text-gray-400 line-through text-sm">{(item.price / 100).toLocaleString()}₫</span>
                            </>
                          ) : (
                            <span className="text-orange-600 font-bold">{(item.price / 100).toLocaleString()}₫</span>
                          )}
                        </div>
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
              <h2 className="text-base font-bold text-gray-900">
                {orderNumber || "Đơn mới"}
              </h2>
              {orderNumber && (
                <span className="text-xs text-gray-500">{new Date().toLocaleDateString("vi-VN")}</span>
              )}
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
                  onClick={() => setOrderType("DINE_IN")}
                  className={cn(
                    "py-1.5 rounded-md text-xs font-medium transition-all",
                    orderType === "DINE_IN"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Tại bàn
                </button>
                <button
                  onClick={() => setOrderType("TAKEAWAY")}
                  className={cn(
                    "py-1.5 rounded-md text-xs font-medium transition-all",
                    orderType === "TAKEAWAY"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Mang về
                </button>
                <button
                  onClick={() => setOrderType("DELIVERY")}
                  className={cn(
                    "py-1.5 rounded-md text-xs font-medium transition-all",
                    orderType === "DELIVERY"
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
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ShoppingCart className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                        {item.options && (
                          <p className="text-xs text-gray-500 truncate">{item.options}</p>
                        )}
                        <p className="text-sm text-orange-600 font-semibold">{(item.price / 100).toLocaleString()}₫</p>
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
                <button 
                  onClick={() => setIsNoteModalOpen(true)} 
                  className="flex flex-col items-center gap-0.5 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-[10px] text-gray-600">Ghi chú</span>
                  {orderNote && <Check className="h-3 w-3 text-green-500" />}
                </button>
                <button 
                  onClick={() => setIsDiscountModalOpen(true)} 
                  className="flex flex-col items-center gap-0.5 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Ticket className="h-4 w-4 text-gray-600" />
                  <span className="text-[10px] text-gray-600">Mã giảm</span>
                  {discountInfo && <Check className="h-3 w-3 text-green-500" />}
                </button>
                <button 
                  onClick={handleCancelOrder} 
                  className="flex flex-col items-center gap-0.5 py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-[10px] text-red-600">Hủy đơn</span>
                </button>
              </div>

              {/* Summary */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{displaySubtotal.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Giảm giá 
                    {discountInfo && (
                      <span className="text-xs text-orange-600 ml-1">({discountInfo.code})</span>
                    )}
                  </span>
                  <span className="font-medium text-orange-600">-{displayDiscount.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (8%)</span>
                  <span className="font-medium">{displayVat.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-orange-600">{displayTotal.toLocaleString()}₫</span>
                </div>
              </div>

              {/* Payment Method */}
              <p className="text-xs font-medium text-gray-700 mb-2">Phương thức thanh toán</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button 
                  onClick={() => setPaymentMethod("CASH")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors", 
                    paymentMethod === "CASH" 
                      ? "bg-orange-500 hover:bg-orange-600 text-white" 
                      : "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700"
                  )}
                >
                  <DollarSign className="h-4 w-4" />
                  Tiền mặt
                </button>
                <button 
                  onClick={() => setPaymentMethod("E_WALLET")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors", 
                    paymentMethod === "E_WALLET" 
                      ? "bg-orange-500 hover:bg-orange-600 text-white" 
                      : "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700"
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  Momo
                </button>
                <button 
                  onClick={() => setPaymentMethod("CARD")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors", 
                    paymentMethod === "CARD" 
                      ? "bg-orange-500 hover:bg-orange-600 text-white" 
                      : "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700"
                  )}
                >
                  <Wallet className="h-4 w-4" />
                  Momo QR
                </button>
              </div>

              {/* Barcode Input for MoMo POS */}
              {paymentMethod === "CARD" && (
                <div className="mb-3">
                  <Input
                    placeholder="Nhập thanh toán barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="h-9 text-xs border-gray-300"
                  />
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handlePayment}
                disabled={cart.length === 0 || isLoading}
                className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                THANH TOÁN NGAY →
              </Button>
            </div>
          </div>

          {/* Note Modal */}
          <NoteModal
            isOpen={isNoteModalOpen}
            onOpenChange={setIsNoteModalOpen}
            value={orderNote}
            onChange={setOrderNote}
            onSave={() => setIsNoteModalOpen(false)}
          />

          {/* Discount Modal */}
          <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Mã Giảm Giá</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {discountInfo ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-700">{discountInfo.code}</span>
                      </div>
                      <button 
                        onClick={handleRemoveDiscount}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Giảm {discountInfo.type === 'PERCENTAGE' 
                        ? `${discountInfo.value}%` 
                        : `${discountInfo.value.toLocaleString()}₫`
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Input
                        placeholder="Nhập mã giảm giá"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase())
                          setDiscountError(null)
                        }}
                        className="uppercase"
                      />
                      {discountError && (
                        <div className="flex items-center gap-2 mt-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{discountError}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={handleApplyDiscount}
                      disabled={isValidatingDiscount || !discountCode.trim()}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {isValidatingDiscount ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Đang kiểm tra...
                        </>
                      ) : (
                        "Áp dụng"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

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
                <button 
                  onClick={() => {
                    setIsCreateCustomerOpen(true)
                  }}
                  className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Tạo khách hàng mới</span>
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Customer Form */}
          <CreateCustomerForm
            isOpen={isCreateCustomerOpen}
            onOpenChange={setIsCreateCustomerOpen}
            onCustomerCreated={handleCustomerCreated}
            initialPhone={customerSearch}
          />

          {/* Product Options Modal */}
          <ProductOptionsModal
            isOpen={isProductOptionsOpen}
            onOpenChange={setIsProductOptionsOpen}
            product={selectedProduct}
            onAddToCart={handleAddToCartWithOptions}
          />
        </div>
      </div>
    </StaffLayout>
  )
}
