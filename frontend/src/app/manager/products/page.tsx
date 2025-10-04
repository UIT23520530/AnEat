"use client"

import { useState } from "react"
import { ManagerLayout } from "@/components/layouts/manager-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

const mockProducts = [
  {
    id: "1",
    name: "Fried Chicken Combo",
    category: "Chicken",
    price: 50000,
    cost: 25000,
    stock: 45,
    status: "active",
  },
  {
    id: "2",
    name: "Spicy Chicken Wings",
    category: "Chicken",
    price: 45000,
    cost: 22000,
    stock: 32,
    status: "active",
  },
  {
    id: "3",
    name: "Classic Burger",
    category: "Burgers",
    price: 35000,
    cost: 18000,
    stock: 28,
    status: "active",
  },
  {
    id: "4",
    name: "Cheese Burger",
    category: "Burgers",
    price: 40000,
    cost: 20000,
    stock: 5,
    status: "low-stock",
  },
  {
    id: "5",
    name: "Carbonara Pasta",
    category: "Pasta",
    price: 55000,
    cost: 28000,
    stock: 0,
    status: "out-of-stock",
  },
]

export default function ManagerProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "low-stock":
        return <Badge className="bg-yellow-500">Low Stock</Badge>
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <ManagerLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your menu items</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Create a new menu item for your store</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input id="product-name" placeholder="Enter product name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="burgers">Burgers</SelectItem>
                      <SelectItem value="pasta">Pasta</SelectItem>
                      <SelectItem value="sides">Sides</SelectItem>
                      <SelectItem value="drinks">Drinks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price (VND)</Label>
                    <Input id="product-price" type="number" placeholder="50000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-cost">Cost (VND)</Label>
                    <Input id="product-cost" type="number" placeholder="25000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Initial Stock</Label>
                  <Input id="product-stock" type="number" placeholder="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea id="product-description" placeholder="Product description..." />
                </div>
                <Button className="w-full">Create Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-semibold">Product</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Cost</th>
                    <th className="p-4 font-semibold">Margin</th>
                    <th className="p-4 font-semibold">Stock</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const margin = ((product.price - product.cost) / product.price) * 100
                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4">{product.category}</td>
                        <td className="p-4">{product.price.toLocaleString()} VND</td>
                        <td className="p-4">{product.cost.toLocaleString()} VND</td>
                        <td className="p-4">{margin.toFixed(1)}%</td>
                        <td className="p-4">{product.stock}</td>
                        <td className="p-4">{getStatusBadge(product.status)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  )
}
