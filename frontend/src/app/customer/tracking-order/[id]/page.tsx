"use client"

import { PublicLayout } from "@/components/layouts/public-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Package, UtensilsCrossed } from "lucide-react"

export default function TrackingOrderPage({ params }: { params: { id: string } }) {
  // Mock order data
  const order = {
    id: params.id,
    orderNumber: "#1-4",
    status: "preparing",
    customerName: "Nguyễn Công Hậu",
    customerPhone: "0123456789",
    orderType: "take-away",
    items: [{ name: "Gà rán", quantity: 1, price: 50000 }],
    total: 50000,
    createdAt: "2025-10-04T17:43:00",
  }

  const statusSteps = [
    { key: "pending", label: "Order Received", icon: CheckCircle2, completed: true },
    { key: "preparing", label: "Preparing", icon: UtensilsCrossed, completed: true },
    { key: "ready", label: "Ready for Pickup", icon: Package, completed: false },
    { key: "completed", label: "Completed", icon: CheckCircle2, completed: false },
  ]

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

          {/* Order Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order {order.orderNumber}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Type</p>
                  <p className="font-medium capitalize">{order.orderType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Time</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Timeline */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon
                  const isLast = index === statusSteps.length - 1
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`rounded-full p-2 ${
                            step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-12 ${step.completed ? "bg-primary" : "bg-muted"} transition-colors`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {step.completed && step.key === order.status && (
                          <p className="text-sm text-muted-foreground mt-1">In progress...</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">{item.price.toLocaleString()} VND</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{order.total.toLocaleString()} VND</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  )
}
