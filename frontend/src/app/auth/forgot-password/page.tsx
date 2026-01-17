"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Vì backend chưa có endpoint này, chúng ta giả lập thành công sau 1.5s
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch (err: any) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
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
                    src="https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400&h=400&fit=crop" 
                    alt="Khôi phục tài khoản" 
                    className="w-64 h-64 object-cover"
                  />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Lấy lại mật khẩu</h1>
                <p className="text-lg text-slate-600">Đừng lo lắng, chúng tôi sẽ hỗ trợ bạn khôi phục quyền truy cập vào AnEat.</p>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-md">
                {!submitted ? (
                  <>
                    {/* Header */}
                    <div className="mb-8">
                      <Link 
                        href="/auth/login" 
                        className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium mb-6 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại đăng nhập
                      </Link>
                      <h2 className="text-4xl font-bold text-orange-500 mb-2">Quên mật khẩu?</h2>
                      <p className="text-slate-500">Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleForgotPassword} className="space-y-6 mb-8">
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
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 py-6 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                          {error}
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg shadow-orange-200"
                        disabled={loading}
                      >
                        {loading ? "ĐANG TIẾN HÀNH..." : "GỬI YÊU CẦU"}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Kiểm tra Email của bạn</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                      Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến <span className="font-semibold text-slate-900">{email}</span>. Vui lòng kiểm tra hộp thư đến (và cả thư rác).
                    </p>
                    <Button 
                      asChild
                      className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-colors"
                    >
                      <Link href="/auth/login">QUAY LẠI ĐĂNG NHẬP</Link>
                    </Button>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-slate-500 hover:text-orange-500 font-medium transition-colors"
                    >
                      Tôi chưa nhận được email? Gửi lại
                    </button>
                  </div>
                )}

                {/* Footer Link */}
                <div className="text-center text-slate-600 mt-8">
                  Bạn gặp vấn đề?{" "}
                  <Link href="/contact" className="text-orange-500 hover:text-orange-600 font-semibold">
                    Liên hệ hỗ trợ
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
