"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, List, UtensilsCrossed, LogOut, Users, UserCircle } from "lucide-react"
import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function StaffLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/staff/pos", icon: ShoppingCart, label: "POS" },
    { href: "/staff/orders", icon: List, label: "Orders" },
    { href: "/staff/kitchen", icon: UtensilsCrossed, label: "Kitchen" },
    { href: "/staff/customers", icon: Users, label: "Customers" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-6">
            <Link href="/staff/pos" className="font-bold text-xl">
              FastFood POS
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(isActive && "bg-primary/10")}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <UserCircle className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
