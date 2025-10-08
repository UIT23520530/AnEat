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

const managerNavItems: NavItem[] = [
  { href: "/manager/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/manager/staff", icon: Users, label: "Staff" },
  { href: "/manager/products", icon: ShoppingBag, label: "Products" },
  { href: "/manager/promotions", icon: Ticket, label: "Promotions" },
  { href: "/manager/invoices", icon: FileText, label: "Invoices" },
  { href: "/manager/templates", icon: FileCode, label: "Templates" },
  { href: "/manager/analytics", icon: BarChart, label: "Analytics" },
  { href: "/manager/tables", icon: ClipboardList, label: "Tables" },
  { href: "/manager/settings", icon: Settings, label: "Settings" },
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
        {children}
      </main>
    </div>
  )
}
