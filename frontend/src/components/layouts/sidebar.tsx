"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle,
} from "lucide-react"

import { logout, getCurrentUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User } from "@/types"

export interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  items?: NavItem[]
}

interface SidebarProps {
  navItems: NavItem[]
  isCollapsed: boolean
  onToggle: () => void
  className?: string
}

export function Sidebar({
  navItems,
  isCollapsed,
  onToggle,
  className,
}: SidebarProps) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white shadow-sm z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-20 items-center justify-center px-6 border-b border-gray-100">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 justify-center",
              isCollapsed && "justify-center"
            )}
          >
            <Image
              src="/icons/AnEat.svg"
              alt="AnEat Logo"
              width={isCollapsed ? 32 : 32}
              height={isCollapsed ? 32 : 32}
              className="object-contain"
              priority
            />
            {!isCollapsed && (
              <span className="text-xl font-bold text-orange-500">AnEat</span>
            )}
          </Link>
        </div>
        {!isCollapsed && (
          <div className="px-6 py-3 text-xs text-slate-600 font-medium border-b border-gray-100">
            <div className="text-center">
              {currentUser?.role === "ADMIN_SYSTEM"
                ? "ADMIN SYSTEM"
                : `MANAGER - ${currentUser?.branchName || "Branch"}`}
            </div>
          </div>
        )}
        <ScrollArea className="flex-1">
          <nav className="grid items-start gap-1 px-3 py-2 text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-gray-600 transition-all hover:bg-green-50 hover:text-green-600",
                    isActive && "bg-green-100/60 text-green-700 font-medium",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
        <div className="mt-auto border-t border-gray-100">
          {currentUser && !isCollapsed && (
            <div className="p-3 mb-2 bg-slate-50 rounded-lg mx-2">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-600 capitalize">
                {currentUser.role === "ADMIN_SYSTEM" 
                  ? "System Admin"
                  : currentUser.role === "ADMIN_BRAND"
                  ? "Brand Admin"
                  : currentUser.role === "STAFF"
                  ? "Staff"
                  : "Customer"}
              </p>
            </div>
          )}
          <div className="p-3 space-y-1">
            <Link href="/profile">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-600 hover:bg-green-50 hover:text-green-600",
                  isCollapsed && "w-auto justify-center p-2"
                )}
                title={isCollapsed ? "Profile" : undefined}
              >
                <UserCircle className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3">Hồ sơ</span>}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-gray-600 hover:bg-red-50 hover:text-red-600",
                isCollapsed && "w-auto justify-center p-2"
              )}
              onClick={logout}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
