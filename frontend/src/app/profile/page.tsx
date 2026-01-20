"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser, setCurrentUser } from "@/lib/auth"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { ManagerLayout } from "@/components/layouts/manager-layout"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { PublicLayout } from "@/components/layouts/public-layout"
import { User, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react"
import type { User as UserType } from "@/types"
import apiClient from "@/lib/api-client"

// Constraints cho các trường
const CONSTRAINTS = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
    message: "Họ tên từ 2-50 ký tự, chỉ chứa chữ cái và khoảng trắng",
  },
  phone: {
    pattern: /^[0-9]{10}$/,
    message: "Số điện thoại phải có đúng 10 số",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 100,
    message: "Email không hợp lệ",
  },
  address: {
    maxLength: 200,
    message: "Địa chỉ tối đa 200 ký tự",
  },
}

const getTierName = (tier?: string) => {
  switch (tier) {
    case "BRONZE": return "Thành viên Mới";
    case "SILVER": return "Thành viên Bạc";
    case "GOLD": return "Thành viên Vàng";
    case "VIP": return "Thành viên VIP";
    default: return "Thành viên Mới";
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Validate một trường
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Họ tên không được để trống"
        if (value.length < CONSTRAINTS.name.minLength) return `Họ tên tối thiểu ${CONSTRAINTS.name.minLength} ký tự`
        if (value.length > CONSTRAINTS.name.maxLength) return `Họ tên tối đa ${CONSTRAINTS.name.maxLength} ký tự`
        if (!CONSTRAINTS.name.pattern.test(value)) return CONSTRAINTS.name.message
        return ""
      case "phone":
        if (!value.trim()) return "Số điện thoại không được để trống"
        if (!CONSTRAINTS.phone.pattern.test(value)) return CONSTRAINTS.phone.message
        return ""
      case "email":
        if (!value.trim()) return "Email không được để trống"
        if (value.length > CONSTRAINTS.email.maxLength) return `Email tối đa ${CONSTRAINTS.email.maxLength} ký tự`
        if (!CONSTRAINTS.email.pattern.test(value)) return CONSTRAINTS.email.message
        return ""
      case "address":
        if (value.length > CONSTRAINTS.address.maxLength) return CONSTRAINTS.address.message
        return ""
      default:
        return ""
    }
  }

  // Validate toàn bộ form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    newErrors.name = validateField("name", formData.name)
    newErrors.phone = validateField("phone", formData.phone)
    newErrors.email = validateField("email", formData.email)
    newErrors.address = validateField("address", formData.address)

    // Xóa các error rỗng
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key]
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle thay đổi input với validation
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    
    // Validate ngay khi nhập
    const error = validateField(field, value)
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }))
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        
        // Lấy địa chỉ đã lưu từ localStorage
        const savedAddress = localStorage.getItem("customerDefaultAddress") || ""
        
        // 1. Thử lấy từ local storage trước để hiển thị ngay
        const localUser = getCurrentUser()
        if (localUser) {
          setUser(localUser)
          setFormData({
            name: localUser.name,
            email: localUser.email,
            phone: localUser.phone || "",
            address: savedAddress,
          })
        }

        // 2. Gọi API để lấy thông tin mới nhất
        const response = await apiClient.get<{ status: string; data: { user: UserType } }>("/auth/me")
        
        if (response.data.status === "success" && response.data.data.user) {
          const userData = response.data.data.user
          setUser(userData)
          // Cập nhật lại local storage
          setCurrentUser(userData)
          
          setFormData({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || "",
            address: savedAddress,
          })
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        // Nếu không có local user và API lỗi -> redirect login
        if (!getCurrentUser()) {
          router.push("/auth/login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSave = async () => {
    if (!user) return
    
    // Validate trước khi lưu
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    try {
      // Gọi API cập nhật profile
      const response = await apiClient.put("/customer/profile", {
        name: formData.name,
        address: formData.address,
      })

      if (response.data.status === "success") {
        const updatedUser = {
          ...user,
          name: formData.name,
          address: formData.address,
        }
        setCurrentUser(updatedUser)
        setUser(updatedUser)
        
        // Cũng lưu vào localStorage để checkout sử dụng
        if (formData.address) {
          localStorage.setItem("customerDefaultAddress", formData.address)
        }
        
        // Hiển thị thông báo thành công
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error: any) {
      console.error("Update profile error:", error)
    } finally {
      setSaving(false)
    }
  }

  const getLayout = (children: React.ReactNode) => {
    if (!user) return children

    switch (user.role) {
      case "ADMIN_SYSTEM":
        return <AdminLayout>{children}</AdminLayout>
      case "ADMIN_BRAND":
        return <ManagerLayout>{children}</ManagerLayout>
      case "STAFF":
        return <StaffLayout>{children}</StaffLayout>
      case "CUSTOMER":
        return <PublicLayout>{children}</PublicLayout>
      default:
        return children
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    )
  }

  if (!user) return null

  const content = (
    <div className="flex items-center justify-center py-12 px-4 min-h-screen">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left side - Profile Welcome */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-8">
            <div className="text-center">
              {/* Avatar Circle */}
              <div className="mb-6 w-24 h-24 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avt/avt-profile.jpg" />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Chào mừng, {user.name}!</h2>
              <p className="text-slate-600 mb-6">Cập nhật thông tin cá nhân của bạn để nhận những ưu đãi mới nhất.</p>
              
              {/* Member Status */}
              {user.role === "CUSTOMER" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-orange-500">
                    <span className="text-lg">⭐</span>
                    <span className="font-semibold">{getTierName(user.tier)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <span>📊</span>
                    <span>{(user.points || 0).toLocaleString("vi-VN")} điểm tích lũy</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-orange-500 mb-2">HỒ SƠ CỦA TÔI</h3>
                <p className="text-slate-600">Quản lý tài khoản của bạn</p>
              </div>

              {/* Form */}
              <form className="space-y-6 mb-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-semibold text-sm">
                    HỌ VÀ TÊN <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      maxLength={CONSTRAINTS.name.maxLength}
                      className={`pl-10 py-6 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 ${
                        errors.name ? "border-red-500" : "border-transparent"
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-semibold text-sm">
                    SỐ ĐIỆN THOẠI <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      maxLength={10}
                      className={`pl-10 py-6 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 ${
                        errors.phone ? "border-red-500" : "border-transparent"
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">
                    ĐỊA CHỈ EMAIL <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      maxLength={CONSTRAINTS.email.maxLength}
                      className={`pl-10 py-6 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 ${
                        errors.email ? "border-red-500" : "border-transparent"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-700 font-semibold text-sm">
                    ĐỊA CHỈ GIAO HÀNG MẶC ĐỊNH
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      maxLength={CONSTRAINTS.address.maxLength}
                      placeholder="123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh"
                      className={`pl-10 py-6 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400 ${
                        errors.address ? "border-red-500" : "border-transparent"
                      }`}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                  <p className="text-slate-400 text-xs">{formData.address.length}/{CONSTRAINTS.address.maxLength} ký tự</p>
                </div>
              </form>

              {/* Success Message */}
              {saveSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm font-medium">Lưu thông tin thành công!</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-base disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-6 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold rounded-lg text-base"
                  onClick={() => router.push("/auth/forgot-password")}
                >
                  ĐỔI MẬT KHẨU
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return getLayout(content)
}
