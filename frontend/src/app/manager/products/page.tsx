"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ManagerLayout } from "@/components/layouts/manager-layout"
import { Card, CardHeader } from "@/components/ui/card"
import ProductsForm from "@/components/forms/admin/products/ProductsForm"
import ProductsDetailModal from "@/components/forms/admin/products/ProductsDetailModal"
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  App,
  Statistic,
  Select,
  Form,
  Row,
  Col,
  Spin,
  Tooltip,
  Image,
} from "antd"
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  WarningOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import {
  managerProductService,
} from "@/services/manager-product.service"
import {
  type Product,
  type ProductStats,
} from "@/services/admin-product.service"
import { managerCategoryService } from "@/services/manager-category.service"
import { type Category } from "@/services/admin-category.service"
import { onEvent, onStorageEvent } from "@/lib/events"

// Generate consistent color from string
const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ['blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'lime', 'gold']
  return colors[Math.abs(hash) % colors.length]
}

// Stock status badge colors
const getStockStatus = (quantity: number, isAvailable: boolean) => {
  if (!isAvailable) return { text: "Đã ẩn tại CH", color: "volcano" }
  if (quantity === 0) return { text: "Hết hàng", color: "error" }
  if (quantity <= 10) return { text: "Sắp hết", color: "warning" }
  return { text: "Đang bán", color: "success" }
}

// Search normalization helper
const normalizeSearchString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .trim()
}

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message, modal } = App.useApp()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [statistics, setStatistics] = useState<ProductStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "low-stock" | "hidden" | "out-of-stock">("all")
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Forms
  const [editForm] = Form.useForm()
  const [addForm] = Form.useForm()

  // Handle query params on mount (for navigation from categories page)
  useEffect(() => {
    const categoryId = searchParams.get('categoryId')
    if (categoryId) {
      setCategoryFilter(categoryId)
    }
  }, [searchParams])

  // Load data on mount
  useEffect(() => {
    loadProducts()
    loadStatistics()
    loadCategories()
  }, [searchQuery, categoryFilter, statusFilter])

  // Listen to category toggle events
  useEffect(() => {
    const unsubscribe = onEvent('category:toggled', (detail) => {
      console.log('🔔 Category toggled event received:', detail)
      // Reload products to reflect the cascade update
      loadProducts()
      loadStatistics()
      
      // Show notification
      if (detail?.productCount > 0) {
        message.info(`${detail.productCount} sản phẩm đã được ${detail.isActive ? 'hiện' : 'ẩn'} theo danh mục`)
      }
    })

    // Also listen to storage events (from other tabs)
    const unsubscribeStorage = onStorageEvent((eventName, detail) => {
      if (eventName === 'category:toggled') {
        console.log('🔔 Category toggled event from storage:', detail)
        loadProducts()
        loadStatistics()
      }
    })

    return () => {
      unsubscribe()
      unsubscribeStorage()
    }
  }, [])

  // Load products
  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await managerProductService.getProducts({
        page: 1,
        limit: 999,
        search: searchQuery || undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })

      // Client-side search normalization if needed (backend might already handle it)
      let filteredData = response.data

      if (searchQuery) {
        const normalizedQuery = normalizeSearchString(searchQuery)
        filteredData = filteredData.filter((p: Product) => {
          const normalizedName = normalizeSearchString(p.name)
          const normalizedCode = normalizeSearchString(p.code)
          return normalizedName.includes(normalizedQuery) || normalizedCode.includes(normalizedQuery)
        })
      }

      setProducts(filteredData)
      setPagination({
        ...pagination,
        total: filteredData.length,
      })
    } catch (error: any) {
      console.error("❌ Load products error:", error)
      message.error(error.response?.data?.message || "Không thể tải danh sách sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await managerProductService.getProductStats()
      setStatistics(response.data)
    } catch (error: any) {
      console.error("❌ Load statistics error:", error)
    }
  }

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await managerCategoryService.getCategories({
        page: 1,
        limit: 999,
      })
      setCategories(response.data)
    } catch (error: any) {
      console.error("❌ Load categories error:", error)
    }
  }

  // Action handlers
  const handleEditClick = (record: Product) => {
    setSelectedProduct(record)
    setIsEditModalOpen(true)
  }

  const handleViewClick = (record: Product) => {
    setSelectedProduct(record)
    setIsDetailModalOpen(true)
  }

  const handleDelete = (record: Product) => {
    modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa sản phẩm <strong>{record.name}</strong>?
          </p>
          <p className="text-red-600 text-sm mt-2">
            ⚠️ Thao tác này không thể hoàn tác!
          </p>
        </div>
      ),
      okText: "Xác nhận xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await managerProductService.deleteProduct(record.id)
          message.success("Đã xóa sản phẩm thành công")
          loadProducts()
          loadStatistics()
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Không thể xóa sản phẩm"
          message.error(errorMessage)
        }
      },
    })
  }

  const handleToggleActive = async (record: Product) => {
    const action = record.isAvailable ? "ẩn" : "hiện"
    try {
      await managerProductService.updateProduct(record.id, {
        isAvailable: !record.isAvailable,
      })
      message.success(`Đã ${action} sản phẩm tại cửa hàng thành công`)
      loadProducts()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Không thể ${action} sản phẩm`
      message.error(errorMessage)
    }
  }

  const handleSubmitEdit = async (values: any) => {
    if (!selectedProduct) return

    try {
      // Backend handles branchId auto-assignment for managers
      await managerProductService.updateProduct(selectedProduct.id, {
        ...values,
        price: values.price, // Giá đã là VND
        costPrice: values.costPrice || undefined,
      })
      message.success("Đã cập nhật sản phẩm thành công")
      setIsEditModalOpen(false)
      loadProducts()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể cập nhật sản phẩm"
      message.error(errorMessage)
    }
  }

  const handleSubmitAdd = async (values: any) => {
    try {
      // Backend auto-assigns branchId
      await managerProductService.createProduct({
        ...values,
        price: values.price, // Giá đã là VND
        costPrice: values.costPrice || undefined,
      })
      message.success("Đã thêm sản phẩm mới thành công")
      setIsAddModalOpen(false)
      addForm.resetFields()
      loadProducts()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể thêm sản phẩm"
      message.error(errorMessage)
    }
  }

  // Table columns
  const columns: TableColumnsType<Product> = [
    {
      title: "Sản phẩm",
      key: "product",
      fixed: "left",
      width: 250,
      render: (_, record: Product) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: record.isAvailable ? 1 : 0.6 }}>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: record.isAvailable ? "#262626" : "#8c8c8c" }}>
              {record.name}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
      width: 140,
      render: (categoryName: string, record: Product) => {
        const categoryCode = record.category?.code || "DEFAULT"
        return (
          <Tag color={stringToColor(categoryCode)} style={{ opacity: record.isAvailable ? 1 : 0.6 }}>
            {categoryName || "N/A"}
          </Tag>
        )
      },
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right",
      sorter: (a, b) => a.price - b.price,
      render: (price: number, record: Product) => (
        <span style={{ opacity: record.isAvailable ? 1 : 0.6, fontWeight: 600, color: "#f5222d" }}>
          {price.toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity: number, record: Product) => (
        <span style={{ opacity: record.isAvailable ? 1 : 0.6 }}>
          <Tag color={quantity <= 10 ? "red" : "blue"}>{quantity}</Tag>
        </span>
      ),
    },
    {
      title: "Chuẩn bị",
      dataIndex: "prepTime",
      key: "prepTime",
      width: 100,
      align: "center",
      render: (time: number, record: Product) => (
        <span style={{ opacity: record.isAvailable ? 1 : 0.6 }}>{time} ph</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isAvailable",
      key: "isAvailable",
      width: 150,
      align: "center",
      render: (isAvailable: boolean, record: Product) => {
        const status = getStockStatus(record.quantity, isAvailable)
        return (
          <Tag
            icon={
              status.text.includes("ẩn") ? <EyeInvisibleOutlined /> :
                status.color === "error" ? <StopOutlined /> :
                  status.color === "warning" ? <WarningOutlined /> :
                    <CheckCircleOutlined />
            }
            color={status.color}
          >
            {status.text}
          </Tag>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      align: "center",
      fixed: "right",
      render: (_, record: Product) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewClick(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>
          <Tooltip title={record.isAvailable ? "Ẩn tại cửa hàng" : "Hiển thị lại"}>
            <Button
              type="text"
              icon={record.isAvailable ? <EyeInvisibleOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleActive(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-8">
      <Spin spinning={loading}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4">
              {/* Stats Cards */}
              {statistics && (
                <Row gutter={[24, 16]} className="-mx-2">
                  <Col span={8}>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <Statistic
                        title="Tổng số sản phẩm"
                        value={statistics.totalProducts}
                        prefix={<ShoppingOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <Statistic
                        title="Sản phẩm đang bán"
                        value={statistics.availableProducts}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <Statistic
                        title="Sản phẩm đã ẩn"
                        value={statistics.unavailableProducts}
                        prefix={<StopOutlined />}
                        valueStyle={{ color: "#ff7a45" }}
                      />
                    </div>
                  </Col>
                </Row>
              )}

              {/* Filters */}
              <div className="flex justify-between items-center gap-2">
                <Space size="middle">
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    prefix={<SearchOutlined />}
                    style={{ width: 250 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                  />
                  <Select
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    style={{ width: 200 }}
                    className={categoryFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                  >
                    <Select.Option value="all">Tất cả danh mục</Select.Option>
                    {categories.map((cat) => (
                      <Select.Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Select.Option>
                    ))}
                  </Select>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 180 }}
                    className={statusFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                  >
                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                    <Select.Option value="available">Đang bán</Select.Option>
                    <Select.Option value="low-stock">Sắp hết</Select.Option>
                    <Select.Option value="out-of-stock">Hết hàng</Select.Option>
                    <Select.Option value="hidden">Đã ẩn</Select.Option>
                  </Select>
                </Space>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Thêm sản phẩm
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            scroll={{ x: 1400 }}
            className="ant-table-custom"
            pagination={{
              ...pagination,
              showTotal: (total) => `Hiển thị ${total} sản phẩm`,
              showSizeChanger: true,
            }}
            onChange={(newPagination) => {
              setPagination({
                current: newPagination.current || 1,
                pageSize: newPagination.pageSize || 10,
                total: pagination.total,
              })
            }}
          />
        </Card>
      </Spin>

      {/* Modals */}
      <Modal
        title="Thêm món ăn mới"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false)
          addForm.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsAddModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => addForm.submit()}>
            Thêm món
          </Button>
        ]}
        width={700}
      >
        <ProductsForm
          form={addForm}
          onFinish={handleSubmitAdd}
          isEdit={false}
          categories={categories}
          branches={[]}
          hideBranch={true}
        />
      </Modal >

      <Modal
        title="Chỉnh sửa chi tiết món ăn"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>,
          <Button key="submit" type="primary" onClick={() => editForm.submit()}>Lưu thay đổi</Button>
        ]}
        width={700}
      >
        <ProductsForm
          form={editForm}
          onFinish={handleSubmitEdit}
          isEdit={true}
          selectedProduct={selectedProduct}
          categories={categories}
          branches={[]}
          hideBranch={true}
        />
      </Modal>

      <ProductsDetailModal
        product={selectedProduct}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
      />
    </div >
  )
}

export default function ProductsPage() {
  return (
    <ManagerLayout title="Quản lý sản phẩm">
      <App>
        <Suspense fallback={<div>Loading...</div>}>
          <ProductsContent />
        </Suspense>
      </App>
    </ManagerLayout>
  )
}
