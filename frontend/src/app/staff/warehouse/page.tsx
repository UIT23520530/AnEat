"use client"

import { useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { WarehouseFormModal } from "@/components/forms/staff/warehouse-form-modal"
import { Search, Plus, AlertTriangle, Edit, Package, Clock, CheckCircle, XCircle, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

interface WarehouseItem {
  id: string
  name: string
  category: string
  unit: string
  quantity: number
  minLevel: number
  price: number
  lastUpdate: string
}

interface StockRequest {
  id: string
  requestNumber: string
  productName: string
  type: "RESTOCK" | "ADJUSTMENT" | "RETURN"
  requestedQuantity: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED"
  requestedDate: string
  expectedDate?: string
  notes?: string
}

interface Statistics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  completedRequests: number
  rejectedRequests: number
  cancelledRequests: number
}

export default function WarehousePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<WarehouseItem | null>(null)
  const [activeTab, setActiveTab] = useState<"inventory" | "requests">("inventory")
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([
    {
      id: "1",
      name: "Thịt Gà",
      category: "Nguyên liệu chính",
      unit: "kg",
      quantity: 45,
      minLevel: 20,
      price: 85000,
      lastUpdate: "15:00 02-01",
    },
    {
      id: "2",
      name: "Khoai Tây",
      category: "Nguyên liệu chính",
      unit: "kg",
      quantity: 15,
      minLevel: 30,
      price: 25000,
      lastUpdate: "14:30 02-01",
    },
    {
      id: "3",
      name: "Bánh Mì Burger",
      category: "Bánh",
      unit: "cái",
      quantity: 120,
      minLevel: 50,
      price: 3000,
      lastUpdate: "16:00 02-01",
    },
    {
      id: "4",
      name: "Phở Mai",
      category: "Phụ liệu",
      unit: "lát",
      quantity: 200,
      minLevel: 100,
      price: 2500,
      lastUpdate: "15:30 02-01",
    },
    {
      id: "5",
      name: "Pepsi",
      category: "Đồ uống",
      unit: "chai",
      quantity: 8,
      minLevel: 50,
      price: 8000,
      lastUpdate: "23:00 01-01",
    },
  ])

  const [stockRequests, setStockRequests] = useState<StockRequest[]>([
    {
      id: "1",
      requestNumber: "REQ-001",
      productName: "Thịt Gà",
      type: "RESTOCK",
      requestedQuantity: 50,
      status: "PENDING",
      requestedDate: "14/01/2026",
      expectedDate: "20/01/2026",
      notes: "Cần gấp cho tuần sau",
    },
    {
      id: "2",
      requestNumber: "REQ-002",
      productName: "Khoai Tây",
      type: "RESTOCK",
      requestedQuantity: 30,
      status: "APPROVED",
      requestedDate: "13/01/2026",
      expectedDate: "18/01/2026",
    },
  ])

  const statistics: Statistics = {
    totalRequests: stockRequests.length,
    pendingRequests: stockRequests.filter((r) => r.status === "PENDING").length,
    approvedRequests: stockRequests.filter((r) => r.status === "APPROVED").length,
    completedRequests: stockRequests.filter((r) => r.status === "COMPLETED").length,
    rejectedRequests: stockRequests.filter((r) => r.status === "REJECTED").length,
    cancelledRequests: stockRequests.filter((r) => r.status === "CANCELLED").length,
  }

  const handleCreateRequest = (product: WarehouseItem) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleSubmitRequest = (requestData: any) => {
    const newRequest: StockRequest = {
      id: (stockRequests.length + 1).toString(),
      requestNumber: `REQ-${(stockRequests.length + 1).toString().padStart(3, "0")}`,
      productName: selectedProduct?.name || requestData.productName,
      type: requestData.type,
      requestedQuantity: requestData.requestedQuantity,
      status: "PENDING",
      requestedDate: new Date().toLocaleDateString("vi-VN"),
      expectedDate: requestData.expectedDate
        ? new Date(requestData.expectedDate).toLocaleDateString("vi-VN")
        : undefined,
      notes: requestData.notes,
    }
    setStockRequests((prev) => [...prev, newRequest])
  }

  const handleCancelRequest = (id: string) => {
    if (confirm("Bạn có chắc muốn hủy yêu cầu này?")) {
      setStockRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "CANCELLED" as const } : req))
      )
    }
  }

  const handleEditItem = (item: WarehouseItem) => {
    setEditingItem(item)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleSubmitItem = (itemData: Omit<WarehouseItem, "id" | "lastUpdate">) => {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const dateStr = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
    const lastUpdate = `${timeStr} ${dateStr}`

    if (editingItem) {
      // Update existing item
      setWarehouseItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...itemData, lastUpdate } : item
        )
      )
    } else {
      // Add new item
      const newItem: WarehouseItem = {
        ...itemData,
        id: (warehouseItems.length + 1).toString(),
        lastUpdate,
      }
      setWarehouseItems((prev) => [...prev, newItem])
    }
  }

  const lowStockItems = warehouseItems.filter((item) => item.quantity < item.minLevel)

  const filteredItems = warehouseItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRequests = stockRequests.filter((req) =>
    req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.productName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                Tồn kho ({filteredItems.length})
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
                Yêu cầu nhập kho ({filteredRequests.length})
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
                    placeholder="Tìm kiếm theo tên hoặc danh mục..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-gray-300"
                  />
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white ml-4" onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo yêu cầu nhanh
                </Button>
              </div>

              {/* Warehouse Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên Hàng</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh Mục</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Đơn Vị</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Số Lượng</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mức Tối Thiểu</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Đơn Giá</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cập Nhật Lần Cuối</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredItems.map((item) => {
                        const isLowStock = item.quantity < item.minLevel
                        return (
                          <tr
                            key={item.id}
                            className={cn("hover:bg-gray-50 transition-colors", isLowStock && "bg-red-50")}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                {item.name}
                                {isLowStock && <AlertTriangle className="h-4 w-4 text-red-600" />}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={cn("font-semibold", isLowStock ? "text-red-600" : "text-gray-900")}>
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.minLevel}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {item.price.toLocaleString()}đ
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.lastUpdate}</td>
                            <td className="px-6 py-4">
                              <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600 text-white"
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

              {/* Requests Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã YC</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Loại</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SL yêu cầu</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày yêu cầu</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày dự kiến</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRequests.map((request) => {
                        const statusConfig = getRequestStatus(request.status)
                        const StatusIcon = statusConfig.icon
                        return (
                          <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {request.requestNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.productName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{getTypeText(request.type)}</td>
                            <td className="px-6 py-4 text-sm text-center font-semibold">{request.requestedQuantity}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", statusConfig.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{request.requestedDate}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{request.expectedDate || "-"}</td>
                            <td className="px-6 py-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleCancelRequest(request.id)}
                                disabled={request.status !== "PENDING" && request.status !== "APPROVED"}
                              >
                                Hủy yêu cầu
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
            productName={selectedProduct?.name}
            currentStock={selectedProduct?.quantity}
            mode="request"
          />
        </div>
      </div>
    </StaffLayout>
  )
}
