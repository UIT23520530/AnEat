"use client";

import 'antd/dist/reset.css'
import '@/styles/antd-custom.css'
import { AntdProvider } from "@/components/providers/AntdProvider";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AntdProvider>{children}</AntdProvider>;
}
