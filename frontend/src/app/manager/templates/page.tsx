"use client"

import { ManagerLayout } from "@/components/layouts/manager-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FilePlus, FileEdit } from "lucide-react"

const mockTemplates = [
  {
    id: "TPL001",
    name: "Mẫu hóa đơn chuẩn",
    description: "Mẫu hóa đơn mặc định với logo và thông tin cửa hàng.",
  },
  {
    id: "TPL002",
    name: "Mẫu order tại bàn",
    description: "Mẫu in phiếu order cho khách tại bàn.",
  },
  {
    id: "TPL003",
    name: "Mẫu báo cáo cuối ngày",
    description: "Mẫu báo cáo doanh thu và hàng tồn kho cuối ngày.",
  },
]

export default function ManagerTemplatesPage() {
  return (
    <ManagerLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý mẫu</h1>
            <p>Quản lý các mẫu hóa đơn, order và báo cáo.</p>
          </div>
          <Button>
            <FilePlus className="mr-2 h-4 w-4" /> Tạo mẫu mới
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {template.name}
                  <Button variant="ghost" size="icon">
                    <FileEdit className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ManagerLayout>
  )
}