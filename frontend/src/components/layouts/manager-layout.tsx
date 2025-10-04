"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Users, FileText, LogOut, UserCircle } from "lucide-react"
import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function ManagerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/manager/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/manager/products", icon: Package, label: "Products" },
    { href: "/manager/staff", icon: Users, label: "Staff" },
    { href: "/manager/reports", icon: FileText, label: "Reports" },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/manager/dashboard" className="font-bold text-xl">
            FastFood Manager
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isActive && "bg-primary/10")}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t space-y-1">
          <Link href="/profile">
            <Button variant="ghost" className="w-full justify-start">
              <UserCircle className="h-4 w-4 mr-3" />
              Profile
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="border-b bg-card h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">Store #1</h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
