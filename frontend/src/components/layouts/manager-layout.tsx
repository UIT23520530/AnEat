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
  { href: "/manager/templates", icon: FileCode, label: "Cài đặt mẫu hoá đơn" },
  { href: "/manager/settings", icon: Settings, label: "Thiết lập cửa hàng" },
]

interface BreadcrumbItem {
  label: string
  href?: string
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  "/manager/dashboard": [{ label: "Tổng quan" }],
  "/manager/analytics": [{ label: "Phân tích" }],
  "/manager/staffs": [{ label: "Danh sách nhân viên" }],
  "/manager/categories": [{ label: "Danh mục sản phẩm" }],
  "/manager/warehouse": [{ label: "Quản lý kho hàng" }],
  "/manager/products": [{ label: "Danh sách sản phẩm" }],
  "/manager/promotions": [{ label: "Chương trình khuyến mãi" }],
  "/manager/invoices": [{ label: "Quản lý hóa đơn" }],
  "/manager/templates": [{ label: "Cài đặt mẫu hoá đơn" }],
  "/manager/settings": [{ label: "Cài đặt" }],
}

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const breadcrumbs = breadcrumbMap[pathname] || [{ label: "Quản lý" }]

  return (
    <div className="min-h-screen w-full">
      <Sidebar
        navItems={managerNavItems}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className={`fixed top-0 bg-white border-b border-gray-200 px-6 py-4 h-20 flex items-center z-40 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "left-20 right-0" : "left-64 right-0"
        }`}>
          <div className="flex items-center gap-2">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                <span className={cn(
                  "text-base font-medium",
                  index === breadcrumbs.length - 1 
                    ? "text-orange-600" 
                    : "text-gray-600"
                )}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-20">
          <AntdProvider>
            {children}
          </AntdProvider>
        </div>
      </main>
    </div>
  )
}
