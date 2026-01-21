"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CalendarIcon, Check, Search } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { InventoryItemDTO } from "@/services/staff-warehouse.service"

interface StockRequest {
  id?: string
  productId: string
  type: "RESTOCK" | "ADJUSTMENT" | "RETURN"
  requestedQuantity: number
  expectedDate?: Date
  notes?: string
}

interface WarehouseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: StockRequest) => void
  products: InventoryItemDTO[]
  selectedProduct?: InventoryItemDTO | null
  mode?: "request"
}

export function WarehouseFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  products,
  selectedProduct,
  mode = "request" 
}: WarehouseFormModalProps) {
  const [formData, setFormData] = useState<StockRequest>({
    productId: "",
    type: "RESTOCK",
    requestedQuantity: 1,
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        productId: selectedProduct.id,
        type: "RESTOCK",
        requestedQuantity: 1,
        notes: "",
      })
    } else {
      setFormData({
        productId: "",
        type: "RESTOCK",
        requestedQuantity: 1,
        notes: "",
      })
    }
    setErrors({})
  }, [selectedProduct, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.productId) {
      newErrors.productId = "Vui lòng chọn sản phẩm"
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

  // Find info of product being requested
  const productInfo = selectedProduct || products?.find(p => p.id === formData.productId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tạo yêu cầu nhập kho</DialogTitle>
        </DialogHeader>

        {productInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-100">
            <div className="flex items-center gap-3">
              {productInfo.image && (
                <img
                  src={productInfo.image}
                  alt={productInfo.name}
                  className="w-16 h-16 rounded object-cover border border-gray-200"
                />
              )}
              <div>
                <div className="font-medium text-blue-600">{productInfo.name}</div>
                <div className="text-sm text-gray-500">
                  Mã sản phẩm: <span className="font-mono">{productInfo.code}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Tồn kho hiện tại: <strong className={productInfo.quantity < 10 ? "text-red-500" : "text-gray-700"}>{productInfo.quantity}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!selectedProduct && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn sản phẩm <span className="text-red-600">*</span>
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      errors.productId && "border-red-500"
                    )}
                  >
                    {formData.productId
                      ? products?.find(p => p.id === formData.productId)?.name + " - " + 
                        products?.find(p => p.id === formData.productId)?.code + 
                        " (Tồn: " + products?.find(p => p.id === formData.productId)?.quantity + ")"
                      : "Chọn sản phẩm cần nhập kho"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
                  <Command>
                    <CommandInput placeholder="Tìm kiếm sản phẩm..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                      <CommandGroup>
                        {products?.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name + " " + p.code}
                            onSelect={() => {
                              handleChange("productId", p.id)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.productId === p.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {p.name} - {p.code} (Tồn: {p.quantity})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.productId && <p className="text-xs text-red-600 mt-1">{errors.productId}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                onChange={(e) => {
                  const value = e.target.value === "" ? 1 : parseInt(e.target.value);
                  handleChange("requestedQuantity", isNaN(value) ? 1 : value);
                }}
                placeholder="1"
                type="number"
                min="1"
                className={errors.requestedQuantity ? "border-red-500" : ""}
              />
              {errors.requestedQuantity && <p className="text-xs text-red-600 mt-1">{errors.requestedQuantity}</p>}
            </div>
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
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 !text-white">
              Tạo yêu cầu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
