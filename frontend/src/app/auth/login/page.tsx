"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setCurrentUser } from "@/lib/auth"
import { ROLE_ROUTES } from "@/constants/roles"
import type { User, UserRole } from "@/types"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { Mail, Lock, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
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
        }
        setCurrentUser(userInfo)

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Chào mừng trở lại!</h1>
            <p className="text-gray-600">Đăng nhập để tiếp tục đặt món ngon</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-semibold">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <span className="font-semibold">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Đăng nhập</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Test Accounts */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="font-semibold text-sm mb-2 text-orange-800">Tài khoản thử nghiệm:</p>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>• Manager: manager1@aneat.com / password123</li>
                  <li>• Staff: staff001@aneat.com / staff123</li>
                </ul>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Chưa có tài khoản?{" "}
                  <Link href="/auth/register" className="text-orange-500 font-semibold hover:text-orange-600 hover:underline transition-colors">
                    Đăng ký ngay
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
