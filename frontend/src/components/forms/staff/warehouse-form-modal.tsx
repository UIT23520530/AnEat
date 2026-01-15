"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface StockRequest {
  id?: string
  productName: string
  type: "RESTOCK" | "ADJUSTMENT" | "RETURN"
  requestedQuantity: number
  expectedDate?: Date
  notes?: string
}

interface WarehouseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: StockRequest) => void
  productName?: string
  currentStock?: number
  mode?: "request"
}

export function WarehouseFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  productName,
  currentStock,
  mode = "request" 
}: WarehouseFormModalProps) {
  const [formData, setFormData] = useState<StockRequest>({
    productName: "",
    type: "RESTOCK",
    requestedQuantity: 0,
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (productName) {
      setFormData((prev) => ({ ...prev, productName }))
    } else {
      setFormData({
        productName: "",
        type: "RESTOCK",
        requestedQuantity: 0,
        notes: "",
      })
    }
    setErrors({})
  }, [productName, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.productName.trim()) {
      newErrors.productName = "Vui lòng nhập tên sản phẩm"
    }

    if (!formData.type) {
      newErrors.type = "Vui lòng chọn loại yêu cầu"
    }

    if (formData.requestedQuantity <= 0) {
      newErrors.requestedQuantity = "Số lượng phải lớn hơn 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      onClose()
    }
  }

  const handleChange = (field: keyof StockRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tạo Yêu Cầu Nhập Kho</DialogTitle>
        </DialogHeader>

        {productName && currentStock !== undefined && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{productName}</p>
              <p className="text-gray-600 mt-1">
                Tồn kho hiện tại: <strong>{currentStock}</strong>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!productName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-600">*</span>
              </label>
              <Input
                value={formData.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                placeholder="Nhập tên sản phẩm"
                className={errors.productName ? "border-red-500" : ""}
              />
              {errors.productName && <p className="text-xs text-red-600 mt-1">{errors.productName}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại yêu cầu <span className="text-red-600">*</span>
            </label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Chọn loại yêu cầu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESTOCK">Nhập hàng</SelectItem>
                <SelectItem value="ADJUSTMENT">Điều chỉnh</SelectItem>
                <SelectItem value="RETURN">Trả hàng</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng yêu cầu <span className="text-red-600">*</span>
            </label>
            <Input
              value={formData.requestedQuantity}
              onChange={(e) => handleChange("requestedQuantity", parseInt(e.target.value) || 0)}
              placeholder="0"
              type="number"
              min="1"
              className={errors.requestedQuantity ? "border-red-500" : ""}
            />
            {errors.requestedQuantity && <p className="text-xs text-red-600 mt-1">{errors.requestedQuantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến nhận hàng</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expectedDate ? (
                    format(formData.expectedDate, "PPP", { locale: vi })
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expectedDate}
                  onSelect={(date) => handleChange("expectedDate", date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Ghi chú thêm về yêu cầu này..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              Tạo yêu cầu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
