"use client"

import { useState, useEffect } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomerFormModal } from "@/components/forms/staff/customer-form-modal"
import { Search, Plus, Edit, EyeOff, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { staffCustomerService, CustomerDTO } from "@/services/staff-customer.service"
import { toast } from "sonner"

// Use DTO from service with _count field
interface CustomerWithCount extends CustomerDTO {
  _count?: {
    orders: number
    reviews: number
  }
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithCount | null>(null)
  const [customers, setCustomers] = useState<CustomerWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Load customers from API
  useEffect(() => {
    loadCustomers()
  }, [page, searchQuery])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await staffCustomerService.getList({
        page,
        limit: 20,
        search: searchQuery || undefined,
        sort: 'createdAt',
        order: 'desc'
      })
      setCustomers(response.data as CustomerWithCount[])
      setTotalPages(response.meta.total_pages)
      setTotalItems(response.meta.total_items)
    } catch (err: any) {
      console.error('Load customers error:', err)
      setError('Không thể tải danh sách khách hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer: CustomerWithCount) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleHideCustomer = async (customerId: string) => {
    // Thông báo cảnh báo (không chặn thao tác)
    toast.message("Ẩn khách hàng", {
      description: "Khách hàng sẽ bị ẩn (xóa tạm) và có thể khôi phục sau. Họ sẽ không xuất hiện trong tìm kiếm và khi tạo đơn.",
    })

    try {
      await staffCustomerService.delete(customerId)
      toast.success('Ẩn khách hàng thành công')
      loadCustomers()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi ẩn khách hàng'
      toast.error(errorMessage)
    }
  }

  const handleSubmitCustomer = async (customerData: { name: string; phone: string; email: string }) => {
    try {
      if (editingCustomer) {
        // Update existing customer
        await staffCustomerService.update(editingCustomer.id, {
          name: customerData.name,
          email: customerData.email || undefined
        })
      } else {
        // Create new customer
        await staffCustomerService.create({
          phone: customerData.phone,
          name: customerData.name,
          email: customerData.email || undefined
        })
      }
      setIsModalOpen(false)
      setEditingCustomer(null)
      loadCustomers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu khách hàng')
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1) // Reset to page 1 when searching
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <StaffLayout>
      <div className="flex flex-col h-full bg-gray-50">
        <StaffHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h1>
              <p className="text-sm text-gray-500 mt-1">Danh sách khách hàng thân thiết</p>
            </div>
            <Button className="bg-red-500 hover:bg-red-500 !text-white" onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Khách Hàng
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khách hàng (tên, SĐT, email)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-300"
              />
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
              <Button onClick={loadCustomers} variant="outline" size="sm" className="mt-2">
                Thử lại
              </Button>
            </div>
          )}

          {!loading && !error && customers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Không tìm thấy khách hàng nào</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tên Khách Hàng</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số Điện Thoại</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Điểm Tích Lũy</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tổng Đơn</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày Tạo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {!loading && customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.phone}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.email || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {customer.points} điểm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer._count?.orders || 0}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(customer.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleHideCustomer(customer.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Ẩn khách hàng (xóa tạm)"
                        >
                          <EyeOff className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{customers.length}</span> / <span className="font-medium">{totalItems}</span> kết quả
                </div>
                {totalPages > 1 && (
                  <div className="text-sm text-gray-500">
                    Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                  </div>
                )}
              </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      page === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "min-w-[40px] h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors",
                            pageNum === page
                              ? "bg-orange-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      page === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          {/* Customer Form Modal */}
          <CustomerFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setEditingCustomer(null)
            }}
            onSubmit={handleSubmitCustomer}
            customer={editingCustomer}
          />
        </main>
      </div>
    </StaffLayout>
  )
}