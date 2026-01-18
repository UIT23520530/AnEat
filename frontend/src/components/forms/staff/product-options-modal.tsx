"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { OrderProduct, ProductOption } from "@/services/staff-order.service"
import Image from "next/image"

interface ProductOptionsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  product: OrderProduct | null
  onAddToCart: (product: OrderProduct, quantity: number, selectedOptions: ProductOption[], notes: string) => void
}

export function ProductOptionsModal({
  isOpen,
  onOpenChange,
  product,
  onAddToCart
}: ProductOptionsModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setSelectedSize("")
      setSelectedToppings([])
      setNotes("")
    }
  }, [product])

  if (!product) return null

  // Group options by type
  const sizeOptions = product.options?.filter(opt => opt.type === 'SIZE') || []
  const toppingOptions = product.options?.filter(opt => opt.type === 'TOPPING') || []

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = product.promotionPrice || product.price
    
    // Add size price
    if (selectedSize) {
      const size = sizeOptions.find(s => s.id === selectedSize)
      if (size) total += size.price
    }
    
    // Add toppings price
    selectedToppings.forEach(toppingId => {
      const topping = toppingOptions.find(t => t.id === toppingId)
      if (topping) total += topping.price
    })

    return total * quantity
  }

  const handleAddToCart = () => {
    const selectedOptions: ProductOption[] = []
    
    if (selectedSize) {
      const size = sizeOptions.find(s => s.id === selectedSize)
      if (size) selectedOptions.push(size)
    }
    
    selectedToppings.forEach(toppingId => {
      const topping = toppingOptions.find(t => t.id === toppingId)
      if (topping) selectedOptions.push(topping)
    })

    onAddToCart(product, quantity, selectedOptions, notes)
    onOpenChange(false)
  }

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings(prev => 
      prev.includes(toppingId)
        ? prev.filter(id => id !== toppingId)
        : [...prev, toppingId]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tuỳ chọn sản phẩm</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {product.image ? (
                <Image 
                  src={product.image} 
                  alt={product.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{product.description || "Không có mô tả"}</p>
              <div className="mt-2 flex items-center gap-2">
                {product.promotionPrice && product.promotionPrice < product.price ? (
                  <>
                    <span className="text-orange-600 font-bold text-lg">
                      {product.promotionPrice.toLocaleString()}₫
                    </span>
                    <span className="text-gray-400 line-through text-sm">
                      {product.price.toLocaleString()}₫
                    </span>
                  </>
                ) : (
                  <span className="text-orange-600 font-bold text-lg">
                    {product.price.toLocaleString()}₫
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Size Options */}
          {sizeOptions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Kích cỡ</h4>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                <div className="space-y-2">
                  {sizeOptions.map((size) => (
                    <div 
                      key={size.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedSize(size.id)}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={size.id} id={size.id} />
                        <Label htmlFor={size.id} className="cursor-pointer font-medium">
                          {size.name}
                        </Label>
                      </div>
                      <span className="text-orange-600 font-medium">
                        +{size.price.toLocaleString()}₫
                      </span>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Toppings Options */}
          {toppingOptions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Topping thêm</h4>
              <div className="space-y-2">
                {toppingOptions.map((topping) => (
                  <div 
                    key={topping.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedToppings.includes(topping.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => toggleTopping(topping.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedToppings.includes(topping.id)
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300"
                      }`}>
                        {selectedToppings.includes(topping.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">{topping.name}</span>
                    </div>
                    <span className="text-orange-600 font-medium">
                      +{topping.price.toLocaleString()}₫
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Ghi chú</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú cho món (VD: ít đường, không đá...)"
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={2}
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Số lượng</h4>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleAddToCart}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold"
          >
            Thêm vào giỏ - {calculateTotalPrice().toLocaleString()}₫
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
