"use client"

import { useState, useEffect } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  User,
  Loader2
} from "lucide-react"
import staffOrderTrackingService, { TrackingOrder } from "@/services/staff-order-tracking.service"
import soundService from "@/services/sound.service"
import { toast } from "sonner"
import Image from "next/image"
import { ViewOrderModal } from "@/components/forms/staff/tracking-order/ViewOrderModal"
import { EditOrderModal } from "@/components/forms/staff/tracking-order/EditOrderModal"
import { CancelOrderModal } from "@/components/forms/staff/tracking-order/CancelOrderModal"
import { PaymentMethodModal } from "@/components/forms/staff/tracking-order/PaymentMethodModal"
import { BillDetailModal } from "@/components/forms/staff/tracking-order/BillDetailModal"

export default function StaffOrderTrackingPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing'>('pending')
  const [pendingOrders, setPendingOrders] = useState<TrackingOrder[]>([])
  const [preparingOrders, setPreparingOrders] = useState<TrackingOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previousPendingCount, setPreviousPendingCount] = useState<number>(0)

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
  const fetchOrders = async (isInitialLoad = false) => {
    try {
      setLoading(isInitialLoad)
      setError(null)

      const [pendingRes, preparingRes] = await Promise.all([
        staffOrderTrackingService.getPendingOrders(1, 50),
        staffOrderTrackingService.getPreparingOrders(1, 50),
      ])

      if (pendingRes.success) {
        const newPendingOrders = pendingRes.data
        
        // Check for new orders and play sound
        if (!isInitialLoad && previousPendingCount > 0 && newPendingOrders.length > previousPendingCount) {
          const newOrdersCount = newPendingOrders.length - previousPendingCount
          soundService.playNotification()
          toast.success(`🔔 Có ${newOrdersCount} đơn hàng mới!`, {
            duration: 5000,
          })
        }
        
        setPendingOrders(newPendingOrders)
        setPreviousPendingCount(newPendingOrders.length)
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
    // Initial load
    fetchOrders(true)
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => fetchOrders(false), 30000)
    
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
                  <Button onClick={() => fetchOrders(true)} variant="outline" className="mt-2">
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

      {/* Modals */}
      <ViewOrderModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        order={selectedOrder}
        isProcessing={isProcessing}
        onAcceptOrder={handleAcceptOrder}
        onOpenEditModal={handleOpenEditModal}
        onOpenCancelModal={handleOpenCancelModal}
      />

      <EditOrderModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        order={selectedOrder}
        editItems={editItems}
        editReason={editReason}
        isProcessing={isProcessing}
        onUpdateQuantity={handleUpdateEditQuantity}
        onRemoveItem={handleRemoveEditItem}
        onReasonChange={setEditReason}
        onSubmit={handleSubmitEdit}
      />

      <CancelOrderModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        order={selectedOrder}
        cancelReason={cancelReason}
        isProcessing={isProcessing}
        onReasonChange={setCancelReason}
        onSubmit={handleSubmitCancel}
      />

      <PaymentMethodModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        selectedPaymentMethod={selectedPaymentMethod}
        isProcessing={isProcessing}
        onSelectPaymentMethod={setSelectedPaymentMethod}
        onSubmit={handleUpdatePaymentAndComplete}
      />

      <BillDetailModal
        open={isBillDetailOpen}
        onOpenChange={setIsBillDetailOpen}
        bill={completedBill}
      />
    </StaffLayout>
  )
}
