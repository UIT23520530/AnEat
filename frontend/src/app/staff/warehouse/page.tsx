"use client"

import { useState, useEffect } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { WarehouseFormModal } from "@/components/forms/staff/warehouse-form-modal"
import { Search, Plus, AlertTriangle, Edit, Package, Clock, CheckCircle, XCircle, Ban, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { staffWarehouseService, InventoryItemDTO } from "@/services/staff-warehouse.service"
import { staffStockRequestService, StockRequest, CreateStockRequestDto } from "@/services/staff-stock-request.service"

// Using InventoryItemDTO from service
// Using StockRequest from service

interface InventoryStats {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalQuantity: number
}

export default function WarehousePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<InventoryItemDTO | null>(null)
  const [activeTab, setActiveTab] = useState<"inventory" | "requests">("inventory")
  const [editingItem, setEditingItem] = useState<InventoryItemDTO | null>(null)
  const [modalMode, setModalMode] = useState<"request" | "edit">("request")
  
  // Inventory state
  const [inventoryItems, setInventoryItems] = useState<InventoryItemDTO[]>([])
  const [inventoryLoading, setInventoryLoading] = useState(true)
  const [inventoryError, setInventoryError] = useState<string | null>(null)
  const [inventoryPage, setInventoryPage] = useState(1)
  const [inventoryTotalPages, setInventoryTotalPages] = useState(1)
  const [stats, setStats] = useState<InventoryStats | null>(null)
  
  // Stock requests state
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState<string | null>(null)
  const [requestsPage, setRequestsPage] = useState(1)
  const [requestsTotalPages, setRequestsTotalPages] = useState(1)
  
  // Load inventory data
  useEffect(() => {
    if (activeTab === 'inventory') {
      loadInventory()
      loadStats()
    }
  }, [activeTab, inventoryPage, searchQuery])

  // Load stock requests
  useEffect(() => {
    if (activeTab === 'requests') {
      loadStockRequests()
    }
  }, [activeTab, requestsPage, searchQuery])

  const loadInventory = async () => {
    try {
      setInventoryLoading(true)
      setInventoryError(null)
      const response = await staffWarehouseService.getInventoryList({
        page: inventoryPage,
        limit: 20,
        search: searchQuery || undefined,
        sort: 'name',
        order: 'asc'
      })
      // Ensure data is always an array
      setInventoryItems(Array.isArray(response.data) ? response.data : [])
      setInventoryTotalPages(response.meta?.total_pages || 1)
    } catch (err: any) {
      console.error('Load inventory error:', err)
      // Only show error for actual API failures
      if (err.response?.status === 500 || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        setInventoryError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
      } else {
        setInventoryError('Không thể tải danh sách kho hàng')
      }
      setInventoryItems([]) // Set empty array on error
    } finally {
      setInventoryLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await staffWarehouseService.getInventoryStats()
      setStats(response.data)
    } catch (err) {
      console.error('Load stats error:', err)
    }
  }

  const loadStockRequests = async () => {
    try {
      setRequestsLoading(true)
      setRequestsError(null)
      const response = await staffStockRequestService.getList({
        page: requestsPage,
        limit: 20,
        search: searchQuery || undefined
      })
      // Ensure data is always an array
      setStockRequests(Array.isArray(response.data) ? response.data : [])
      setRequestsTotalPages(response.meta?.totalPages || 1)
    } catch (err: any) {
      console.error('Load stock requests error:', err)
      // Only show error for actual API failures
      if (err.response?.status === 500 || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        setRequestsError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
      } else {
        setRequestsError('Không thể tải danh sách yêu cầu nhập kho')
      }
      setStockRequests([]) // Set empty array on error
    } finally {
      setRequestsLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'inventory') {
        setInventoryPage(1)
      } else {
        setRequestsPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleCreateRequest = (product: InventoryItemDTO) => {
    setSelectedProduct(product)
    setModalMode("request")
    setIsModalOpen(true)
  }

  const handleSubmitRequest = async (requestData: any) => {
    try {
      if (!selectedProduct) return
      
      const createData: CreateStockRequestDto = {
        productId: selectedProduct.id,
        type: requestData.type || 'RESTOCK',
        requestedQuantity: requestData.requestedQuantity,
        notes: requestData.notes,
        expectedDate: requestData.expectedDate
      }
      
      await staffStockRequestService.create(createData)
      
      // Reload stock requests
      if (activeTab === 'requests') {
        await loadStockRequests()
      }
      
      // Close modal
      setIsModalOpen(false)
      setSelectedProduct(null)
    } catch (err: any) {
      console.error('Create request error:', err)
      alert('Không thể tạo yêu cầu nhập kho')
    }
  }

  const handleCancelRequest = async (id: string) => {
    if (confirm("Bạn có chắc muốn hủy yêu cầu này?")) {
      try {
        await staffStockRequestService.cancel(id)
        await loadStockRequests()
      } catch (err: any) {
        console.error('Cancel request error:', err)
        alert('Không thể hủy yêu cầu')
      }
    }
  }

  // Low stock items from inventory (hasAlert flag from backend)
  const lowStockItems = inventoryItems.filter((item) => item.hasAlert)

  // Format helpers
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const getRequestStatus = (status: string) => {
    const configs: Record<string, { color: string; text: string; icon: any }> = {
      PENDING: { color: "text-orange-600 bg-orange-50", text: "Chờ duyệt", icon: Clock },
      APPROVED: { color: "text-blue-600 bg-blue-50", text: "Đã duyệt", icon: CheckCircle },
      REJECTED: { color: "text-red-600 bg-red-50", text: "Từ chối", icon: XCircle },
      COMPLETED: { color: "text-green-600 bg-green-50", text: "Hoàn thành", icon: CheckCircle },
      CANCELLED: { color: "text-gray-600 bg-gray-50", text: "Đã hủy", icon: Ban },
    }
    return configs[status] || configs.PENDING
  }

  const getTypeText = (type: string) => {
    const types: Record<string, string> = {
      RESTOCK: "Nhập hàng",
      ADJUSTMENT: "Điều chỉnh",
      RETURN: "Trả hàng",
    }
    return types[type] || type
  }

  return (
    <StaffLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        <StaffHeader />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Kho Hàng</h1>
            <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý nguyên liệu, hàng tồn kho</p>
          </div>

          {/* Low Stock Alert */}
              {lowStockItems.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Cảnh báo: Có {lowStockItems.length} mặt hàng sắp hết hàng
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {lowStockItems.map((item) => item.name).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
         
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("inventory")}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "inventory"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                Tồn kho ({inventoryItems.length})
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "requests"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                Yêu cầu nhập kho ({stockRequests.length})
              </button>
            </div>
          </div>

          {activeTab === "inventory" && (
            <>
              {/* Search Bar */}
              <div className="mb-6 flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-gray-300"
                  />
                </div>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 !text-white ml-4" 
                  onClick={() => {
                    setSelectedProduct(null)
                    setModalMode("request")
                    setIsModalOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo yêu cầu nhanh
                </Button>
              </div>

              {/* Loading & Error States */}
              {inventoryLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              )}

              {inventoryError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600 text-sm">{inventoryError}</p>
                  <button onClick={loadInventory} className="mt-2 text-sm text-red-700 underline">
                    Thử lại
                  </button>
                </div>
              )}

              {!inventoryLoading && !inventoryError && inventoryItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-1">Không có sản phẩm trong kho</p>
                  <p className="text-sm text-gray-500">
                    {searchQuery 
                      ? "Không tìm thấy sản phẩm phù hợp với từ khóa tìm kiếm"
                      : "Chi nhánh chưa có sản phẩm nào trong kho"}
                  </p>
                </div>
              )}

              {/* Warehouse Table */}
              {!inventoryLoading && !inventoryError && inventoryItems.length > 0 && (
                <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên Hàng</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh Mục</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Số Lượng</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá Vốn</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá Bán</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng Thái</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cập Nhật</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventoryItems.map((item) => {
                          const isLowStock = item.hasAlert
                          return (
                            <tr
                              key={item.id}
                              className={cn("hover:bg-gray-50 transition-colors", isLowStock && "bg-red-50")}
                            >
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.code}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                  {item.name}
                                  {isLowStock && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {item.category?.name || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={cn("font-semibold", isLowStock ? "text-red-600" : "text-gray-900")}>
                                  {item.quantity}
                                </span>
                                {isLowStock && (
                                  <div className="text-xs text-red-600 mt-1">Dưới 50</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {item.costPrice.toLocaleString()}₫
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                {item.price.toLocaleString()}₫
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={cn(
                                    "inline-flex items-center px-4 py-1 rounded-sm text-xs font-medium",
                                    item.isAvailable
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-700"
                                  )}
                                >
                                  {item.isAvailable ? "Có sẵn" : "Hết hàng"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatTime(item.updatedAt)}
                                <br />
                                {formatDate(item.updatedAt)}
                              </td>
                              <td className="px-6 py-4">
                                <Button
                                  size="sm"
                                  className="bg-orange-500 hover:bg-orange-600 !text-white"
                                  onClick={() => handleCreateRequest(item)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Yêu cầu nhập
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "requests" && (
            <>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Tìm theo mã yêu cầu hoặc sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-gray-300"
                  />
                </div>
              </div>

              {/* Loading & Error States */}
              {requestsLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              )}

              {requestsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600 text-sm">{requestsError}</p>
                  <button onClick={loadStockRequests} className="mt-2 text-sm text-red-700 underline">
                    Thử lại
                  </button>
                </div>
              )}

              {!requestsLoading && !requestsError && stockRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-1">Không có yêu cầu nhập kho</p>
                  <p className="text-sm text-gray-500">
                    {searchQuery 
                      ? "Không tìm thấy yêu cầu phù hợp với từ khóa tìm kiếm"
                      : "Chưa có yêu cầu nhập kho nào được tạo"}
                  </p>
                </div>
              )}

              {/* Requests Table */}
              {!requestsLoading && !requestsError && stockRequests.length > 0 && (
                <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã yêu cầu</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Loại</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SL yêu cầu</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SL duyệt</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày yêu cầu</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày dự kiến</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stockRequests.map((request) => {
                          const statusConfig = getRequestStatus(request.status)
                          const StatusIcon = statusConfig.icon
                          return (
                            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-100 text-blue-700">
                                  {request.requestNumber}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {request.product.code}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{getTypeText(request.type)}</td>
                              <td className="px-6 py-4 text-sm text-center font-semibold">{request.requestedQuantity}</td>
                              <td className="px-6 py-4 text-sm text-center font-semibold text-green-600">
                                {request.approvedQuantity || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={cn("inline-flex items-center px-3 py-1 rounded text-xs font-medium whitespace-nowrap", statusConfig.color)}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConfig.text}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {request.requestedDate ? formatDate(request.requestedDate) : formatDate(request.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {request.expectedDate ? formatDate(request.expectedDate) : "-"}
                              </td>
                              <td className="px-6 py-4">
                                {(request.status === "PENDING" || request.status === "APPROVED") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleCancelRequest(request.id)}
                                  >
                                    Hủy yêu cầu
                                  </Button>
                                )}
                                {request.status === "REJECTED" && request.rejectedReason && (
                                  <div className="text-xs text-red-600">
                                    {request.rejectedReason}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Warehouse Form Modal */}
          <WarehouseFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedProduct(null)
            }}
            onSubmit={handleSubmitRequest}
            products={inventoryItems}
            selectedProduct={selectedProduct}
          />
        </div>
      </div>
    </StaffLayout>
  )
}
