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
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-sm mb-2">Test Accounts:</p>
              <ul className="space-y-1 text-xs">
                <li>• Manager: manager1@aneat.com / password123</li>
                <li>• Staff: staff001@aneat.com / staff123</li>
              </ul>
            </div>

            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
