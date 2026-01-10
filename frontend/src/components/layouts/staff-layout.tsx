"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  List,
  UtensilsCrossed,
  LogOut,
  Users,
  UserCircle,
  LayoutGrid,
  Receipt,
  Settings,
  ChefHat,
  Menu,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AntdProvider } from "@/components/providers/AntdProvider"
import 'antd/dist/reset.css'
import '@/styles/antd-custom.css'

export function StaffLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/staff/pos", icon: LayoutGrid, label: "POS Dashboard" },
    { href: "/staff/orders", icon: Receipt, label: "Đơn hàng" },
    { href: "/staff/kitchen", icon: ChefHat, label: "Bếp" },
    { href: "/staff/customers", icon: Users, label: "Khách hàng" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 bg-white border-r border-orange-100 flex flex-col items-center py-6 shadow-sm">
          {/* Logo */}
          <Link
            href="/staff/pos"
            className="mb-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="text-white font-bold text-2xl">AE</span>
          </Link>

          {/* Navigation Icons */}
          <nav className="flex-1 flex flex-col gap-4 w-full px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={cn(
                      "w-full h-14 rounded-xl flex items-center justify-center transition-all group relative",
                      isActive
                        ? "bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-200"
                        : "hover:bg-orange-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6 transition-colors",
                        isActive ? "text-white" : "text-gray-600 group-hover:text-orange-500"
                      )}
                    />
                    {/* Tooltip */}
                    <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                      {item.label}
                    </span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-4 w-full px-2">
            <Link href="/staff/settings">
              <button className="w-full h-14 rounded-xl flex items-center justify-center hover:bg-orange-50 transition-all group relative">
                <Settings className="h-6 w-6 text-gray-600 group-hover:text-orange-500 transition-colors" />
                <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                  Cài đặt
                </span>
              </button>
            </Link>

            <button
              onClick={logout}
              className="w-full h-14 rounded-xl flex items-center justify-center hover:bg-red-50 transition-all group relative"
            >
              <LogOut className="h-6 w-6 text-gray-600 group-hover:text-red-500 transition-colors" />
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                Đăng xuất
              </span>
            </button>

            {/* User Avatar */}
            <div className="mt-2 relative group">
              <Avatar className="w-14 h-14 border-2 border-orange-200 cursor-pointer hover:border-orange-400 transition-colors">
                <AvatarImage src="/staff-avatar.jpg" alt="Staff" />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white font-semibold">
                  NV
                </AvatarFallback>
              </Avatar>
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 top-1/2 -translate-y-1/2">
                Nhân viên
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <AntdProvider>
            <div className="h-full">{children}</div>
          </AntdProvider>
        </main>
      </div>
    </div>
  );
}
