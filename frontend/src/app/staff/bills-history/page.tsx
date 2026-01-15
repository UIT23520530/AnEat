"use client"

import { useState, useEffect } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Input } from "@/components/ui/input"
import { Search, Filter, ChevronDown, X, Check, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { staffBillsHistoryService, BillDTO } from "@/services/staff-bills-history.service"

interface FilterOption {
  id: string
  label: string
  value: string
  category: "status" | "payment"
}

const filterOptions: FilterOption[] = [
  { id: "status-all", label: "Tất cả trạng thái", value: "all", category: "status" },
  { id: "status-issued", label: "Đã phát hành", value: "ISSUED", category: "status" },
  { id: "status-paid", label: "Đã thanh toán", value: "PAID", category: "status" },
  { id: "status-cancelled", label: "Đã hủy", value: "CANCELLED", category: "status" },
  { id: "payment-all", label: "Tất cả thanh toán", value: "all", category: "payment" },
  { id: "payment-pending", label: "Chờ thanh toán", value: "PENDING", category: "payment" },
  { id: "payment-paid", label: "Đã thanh toán", value: "PAID", category: "payment" },
  { id: "payment-failed", label: "Thất bại", value: "FAILED", category: "payment" },
]

export default function StaffBillsHistoryPage() {
  const [bills, setBills] = useState<BillDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<{
    status: string
    payment: string
  }>({
    status: "all",
    payment: "all",
  })

  // Load bills from API
  useEffect(() => {
    loadBills()
  }, [page, searchQuery, selectedFilters])

  const loadBills = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await staffBillsHistoryService.getList({
        page,
        limit: 20,
        search: searchQuery || undefined,
        status: selectedFilters.status !== 'all' ? selectedFilters.status as any : undefined,
        paymentStatus: selectedFilters.payment !== 'all' ? selectedFilters.payment as any : undefined,
        sort: 'createdAt',
        order: 'desc'
      })
      setBills(response.data)
      setTotalPages(response.meta.total_pages)
    } catch (err: any) {
      console.error('Load bills error:', err)
      setError('Không thể tải danh sách hóa đơn')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (category: "status" | "payment", value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [category]: value }))
    setPage(1) // Reset to page 1 when filter changes
  }

  const clearFilters = () => {
    setSelectedFilters({ status: "all", payment: "all" })
    setPage(1)
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
    return labels.join(", ")
  }

  // Format helpers
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return '-'
    const map: Record<string, string> = {
      'CASH': 'Tiền mặt',
      'CARD': 'Thẻ',
      'BANK_TRANSFER': 'Chuyển khoản',
      'E_WALLET': 'Ví điện tử'
    }
    return map[method] || method
  }

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      'DRAFT': 'Nháp',
      'ISSUED': 'Đã phát hành',
      'PAID': 'Đã thanh toán',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền'
    }
    return map[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ISSUED': 'bg-blue-100 text-blue-700',
      'PAID': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700',
      'REFUNDED': 'bg-yellow-100 text-yellow-700',
      'DRAFT': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

          {/* Loading & Error States */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={loadBills} className="mt-2 text-sm text-red-700 underline">
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && bills.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Không tìm thấy hóa đơn nào</p>
            </div>
          )}

          {/* Orders Table */}
          {!loading && !error && bills.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã Hóa Đơn</th>
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
                    {bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{bill.billNumber}</div>
                          {bill.isEdited && (
                            <div className="text-xs text-orange-600 mt-1">
                              Đã chỉnh sửa ({bill.editCount} lần)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{bill.customerName || 'Khách vãng lai'}</div>
                          {bill.customerPhone && (
                            <div className="text-xs text-gray-500">{bill.customerPhone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatTime(bill.createdAt)}
                          <br />
                          {formatDate(bill.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {bill.order?.items && bill.order.items.length > 0 ? (
                            <>
                              {bill.order.items.slice(0, 3).map((item, index) => (
                                <div key={index}>
                                  {item.quantity}x {item.product.name}
                                </div>
                              ))}
                              {bill.order.items.length > 3 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  +{bill.order.items.length - 3} món khác
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {bill.total.toLocaleString()}₫
                          </div>
                          {bill.discountAmount > 0 && (
                            <div className="text-xs text-gray-500">
                              Giảm: {bill.discountAmount.toLocaleString()}₫
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatPaymentMethod(bill.paymentMethod)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                              getStatusColor(bill.status)
                            )}
                          >
                            {formatStatus(bill.status)}
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
          )}
        </div>
      </div>
    </StaffLayout>
  )
}
