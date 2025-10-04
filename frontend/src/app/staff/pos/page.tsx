"use client"

import { useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Trash2, Plus, Minus, ShoppingCart } from "lucide-react"

const categories = ["All", "Chicken", "Burgers", "Pasta", "Sides", "Drinks"]

const mockProducts = [
  { id: "1", name: "Fried Chicken Combo", category: "Chicken", price: 50000, image: "/fried-chicken-combo.jpg" },
  { id: "2", name: "Spicy Chicken Wings", category: "Chicken", price: 45000, image: "/spicy-chicken-wings.png" },
  { id: "3", name: "Classic Burger", category: "Burgers", price: 35000, image: "/classic-burger.png" },
  { id: "4", name: "Cheese Burger", category: "Burgers", price: 40000, image: "/cheese-burger.png" },
  { id: "5", name: "Carbonara Pasta", category: "Pasta", price: 55000, image: "/classic-carbonara.png" },
  { id: "6", name: "Bolognese Pasta", category: "Pasta", price: 55000, image: "/bolognese-pasta.png" },
  { id: "7", name: "French Fries", category: "Sides", price: 20000, image: "/crispy-french-fries.png" },
  { id: "8", name: "Soft Drink", category: "Drinks", price: 15000, image: "/refreshing-soft-drink.png" },
]

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [orderType, setOrderType] = useState<"dine-in" | "take-away" | "delivery">("dine-in")

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: (typeof mockProducts)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
      return updated
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName("")
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty!")
      return
    }
    alert(`Order placed successfully!\nTotal: ${total.toLocaleString()} VND`)
    clearCart()
  }

  return (
    <StaffLayout>
      <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-primary font-bold">{product.price.toLocaleString()} VND</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Cart */}
        <div className="w-96 flex flex-col bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-3">Current Order</h2>

            {/* Order Type */}
            <div className="flex gap-2 mb-3">
              <Button
                variant={orderType === "dine-in" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrderType("dine-in")}
                className="flex-1"
              >
                Dine In
              </Button>
              <Button
                variant={orderType === "take-away" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrderType("take-away")}
                className="flex-1"
              >
                Take Away
              </Button>
              <Button
                variant={orderType === "delivery" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrderType("delivery")}
                className="flex-1"
              >
                Delivery
              </Button>
            </div>

            {/* Customer Name */}
            <Input
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-2" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm flex-1">{item.name}</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-transparent"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-transparent"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-primary">{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Cart Summary */}
          <div className="p-4 border-t space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>{tax.toLocaleString()} VND</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{total.toLocaleString()} VND</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="flex-1 bg-transparent"
              >
                Clear
              </Button>
              <Button onClick={handleCheckout} disabled={cart.length === 0} className="flex-1">
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
