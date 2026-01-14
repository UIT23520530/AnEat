"use client"

import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Card } from "@/components/ui/card"
import { DollarSign, ShoppingBag, Package as PackageIcon, TrendingUp, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Order {
  id: string
  time: string
  items: number
  total: string
  status: "completed" | "pending"
}

const recentOrders: Order[] = [
  { id: "ord-001", time: "15:30", items: 3, total: "105.000đ", status: "completed" },
  { id: "ord-002", time: "16:15", items: 4, total: "110.000đ", status: "completed" },
  { id: "ord-003", time: "17:00", items: 1, total: "89.000đ", status: "pending" },
]

export default function DashboardPage() {
  return (
    <StaffLayout>
      <div className="flex flex-col h-full bg-gray-50">
        <StaffHeader />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tổng Quan</h1>
            <p className="text-sm text-gray-500 mt-1">Thống kê hoạt động hôm nay</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Revenue Card */}
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +12%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Doanh Thu Hôm Nay</p>
                <h3 className="text-2xl font-bold text-gray-900">215.000đ</h3>
              </div>
            </Card>

            {/* Orders Card */}
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">2 hoàn thành</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Đơn Hàng</p>
                <h3 className="text-2xl font-bold text-gray-900">3</h3>
              </div>
            </Card>

            {/* Items Card */}
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <PackageIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Tất cả món</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Số Lượng Món</p>
                <h3 className="text-2xl font-bold text-gray-900">8</h3>
              </div>
            </Card>

            {/* Pending Orders Card */}
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Đang xử lý</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Đơn Chờ</p>
                <h3 className="text-2xl font-bold text-gray-900">1</h3>
              </div>
            </Card>
          </div>

          {/* Recent Orders and Create New Order */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders Table */}
            <Card className="lg:col-span-2 bg-white border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Đơn Hàng Gần Đây</h2>
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
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{order.time}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{order.items}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.total}</td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                order.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              )}
                            >
                              {order.status === "completed" ? "Hoàn thành" : "Chờ xử lý"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* Create New Order Card */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none hover:shadow-xl transition-shadow">
              <Link href="/staff/orders">
                <div className="p-6 h-full flex flex-col items-center justify-center text-center cursor-pointer">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Plus className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Tạo đơn mới</h3>
                  <p className="text-orange-100 text-sm">Nhấn để bắt đầu đơn hàng mới</p>
                </div>
              </Link>
            </Card>
          </div>
        </main>
      </div>
    </StaffLayout>
  )
}