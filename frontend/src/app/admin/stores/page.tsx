"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MapPin, Phone, Mail, Settings } from "lucide-react"
import Link from "next/link"

const mockStores = [
  {
    id: "1",
    name: "Store #1",
    address: "123 Main Street, District 1, Ho Chi Minh City",
    phone: "0123456789",
    email: "store1@fastfood.com",
    manager: "Nguyễn Văn A",
    status: "active",
    revenue: 22800000,
    orders: 454,
  },
  {
    id: "2",
    name: "Store #2",
    address: "456 Second Avenue, District 3, Ho Chi Minh City",
    phone: "0987654321",
    email: "store2@fastfood.com",
    manager: "Trần Thị B",
    status: "active",
    revenue: 18500000,
    orders: 378,
  },
  {
    id: "3",
    name: "Store #3",
    address: "789 Third Road, District 7, Ho Chi Minh City",
    phone: "0369852147",
    email: "store3@fastfood.com",
    manager: "Lê Văn C",
    status: "active",
    revenue: 25600000,
    orders: 512,
  },
  {
    id: "4",
    name: "Store #4",
    address: "321 Fourth Street, District 10, Ho Chi Minh City",
    phone: "0258963147",
    email: "store4@fastfood.com",
    manager: "Phạm Thị D",
    status: "maintenance",
    revenue: 19200000,
    orders: 401,
  },
]

export default function AdminStoresPage() {
  const [stores, setStores] = useState(mockStores)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Store Management</h1>
            <p className="text-muted-foreground">Manage all store locations</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Store</DialogTitle>
                <DialogDescription>Create a new store location</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" placeholder="Store #5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address">Address</Label>
                  <Textarea id="store-address" placeholder="Full address" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Phone</Label>
                    <Input id="store-phone" placeholder="0123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-email">Email</Label>
                    <Input id="store-email" type="email" placeholder="store@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-manager">Manager Name</Label>
                  <Input id="store-manager" placeholder="Manager name" />
                </div>
                <Button className="w-full">Create Store</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Store Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{store.name}</CardTitle>
                  <Badge variant={store.status === "active" ? "default" : "outline"}>{store.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{store.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{store.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{store.email}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Manager</p>
                      <p className="font-medium">{store.manager}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Orders</p>
                      <p className="font-medium">{store.orders}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Weekly Revenue</p>
                    <p className="text-xl font-bold text-primary">{store.revenue.toLocaleString()} VND</p>
                  </div>
                </div>

                <Link href={`/admin/stores/${store.id}`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Store
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
