"use client"

import { useState } from "react"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, ShoppingCart } from "lucide-react"

const categories = ["All", "Chicken", "Burgers", "Pasta", "Sides", "Drinks"]

const mockProducts = [
  {
    id: "1",
    name: "Fried Chicken Combo",
    category: "Chicken",
    price: 50000,
    image: "/fried-chicken-combo.jpg",
    isPromotion: true,
  },
  {
    id: "2",
    name: "Spicy Chicken Wings",
    category: "Chicken",
    price: 45000,
    image: "/spicy-chicken-wings.png",
    isPromotion: false,
  },
  {
    id: "3",
    name: "Classic Burger",
    category: "Burgers",
    price: 35000,
    image: "/classic-burger.png",
    isPromotion: false,
  },
  {
    id: "4",
    name: "Cheese Burger",
    category: "Burgers",
    price: 40000,
    image: "/cheese-burger.png",
    isPromotion: true,
  },
  {
    id: "5",
    name: "Carbonara Pasta",
    category: "Pasta",
    price: 55000,
    image: "/classic-carbonara.png",
    isPromotion: false,
  },
  {
    id: "6",
    name: "Bolognese Pasta",
    category: "Pasta",
    price: 55000,
    image: "/bolognese-pasta.png",
    isPromotion: false,
  },
  {
    id: "7",
    name: "French Fries",
    category: "Sides",
    price: 20000,
    image: "/crispy-french-fries.png",
    isPromotion: false,
  },
  {
    id: "8",
    name: "Soft Drink",
    category: "Drinks",
    price: 15000,
    image: "/refreshing-soft-drink.png",
    isPromotion: false,
  },
]

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground text-lg">Discover our delicious selection of fast food favorites</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.isPromotion && <Badge className="absolute top-2 right-2 z-10 bg-destructive">Sale</Badge>}
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{product.price.toLocaleString()} VND</span>
                    <Button size="sm" onClick={(e) => e.preventDefault()}>
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found</p>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
