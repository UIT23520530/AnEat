import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, XCircle, Loader2 } from "lucide-react"
import { TrackingOrder } from "@/services/staff-order-tracking.service"

interface CancelOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: TrackingOrder | null
  cancelReason: string
  isProcessing: boolean
  onReasonChange: (reason: string) => void
  onSubmit: () => void
}

export function CancelOrderModal({
  open,
  onOpenChange,
  order,
  cancelReason,
  isProcessing,
  onReasonChange,
  onSubmit
}: CancelOrderModalProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hủy đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Bạn có chắc muốn hủy đơn hàng <strong>{order.orderNumber}</strong>?
          </div>

          <div>
            <Label htmlFor="cancel-reason">
              Lý do hủy <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="Ví dụ: Khách hàng hủy, không đủ nguyên liệu, đã gọi xác nhận với khách..."
              value={cancelReason}
              onChange={(e) => onReasonChange(e.target.value)}
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
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Quay lại
            </Button>
            <Button
              variant="destructive"
              onClick={onSubmit}
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
      </DialogContent>
    </Dialog>
  )
}
