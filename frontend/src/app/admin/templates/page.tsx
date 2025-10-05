"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, PlusCircle } from "lucide-react";

const mockTemplates = [
  {
    id: "TPL01",
    name: "Hóa đơn mặc định",
    type: "Hóa đơn",
    lastUpdated: "2025-09-20",
  },
  {
    id: "TPL02",
    name: "Order tại bàn",
    type: "Mẫu order",
    lastUpdated: "2025-08-15",
  },
  {
    id: "TPL03",
    name: "Hóa đơn khuyến mãi",
    type: "Hóa đơn",
    lastUpdated: "2025-10-01",
  },
];

export default function TemplatesPage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Quản lý mẫu</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Tạo mẫu mới
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                {template.name}
              </CardTitle>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Loại: {template.type}
              </p>
              <p className="text-sm text-muted-foreground">
                Cập nhật lần cuối: {template.lastUpdated}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}