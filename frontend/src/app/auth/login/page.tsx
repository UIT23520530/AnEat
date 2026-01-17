"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setCurrentUser } from "@/lib/auth"
import { ROLE_ROUTES } from "@/constants/roles"
import type { User, UserRole } from "@/types"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Call real API
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      })

      if (response.data.status === "success" && response.data.data) {
        const { user, token, customer } = response.data.data

        // Save token to localStorage
        localStorage.setItem("token", token)

        // Save user info
        const userInfo: User = {
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

        // Save customer info if available (for CUSTOMER role)
        if (customer && user.role === "CUSTOMER") {
          localStorage.setItem("customerInfo", JSON.stringify(customer))
        }

        // Redirect based on role
        router.push(ROLE_ROUTES[user.role as UserRole])
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again."
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
              <div className="mb-8">
                <img 
                  src="/icons/AnEat.svg" 
                  alt="Thỏa mãn cơn thèm của bạn" 
                  className="w-96 h-96"
                />
              </div>
              {/* <h1 className="text-4xl font-bold text-slate-900 mb-4">Đa dạng về menu</h1> */}
              {/* <p className="text-lg text-slate-600">AnEat hân hạnh phục vụ quý khách</p> */}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-orange-500 mb-2">AnEat xin chào!</h2>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6 mb-8">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">
                    Tên đăng nhập hoặc Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-semibold">
                      Mật khẩu
                    </Label>
                    <Link href="/auth/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu của bạn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-12 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-slate-500 text-sm">hoặc đăng nhập bằng</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                <Button 
                  type="button"
                  variant="outline"
                  className="py-6 border-2 border-slate-200 hover:border-slate-300 rounded-lg font-semibold text-slate-700"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                {/* <Button 
                  type="button"
                  variant="outline"
                  className="py-6 border-2 border-slate-200 hover:border-slate-300 rounded-lg font-semibold text-slate-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button> */}
              </div>

              {/* Register Link */}
              <div className="text-center text-slate-600">
                Chưa có tài khoản?{" "}
                <Link href="/auth/register" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Tạo tài khoản AnEat của bạn!
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
