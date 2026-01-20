"use client"

import { useState, useEffect } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Phone,
  MapPin,
  Package,
  DollarSign,
  User,
  Loader2,
  AlertTriangle,
  ChevronRight,
  CreditCard
} from "lucide-react"
import staffOrderTrackingService, { TrackingOrder, OrderItem } from "@/services/staff-order-tracking.service"
import { toast } from "sonner"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function StaffOrderTrackingPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing'>('pending')
  const [pendingOrders, setPendingOrders] = useState<TrackingOrder[]>([])
  const [preparingOrders, setPreparingOrders] = useState<TrackingOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isBillDetailOpen, setIsBillDetailOpen] = useState(false)
  const [completedBill, setCompletedBill] = useState<any>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [orderToUpdatePayment, setOrderToUpdatePayment] = useState<string | null>(null)

  // Edit modal states
  const [editItems, setEditItems] = useState<Array<{ productId: string; quantity: number }>>([])
  const [editReason, setEditReason] = useState("")

  // Cancel modal states
  const [cancelReason, setCancelReason] = useState("")

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const [pendingRes, preparingRes] = await Promise.all([
        staffOrderTrackingService.getPendingOrders(1, 50),
        staffOrderTrackingService.getPreparingOrders(1, 50),
      ])

      if (pendingRes.success) {
        setPendingOrders(pendingRes.data)
      }

      if (preparingRes.success) {
        setPreparingOrders(preparingRes.data)
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng')
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  // View order details
  const handleViewOrder = (order: TrackingOrder) => {
    setSelectedOrder(order)
    setIsViewModalOpen(true)
  }

  // Accept order
  const handleAcceptOrder = async (orderId: string) => {
    try {
      setIsProcessing(true)
      const response = await staffOrderTrackingService.acceptOrder(orderId)
      
      if (response.success) {
        toast.success('Đã chấp nhận đơn hàng!')
        await fetchOrders()
        setIsViewModalOpen(false)
        setActiveTab('preparing')
      }
    } catch (err: any) {
      console.error('Error accepting order:', err)
      toast.error(err.response?.data?.message || 'Không thể chấp nhận đơn hàng')
    } finally {
      setIsProcessing(false)
    }
  }

  // Complete order - use existing payment method
  const handleCompleteOrder = async (orderId: string) => {
    // Find the order to get payment method
    const order = preparingOrders.find(o => o.id === orderId)
    
    // Check if payment method exists and is not null/empty
    if (!order || !order.paymentMethod || order.paymentMethod === null) {
      // Show modal to update payment method
      setOrderToUpdatePayment(orderId)
      setSelectedPaymentMethod('')
      setIsPaymentModalOpen(true)
      return
    }

    try {
      setIsProcessing(true)
      const response = await staffOrderTrackingService.completeOrder(orderId, order.paymentMethod)
      
      if (response.success) {
        toast.success('Đơn hàng đã hoàn thành!')
        setCompletedBill(response.data.bill)
        await fetchOrders()
        setIsViewModalOpen(false)
        setIsBillDetailOpen(true)
      }
    } catch (err: any) {
      console.error('Error completing order:', err)
      toast.error(err.response?.data?.message || 'Không thể hoàn thành đơn hàng')
    } finally {
      setIsProcessing(false)
    }
  }

  // Update payment method and complete order
  const handleUpdatePaymentAndComplete = async () => {
    if (!orderToUpdatePayment || !selectedPaymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán')
      return
    }

    try {
      setIsProcessing(true)
      
      // Update payment method first
      await staffOrderTrackingService.updatePaymentMethod(orderToUpdatePayment, selectedPaymentMethod)
      
      // Then complete the order
      const response = await staffOrderTrackingService.completeOrder(orderToUpdatePayment, selectedPaymentMethod)
      
      if (response.success) {
        toast.success('Đơn hàng đã hoàn thành!')
        setCompletedBill(response.data.bill)
        await fetchOrders()
        setIsViewModalOpen(false)
        setIsPaymentModalOpen(false)
        setIsBillDetailOpen(true)
      }
    } catch (err: any) {
      console.error('Error updating payment and completing order:', err)
      toast.error(err.response?.data?.message || 'Không thể hoàn thành đơn hàng')
    } finally {
      setIsProcessing(false)
    }
  }

  // Open edit modal
  const handleOpenEditModal = (order: TrackingOrder) => {
    setSelectedOrder(order)
    setEditItems(
      order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    )
    setEditReason("")
    setIsEditModalOpen(true)
    setIsViewModalOpen(false)
  }

  // Update edit item quantity
  const handleUpdateEditQuantity = (productId: string, delta: number) => {
    setEditItems(prev =>
      prev
        .map(item =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
    )
  }

  // Remove item from edit
  const handleRemoveEditItem = (productId: string) => {
    setEditItems(prev => prev.filter(item => item.productId !== productId))
  }

  // Submit edit
  const handleSubmitEdit = async () => {
    if (!selectedOrder) return

    if (editItems.length === 0) {
      toast.error('Đơn hàng phải có ít nhất 1 sản phẩm')
      return
    }

    if (!editReason.trim()) {
      toast.error('Vui lòng nhập lý do chỉnh sửa')
      return
    }

    try {
      setIsProcessing(true)
      const response = await staffOrderTrackingService.editOrderItems(selectedOrder.id, {
        items: editItems,
        reason: editReason,
      })

      if (response.success) {
        toast.success('Đã cập nhật đơn hàng!')
        await fetchOrders()
        setIsEditModalOpen(false)
        setSelectedOrder(null)
      }
    } catch (err: any) {
      console.error('Error editing order:', err)
      toast.error(err.response?.data?.message || 'Không thể cập nhật đơn hàng')
    } finally {
      setIsProcessing(false)
    }
  }

  // Open cancel modal
  const handleOpenCancelModal = (order: TrackingOrder) => {
    setSelectedOrder(order)
    setCancelReason("")
    setIsCancelModalOpen(true)
    setIsViewModalOpen(false)
  }

  // Submit cancel
  const handleSubmitCancel = async () => {
    if (!selectedOrder) return

    if (!cancelReason.trim() || cancelReason.trim().length < 10) {
      toast.error('Lý do hủy phải có ít nhất 10 ký tự')
      return
    }

    try {
      setIsProcessing(true)
      const response = await staffOrderTrackingService.cancelOrder(selectedOrder.id, {
        reason: cancelReason,
      })

      if (response.success) {
        toast.success('Đã hủy đơn hàng!')
        await fetchOrders()
        setIsCancelModalOpen(false)
        setSelectedOrder(null)
      }
    } catch (err: any) {
      console.error('Error cancelling order:', err)
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng')
    } finally {
      setIsProcessing(false)
    }
  }

  // Render order card
  const renderOrderCard = (order: TrackingOrder, orderStatus: 'pending' | 'preparing') => {
    const orderTypeLabels = {
      DINE_IN: 'Tại bàn',
      TAKEAWAY: 'Mang về',
      DELIVERY: 'Giao hàng',
    }

    return (
      <Card
        key={order.id}
        className="hover:shadow-md transition-shadow cursor-pointer flex flex-col"
        onClick={() => handleViewOrder(order)}
      >
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <CardTitle className="text-base font-bold truncate">{order.orderNumber}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex-shrink-0">
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </span>
              <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                {orderTypeLabels[order.orderType]}
              </Badge>
            </div>
            {order.customer && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{order.customer.name}</span>
                <span className="text-gray-400 flex-shrink-0">•</span>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="flex-shrink-0">{order.customer.phone}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1">
          {/* Items - Fixed height container */}
          <div className="mb-3">
            <div className="space-y-2">
              {[0, 1].map(index => {
                const item = order.items[index]
                return (
                  <div key={index} className="flex items-center gap-2 text-sm h-10">
                    {item ? (
                      <>
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <span className="flex-1 truncate">{item.name}</span>
                        <span className="text-gray-600">x{item.quantity}</span>
                      </>
                    ) : (
                      <div className="w-full h-10"></div>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Always render this line to maintain consistent height */}
            <div className="text-xs text-gray-500 pl-12 h-5 mt-2">
              {order.items.length > 2 && (
                <>+{order.items.length - 2} sản phẩm khác</>
              )}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Bottom section - always at same position */}
          <div className="mt-auto">
            {/* Total */}
            <div className="flex items-center justify-between py-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Tổng cộng</span>
              <span className="text-lg font-bold text-orange-600">
                {order.total.toLocaleString('vi-VN')}₫
              </span>
            </div>

            {/* Delivery address */}
            {order.orderType === 'DELIVERY' && order.deliveryAddress && (
              <div className="flex items-start gap-2 text-xs text-gray-600 mb-3 p-2 bg-blue-50 rounded">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{order.deliveryAddress}</span>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="text-xs text-gray-600 mb-3 p-2 bg-yellow-50 rounded">
                <strong>Ghi chú:</strong> {order.notes}
              </div>
            )}

            {/* Actions */}
            {orderStatus === 'pending' && (
              <div className="flex flex-nowrap gap-2 mt-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAcceptOrder(order.id)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 min-w-0 text-sm"
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Chấp nhận</span>
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenEditModal(order)
                  }}
                  variant="outline"
                  className="w-10 h-10 p-0 flex-shrink-0"
                  disabled={isProcessing}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenCancelModal(order)
                  }}
                  variant="destructive"
                  className="w-10 h-10 p-0 flex-shrink-0"
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
            {orderStatus === 'preparing' && (
              <div className="flex flex-nowrap gap-2 mt-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCompleteOrder(order.id)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 min-w-0 text-sm !text-white"
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Hoàn thành</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <StaffLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        <StaffHeader />

        <div className="flex-1 overflow-hidden">
          <div className="container mx-auto p-6 h-full">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Theo dõi đơn hàng</h1>
              <p className="text-sm text-gray-500">
                Quản lý đơn hàng từ khách hàng và đơn tại cửa hàng
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'preparing')} className="h-[calc(100%-100px)]">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                <TabsTrigger value="pending" className="relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Chờ xác nhận
                  {pendingOrders.length > 0 && (
                    <Badge className="ml-2 bg-red-500">{pendingOrders.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="preparing">
                  <Clock className="h-4 w-4 mr-2" />
                  Đang chuẩn bị
                  {preparingOrders.length > 0 && (
                    <Badge className="ml-2 bg-orange-500">{preparingOrders.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchOrders} variant="outline" className="mt-2">
                    Thử lại
                  </Button>
                </div>
              )}

              {/* Pending orders tab */}
              {!loading && !error && (
                <TabsContent value="pending" className="h-full overflow-y-auto">
                  {pendingOrders.length === 0 ? (
                    <div className="text-center py-16">
                      <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Không có đơn hàng chờ xác nhận</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                      {pendingOrders.map(order => renderOrderCard(order, 'pending'))}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* Preparing orders tab */}
              {!loading && !error && (
                <TabsContent value="preparing" className="h-full overflow-y-auto">
                  {preparingOrders.length === 0 ? (
                    <div className="text-center py-16">
                      <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Không có đơn hàng đang chuẩn bị</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                      {preparingOrders.map(order => renderOrderCard(order, 'preparing'))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Mã đơn hàng</Label>
                  <p className="font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Loại đơn</Label>
                  <p className="font-semibold">
                    {selectedOrder.orderType === 'DINE_IN' && 'Tại bàn'}
                    {selectedOrder.orderType === 'TAKEAWAY' && 'Mang về'}
                    {selectedOrder.orderType === 'DELIVERY' && 'Giao hàng'}
                  </p>
                </div>
              </div>

              {/* Customer */}
              {selectedOrder.customer && (
                <div>
                  <Label className="text-xs text-gray-500">Khách hàng</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    <span>{selectedOrder.customer.name}</span>
                    <span className="text-gray-400">•</span>
                    <Phone className="h-4 w-4" />
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                </div>
              )}

              {/* Delivery address */}
              {selectedOrder.orderType === 'DELIVERY' && selectedOrder.deliveryAddress && (
                <div>
                  <Label className="text-xs text-gray-500">Địa chỉ giao hàng</Label>
                  <div className="flex items-start gap-2 mt-1 p-2 bg-blue-50 rounded">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="text-sm">{selectedOrder.deliveryAddress}</span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Items */}
              <div>
                <Label className="text-xs text-gray-500">Sản phẩm</Label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.price.toLocaleString('vi-VN')}₫ x {item.quantity}
                        </p>
                        {!item.isAvailable && (
                          <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Không khả dụng</span>
                          </div>
                        )}
                        {item.isAvailable && item.stockQuantity < item.quantity && (
                          <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Chỉ còn {item.stockQuantity} sản phẩm</span>
                          </div>
                        )}
                      </div>
                      <p className="font-semibold">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span>{selectedOrder.subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Giảm giá</span>
                    <span>-{selectedOrder.discountAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-orange-600">
                    {selectedOrder.total.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                
                {/* Payment Method */}
                {selectedOrder.paymentMethod && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center pt-2 bg-gray-50 p-3 rounded-lg mt-2">
                      <span className="text-sm font-medium text-gray-700">Phương thức thanh toán</span>
                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                          selectedOrder.paymentMethod === 'CASH' && "bg-green-100 text-green-700",
                          selectedOrder.paymentMethod === 'CARD' && "bg-blue-100 text-blue-700",
                          selectedOrder.paymentMethod === 'BANK_TRANSFER' && "bg-red-100 text-red-700",
                          selectedOrder.paymentMethod === 'E_WALLET' && "bg-purple-100 text-purple-700"
                        )}
                      >
                        {selectedOrder.paymentMethod === 'CASH' && 'Tiền mặt'}
                        {selectedOrder.paymentMethod === 'CARD' && 'Thẻ'}
                        {selectedOrder.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản'}
                        {selectedOrder.paymentMethod === 'E_WALLET' && 'Ví điện tử'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <Label className="text-xs text-gray-500">Ghi chú</Label>
                  <div className="p-2 bg-yellow-50 rounded text-sm mt-1">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedOrder.status === 'PENDING' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleAcceptOrder(selectedOrder.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Chấp nhận đơn
                  </Button>
                  <Button
                    onClick={() => handleOpenEditModal(selectedOrder)}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    onClick={() => handleOpenCancelModal(selectedOrder)}
                    variant="destructive"
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[100vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đơn hàng</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-">
              <div className="text-sm text-gray-600">
                Đơn hàng: <strong>{selectedOrder.orderNumber}</strong>
              </div>

              {/* Items */}
              <div className="mb-5">
                <Label>Sản phẩm</Label>
                <div className="space-y-3 mt-2">
                  {editItems.map((editItem, index) => {
                    const item = selectedOrder.items.find(i => i.productId === editItem.productId)
                    if (!item) return null

                    return (
                      <div key={`edit-item-${index}-${item.productId}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-16 h-16 bg-white rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 mb-1">{item.name}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            Đơn giá: {item.price.toLocaleString('vi-VN')}₫
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUpdateEditQuantity(item.productId, -1)
                              }}
                              disabled={editItem.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="w-12 text-center font-semibold text-sm bg-white px-2 py-1 rounded border">
                              {editItem.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUpdateEditQuantity(item.productId, 1)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              +
                            </Button>
                            <div className="flex-1"></div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveEditItem(item.productId)
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Xóa</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label htmlFor="edit-reason" className="mb-5">
                  Lý do chỉnh sửa <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="edit-reason"
                  placeholder="Ví dụ: Hết hàng sản phẩm X, thay thế bằng sản phẩm Y..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  rows={3}
                  className="mb-5"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 !text-white"
                  onClick={handleSubmitEdit}
                  disabled={isProcessing || editItems.length === 0 || !editReason.trim()}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hủy đơn hàng</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Bạn có chắc muốn hủy đơn hàng <strong>{selectedOrder.orderNumber}</strong>?
              </div>

              <div>
                <Label htmlFor="cancel-reason">
                  Lý do hủy <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Ví dụ: Khách hàng hủy, không đủ nguyên liệu, đã gọi xác nhận với khách..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Tối thiểu 10 ký tự</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Số lượng sản phẩm sẽ được hoàn lại kho
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isProcessing}
                >
                  Quay lại
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSubmitCancel}
                  disabled={isProcessing || !cancelReason.trim() || cancelReason.trim().length < 10}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Xác nhận hủy
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Method Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Vui lòng chọn phương thức thanh toán để hoàn thành đơn hàng
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPaymentMethod('CASH')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors",
                  selectedPaymentMethod === 'CASH'
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Tiền mặt</span>
              </button>

              <button
                onClick={() => setSelectedPaymentMethod('CARD')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors",
                  selectedPaymentMethod === 'CARD'
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Thẻ</span>
              </button>

              <button
                onClick={() => setSelectedPaymentMethod('E_WALLET')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors",
                  selectedPaymentMethod === 'E_WALLET'
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Ví điện tử</span>
              </button>

              <button
                onClick={() => setSelectedPaymentMethod('BANK_TRANSFER')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors",
                  selectedPaymentMethod === 'BANK_TRANSFER'
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Chuyển khoản</span>
              </button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 !text-white"
              onClick={handleUpdatePaymentAndComplete}
              disabled={isProcessing || !selectedPaymentMethod}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Detail Modal */}
      <Dialog open={isBillDetailOpen} onOpenChange={setIsBillDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-orange-500" />
              Chi Tiết Hóa Đơn
            </DialogTitle>
          </DialogHeader>
          
          {completedBill && (
            <div className="space-y-4">
              {/* Bill Number */}
              <div className="bg-gray-50 rounded-lg p-4">
                <Label className="text-xs text-gray-500">Mã hóa đơn</Label>
                <p className="text-lg font-bold text-gray-900">{completedBill.billNumber}</p>
                <Badge variant="outline" className="mt-2">Đã phát hành</Badge>
              </div>

              {/* Customer Info */}
              {(completedBill.customerName || completedBill.customerPhone) && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông Tin Khách Hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Tên khách hàng</Label>
                      <p className="text-sm font-medium">{completedBill.customerName || 'Khách vãng lai'}</p>
                    </div>
                    {completedBill.customerPhone && (
                      <div>
                        <Label className="text-xs text-gray-500">Số điện thoại</Label>
                        <p className="text-sm font-medium">{completedBill.customerPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Chi Tiết Đơn Hàng
                </h3>
                {completedBill.items && completedBill.items.length > 0 ? (
                  <div className="space-y-2">
                    {completedBill.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                        {item.productImage && (
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.price.toLocaleString()}₫ x {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {item.total.toLocaleString()}₫
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có sản phẩm</p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Thông Tin Thanh Toán
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{completedBill.subtotal.toLocaleString()}₫</span>
                  </div>
                  {completedBill.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá</span>
                      <span className="font-medium text-orange-600">-{completedBill.discountAmount.toLocaleString()}₫</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (8%)</span>
                    <span className="font-medium">{completedBill.taxAmount.toLocaleString()}₫</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between pt-2">
                    <span className="text-base font-bold">Tổng cộng</span>
                    <span className="text-lg font-bold text-orange-600">{completedBill.total.toLocaleString()}₫</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Phương thức thanh toán</span>
                    {completedBill.paymentMethod ? (
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                        completedBill.paymentMethod === 'CASH' && 'bg-green-100 text-green-700',
                        completedBill.paymentMethod === 'CARD' && 'bg-blue-100 text-blue-700',
                        completedBill.paymentMethod === 'E_WALLET' && 'bg-purple-100 text-purple-700',
                        completedBill.paymentMethod === 'BANK_TRANSFER' && 'bg-red-100 text-red-700'
                      )}>
                        {completedBill.paymentMethod === 'CASH' && 'Tiền mặt'}
                        {completedBill.paymentMethod === 'CARD' && 'Thẻ'}
                        {completedBill.paymentMethod === 'E_WALLET' && 'Ví điện tử'}
                        {completedBill.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Chưa thanh toán</span>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  className="bg-orange-500 hover:bg-orange-600 !text-white w-full"
                  onClick={() => setIsBillDetailOpen(false)}
                >
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StaffLayout>
  )
}
