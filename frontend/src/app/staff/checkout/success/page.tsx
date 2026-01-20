"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Printer, FileText } from "lucide-react"
import { InvoicePrintModal } from "@/components/forms/admin/InvoicePrintModal"
import staffOrderService from "@/services/staff-order.service"

export default function StaffCheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState({
    orderId: "",
    orderNumber: "",
    total: 0,
  })

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [invoice, setInvoice] = useState<any | null>(null)

  const getPaymentMethodText = (method: string | null) => {
    switch (method) {
      case "CASH": return "Tiền mặt"
      case "CARD": return "Thẻ"
      case "BANK_TRANSFER": return "Chuyển khoản"
      case "E_WALLET": return "Ví điện tử (MoMo)"
      default: return method || "Không xác định"
    }
  }

  useEffect(() => {
    const orderId = searchParams.get("orderId")
    const orderNumber = searchParams.get("orderNumber")
    const total = searchParams.get("total")

    setOrderData({
      orderId: orderId || "",
      orderNumber: orderNumber || "ORD-XXXXX",
      total: total ? Number(total) : 0,
    })

    if (orderId) {
      // Load order details to prepare thermal receipt data
      staffOrderService.getOrderById(orderId).then((response) => {
        if (response.success && response.data) {
          const order = response.data
          const items = (order.items || []).map((it: any) => ({
            name: it.name,
            quantity: it.quantity || 0,
            price: it.price || 0,
            total: (it.price || 0) * (it.quantity || 0),
          }))

          // Cập nhật orderData với tổng tiền từ đơn hàng thực tế
          setOrderData(prev => ({
            ...prev,
            total: order.total || prev.total,
            orderNumber: order.orderNumber || prev.orderNumber,
          }))

          setInvoice({
            billNumber: order.billNumber || order.orderNumber,
            orderNumber: order.orderNumber,
            date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
            time: new Date(order.createdAt).toLocaleTimeString("vi-VN"),
            branchName: order.branch?.name || "AnEat",
            branchAddress: order.branch?.address || "",
            customerName: order.customer?.name || "Khách lẻ",
            customerPhone: order.customer?.phone || "",
            customerAddress: order.deliveryAddress || undefined,
            items,
            subtotal: order.subtotal || 0,
            tax: Math.round(((order.subtotal || 0) - (order.discountAmount || 0)) * 0.08),
            discount: order.discountAmount || 0,
            total: order.total || 0,
            paymentMethod: order.paymentMethod || "CASH",
            staffName: order.staff?.name || "",
            notes: order.notes || undefined,
          })
        }
      }).catch(() => {
        // ignore
      })
    }
  }, [searchParams])

  const handlePrintReceipt = () => {
    if (!invoice) return
    setIsPrintModalOpen(true)
  }

  const handleNewOrder = () => {
    router.push("/staff/orders")
  }

  const handleViewOrder = () => {
    if (orderData.orderId) {
      router.push(`/staff/orders/${orderData.orderId}`)
    }
  }

  return (
    <StaffLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        <StaffHeader />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
            <Card className="max-w-lg w-full shadow-xl">
              <CardContent className="p-10 text-center">
                {/* Success Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                </div>

                {/* Success Message */}
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Đơn hàng thành công!
                </h2>
                <p className="text-gray-600 mb-8">
                  Đơn hàng đã được tạo và thanh toán thành công
                </p>

                {/* Order Details */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl mb-8 border-2 border-orange-200">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orderData.orderNumber}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-orange-200">
                    <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {(orderData.total || 0).toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Đơn hàng đã được lưu vào hệ thống và có thể theo dõi tại phần quản lý đơn hàng
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 gap-5 flex flex-col">
                  <Button
                    onClick={handlePrintReceipt}
                    className="w-full bg-gray-700 hover:bg-gray-800 !text-white py-6 rounded-lg text-base font-semibold flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    In hoá đơn
                  </Button>

                  <Button
                    onClick={handleViewOrder}
                    variant="outline"
                    className="w-full py-6 rounded-lg text-base font-semibold border-2 border-orange-500 text-orange-600 hover:bg-orange-50 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Xem chi tiết đơn hàng
                  </Button>

                  <Button
                    onClick={handleNewOrder}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-lg text-base font-semibold flex items-center justify-center gap-2"
                  >
                    Tạo đơn hàng mới
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Thời gian: {new Date().toLocaleString("vi-VN")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <InvoicePrintModal
        open={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={invoice}
        onConfirmPrint={() => {
          setIsPrintModalOpen(false)
          window.print()
        }}
        getPaymentMethodText={getPaymentMethodText}
      />
    </StaffLayout>
  )
}
