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
  ClipboardList,
} from "lucide-react"
import { Sidebar, NavItem } from "./sidebar"
import { useState } from "react"
import { AntdProvider } from "@/components/providers/AntdProvider"
import 'antd/dist/reset.css'
import '@/styles/antd-custom.css'

const managerNavItems: NavItem[] = [
  { href: "/manager/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/manager/analytics", icon: BarChart, label: "Phân tích" },
  { href: "/manager/staff", icon: Users, label: "Nhân viên" },
  { href: "/manager/products", icon: ShoppingBag, label: "Sản phẩm" },
  { href: "/manager/promotions", icon: Ticket, label: "Khuyến mãi" },
  { href: "/manager/invoices", icon: FileText, label: "Hóa đơn" },
  { href: "/manager/templates", icon: FileCode, label: "Mẫu" },
  { href: "/manager/settings", icon: Settings, label: "Cài đặt" },
]

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen w-full">
      <Sidebar
        navItems={managerNavItems}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        roleLabel="Manager Panel"
      />
      <main
        className={`transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <AntdProvider>
          {children}
        </AntdProvider>
      </main>
    </div>
  )
}
