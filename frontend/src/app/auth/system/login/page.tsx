"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { setCurrentUser } from "@/lib/auth"
import { ROLE_ROUTES } from "@/constants/roles"
import type { User, UserRole } from "@/types"
import apiClient from "@/lib/api-client"
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Briefcase, Truck } from "lucide-react"

export default function SystemLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("STAFF")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Call system login API for staff/admin/manager/logistics
      const response = await apiClient.post("/auth/system/login", {
        email,
        password,
        role, // Send role for internal verification
      })

      if (response.data.status === "success" && response.data.data) {
        const { user, token } = response.data.data

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

        // Redirect based on role
        router.push(ROLE_ROUTES[user.role as UserRole])
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Đăng nhập thất bại. Kiểm tra lại thông tin và vai trò."
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
            {/* Left side - Brand (Consistent with auth/login) */}
            <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-8">
              <div className="text-center">
                <div className="mb-8">
                  <img 
                    src="/icons/AnEat.svg" 
                    alt="AnEat System Portal" 
                    className="w-96 h-96"
                  />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">AnEat <span className="text-orange-500">System</span></h1>
                <p className="text-lg text-slate-600">Cổng thông tin nội bộ</p>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="flex flex-col items-center justify-center p-8 md:p-12">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-orange-500 mb-2">Hệ thống AnEat</h2>
                  <p className="text-slate-500 font-medium">Vui lòng đăng nhập để quản lý</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold">
                      Email công việc
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ten@aneat.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
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
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
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
                    {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP HỆ THỐNG"}
                  </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-slate-400 uppercase tracking-widest">
                  &copy; 2026 AnEat Portal &bull; Internal Use Only
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
