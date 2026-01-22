"use client"

import { useEffect, useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Card } from "@/components/ui/card"
import { DollarSign, ShoppingBag, Package as PackageIcon, TrendingUp, ShoppingCart, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { dashboardService, DashboardStats } from "@/services/dashboard.service"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  updatedAt?: string
  items: { id: string; quantity: number }[]
  total: number
  status: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Load dashboard data
  async function loadDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Fetch dashboard stats and recent orders
      const [statsResponse, ordersResponse] = await Promise.all([
        dashboardService.getStaffStats(),
        dashboardService.getStaffRecentOrders({ page: 1, limit: 5 })
      ])

      setStats(statsResponse.data)
      
      // Sort orders by updatedAt or createdAt (most recent first)
      const sortedOrders = ordersResponse.data.sort((a: Order, b: Order) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt).getTime()
        return dateB - dateA // Most recent first
      })
      
      setRecentOrders(sortedOrders)
      setLastUpdate(new Date())
    } catch (err: any) {
      console.error('Load dashboard error:', err)
      setError(err.message || 'Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadDashboard()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard(true)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Manual refresh handler
  const handleRefresh = () => {
    loadDashboard(true)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Format time - show update time if available, otherwise creation time
  const formatTime = (order: Order) => {
    const date = new Date(order.updatedAt || order.createdAt)
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const isUpdated = order.updatedAt && order.updatedAt !== order.createdAt
    return isUpdated ? `${time} (CN)` : time // CN = Cập nhật
  }

  // Calculate total items
  const getTotalItems = (items: { quantity: number }[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  // Format last update time
  const getLastUpdateText = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
    
    if (diff < 60) return `${diff} giây trước`
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    return lastUpdate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <StaffLayout>
      <div className="flex flex-col h-full bg-gray-50">
        <StaffHeader />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tổng Quan</h1>
              <p className="text-sm text-gray-500 mt-1">
                Thống kê hoạt động hôm nay • Cập nhật {getLastUpdateText()}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Làm mới
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">Lỗi tải dữ liệu</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Total Products Card */}
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <PackageIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Tổng cộng
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-0.5">Tổng Sản Phẩm</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.products?.total || 0}</h3>
                  </div>
                </Card>

                {/* Active Products Card */}
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Hoạt động</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-0.5">Đang Bán</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.products?.active || 0}</h3>
                  </div>
                </Card>

                {/* Low Stock Products Card */}
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      </div>
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Cảnh báo</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-0.5">Sắp Hết Hàng</p>
                    <h3 className="text-xl font-bold text-gray-900">{stats.products?.lowStock || 0}</h3>
                  </div>
                </Card>
              </div>

              {/* Recent Orders and Create New Order */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders Table */}
                <Card className="lg:col-span-2 bg-white border border-gray-200">
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">ĐƠN HÀNG GẦN ĐÂY</h2>
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Chưa có đơn hàng nào</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã Đơn</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thời Gian</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số Món</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tổng Tiền</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng Thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order) => (
                              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{formatTime(order)}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{getTotalItems(order.items)}</td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(order.total)}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                      order.status === "COMPLETED"
                                        ? "bg-green-100 text-green-700"
                                        : order.status === "PENDING"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : order.status === "PREPARING"
                                        ? "bg-blue-100 text-blue-700"
                                        : order.status === "CANCELLED"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                    )}
                                  >
                                    {order.status === "COMPLETED" ? "Hoàn thành" 
                                      : order.status === "PENDING" ? "Chờ xử lý"
                                      : order.status === "PREPARING" ? "Đang chuẩn bị"
                                      : order.status === "CANCELLED" ? "Đã hủy"
                                      : order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Create New Order Card */}
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none hover:shadow-xl transition-shadow">
                  <Link href="/staff/orders" className="block h-full">
                    <div className="p-6 h-full flex flex-col items-center justify-center cursor-pointer">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <ShoppingCart className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 text-center">Tạo đơn mới</h3>
                      <p className="text-orange-100 text-sm text-center">Nhấn để bắt đầu đơn hàng mới</p>
                    </div>
                  </Link>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </StaffLayout>
  )
}