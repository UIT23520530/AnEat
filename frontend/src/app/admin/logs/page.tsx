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

const mockLogs = [
  {
    id: 1,
    timestamp: "2025-10-05 10:30:15",
    level: "info",
    user: "admin@aneat.com",
    action: "Đăng nhập thành công",
  },
  {
    id: 2,
    timestamp: "2025-10-05 10:32:01",
    level: "warning",
    user: "staff@aneat.com",
    action: "Cập nhật sản phẩm không thành công (ID: P001)",
  },
  {
    id: 3,
    timestamp: "2025-10-05 10:35:22",
    level: "info",
    user: "admin@aneat.com",
    action: "Tạo khuyến mãi mới (CODE: FALL25)",
  },
  {
    id: 4,
    timestamp: "2025-10-05 10:40:00",
    level: "error",
    user: "system",
    action: "Lỗi kết nối cơ sở dữ liệu",
  },
];

export default function LogsPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-8">Bản ghi hệ thống</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Cấp độ</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.level === "info"
                        ? "default"
                        : log.level === "warning"
                        ? "secondary"
                        : "destructive"
                    }
                    className="capitalize"
                  >
                    {log.level}
                  </Badge>
                </TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}