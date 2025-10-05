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
import { Edit, PlusCircle, Trash2 } from "lucide-react";

const mockPromotions = [
  {
    id: "PROMO01",
    name: "Giảm 20% cho đơn hàng đầu tiên",
    code: "WELCOME20",
    discount: "20%",
    status: "active",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
  },
  {
    id: "PROMO02",
    name: "Miễn phí vận chuyển",
    code: "FREESHIP",
    discount: "100%",
    status: "active",
    startDate: "2025-09-15",
    endDate: "2025-10-15",
  },
  {
    id: "PROMO03",
    name: "Giảm 50K cho đơn từ 200K",
    code: "50KOFF",
    discount: "50,000đ",
    status: "expired",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
  },
];

export default function PromotionsPage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Quản lý khuyến mãi</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Tạo khuyến mãi
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên chương trình</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPromotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-medium">{promo.name}</TableCell>
                <TableCell>{promo.code}</TableCell>
                <TableCell>{promo.discount}</TableCell>
                <TableCell>{promo.startDate}</TableCell>
                <TableCell>{promo.endDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={promo.status === "active" ? "default" : "outline"}
                  >
                    {promo.status === "active" ? "Đang hoạt động" : "Đã hết hạn"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
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