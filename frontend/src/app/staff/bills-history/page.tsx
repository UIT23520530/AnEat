"use client"

import { useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Input } from "@/components/ui/input"
import { Search, Filter, Eye, X, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderItem {
  name: string
  quantity: number
}

interface Order {
  id: string
  customer: string
  time: string
  date: string
  items: OrderItem[]
  total: number
  payment: string
  status: "completed" | "pending"
}

interface FilterOption {
  id: string
  label: string
  value: string
  category: "status" | "payment" | "date"
}

const filterOptions: FilterOption[] = [
  { id: "status-all", label: "Tất cả trạng thái", value: "all", category: "status" },
  { id: "status-completed", label: "Hoàn thành", value: "completed", category: "status" },
  { id: "status-pending", label: "Chờ xử lý", value: "pending", category: "status" },
  { id: "payment-all", label: "Tất cả thanh toán", value: "all", category: "payment" },
  { id: "payment-cash", label: "Tiền mặt", value: "Tiền mặt", category: "payment" },
  { id: "payment-card", label: "Thẻ", value: "Thẻ", category: "payment" },
  { id: "date-today", label: "Hôm nay", value: "today", category: "date" },
  { id: "date-yesterday", label: "Hôm qua", value: "yesterday", category: "date" },
  { id: "date-week", label: "7 ngày qua", value: "week", category: "date" },
  { id: "date-month", label: "30 ngày qua", value: "month", category: "date" },
]

const orders: Order[] = [
  {
    id: "#ord-001",
    customer: "Nguyễn Văn A",
    time: "15:30",
    date: "02/01/2026",
    items: [
      { name: "Gà Rán Giòn", quantity: 2 },
      { name: "Pepsi", quantity: 1 },
    ],
    total: 105000,
    payment: "Tiền mặt",
    status: "completed",
  },
  {
    id: "#ord-002",
    customer: "Trần Thị B",
    time: "16:15",
    date: "02/01/2026",
    items: [
      { name: "Burger Bò Phô Mai", quantity: 1 },
      { name: "Khoai Tây Chiên", quantity: 1 },
      { name: "Pepsi", quantity: 1 },
    ],
    total: 110000,
    payment: "Thẻ",
    status: "completed",
  },
  {
    id: "#ord-003",
    customer: "Khách vãng lai",
    time: "17:00",
    date: "02/01/2026",
    items: [{ name: "Pizza Hải Sản", quantity: 1 }],
    total: 89000,
    payment: "Tiền mặt",
    status: "pending",
  },
]

export default function StaffBillsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<{
    status: string
    payment: string
    date: string
  }>({
    status: "all",
    payment: "all",
    date: "all",
  })

  const handleFilterChange = (category: "status" | "payment" | "date", value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [category]: value }))
  }

  const clearFilters = () => {
    setSelectedFilters({ status: "all", payment: "all", date: "all" })
  }

  const activeFilterCount = Object.values(selectedFilters).filter((v) => v !== "all").length

  const getActiveFilterLabel = () => {
    if (activeFilterCount === 0) return "Không có bộ lọc"
    const labels: string[] = []
    if (selectedFilters.status !== "all") {
      const option = filterOptions.find((o) => o.category === "status" && o.value === selectedFilters.status)
      if (option) labels.push(option.label)
    }
    if (selectedFilters.payment !== "all") {
      const option = filterOptions.find((o) => o.category === "payment" && o.value === selectedFilters.payment)
      if (option) labels.push(option.label)
    }
    if (selectedFilters.date !== "all") {
      const option = filterOptions.find((o) => o.category === "date" && o.value === selectedFilters.date)
      if (option) labels.push(option.label)
    }
    return labels.join(", ")
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedFilters.status === "all" || order.status === selectedFilters.status
    const matchesPayment = selectedFilters.payment === "all" || order.payment === selectedFilters.payment
    return matchesSearch && matchesStatus && matchesPayment
  })

  return (
    <StaffLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        <StaffHeader />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Lịch Sử Đơn Hàng</h1>
            <p className="text-sm text-gray-500 mt-1">Xem lại tất cả các đơn hàng đã thực hiện</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-gray-300"
              />
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.clear-filter-btn')) {
                    clearFilters()
                  } else {
                    setIsFilterDropdownOpen(!isFilterDropdownOpen)
                  }
                }}
                className="h-12 px-4 flex items-center gap-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white min-w-[250px] relative"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600 truncate flex-1 text-left">{getActiveFilterLabel()}</span>
                {activeFilterCount > 0 ? (
                  <span className="clear-filter-btn p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 cursor-pointer">
                    <X className="h-4 w-4 text-gray-500" />
                  </span>
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                )}
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isFilterDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />
                  <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[500px] overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {/* Status Filter */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Trạng Thái</h3>
                        <div className="space-y-1">
                          {filterOptions
                            .filter((opt) => opt.category === "status")
                            .map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleFilterChange("status", option.value)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <span className="text-sm text-gray-700">{option.label}</span>
                                {selectedFilters.status === option.value && (
                                  <Check className="h-4 w-4 text-orange-500" />
                                )}
                              </button>
                            ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Payment Filter */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Thanh Toán</h3>
                        <div className="space-y-1">
                          {filterOptions
                            .filter((opt) => opt.category === "payment")
                            .map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleFilterChange("payment", option.value)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <span className="text-sm text-gray-700">{option.label}</span>
                                {selectedFilters.payment === option.value && (
                                  <Check className="h-4 w-4 text-orange-500" />
                                )}
                              </button>
                            ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Date Filter */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Thời Gian</h3>
                        <div className="space-y-1">
                          {filterOptions
                            .filter((opt) => opt.category === "date")
                            .map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleFilterChange("date", option.value)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <span className="text-sm text-gray-700">{option.label}</span>
                                {selectedFilters.date === option.value && (
                                  <Check className="h-4 w-4 text-orange-500" />
                                )}
                              </button>
                            ))}
                        </div>
                      </div>

                      {activeFilterCount > 0 && (
                        <>
                          <div className="border-t border-gray-200" />
                          <button
                            onClick={() => {
                              clearFilters()
                              setIsFilterDropdownOpen(false)
                            }}
                            className="w-full py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            Xóa tất cả bộ lọc
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã Đơn</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách Hàng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thời Gian</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Chi Tiết</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng Tiền</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thanh Toán</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng Thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.time}
                        <br />
                        {order.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items.map((item, index) => (
                          <div key={index}>
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {order.total.toLocaleString()}đ
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.payment}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {order.status === "completed" ? "Hoàn thành" : "Chờ xử lý"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="h-5 w-5 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
