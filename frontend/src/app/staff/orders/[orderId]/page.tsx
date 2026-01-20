"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Printer, 
  User, 
  MapPin, 
  Calendar,
  Clock,
  CreditCard,
  Package,
  ShoppingCart,
  FileText,
  Loader2
} from "lucide-react"
import staffOrderService from "@/services/staff-order.service"
import { toast } from "sonner"
import Image from "next/image"

interface OrderItem {
  id: string
  productId: string
  orderId: string
  quantity: number
  price: number
  name: string
  options?: string | null
  product?: {
    id: string
    name: string
    image?: string | null
  }
}

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  orderType?: string
  subtotal: number
  discountAmount: number
  total: number
  notes?: string | null
  deliveryAddress?: string | null
  createdAt: string
  updatedAt: string
  customer?: {
    id: string
    name: string
    phone: string
    email?: string | null
  } | null
  staff?: {
    id: string
    name: string
  }
  branch?: {
    id: string
    name: string
    address: string
  }
  items: OrderItem[]
  promotion?: {
    id: string
    code: string
    type: string
    value: number
  } | null
}

const orderStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  PREPARING: { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-800" },
  READY: { label: "Sẵn sàng", color: "bg-purple-100 text-purple-800" },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
}

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-800" },
}

const paymentMethodMap: Record<string, string> = {
  CASH: "Tiền mặt",
  CARD: "Thẻ",
  BANK_TRANSFER: "Chuyển khoản",
  E_WALLET: "Ví điện tử (MoMo)",
}

const orderTypeMap: Record<string, string> = {
  DINE_IN: "Tại bàn",
  TAKEAWAY: "Mang về",
  DELIVERY: "Giao hàng",
}

export default function StaffOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      loadOrderDetail()
    }
  }, [orderId])

  const loadOrderDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await staffOrderService.getOrderById(orderId)
      
      if (response.success && response.data) {
        setOrder(response.data)
      } else {
        setError("Không tìm thấy đơn hàng")
      }
    } catch (err: any) {
      console.error("Load order detail error:", err)
      setError(err?.response?.data?.message || "Không thể tải thông tin đơn hàng")
      toast.error("Không thể tải thông tin đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    router.push("/staff/orders")
  }

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex flex-col h-screen bg-gray-50">
          <StaffHeader />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </div>
      </StaffLayout>
    )
  }

  if (error || !order) {
    return (
      <StaffLayout>
        <div className="flex flex-col h-screen bg-gray-50">
          <StaffHeader />
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-red-500">{error || "Không tìm thấy đơn hàng"}</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
      </StaffLayout>
    )
  }

  const vat = Math.round((order.subtotal - order.discountAmount) * 0.08)

  return (
    <StaffLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        <StaffHeader />
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleBack} variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
                <p className="text-sm text-gray-500">Mã đơn: {order.orderNumber}</p>
              </div>
            </div>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              In hoá đơn
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Trạng thái đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Trạng thái đơn</p>
                      <Badge className={orderStatusMap[order.status]?.color || "bg-gray-100 text-gray-800"}>
                        {orderStatusMap[order.status]?.label || order.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Trạng thái thanh toán</p>
                      <Badge className={paymentStatusMap[order.paymentStatus]?.color || "bg-gray-100 text-gray-800"}>
                        {paymentStatusMap[order.paymentStatus]?.label || order.paymentStatus}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Phương thức thanh toán</p>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {paymentMethodMap[order.paymentMethod] || order.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Loại đơn</p>
                      <span className="text-sm font-medium">
                        {order.orderType ? orderTypeMap[order.orderType] || order.orderType : "Không xác định"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Danh sách sản phẩm ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.product?.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <ShoppingCart className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          {item.options && (
                            <p className="text-xs text-gray-500 mt-1">{item.options}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">
                              {(item.price || 0).toLocaleString("vi-VN")}₫ × {item.quantity || 0}
                            </span>
                            <span className="font-semibold text-orange-600">
                              {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}₫
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes Card */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Ghi chú
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info Card */}
              {order.customer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Tên khách hàng</p>
                      <p className="font-medium">{order.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{order.customer.phone}</p>
                    </div>
                    {order.customer.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{order.customer.email}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Địa chỉ giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.deliveryAddress}</p>
                  </CardContent>
                </Card>
              )}

              {/* Payment Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Tổng kết thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{(order.subtotal || 0).toLocaleString("vi-VN")}₫</span>
                  </div>
                  
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Giảm giá
                        {order.promotion && (
                          <span className="text-xs text-orange-600 ml-1">({order.promotion.code})</span>
                        )}
                      </span>
                      <span className="font-medium text-orange-600">
                        -{(order.discountAmount || 0).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (8%)</span>
                    <span className="font-medium">{(vat || 0).toLocaleString("vi-VN")}₫</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="font-bold text-lg">Tổng cộng</span>
                    <span className="font-bold text-lg text-orange-600">
                      {(order.total || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Ngày tạo</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Giờ tạo</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleTimeString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  {order.staff && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Nhân viên xử lý</p>
                        <p className="font-medium">{order.staff.name}</p>
                      </div>
                    </div>
                  )}

                  {order.branch && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Chi nhánh</p>
                        <p className="font-medium">{order.branch.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.branch.address}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
