"use client"

import { useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2 } from "lucide-react"

const mockKitchenOrders = [
  {
    id: "1",
    orderNumber: "#1-4",
    items: [{ name: "Gà rán", quantity: 1, notes: "Extra crispy" }],
    status: "pending",
    priority: "normal",
    createdAt: "2025-10-04T17:43:00",
  },
  {
    id: "2",
    orderNumber: "#1-5",
    items: [
      { name: "Burger", quantity: 2, notes: "No onions" },
      { name: "Fries", quantity: 1, notes: "" },
    ],
    status: "preparing",
    priority: "high",
    createdAt: "2025-10-04T17:45:00",
  },
  {
    id: "3",
    orderNumber: "#1-6",
    items: [{ name: "Pasta", quantity: 1, notes: "Extra cheese" }],
    status: "pending",
    priority: "normal",
    createdAt: "2025-10-04T17:50:00",
  },
]

export default function KitchenPage() {
  const [orders, setOrders] = useState(mockKitchenOrders)

  const startPreparing = (orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "preparing" } : order)))
  }

  const markReady = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
  }

  const getElapsedTime = (createdAt: string) => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000 / 60)
    return `${elapsed} min ago`
  }

  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Kitchen Display</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className={order.priority === "high" ? "border-red-500 border-2" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{order.orderNumber}</CardTitle>
                  <div className="flex items-center gap-2">
                    {order.priority === "high" && <Badge variant="destructive">Urgent</Badge>}
                    <Badge variant={order.status === "preparing" ? "default" : "outline"}>{order.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{getElapsedTime(order.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary pl-3">
                      <p className="font-semibold">
                        {item.quantity}x {item.name}
                      </p>
                      {item.notes && <p className="text-sm text-muted-foreground italic">{item.notes}</p>}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button className="flex-1" onClick={() => startPreparing(order.id)}>
                      Start Preparing
                    </Button>
                  )}
                  {order.status === "preparing" && (
                    <Button className="flex-1" onClick={() => markReady(order.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No orders in kitchen</p>
          </div>
        )}
      </div>
    </StaffLayout>
  )
}
