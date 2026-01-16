import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NoteModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (value: string) => void
  onSave: () => void
}

export function NoteModal({
  isOpen,
  onOpenChange,
  value,
  onChange,
  onSave,
}: NoteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Thêm Ghi Chú</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ghi chú đơn hàng
            </label>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nhập ghi chú cho đơn hàng..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px] resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                onSave()
                onOpenChange(false)
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Lưu ghi chú
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
