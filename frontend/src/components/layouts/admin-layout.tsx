"use client"

import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Ticket,
  FileText,
  Settings,
  FileCode,
  BarChart,
  Bell,
  MessageSquare,
  Gift,
  Search,
  FolderOpen,
  UserCheck,
  Warehouse,
} from "lucide-react"
import { Sidebar, NavItem } from "./sidebar"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AntdProvider } from "@/components/providers/AntdProvider"
import 'antd/dist/reset.css'
import '@/styles/antd-custom.css'
import { categories } from "@/lib/menu-data"

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/admin/branches", icon: Store, label: "Quản lý chi nhánh" },
  { href: "/admin/users", icon: Users, label: "Quản lý người dùng" },
  { href: "/admin/customers", icon: UserCheck, label: "Quản lý khách hàng" },
  { href: "/admin/categories", icon: FolderOpen, label: "Quản lý danh mục" },
  { href: "/admin/products", icon: ShoppingBag, label: "Quản lý sản phẩm" },
  { href: "/admin/promotions", icon: Ticket, label: "Quản lý khuyến mãi" },
  { href: "/admin/warehouse", icon: Box, label: "Quản lý kho hàng"},
  { href: "/admin/invoices", icon: FileText, label: "Quản lý hóa đơn" },
  { href: "/admin/templates", icon: FileCode, label: "Quản lý mẫu" },
  { href: "/admin/warehouses", icon: Warehouse, label: "Quản lý kho hàng" },
  { href: "/admin/settings", icon: Settings, label: "Cài đặt chung" },
]

export function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <Sidebar
        navItems={adminNavItems}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-20">
          <div className="flex items-end pb-1 justify-start h-full px-8">
            {title && (
              <h1 className="text-3xl font-black text-slate-900" style={{ fontWeight: 700 }}>{title}</h1>
            )}
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)]">
          <AntdProvider>
            {children}
          </AntdProvider>
        </main>
      </div>
    </div>
  )
}
