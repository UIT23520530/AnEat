"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Customer {
  id?: string
  name: string
  phone: string
  email: string | null
  points?: number
}

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (customer: { name: string; phone: string; email: string; points?: number }) => void
  customer?: Customer | null
}

export function CustomerFormModal({ isOpen, onClose, onSubmit, customer }: CustomerFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    points: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        points: customer.points || 0,
      })
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        points: 0,
      })
    }
    setErrors({})
  }, [customer, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên khách hàng"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (10 chữ số)"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (formData.points < 0) {
      newErrors.points = "Điểm tích lũy không được âm"
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

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {customer ? "Cập Nhật Khách Hàng" : "Thêm Khách Hàng Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên khách hàng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên khách hàng <span className="text-red-600">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nhập tên khách hàng"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại <span className="text-red-600">*</span>
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="0901234567"
              maxLength={10}
              disabled={!!customer}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            {customer && <p className="text-xs text-gray-500 mt-1">Không thể thay đổi số điện thoại</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="example@email.com"
              type="email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Điểm tích lũy - Editable for staff */}
          {customer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tích lũy</label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => {
                  const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                  handleChange("points", isNaN(value) ? 0 : value);
                }}
                placeholder="0"
                min="0"
                className={errors.points ? "border-red-500" : ""}
              />
              {errors.points && <p className="text-xs text-red-600 mt-1">{errors.points}</p>}
            </div>
          )}

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
            <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-500 !text-white">
              {customer ? "Cập Nhật" : "Thêm Mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
