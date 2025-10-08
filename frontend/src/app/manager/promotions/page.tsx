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
import { Edit, Trash } from "lucide-react"

const mockPromotions = [
  {
    id: "PROMO001",
    name: "Giảm 20% cho đơn hàng trên 500k",
    code: "SALE20",
    startDate: "2024-05-01",
    endDate: "2024-05-31",
    status: "Active",
  },
  {
    id: "PROMO002",
    name: "Miễn phí vận chuyển",
    code: "FREESHIP",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    status: "Scheduled",
  },
  {
    id: "PROMO003",
    name: "Mua 1 tặng 1",
    code: "BOGO",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    status: "Expired",
  },
]

export default function ManagerPromotionsPage() {
  return (
    <ManagerLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Quản lý khuyến mãi</h1>
        <p>Tạo và quản lý các chương trình khuyến mãi cho cửa hàng.</p>
        <Button>Tạo khuyến mãi mới</Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên chương trình</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPromotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell>{promo.name}</TableCell>
                <TableCell>{promo.code}</TableCell>
                <TableCell>{promo.startDate}</TableCell>
                <TableCell>{promo.endDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      promo.status === "Active"
                        ? "default"
                        : promo.status === "Scheduled"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {promo.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon">
                    <Trash className="h-4 w-4" />
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