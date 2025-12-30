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
          {currentUser && (
            <div className={cn(
              "p-4 mx-3 my-3 bg-gradient-to-br from-orange-50 to-green-50 rounded-xl border border-orange-100",
              isCollapsed && "mx-2 p-2"
            )}>
              {!isCollapsed ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center text-white font-bold shadow-md">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {currentUser.role === "ADMIN_SYSTEM" 
                          ? "Quản trị hệ thống"
                          : currentUser.role === "ADMIN_BRAND"
                          ? "Quản lý chi nhánh"
                          : currentUser.role === "STAFF"
                          ? "Nhân viên"
                          : "Khách hàng"}
                      </p>
                    </div>
                  </div>
                  {currentUser.role === "ADMIN_BRAND" && currentUser.branchName && (
                    <div className="pt-2 border-t border-orange-100">
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <Shield className="w-3.5 h-3.5 text-orange-600" />
                        <span className="font-medium">{currentUser.branchName}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center text-white font-bold shadow-md mx-auto">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          <div className="px-3 pb-3 space-y-1">
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
