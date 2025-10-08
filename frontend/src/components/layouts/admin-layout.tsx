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
} from "lucide-react"
import { Sidebar, NavItem } from "./sidebar"
import { useState } from "react"

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/stores", icon: Store, label: "Stores" },
  { href: "/admin/products", icon: ShoppingBag, label: "Products" },
  { href: "/admin/promotions", icon: Ticket, label: "Promotions" },
  { href: "/admin/invoices", icon: FileText, label: "Invoices" },
  { href: "/admin/templates", icon: FileCode, label: "Templates" },
  { href: "/admin/analytics", icon: BarChart, label: "Analytics" },
  { href: "/admin/logs", icon: FileClock, label: "Logs" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen w-full">
      <Sidebar
        navItems={adminNavItems}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        roleLabel="Admin Panel"
      />
      <main
        className={`transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  )
}
