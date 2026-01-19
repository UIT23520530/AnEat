"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button, IconButton } from "@/components/ui/button";
import {
  ShoppingCart,
  List,
  LogOut,
  Users,
  LayoutGrid,
  Receipt,
  Settings,
  Package,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  ArrowRightFromLine,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { AntdProvider } from "@/components/providers/AntdProvider"
import { usePendingOrders } from "@/hooks/use-pending-orders";
import { Toaster } from "sonner";
import 'antd/dist/reset.css'
import '@/styles/antd-custom.css'

export function StaffLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { pendingCount } = usePendingOrders(true, 30000);

  const navItems = [
    { href: "/staff/dashboard", icon: LayoutGrid, label: "Tổng quan" },
    { href: "/staff/orders", icon: ShoppingCart, label: "Thực hiện Order" },
    { href: "/staff/tracking-order", icon: ReceiptText, label: "Theo dõi đơn" },
    { href: "/staff/customers", icon: Users, label: "Khách hàng" },
    { href: "/staff/bills-history", icon: Receipt, label: "Lịch sử đơn hàng" },
    { href: "/staff/warehouse", icon: Package, label: "Kho hàng" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-gray-200 flex flex-col py-6 shadow-sm transition-all duration-300 relative",
            collapsed ? "w-20" : "w-64"
          )}
        >
          {/* Logo & Branch Info */}
          <div className={cn("mb-8 px-4", collapsed && "flex justify-center px-2")}>
            <Link href="/staff/dashboard" className="block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/icons/AnEat.svg"
                    alt="AnEat Logo"
                    width={48}
                    height={48}
                    className="text-white"
                  />
                </div>
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-lg">AnEat</span>
                    <span className="text-xs text-gray-500">Cửa hàng chi nhánh Quận 1</span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-4")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              const isTrackingOrder = item.href === "/staff/tracking-order";
              const showBadge = isTrackingOrder && pendingCount > 0;
              
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={cn(
                      "w-full h-11 rounded-lg flex items-center gap-3 transition-all relative",
                      collapsed ? "justify-center px-0" : "px-3",
                      isActive
                        ? "bg-orange-50 text-orange-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-orange-500")} />
                    {!collapsed && (
                      <>
                        <span className={cn("text-sm font-medium", isActive && "text-orange-500")}>{item.label}</span>
                        {showBadge && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center animate-pulse">
                            {pendingCount}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && showBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Divider with Toggle Button */}
          <div className="relative px-4 my-3">
            <div className="border-t border-gray-200" />
            {/* Toggle Button on the right side of divider */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
              <IconButton
                onClick={() => setCollapsed(!collapsed)}
                className="bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-full h-8 w-8 p-0"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                )}
              </IconButton>
            </div>
          </div>

          {/* Spacer để đẩy logout xuống dưới cùng */}
          <div className="flex-1" />

          {/* Divider before Logout */}
          <div className="px-4 my-1">
            <div className="border-t border-gray-200" />
          </div>

          <div className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-4")}>
            {/* Logout */}
            <button
              onClick={logout}
              className={cn(
                "w-full h-11 rounded-lg flex items-center gap-3 text-red-500 hover:bg-red-50 transition-all",
                collapsed ? "justify-center px-0" : "px-3"
              )}
            >
              <ArrowRightFromLine className="h-5 w-5 flex-shrink-0 text-red-500" />
              {!collapsed && <span className="text-sm font-medium text-red-500">Đăng xuất</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <AntdProvider>
            <div className="h-full">{children}</div>
          </AntdProvider>
          <Toaster position="top-right" richColors />
        </main>
      </div>
    </div>
  );
}
