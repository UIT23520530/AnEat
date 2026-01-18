"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { staffCustomerService, CustomerDTO } from "@/services/staff-customer.service"

interface CreateCustomerFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCustomerCreated: (customer: CustomerDTO) => void
  initialPhone?: string
}

export function CreateCustomerForm({
  isOpen,
  onOpenChange,
  onCustomerCreated,
  initialPhone = ""
}: CreateCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    phone: initialPhone,
    name: "",
    email: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (!formData.phone || !formData.name) {
      setError("Vui lòng nhập số điện thoại và tên khách hàng")
      return
    }

    if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      setError("Số điện thoại phải có 10-11 chữ số")
      return
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email không hợp lệ")
      return
    }

    try {
      setIsLoading(true)
      const response = await staffCustomerService.create({
        phone: formData.phone,
        name: formData.name,
        email: formData.email || undefined
      })

      if (response.success) {
        onCustomerCreated(response.data)
        onOpenChange(false)
        // Reset form
        setFormData({ phone: "", name: "", email: "" })
      } else {
        setError(response.message || "Không thể tạo khách hàng")
      }
    } catch (err: any) {
      console.error("Create customer error:", err)
      setError(err?.response?.data?.message || "Không thể tạo khách hàng")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null)
      setFormData({ phone: initialPhone, name: "", email: "" })
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tạo Khách Hàng Mới</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
            <Input
              id="phone"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              maxLength={11}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="Nhập họ và tên"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (tuỳ chọn)</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                "Tạo khách hàng"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
