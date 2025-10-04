"use client"

import { useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XCircle } from "lucide-react"

const mockOrders = [
  {
    id: "1",
    orderNumber: "#1-4",
    customerName: "Nguyễn Công Hậu",
    orderType: "take-away",
    items: [{ name: "Gà rán", quantity: 1, price: 50000 }],
    total: 50000,
    status: "pending",
    createdAt: "2025-10-04T17:43:00",
  },
  {
    id: "2",
    orderNumber: "#1-5",
    customerName: "Trần Văn A",
    orderType: "dine-in",
    items: [
      { name: "Burger", quantity: 2, price: 35000 },
      { name: "Fries", quantity: 1, price: 20000 },
    ],
    total: 90000,
    status: "preparing",
    createdAt: "2025-10-04T17:45:00",
  },
  {
    id: "3",
    orderNumber: "#1-6",
    customerName: "Lê Thị B",
    orderType: "delivery",
    items: [{ name: "Pasta", quantity: 1, price: 55000 }],
    total: 55000,
    status: "ready",
    createdAt: "2025-10-04T17:50:00",
  },
]

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [activeTab, setActiveTab] = useState("all")

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    return order.status === activeTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "preparing":
        return "bg-blue-500"
      case "ready":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Order Management</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Customer</span>
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{order.orderType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold mb-2">Items:</p>
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.name} x{item.quantity}
                        </p>
                      ))}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">{order.total.toLocaleString()} VND</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button size="sm" className="flex-1" onClick={() => updateOrderStatus(order.id, "preparing")}>
                          Start Preparing
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button size="sm" className="flex-1" onClick={() => updateOrderStatus(order.id, "ready")}>
                          Mark Ready
                        </Button>
                      )}
                      {order.status === "ready" && (
                        <Button size="sm" className="flex-1" onClick={() => updateOrderStatus(order.id, "completed")}>
                          Complete Order
                        </Button>
                      )}
                      {(order.status === "pending" || order.status === "preparing") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No orders found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  )
}
