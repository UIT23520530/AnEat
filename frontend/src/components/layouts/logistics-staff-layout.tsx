"use client";

import React, { useEffect, useState } from "react";
import { BellOutlined } from "@ant-design/icons";
import { Button as AntButton, Badge } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User as UserIcon, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser, logout as authLogout } from "@/lib/auth";
import type { User } from "@/types";

interface LogisticsStaffLayoutProps {
  children: React.ReactNode;
}

export function LogisticsStaffLayout({ children }: LogisticsStaffLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initial load
    setUser(getCurrentUser());

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        setUser(getCurrentUser());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Polling to capture changes within the same tab/window if not triggered by storage event
    const intervalId = setInterval(() => {
      const updatedUser = getCurrentUser();
      setUser((prevUser) => {
        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(prevUser)) {
          return updatedUser;
        }
        if (!updatedUser && prevUser) {
          return null;
        }
        return prevUser;
      });
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = () => {
    authLogout();
    router.push("/auth/system/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* --- HEADER (Cố định) --- */}
      <header className="flex-none h-16 bg-white border-b border-gray-200 z-50 px-6 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/icons/AnEat.svg" alt="AnEat" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-[#ff6600]">
            AnEat
          </span>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <Badge count={2} size="small">
            <AntButton icon={<BellOutlined />} shape="circle" />
          </Badge>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarImage src="/avt/avt-profile.jpg" alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[1100]" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Nhân viên"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || ""}
                  </p>
                  <p className="text-xs leading-none text-orange-500 font-medium mt-1">
                    Nhân viên Kho vận
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}