"use client"

import { ManagerLayout } from "@/components/layouts/manager-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

const mockTables = [
  { id: "T01", status: "Available", capacity: 4 },
  { id: "T02", status: "Occupied", capacity: 2 },
  { id: "T03", status: "Available", capacity: 6 },
  { id: "T04", status: "Reserved", capacity: 4 },
  { id: "T05", status: "Occupied", capacity: 2 },
  { id: "T06", status: "Available", capacity: 8 },
  { id: "T07", status: "Available", capacity: 4 },
  { id: "T08", status: "Reserved", capacity: 2 },
]

export default function ManagerTablesPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Available":
        return "default"
      case "Occupied":
        return "destructive"
      case "Reserved":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <ManagerLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý bàn</h1>
            <p>Xem trạng thái và quản lý các bàn trong cửa hàng.</p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm bàn mới
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {mockTables.map((table) => (
            <Card key={table.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Bàn {table.id}
                  <Badge variant={getStatusVariant(table.status)}>
                    {table.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sức chứa: {table.capacity} người
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ManagerLayout>
  )
}