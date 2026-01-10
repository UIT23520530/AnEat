"use client"

import { PublicLayout } from "@/components/layouts/public-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye } from "lucide-react"

const mockOrders = [
  {
    id: "1",
    orderNumber: "#1-4",
    date: "2025-10-04",
    time: "17:43",
    items: [{ name: "Gà rán", quantity: 1 }],
    total: 50000,
    status: "completed",
  },
  {
    id: "2",
    orderNumber: "#1-3",
    date: "2025-10-03",
    time: "12:30",
    items: [
      { name: "Burger", quantity: 2 },
      { name: "Fries", quantity: 1 },
    ],
    total: 95000,
    status: "completed",
  },
  {
    id: "3",
    orderNumber: "#1-2",
    date: "2025-10-01",
    time: "19:15",
    items: [{ name: "Pasta", quantity: 1 }],
    total: 55000,
    status: "cancelled",
  },
]

export default function HistoryPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>

        <div className="max-w-4xl mx-auto space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">Order {order.orderNumber}</h3>
                      <Badge variant={order.status === "completed" ? "default" : "destructive"} className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {order.date} at {order.time}
                    </p>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.name} x{item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-3">
                    <p className="text-xl font-bold text-primary">{order.total.toLocaleString()} VND</p>
                    <div className="flex gap-2">
                      <Link href={`/tracking-order/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      {order.status === "completed" && (
                        <Button size="sm" variant="default">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {mockOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No orders yet</p>
              <Link href="/customer/menu">
                <Button>Start Ordering</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
