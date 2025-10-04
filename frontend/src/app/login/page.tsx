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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mock login - Replace with real API call
    setTimeout(() => {
      let role: UserRole = "CUSTOMER"

      // Demo accounts
      if (email === "admin@system.com") role = "ADMIN_SYSTEM"
      else if (email === "manager@branch.com") role = "ADMIN_BRAND"
      else if (email === "staff@branch.com") role = "STAFF"

      const user: User = {
        id: "1",
        name: email.split("@")[0],
        email,
        phone: "0123456789",
        role,
        branchId: role !== "ADMIN_SYSTEM" ? "branch-1" : undefined,
      }

      setCurrentUser(user)
      router.push(ROLE_ROUTES[role])
      setLoading(false)
    }, 1000)
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">Demo Accounts:</p>
              <ul className="space-y-1 text-xs">
                <li>• System Admin: admin@system.com</li>
                <li>• Branch Manager: manager@branch.com</li>
                <li>• Staff: staff@branch.com</li>
                <li>• Customer: any other email</li>
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
