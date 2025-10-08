"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle,
} from "lucide-react"

import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  roleLabel: string
  className?: string
}

export function Sidebar({
  navItems,
  isCollapsed,
  onToggle,
  roleLabel,
  className,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full border-r bg-background z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 font-semibold",
              isCollapsed && "justify-center"
            )}
          >
            <Shield className="h-6 w-6" />
            {!isCollapsed && <span>{roleLabel}</span>}
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid items-start gap-1 px-3 py-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname.startsWith(item.href) && "bg-muted text-primary",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="mt-auto border-t">
          <div className="p-3 space-y-1">
            <Link href="/profile">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "w-auto justify-center p-2"
                )}
                title={isCollapsed ? "Profile" : undefined}
              >
                <UserCircle className="h-4 w-4" />
                {!isCollapsed && <span className="ml-3">Hồ sơ</span>}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
                isCollapsed && "w-auto justify-center p-2"
              )}
              onClick={logout}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
            </Button>
          </div>
          <div className="flex items-center justify-center p-3 border-t">
            <Button variant="outline" size="icon" onClick={onToggle}>
              {isCollapsed ? (
                <ArrowRightToLine className="h-4 w-4" />
              ) : (
                <ArrowLeftToLine className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
