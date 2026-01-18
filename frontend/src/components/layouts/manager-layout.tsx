"use client"

import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Ticket,
  FileText,
  Settings,
  FileCode,
  BarChart,
  ChevronRight,
  Warehouse,
  FolderOpen,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Sidebar, NavItem } from "./sidebar"
import { useState } from "react"
import { AntdProvider } from "@/components/providers/AntdProvider"
import { cn } from "@/lib/utils"
import 'antd/dist/reset.css'
import '@/styles/antd-custom.css'

const managerNavItems: NavItem[] = [
  { href: "/manager/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/manager/staffs", icon: Users, label: "Danh sách nhân viên" },
  { href: "/manager/customers", icon: Users, label: "Quản lý khách hàng" },
  { href: "/manager/categories", icon: FolderOpen, label: "Danh mục sản phẩm" },
  { href: "/manager/products", icon: ShoppingBag, label: "Danh sách sản phẩm" },
  { href: "/manager/warehouse", icon: Warehouse, label: "Quản lý kho hàng" },
  { href: "/manager/promotions", icon: Ticket, label: "Chương trình khuyến mãi" },
  { href: "/manager/invoices", icon: FileText, label: "Quản lý hóa đơn" },
  { href: "/manager/templates", icon: FileCode, label: "Quản lý mẫu in hoá đơn" },
  { href: "/manager/settings", icon: Settings, label: "Thiết lập cửa hàng" },
]

interface BreadcrumbItem {
  label: string
  href?: string
}

export function ManagerLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen w-full bg-slate-50">
          <Sidebar
            navItems={managerNavItems}
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
