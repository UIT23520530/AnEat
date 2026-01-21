import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DollarSign, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPaymentMethod: string
  isProcessing: boolean
  onSelectPaymentMethod: (method: string) => void
  onSubmit: () => void
}

export function PaymentMethodModal({
  open,
  onOpenChange,
  selectedPaymentMethod,
  isProcessing,
  onSelectPaymentMethod,
  onSubmit
}: PaymentMethodModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onClick={() => onSelectPaymentMethod('CASH')}
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
              onClick={() => onSelectPaymentMethod('CARD')}
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
              onClick={() => onSelectPaymentMethod('E_WALLET')}
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
              onClick={() => onSelectPaymentMethod('BANK_TRANSFER')}
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
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 !text-white"
            onClick={onSubmit}
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
  )
}
