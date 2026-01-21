import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Phone,
  MapPin,
  Package,
  AlertTriangle,
  CheckCircle2,
  Edit,
  XCircle,
  Loader2
} from "lucide-react"
import { TrackingOrder } from "@/services/staff-order-tracking.service"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ViewOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: TrackingOrder | null
  isProcessing: boolean
  onAcceptOrder: (orderId: string) => void
  onOpenEditModal: (order: TrackingOrder) => void
  onOpenCancelModal: (order: TrackingOrder) => void
}

export function ViewOrderModal({
  open,
  onOpenChange,
  order,
  isProcessing,
  onAcceptOrder,
  onOpenEditModal,
  onOpenCancelModal
}: ViewOrderModalProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Mã đơn hàng</Label>
              <p className="font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Loại đơn</Label>
              <p className="font-semibold">
                {order.orderType === 'DINE_IN' && 'Tại bàn'}
                {order.orderType === 'TAKEAWAY' && 'Mang về'}
                {order.orderType === 'DELIVERY' && 'Giao hàng'}
              </p>
            </div>
          </div>

          {/* Customer */}
          {order.customer && (
            <div>
              <Label className="text-xs text-gray-500">Khách hàng</Label>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                <span>{order.customer.name}</span>
                <span className="text-gray-400">•</span>
                <Phone className="h-4 w-4" />
                <span>{order.customer.phone}</span>
              </div>
            </div>
          )}

          {/* Delivery address */}
          {order.orderType === 'DELIVERY' && order.deliveryAddress && (
            <div>
              <Label className="text-xs text-gray-500">Địa chỉ giao hàng</Label>
              <div className="flex items-start gap-2 mt-1 p-2 bg-blue-50 rounded">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span className="text-sm">{order.deliveryAddress}</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Items */}
          <div>
            <Label className="text-xs text-gray-500">Sản phẩm</Label>
            <div className="space-y-2 mt-2">
              {order.items.map(item => (
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
              <span>{order.subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Giảm giá</span>
                <span>-{order.discountAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-orange-600">
                {order.total.toLocaleString('vi-VN')}₫
              </span>
            </div>
            
            {/* Payment Method */}
            {order.paymentMethod && (
              <>
                <Separator />
                <div className="flex justify-between items-center pt-2 bg-gray-50 p-3 rounded-lg mt-2">
                  <span className="text-sm font-medium text-gray-700">Phương thức thanh toán</span>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                      order.paymentMethod === 'CASH' && "bg-green-100 text-green-700",
                      order.paymentMethod === 'CARD' && "bg-blue-100 text-blue-700",
                      order.paymentMethod === 'BANK_TRANSFER' && "bg-red-100 text-red-700",
                      order.paymentMethod === 'E_WALLET' && "bg-purple-100 text-purple-700"
                    )}
                  >
                    {order.paymentMethod === 'CASH' && 'Tiền mặt'}
                    {order.paymentMethod === 'CARD' && 'Thẻ'}
                    {order.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản'}
                    {order.paymentMethod === 'E_WALLET' && 'Ví điện tử'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <Label className="text-xs text-gray-500">Ghi chú</Label>
              <div className="p-2 bg-yellow-50 rounded text-sm mt-1">
                {order.notes}
              </div>
            </div>
          )}

          {/* Actions */}
          {order.status === 'PENDING' && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onAcceptOrder(order.id)}
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
                onClick={() => onOpenEditModal(order)}
                variant="outline"
                disabled={isProcessing}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                onClick={() => onOpenCancelModal(order)}
                variant="destructive"
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
