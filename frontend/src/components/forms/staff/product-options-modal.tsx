"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { OrderProduct, ProductOption } from "@/services/staff-order.service"

interface ProductOptionGroup {
  name: string
  options: ProductOption[]
  isFreeGroup: boolean // true if all options are free (price = 0)
}

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  options?: string
  image?: string | null
  selectedOptions?: ProductOption[]
}

interface ProductOptionsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  product: OrderProduct | null
  onAddToCart: (product: OrderProduct, quantity: number, selectedOptions: ProductOption[], notes: string) => void
  editingItem?: CartItem | null
}

export function ProductOptionsModal({
  isOpen,
  onOpenChange,
  product,
  onAddToCart,
  editingItem,
}: ProductOptionsModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOption>>({})
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<Record<string, ProductOption[]>>({})
  const [notes, setNotes] = useState("")
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([])

  // Group options by type and determine if group is free or paid
  useEffect(() => {
    if (product?.options) {
      const groups: Record<string, ProductOption[]> = product.options.reduce((acc, option) => {
        const groupName = option.type.charAt(0).toUpperCase() + option.type.slice(1).toLowerCase()
        if (!acc[groupName]) {
          acc[groupName] = []
        }
        acc[groupName].push(option)
        return acc
      }, {} as Record<string, ProductOption[]>)

      const groupedArray = Object.entries(groups).map(([name, options]) => {
        // Check if all options in this group are free (price = 0)
        const isFreeGroup = options.every(opt => opt.price === 0)
        return { name, options, isFreeGroup }
      })
      setOptionGroups(groupedArray)
    } else {
      setOptionGroups([])
    }
  }, [product])

  // Initialize state when modal opens or product changes
  useEffect(() => {
    if (isOpen && product) {
      // Set initial quantity
      setQuantity(editingItem?.quantity || 1)

      // Set initial selected options
      const initialRadioSelections: Record<string, ProductOption> = {}
      const initialCheckboxSelections: Record<string, ProductOption[]> = {}
      
      if (editingItem?.selectedOptions) {
        editingItem.selectedOptions.forEach(opt => {
          const group = optionGroups.find((g: ProductOptionGroup) => g.options.some((o: ProductOption) => o.id === opt.id))
          if (group) {
            if (group.isFreeGroup) {
              initialRadioSelections[group.name] = opt
            } else {
              if (!initialCheckboxSelections[group.name]) {
                initialCheckboxSelections[group.name] = []
              }
              initialCheckboxSelections[group.name].push(opt)
            }
          }
        })
      } else {
        // Default to first option in free groups only
        optionGroups.forEach((group: ProductOptionGroup) => {
          if (group.isFreeGroup && group.options.length > 0) {
            initialRadioSelections[group.name] = group.options[0]
          } else {
            initialCheckboxSelections[group.name] = []
          }
        })
      }
      setSelectedOptions(initialRadioSelections)
      setSelectedCheckboxes(initialCheckboxSelections)

      // Set initial notes
      const notesMatch = editingItem?.options?.match(/ - (.*)$/)
      setNotes(notesMatch ? notesMatch[1] : "")

    } else {
      // Reset on close
      setQuantity(1)
      setSelectedOptions({})
      setSelectedCheckboxes({})
      setNotes("")
    }
  }, [isOpen, product, editingItem, optionGroups])

  if (!product) return null

  const handleOptionChange = (groupName: string, option: ProductOption) => {
    setSelectedOptions((prev: Record<string, ProductOption>) => ({
      ...prev,
      [groupName]: option,
    }))
  }

  const handleCheckboxChange = (groupName: string, option: ProductOption, checked: boolean) => {
    setSelectedCheckboxes((prev: Record<string, ProductOption[]>) => {
      const current = prev[groupName] || []
      if (checked) {
        return { ...prev, [groupName]: [...current, option] }
      } else {
        return { ...prev, [groupName]: current.filter(opt => opt.id !== option.id) }
      }
    })
  }

  const handleSave = () => {
    // Combine radio selections and checkbox selections
    const radioOptions = Object.values(selectedOptions)
    const checkboxOptions = Object.values(selectedCheckboxes).flat()
    const finalOptions = [...radioOptions, ...checkboxOptions]
    
    onAddToCart(product, quantity, finalOptions, notes)
    onOpenChange(false)
  }

  // Calculate total price
  let basePrice = product.promotionPrice ?? product.price
  const radioOptionsPrice = Object.values(selectedOptions).reduce((sum, opt: ProductOption) => sum + (opt.price || 0), 0)
  const checkboxOptionsPrice = Object.values(selectedCheckboxes)
    .flat()
    .reduce((sum, opt: ProductOption) => sum + (opt.price || 0), 0)
  const totalPrice = (basePrice + radioOptionsPrice + checkboxOptionsPrice) * quantity

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b">
          <DialogTitle className="text-lg font-bold pr-8">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Product Image - More compact */}
          <div className="relative aspect-video w-full mb-3 rounded-lg overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Description - More compact */}
          {product.description && (
            <p className="text-xs text-gray-600 mb-4">{product.description}</p>
          )}

          {/* Options Groups - Compact layout */}
          <div className="space-y-4">
            {optionGroups.map((group: ProductOptionGroup) => (
              <div key={group.name}>
                <Label className="font-semibold text-sm mb-2 block">{group.name}</Label>
                
                {group.isFreeGroup ? (
                  // Free group - Use Radio (must select one)
                  <RadioGroup
                    value={selectedOptions[group.name]?.id}
                    onValueChange={(value) => {
                      const selected = group.options.find((opt: ProductOption) => opt.id === value)
                      if (selected) {
                        handleOptionChange(group.name, selected)
                      }
                    }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {group.options.map((option: ProductOption) => {
                      const isSelected = selectedOptions[group.name]?.id === option.id
                      return (
                        <div 
                          key={option.id} 
                          className={`flex items-center justify-between p-2.5 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleOptionChange(group.name, option)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <RadioGroupItem value={option.id} id={option.id} className="shrink-0" />
                            <Label 
                              htmlFor={option.id} 
                              className="cursor-pointer font-normal text-sm flex-1 truncate"
                            >
                              {option.name}
                            </Label>
                          </div>
                          <span className="text-xs font-medium text-gray-500 ml-1 shrink-0">
                            Miễn phí
                          </span>
                        </div>
                      )
                    })}
                  </RadioGroup>
                ) : (
                  // Paid group - Use Checkbox (optional)
                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((option: ProductOption) => {
                      const isChecked = selectedCheckboxes[group.name]?.some(opt => opt.id === option.id) || false
                      return (
                        <div 
                          key={option.id} 
                          className={`flex items-center justify-between p-2.5 border-2 rounded-lg transition-all cursor-pointer ${
                            isChecked 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleCheckboxChange(group.name, option, !isChecked)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(group.name, option, e.target.checked)}
                              className="shrink-0 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Label 
                              className="cursor-pointer font-normal text-sm flex-1 truncate"
                            >
                              {option.name}
                            </Label>
                          </div>
                          {option.price > 0 && (
                            <span className="text-xs font-semibold text-orange-600 ml-1 shrink-0">
                              +{option.price.toLocaleString()}₫
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <Label htmlFor="notes" className="font-semibold text-sm mb-1.5 block">
              Ghi chú thêm
            </Label>
            <Input
              id="notes"
              placeholder="Ví dụ: không cay, ít ngọt..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
              className="text-sm h-9"
            />
          </div>
        </div>

        {/* Footer - Fixed at bottom - Compact */}
        <div className="border-t px-4 py-3 bg-white">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Số lượng:</span>
              <div className="flex items-center gap-1 border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Tổng cộng</div>
              <div className="text-lg font-bold text-orange-600">{totalPrice.toLocaleString()}₫</div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 text-sm font-semibold"
          >
            {editingItem ? 'Cập nhật giỏ hàng' : 'Thêm vào giỏ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
