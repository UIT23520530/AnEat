"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileDown } from "lucide-react";

const mockInvoices = [
  {
    id: "INV001",
    customer: "Nguyễn Văn A",
    date: "2025-10-05",
    total: 250000,
    status: "paid",
  },
  {
    id: "INV002",
    customer: "Trần Thị B",
    date: "2025-10-05",
    total: 150000,
    status: "pending",
  },
  {
    id: "INV003",
    customer: "Lê Văn C",
    date: "2025-10-04",
    total: 320000,
    status: "paid",
  },
  {
    id: "INV004",
    customer: "Phạm Thị D",
    date: "2025-10-03",
    total: 80000,
    status: "cancelled",
  },
];

export default function InvoicesPage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Lịch sử hóa đơn</h1>
        <Button>
          <FileDown className="mr-2 h-4 w-4" /> Xuất báo cáo
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã hóa đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.total.toLocaleString("vi-VN")}đ</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "paid"
                        ? "default"
                        : invoice.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {invoice.status === "paid"
                      ? "Đã thanh toán"
                      : invoice.status === "pending"
                      ? "Chờ xử lý"
                      : "Đã hủy"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}