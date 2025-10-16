"use client"

import { useState } from "react"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  // Mock product data
  const product = {
    id: params.id,
    name: "Fried Chicken Combo",
    description:
      "Crispy fried chicken served with french fries, coleslaw, and a soft drink. Our signature recipe with 11 herbs and spices.",
    price: 50000,
    image: "/fried-chicken-combo-meal.jpg",
    category: "Chicken",
    isPromotion: true,
    originalPrice: 60000,
  }

  const addons = [
    { id: "1", name: "Extra Cheese", price: 5000 },
    { id: "2", name: "Extra Sauce", price: 3000 },
    { id: "3", name: "Upgrade to Large Drink", price: 5000 },
  ]

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
  }

  const totalPrice =
    product.price * quantity +
    selectedAddons.reduce((sum, id) => sum + (addons.find((a) => a.id === id)?.price || 0), 0)

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.isPromotion && <Badge className="absolute top-4 right-4 z-10 bg-destructive">Sale</Badge>}
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover w-full h-full" />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{product.price.toLocaleString()} VND</span>
                {product.isPromotion && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString()} VND
                  </span>
                )}
              </div>
            </div>

            {/* Add-ons */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Add-ons</h3>
              <div className="space-y-2">
                {addons.map((addon) => (
                  <Card
                    key={addon.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAddons.includes(addon.id) ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="font-medium">{addon.name}</span>
                      <span className="text-sm text-muted-foreground">+{addon.price.toLocaleString()} VND</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total & Actions */}
            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()} VND</span>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Link href="/customer/checkout" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full bg-transparent">
                    Buy Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
