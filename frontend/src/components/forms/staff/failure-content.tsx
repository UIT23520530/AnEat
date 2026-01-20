"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, AlertCircle, Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import staffOrderService from "@/services/staff-order.service"
import staffCheckoutService from "@/services/staff-checkout.service"

export default function StaffCheckoutFailureContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState({
    orderId: "",
    orderNumber: "",
    total: 0,
    errorMessage: "",
  })
  const [orderDetail, setOrderDetail] = useState<any | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const orderId = searchParams.get("orderId")
    const orderNumber = searchParams.get("orderNumber")
    const total = searchParams.get("total")
    const message = searchParams.get("message")

    setOrderData({
      orderId: orderId || "",
      orderNumber: orderNumber || "ORD-XXXXX",
      total: total ? Number(total) : 0,
      errorMessage: message || "Có lỗi xảy ra trong quá trình thanh toán",
    })

    // Fetch order details if orderId exists
    if (orderId) {
      setLoadingOrder(true)
      staffOrderService.getOrderById(orderId)
        .then((response) => {
          if (response.success && response.data) {
            setOrderDetail(response.data)
            setOrderData(prev => ({
              ...prev,
              orderNumber: response.data.orderNumber || prev.orderNumber,
              total: response.data.total || prev.total,
            }))
          }
        })
        .catch((err) => {
          console.error('Failed to load order:', err)
          toast.error('Đơn hàng không tồn tại hoặc đã bị xóa')
        })
        .finally(() => {
          setLoadingOrder(false)
        })
    }
  }, [searchParams])

  const handleRetry = async () => {
    if (!orderData.orderId || !orderDetail) {
      toast.error('Đơn hàng không hợp lệ')
      return
    }

    try {
      setRetrying(true)
      toast.info('Đang tạo liên kết thanh toán mới...')

      // Generate new MoMo payment link using service
      const result = await staffCheckoutService.retryMoMoPayment(
        orderData.orderId,
        orderData.orderNumber,
        orderData.total
      )

      if (result.success && result.redirectUrl) {
        toast.success('Chuyển hướng đến trang thanh toán...')
        window.location.href = result.redirectUrl
      } else {
        throw new Error(result.error || 'Không lấy được link thanh toán MoMo!')
      }
    } catch (error: any) {
      console.error('Retry payment error:', error)
      toast.error(error.message || 'Không thể tạo liên kết thanh toán mới')
    } finally {
      setRetrying(false)
    }
  }

  const handleBackToOrders = () => {
    router.push("/staff/orders")
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Card className="max-w-lg w-full shadow-xl">
          <CardContent className="p-10 text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Thanh toán thất bại!
            </h2>
            <p className="text-gray-600 mb-8">
              Đơn hàng chưa được hoàn tất
            </p>

            {/* Order Details */}
            {orderData.orderNumber !== "ORD-XXXXX" && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl mb-6 border-2 border-gray-200">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderData.orderNumber}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Số tiền</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {(orderData.total || 0).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            )}

            {/* Error Details */}
            <div className="bg-red-50 p-4 rounded-lg mb-8 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  Lý do thất bại:
                </p>
                <p className="text-sm text-red-700">
                  {orderData.errorMessage}
                </p>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 Vui lòng kiểm tra lại thông tin thanh toán hoặc thử phương thức thanh toán khác
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {orderData.orderId && orderDetail && (
                <Button
                  onClick={handleRetry}
                  disabled={retrying || loadingOrder}
                  className="w-full bg-orange-500 hover:bg-orange-600 !text-white py-6 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {retrying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tạo liên kết...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Thanh toán MoMo lại
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleBackToOrders}
                variant="outline"
                disabled={retrying}
                className="w-full py-6 rounded-lg text-base font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Tạo đơn hàng mới
              </Button>
            </div>

            {/* Contact Support */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Cần hỗ trợ? Liên hệ quản lý hoặc IT support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
