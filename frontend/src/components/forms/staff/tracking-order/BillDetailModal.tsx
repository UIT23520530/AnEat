import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, DollarSign, User } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BillDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: any
}

export function BillDetailModal({
  open,
  onOpenChange,
  bill
}: BillDetailModalProps) {
  if (!bill) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-500" />
            Chi Tiết Hóa Đơn
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Bill Number */}
          <div className="bg-gray-50 rounded-lg p-4">
            <Label className="text-xs text-gray-500">Mã hóa đơn</Label>
            <p className="text-lg font-bold text-gray-900">{bill.billNumber}</p>
            <Badge variant="outline" className="mt-2">Đã phát hành</Badge>
          </div>

          {/* Customer Info */}
          {(bill.customerName || bill.customerPhone) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông Tin Khách Hàng
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Tên khách hàng</Label>
                  <p className="text-sm font-medium">{bill.customerName || 'Khách vãng lai'}</p>
                </div>
                {bill.customerPhone && (
                  <div>
                    <Label className="text-xs text-gray-500">Số điện thoại</Label>
                    <p className="text-sm font-medium">{bill.customerPhone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Chi Tiết Đơn Hàng
            </h3>
            {bill.items && bill.items.length > 0 ? (
              <div className="space-y-2">
                {bill.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    {item.productImage && (
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.price.toLocaleString()}₫ x {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {item.total.toLocaleString()}₫
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Không có sản phẩm</p>
            )}
          </div>

          {/* Payment Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Thông Tin Thanh Toán
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">{bill.subtotal.toLocaleString()}₫</span>
              </div>
              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-medium text-orange-600">-{bill.discountAmount.toLocaleString()}₫</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (8%)</span>
                <span className="font-medium">{bill.taxAmount.toLocaleString()}₫</span>
              </div>
              <Separator />
              <div className="flex justify-between pt-2">
                <span className="text-base font-bold">Tổng cộng</span>
                <span className="text-lg font-bold text-orange-600">{bill.total.toLocaleString()}₫</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600">Phương thức thanh toán</span>
                {bill.paymentMethod ? (
                  <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                    bill.paymentMethod === 'CASH' && 'bg-green-100 text-green-700',
                    bill.paymentMethod === 'CARD' && 'bg-blue-100 text-blue-700',
                    bill.paymentMethod === 'E_WALLET' && 'bg-purple-100 text-purple-700',
                    bill.paymentMethod === 'BANK_TRANSFER' && 'bg-red-100 text-red-700'
                  )}>
                    {bill.paymentMethod === 'CASH' && 'Tiền mặt'}
                    {bill.paymentMethod === 'CARD' && 'Thẻ'}
                    {bill.paymentMethod === 'E_WALLET' && 'Ví điện tử'}
                    {bill.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản'}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Chưa thanh toán</span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              className="bg-orange-500 hover:bg-orange-600 !text-white w-full"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
