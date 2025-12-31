import React from 'react';
import { LogisticsStaffLayout } from "@/components/layouts/logistics-staff-layout";

export const metadata = {
  title: "AnEat - Logistics Staff",
  description: "Trang quản lý giao hàng",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LogisticsStaffLayout>
      {children}
    </LogisticsStaffLayout>
  );
}