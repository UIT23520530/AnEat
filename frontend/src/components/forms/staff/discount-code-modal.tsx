import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DiscountCodeModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  code: string
  onCodeChange: (code: string) => void
  appliedDiscount: number
  onApply: () => void
}

export function DiscountCodeModal({
  isOpen,
  onOpenChange,
  code,
  onCodeChange,
  appliedDiscount,
  onApply,
}: DiscountCodeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nhập Mã Giảm Giá</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Mã giảm giá
            </label>
            <Input
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="Nhập mã giảm giá..."
              className="uppercase"
            />
            <p className="text-xs text-gray-500 mt-2">
              Mã mẫu: DISCOUNT10 (giảm 10%), DISCOUNT20 (giảm 20%)
            </p>
          </div>
          {appliedDiscount > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                Đã áp dụng giảm giá: {appliedDiscount.toLocaleString()}₫
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onOpenChange(false)
                onCodeChange("")
              }}
              variant="outline"
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={onApply}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!code}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
