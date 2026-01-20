"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardHeader } from "@/components/ui/card"
import ProductsForm from "@/components/forms/admin/ProductsForm"
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
  InputNumber,
  Switch,
  Descriptions,
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
  adminProductService,
  type Product,
  type ProductStats,
} from "@/services/admin-product.service"
import { adminCategoryService, type Category } from "@/services/admin-category.service"
import { adminBranchService, type Branch } from "@/services/admin-branch.service"

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
  if (!isAvailable) return { text: "Đã ẩn", color: "volcano" }
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
  const [branches, setBranches] = useState<Branch[]>([])
  const [statistics, setStatistics] = useState<ProductStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [branchFilter, setBranchFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "low-stock" | "hidden" | "out-of-stock">("all")
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)

  // Forms
  const [editForm] = Form.useForm()
  const [addForm] = Form.useForm()

  // Handle query params on mount (for navigation from categories/branches page)
  useEffect(() => {
    const categoryId = searchParams.get('categoryId')
    const branchId = searchParams.get('branchId')
    if (categoryId) {
      setCategoryFilter(categoryId)
    }
    if (branchId) {
      setBranchFilter(branchId)
    }
  }, [searchParams])

  // Load data on mount
  useEffect(() => {
    loadProducts()
    loadStatistics()
    loadCategories()
    loadBranches()
  }, [searchQuery, categoryFilter, branchFilter, statusFilter])

  // Load products
  const loadProducts = async () => {
    setLoading(true)
    try {
      // Fetch ALL products to properly filter client-side
      const response = await adminProductService.getProducts({
        page: 1,
        limit: 999,
        search: searchQuery || undefined,
      })

      console.log("📋 Products fetched from API:", response.data.length)

      // Client-side filter
      let filteredData = response.data

      if (searchQuery) {
        const normalizedQuery = normalizeSearchString(searchQuery)
        filteredData = filteredData.filter((p: Product) => {
          const normalizedName = normalizeSearchString(p.name)
          const normalizedCode = normalizeSearchString(p.code)
          return normalizedName.includes(normalizedQuery) || normalizedCode.includes(normalizedQuery)
        })
      }

      if (categoryFilter !== "all") {
        filteredData = filteredData.filter((p: Product) => p.categoryId === categoryFilter)
      }
      if (branchFilter) {
        filteredData = filteredData.filter((p: Product) => p.branchId === branchFilter)
      }
      if (statusFilter === "available") {
        filteredData = filteredData.filter((p: Product) => p.isAvailable && p.quantity > 10)
      } else if (statusFilter === "low-stock") {
        filteredData = filteredData.filter((p: Product) => p.isAvailable && p.quantity > 0 && p.quantity <= 10)
      } else if (statusFilter === "hidden") {
        filteredData = filteredData.filter((p: Product) => !p.isAvailable)
      } else if (statusFilter === "out-of-stock") {
        filteredData = filteredData.filter((p: Product) => p.quantity === 0)
      }

      console.log("✅ Filtered products:", filteredData.length)

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
      const response = await adminProductService.getProductStats(branchFilter)
      setStatistics(response.data)
    } catch (error: any) {
      console.error("❌ Load statistics error:", error)
    }
  }

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await adminCategoryService.getCategories({
        page: 1,
        limit: 999,
      })
      setCategories(response.data)
    } catch (error: any) {
      console.error("❌ Load categories error:", error)
    }
  }

  // Load branches
  const loadBranches = async () => {
    try {
      const response = await adminBranchService.getBranches({
        page: 1,
        limit: 999,
      })
      setBranches(response.data)
    } catch (error: any) {
      console.error("❌ Load branches error:", error)
    }
  }

  const handleEditClick = (record: Product) => {
    setSelectedProduct(record)
    setIsEditModalOpen(true)
  }

  // Handle view click
  const handleViewClick = (record: Product) => {
    setViewProduct(record)
    setIsViewModalOpen(true)
  }

  // Handle delete
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
          await adminProductService.deleteProduct(record.id)
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

  // Handle hide/unhide
  const handleToggleActive = async (record: Product) => {
    const action = record.isAvailable ? "ẩn" : "hiện"
    try {
      await adminProductService.updateProduct(record.id, {
        isAvailable: !record.isAvailable,
      })
      message.success(`Đã ${action} sản phẩm thành công`)
      loadProducts()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Không thể ${action} sản phẩm`
      message.error(errorMessage)
    }
  }

  // Submit edit
  const handleSubmitEdit = async (values: any) => {
    if (!selectedProduct) return

    try {
      await adminProductService.updateProduct(selectedProduct.id, {
        ...values,
        price: values.price, // Backend will convert to cents
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

  // Submit add product
  const handleSubmitAdd = async (values: any) => {
    try {
      await adminProductService.createProduct({
        ...values,
        price: values.price, // Backend will convert to cents
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
      width: 100,
      render: (_, record: Product) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: record.isAvailable ? 1 : 0.5 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                {record.name}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
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
      width: 40,
      render: (categoryName: string, record: Product) => {
        const categoryCode = record.category?.code || categoryName
        const color = stringToColor(categoryCode)
        return (
          <span style={{ opacity: record.isAvailable ? 1 : 0.5 }}>
            <Tag color={color}>{categoryName}</Tag>
          </span>
        )
      },
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 40,
      align: "right",
      sorter: (a, b) => a.price - b.price,
      showSorterTooltip: { title: 'Sắp xếp theo giá bán' },
      render: (price: number, record: Product) => (
        <span style={{ opacity: record.isAvailable ? 1 : 0.5, fontWeight: 500 }}>
          {price.toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 50,
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity,
      showSorterTooltip: { title: 'Sắp xếp theo số lượng tồn kho' },
      render: (quantity: number, record: Product) => (
        <span style={{ opacity: record.isAvailable ? 1 : 0.5 }}>{quantity}</span>
      ),
    },
    {
      title: "Thời gian chuẩn bị",
      dataIndex: "prepTime",
      key: "prepTime",
      width: 60,
      align: "center",
      sorter: (a, b) => a.prepTime - b.prepTime,
      showSorterTooltip: { title: 'Sắp xếp theo thời gian chuẩn bị' },
      render: (prepTime: number, record: Product) => (
        <span style={{ opacity: record.isAvailable ? 1 : 0.5 }}>
          {prepTime} phút
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isAvailable",
      key: "isAvailable",
      width: 40,
      align: "center",
      render: (isAvailable: boolean, record: Product) => {
        const status = getStockStatus(record.quantity, isAvailable)
        return (
          <Tag
            icon={
              status.text === "Sắp hết" ? <WarningOutlined /> :
                status.text === "Hết hàng" ? <StopOutlined /> :
                  status.text === "Đã ẩn" ? <EyeInvisibleOutlined /> :
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
      width: 60,
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
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>
          <Tooltip title={record.isAvailable ? "Ẩn sản phẩm" : "Hiện sản phẩm"}>
            <Button
              type="text"
              icon={record.isAvailable ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleActive(record)}
              danger={record.isAvailable}
              className={!record.isAvailable ? "text-green-600 hover:text-green-700" : ""}
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
                  <Select
                    showSearch
                    allowClear
                    value={branchFilter}
                    onChange={(value) => setBranchFilter(value || null)}
                    placeholder="Lọc theo chi nhánh"
                    style={{ width: 200 }}
                    className={branchFilter ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={branches.map((b) => ({
                      value: b.id,
                      label: `${b.code} # ${b.name}`,
                    }))}
                  />
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

      {/* Add Modal */}
      <Modal
        title="Thêm sản phẩm mới"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false)
          addForm.resetFields()
        }}
        onOk={() => addForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
        width={700}
      >
        <ProductsForm
          form={addForm}
          onFinish={handleSubmitAdd}
          isEdit={false}
          categories={categories}
          branches={branches}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
          editForm.resetFields()
        }}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        width={700}
      >
        <ProductsForm
          form={editForm}
          onFinish={handleSubmitEdit}
          isEdit={true}
          selectedProduct={selectedProduct}
          categories={categories}
          branches={branches}
        />
      </Modal>

      {/* View Detail Modal */}
      <Modal
        title="Chi tiết sản phẩm"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {viewProduct && (
          <div className="flex flex-col gap-6">
            <div className="flex gap-6">
              <div className="w-1/3">
                {viewProduct.image ? (
                  <Image
                    src={viewProduct.image}
                    alt={viewProduct.name}
                    width="100%"
                    className="rounded-lg object-cover"
                    fallback="/images/placeholder-food.jpg"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <ShoppingOutlined style={{ fontSize: 48 }} />
                  </div>
                )}
              </div>
              <div className="w-2/3">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Mã sản phẩm">
                    <Tag color="blue">{viewProduct.code}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên sản phẩm">
                    <strong>{viewProduct.name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Danh mục">
                    <Tag>{viewProduct.category?.name}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá bán">
                    <span className="text-lg font-semibold text-orange-600">
                      {viewProduct.price.toLocaleString("vi-VN")}đ
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {(() => {
                      const status = getStockStatus(viewProduct.quantity, viewProduct.isAvailable)
                      return (
                        <Tag color={status.color}>
                          {status.text}
                        </Tag>
                      )
                    })()}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>

            <Descriptions title="Thông tin chi tiết" column={2} bordered>
              <Descriptions.Item label="Tồn kho">{viewProduct.quantity}</Descriptions.Item>
              <Descriptions.Item label="Thời gian chuẩn bị">{viewProduct.prepTime} phút</Descriptions.Item>
              <Descriptions.Item label="Giá vốn">{viewProduct.costPrice?.toLocaleString("vi-VN")}đ</Descriptions.Item>
              <Descriptions.Item label="Chi nhánh">
                {viewProduct.branches && viewProduct.branches.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {viewProduct.branches.map(b => (
                      <Tag color="blue" key={b.id}>{b.name}</Tag>
                    ))}
                  </div>
                ) : (
                  <Tag color="green">Toàn hệ thống</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {viewProduct.description || "Chưa có mô tả"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <AdminLayout title="Quản lý Sản phẩm">
      <App>
        <ProductsContent />
      </App>
    </AdminLayout>
  )
}
