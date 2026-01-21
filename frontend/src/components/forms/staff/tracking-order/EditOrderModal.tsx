import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Package, XCircle, Loader2 } from "lucide-react"
import { TrackingOrder } from "@/services/staff-order-tracking.service"
import Image from "next/image"

interface EditOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: TrackingOrder | null
  editItems: Array<{ productId: string; quantity: number }>
  editReason: string
  isProcessing: boolean
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveItem: (productId: string) => void
  onReasonChange: (reason: string) => void
  onSubmit: () => void
}

export function EditOrderModal({
  open,
  onOpenChange,
  order,
  editItems,
  editReason,
  isProcessing,
  onUpdateQuantity,
  onRemoveItem,
  onReasonChange,
  onSubmit
}: EditOrderModalProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Đơn hàng: <strong>{order.orderNumber}</strong>
          </div>

          {/* Items */}
          <div>
            <Label>Sản phẩm</Label>
            <div className="space-y-3 mt-2">
              {editItems.map((editItem, index) => {
                const item = order.items.find(i => i.productId === editItem.productId)
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
                            onUpdateQuantity(item.productId, -1)
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
                            onUpdateQuantity(item.productId, 1)
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
                            onRemoveItem(item.productId)
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
            <Label htmlFor="edit-reason">
              Lý do chỉnh sửa <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit-reason"
              placeholder="Ví dụ: Hết hàng sản phẩm X, thay thế bằng sản phẩm Y..."
              value={editReason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 !text-white"
              onClick={onSubmit}
              disabled={isProcessing || editItems.length === 0 || !editReason.trim()}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
