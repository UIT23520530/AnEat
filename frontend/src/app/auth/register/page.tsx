"use client"

import type React from "react"

import { useState } from "react"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { User, Phone, Mail, Lock, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
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

    try {
      // Mock registration - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Đăng ký thành công!",
        description: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
        className: "bg-green-50 border-green-200",
      })

      // Redirect to login after 1 second
      setTimeout(() => {
        router.push("/auth/login")
      }, 1000)
    } catch (error) {
      toast({
        title: "Đăng ký thất bại",
        description: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h1>
            <p className="text-gray-600">Đăng ký để bắt đầu đặt món ngon</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-semibold">
                    Họ và tên
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Nhập họ và tên của bạn"
                      value={formData.name}
                      onChange={handleChange}
                      className={`pl-10 h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-semibold">
                    Số điện thoại
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0123456789"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pl-10 h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-semibold">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-10 h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>Đăng ký</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Đã có tài khoản?{" "}
                  <Link href="/auth/login" className="text-orange-500 font-semibold hover:text-orange-600 hover:underline transition-colors">
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  )
}
