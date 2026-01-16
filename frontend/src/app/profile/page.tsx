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
import { User, Mail, Phone, MapPin, Save } from "lucide-react"
import type { User as UserType } from "@/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    // Mock data for preview - remove after testing
    const mockUser: UserType = {
      id: "1",
      name: "Nguyễn Văn An",
      email: "an.nguyen@example.com",
      phone: "0901 234 567",
      role: "CUSTOMER",
      branchId: "",
      branchName: "",
    }
    
    setUser(mockUser)
    setFormData({
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
      address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    })

    // Uncomment below for real authentication
    // const currentUser = getCurrentUser()
    // if (!currentUser) {
    //   router.push("/login")
    //   return
    // }
    // setUser(currentUser)
    // setFormData({
    //   name: currentUser.name,
    //   email: currentUser.email,
    //   phone: currentUser.phone,
    //   address: "",
    // })
  }, [router])

  const handleSave = () => {
    if (user) {
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }
      setCurrentUser(updatedUser)
      setUser(updatedUser)
      alert("Cập nhật thông tin thành công!")
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

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
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Chào mừng, {user.name}!</h2>
              <p className="text-slate-600 mb-6">Cập nhật thông tin cá nhân của bạn để nhận những ưu đãi mới nhất.</p>
              
              {/* Member Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-orange-500">
                  <span className="text-lg">⭐</span>
                  <span className="font-semibold">Thành viên hạng Vàng</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <span>📊</span>
                  <span>2,450 điểm tích lũy</span>
                </div>
              </div>
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
                    HỌ VÀ TÊN
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-semibold text-sm">
                    SỐ ĐIỆN THOẠI
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">
                    ĐỊA CHỈ EMAIL
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900"
                    />
                  </div>
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
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh"
                      className="pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </form>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 py-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-base"
                >
                  <Save className="h-4 w-4 mr-2" />
                  LƯU THAY ĐỔI
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-6 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold rounded-lg text-base"
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
