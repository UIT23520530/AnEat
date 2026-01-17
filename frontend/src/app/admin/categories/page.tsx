"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardHeader } from "@/components/ui/card"
import CategoriesForm from "@/components/forms/admin/CategoriesForm"
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
  Switch,
} from "antd"
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ArrowRightOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import {
  adminCategoryService,
  type Category,
  type CategoryStats,
} from "@/services/admin-category.service"

// Generate consistent color from string
const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ['blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'lime', 'gold']
  return colors[Math.abs(hash) % colors.length]
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

function CategoriesContent() {
  const router = useRouter()
  const { message, modal } = App.useApp()
  const [categories, setCategories] = useState<Category[]>([])
  const [statistics, setStatistics] = useState<CategoryStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Forms
  const [editForm] = Form.useForm()
  const [addForm] = Form.useForm()

  // Load data on mount
  useEffect(() => {
    loadCategories()
    loadStatistics()
  }, [searchQuery, statusFilter])

  // Load categories
  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await adminCategoryService.getCategories({
        page: 1,
        limit: 999,
        search: searchQuery || undefined,
      })

      // Client-side filter
      let filteredData = response.data

      if (searchQuery) {
        const normalizedQuery = normalizeSearchString(searchQuery)
        filteredData = filteredData.filter((c: Category) => {
          const normalizedName = normalizeSearchString(c.name)
          const normalizedCode = normalizeSearchString(c.code)
          return normalizedName.includes(normalizedQuery) || normalizedCode.includes(normalizedQuery)
        })
      }

      if (statusFilter === "active") {
        filteredData = filteredData.filter((c: Category) => c.isActive)
      } else if (statusFilter === "inactive") {
        filteredData = filteredData.filter((c: Category) => !c.isActive)
      }

      setCategories(filteredData)
      setPagination({
        ...pagination,
        total: filteredData.length,
      })
    } catch (error: any) {
      console.error("❌ Load categories error:", error)
      message.error(error.response?.data?.message || "Không thể tải danh sách danh mục")
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await adminCategoryService.getCategoryStats()
      setStatistics(response.data)
    } catch (error: any) {
      console.error("❌ Load statistics error:", error)
    }
  }

  // Handle edit click
  const handleEditClick = (record: Category) => {
    setSelectedCategory(record)
    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDelete = (record: Category) => {
    modal.confirm({
      title: "Xác nhận xóa danh mục",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa danh mục <strong>{record.name}</strong>?
          </p>
          {record.productCount > 0 && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ Danh mục này có {record.productCount} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.
            </p>
          )}
        </div>
      ),
      okText: "Xác nhận xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await adminCategoryService.deleteCategory(record.id)
          message.success("Đã xóa danh mục thành công")
          loadCategories()
          loadStatistics()
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Không thể xóa danh mục"
          message.error(errorMessage)
        }
      },
    })
  }

  // Handle hide/unhide
  const handleToggleActive = async (record: Category) => {
    const action = record.isActive ? "ẩn" : "hiện"
    try {
      await adminCategoryService.updateCategory(record.id, {
        isActive: !record.isActive,
      })
      message.success(`Đã ${action} danh mục thành công`)
      loadCategories()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Không thể ${action} danh mục`
      message.error(errorMessage)
    }
  }

  // Navigate to products filtered by category
  const handleViewProducts = (categoryId: string) => {
    router.push(`/admin/products?categoryId=${categoryId}`)
  }

  // Submit edit
  const handleSubmitEdit = async (values: any) => {
    if (!selectedCategory) return

    try {
      await adminCategoryService.updateCategory(selectedCategory.id, values)
      message.success("Đã cập nhật danh mục thành công")
      setIsEditModalOpen(false)
      loadCategories()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể cập nhật danh mục"
      message.error(errorMessage)
    }
  }

  // Submit add category
  const handleSubmitAdd = async (values: any) => {
    try {
      await adminCategoryService.createCategory(values)
      message.success("Đã thêm danh mục mới thành công")
      setIsAddModalOpen(false)
      addForm.resetFields()
      loadCategories()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể thêm danh mục"
      message.error(errorMessage)
    }
  }

  // Table columns
  const columns: TableColumnsType<Category> = [
    {
      title: "Mã danh mục",
      dataIndex: "code",
      key: "code",
      width: 130,      
      fixed: 'left',      
      render: (code: string, record: Category) => (
        <Tag 
          color={stringToColor(code)} 
          style={{ opacity: record.isActive ? 1 : 0.5 }}
        >
          {code}
        </Tag>
      ),
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      width: 150,      
      fixed: 'left',      
      render: (name: string, record: Category) => (
        <span style={{ opacity: record.isActive ? 1 : 0.5, fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 180,
      ellipsis: true,
      render: (description: string | null, record: Category) => (
        <span style={{ opacity: record.isActive ? 1 : 0.5 }}>
          {description || <span className="text-gray-400">Chưa có mô tả</span>}
        </span>
      ),
    },
    {
      title: "Số sản phẩm",
      dataIndex: "productCount",
      key: "productCount",
      width: 200,
      align: "center",
      sorter: (a, b) => a.productCount - b.productCount,
      showSorterTooltip: { title: 'Sắp xếp theo số lượng sản phẩm' },
      render: (count: number, record: Category) => (
        <span style={{ opacity: record.isActive ? 1 : 0.5 }}>
          <Tag color={count > 0 ? "blue" : "default"}>{count}</Tag>
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 150,
      align: "center",
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
          color={isActive ? "success" : "error"}
        >
          {isActive ? "Đang hiển thị" : "Đã ẩn"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      align: "center",
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      showSorterTooltip: { title: 'Sắp xếp theo ngày tạo' },
      render: (date: string, record: Category) => (
        <span style={{ opacity: record.isActive ? 1 : 0.5 }}>
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 170,
      align: "center",
      fixed: "right",
      render: (_, record: Category) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Ẩn danh mục" : "Hiện danh mục"}>
            <Button
              type="text"
              icon={record.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleToggleActive(record)}
            />
          </Tooltip>
          <Tooltip title="Xem sản phẩm">
            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              onClick={() => handleViewProducts(record.id)}
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
                        title="Tổng số danh mục"
                        value={statistics.totalCategories}
                        prefix={<FolderOpenOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <Statistic
                        title="Danh mục đang hiển thị"
                        value={statistics.activeCategories}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <Statistic
                        title="Danh mục đã ẩn"
                        value={statistics.inactiveCategories}
                        prefix={<StopOutlined />}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                    </div>
                  </Col>
                </Row>
              )}

              {/* Filters */}
              <div className="flex justify-between items-center">
                <Space size="middle">
                  <Input
                    placeholder="Tìm kiếm danh mục..."
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                  />
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 180 }}
                    className={statusFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                  >
                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                    <Select.Option value="active">Đang hiển thị</Select.Option>
                    <Select.Option value="inactive">Đã ẩn</Select.Option>
                  </Select>
                </Space>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Thêm danh mục
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="id"
            scroll={{ x: 1400 }}
            className="ant-table-custom"
            pagination={{
              ...pagination,
              showTotal: (total) => `Hiển thị ${total} danh mục`,
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
        title="Thêm danh mục mới"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false)
          addForm.resetFields()
        }}
        onOk={() => addForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
        width={600}
      >
        <CategoriesForm
          form={addForm}
          onFinish={handleSubmitAdd}
          isEdit={false}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa danh mục"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
          editForm.resetFields()
        }}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        width={600}
      >
        <CategoriesForm
          form={editForm}
          onFinish={handleSubmitEdit}
          isEdit={true}
          selectedCategory={selectedCategory}
        />
      </Modal>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <AdminLayout title="Quản lý Danh mục sản phẩm">
      <App>
        <CategoriesContent />
      </App>
    </AdminLayout>
  )
}
