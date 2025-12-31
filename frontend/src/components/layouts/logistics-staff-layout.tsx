"use client";

import React from "react";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import { Button, Input, Avatar, Badge } from "antd";

interface LogisticsStaffLayoutProps {
  children: React.ReactNode;
}

export function LogisticsStaffLayout({ children }: LogisticsStaffLayoutProps) {
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
            <Button icon={<BellOutlined />} shape="circle" />
          </Badge>
          <div className="flex items-center gap-2 border-l pl-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">Nguyễn Văn A</div>
              <div className="text-xs text-gray-500">Shipper</div>
            </div>
            <Avatar icon={<UserOutlined />} />
          </div>
        </div>
      </header>
      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}