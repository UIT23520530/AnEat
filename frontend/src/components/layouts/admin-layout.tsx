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
  FileClock,
  Bell,
  MessageSquare,
  Gift,
  Search,
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
  { href: "/admin/analytics", icon: BarChart, label: "Phân tích" },
  { href: "/admin/stores", icon: Store, label: "Cửa hàng" },
  { href: "/admin/users", icon: Users, label: "Người dùng" },
  { href: "/admin/categories", icon: Users, label: "Danh mục" },
  { href: "/admin/products", icon: ShoppingBag, label: "Sản phẩm" },
  { href: "/admin/promotions", icon: Ticket, label: "Khuyến mãi" },
  { href: "/admin/invoices", icon: FileText, label: "Hoá đơn" },
  { href: "/admin/templates", icon: FileCode, label: "Mẫu" },
  { href: "/admin/logs", icon: FileClock, label: "Log" },
  { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
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
          <div className="flex items-center justify-between h-full px-8">
            <div className="flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
              </div>
            </div>
            
            <div className="flex items-center gap-2">
            {/*
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-cyan-500 border-2 border-white text-[10px]">
                  10
                </Badge>
              </Button>
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-cyan-500 border-2 border-white text-[10px]">
                  8
                </Badge>
              </Button>
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                <Gift className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 border-2 border-white text-[10px]">
                  6
                </Badge>
              </Button>
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                <Settings className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-white text-[10px]">
                  12
                </Badge>
              </Button>
              {/**/}
              
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Hello, Haa Ju</p>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Samantha" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
              </div>
            </div>
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
