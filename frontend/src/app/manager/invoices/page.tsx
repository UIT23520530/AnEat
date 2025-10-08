"use client"

import { ManagerLayout } from "@/components/layouts/manager-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

const mockInvoices = [
  {
    id: "INV001",
    customer: "Nguyen Van A",
    date: "2024-05-01",
    total: "250,000đ",
    status: "Paid",
  },
  {
    id: "INV002",
    customer: "Tran Thi B",
    date: "2024-05-02",
    total: "150,000đ",
    status: "Pending",
  },
  {
    id: "INV003",
    customer: "Le Van C",
    date: "2024-05-03",
    total: "350,000đ",
    status: "Paid",
  },
  {
    id: "INV004",
    customer: "Pham Thi D",
    date: "2024-05-04",
    total: "50,000đ",
    status: "Cancelled",
  },
]

export default function ManagerInvoicesPage() {
  return (
    <ManagerLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Lịch sử hóa đơn</h1>
        <p>Xem và quản lý lịch sử hóa đơn của cửa hàng.</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã HĐ</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.total}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "Paid"
                        ? "default"
                        : invoice.status === "Pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ManagerLayout>
  )
}