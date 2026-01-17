"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { User, Mail, Phone, Lock } from "lucide-react"
import apiClient from "@/lib/api-client"
import { setCurrentUser } from "@/lib/auth"
import { ROLE_ROUTES } from "@/constants/roles"
import type { User as UserType, UserRole } from "@/types"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    // Clear error when user types
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")
    
    try {
      // Call registration API
      const response = await apiClient.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      if (response.data.status === "success" && response.data.data) {
        const { user, token } = response.data.data

        // Save token to localStorage
        localStorage.setItem("token", token)

        // Save user info
        const userInfo: UserType = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role as UserRole,
          branchId: user.branchId,
          branchName: user.branchName,
          avatar: user.avatar,
        }
        setCurrentUser(userInfo)

        // For CUSTOMER role, customer record is created automatically
        // Redirect to home page for customer
        router.push(ROLE_ROUTES[user.role as UserRole] || "/")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="flex items-center justify-center py-12 px-4 min-h-screen">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left side - Brand */}
          <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-8">
            <div className="text-center">
              <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop" 
                  alt="Satisfy Your Cravings" 
                  className="w-64 h-64 object-cover"
                />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Satisfy Your Cravings</h1>
              <p className="text-lg text-slate-600">The best fast food delivered hot to your doorstep.</p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-orange-500 mb-2">Tạo tài khoản</h2>
                <p className="text-slate-500">Tham gia AnEat ngay hôm nay và bắt đầu đặt hàng</p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-6 mb-8">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-semibold">
                    Tên đầy đủ
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tên của bạn"
                      value={formData.name}
                      onChange={handleChange}
                      className={`pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400 ${errors.name ? "ring-2 ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">
                    Địa chỉ Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400 ${errors.email ? "ring-2 ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-semibold">
                    Số điện thoại
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0901 234 567"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400 ${errors.phone ? "ring-2 ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-semibold">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Tạo mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400 ${errors.password ? "ring-2 ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400 ${errors.confirmPassword ? "ring-2 ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {/* Register Button */}
                <Button 
                  type="submit" 
                  className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? "ĐANG TẠO TÀI KHOẢN..." : "ĐĂNG KÝ"}
                </Button>
              </form>

              {/* Register Link */}
              <div className="text-center text-slate-600">
                Đã có tài khoản?{" "}
                <Link href="/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Đăng nhập ở đây
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </PublicLayout>
  )
}
