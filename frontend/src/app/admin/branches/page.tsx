"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BranchForm } from "@/components/forms/admin/BranchForm"
import { BranchDetailModal } from "@/components/forms/admin/BranchDetailModal"
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
  Spin,
  Avatar,
  Tooltip,
  Row,
  Col,
} from "antd"
import {
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import {
  adminBranchService,
  type Branch,
} from "@/services/admin-branch.service"

// Helper function to normalize search text
const normalizeSearchText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/\s+/g, "-")
    .trim()
}

function BranchesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message, modal } = App.useApp()
  const processedBranchId = useRef<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)
  const [branchStats, setBranchStats] = useState<any>(null)
  const [availableManagers, setAvailableManagers] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Handle query params to open detail modal
  useEffect(() => {
    const branchId = searchParams.get('branchId')
    // Only process if branchId exists, branches loaded, and not already processed
    if (branchId && branches.length > 0 && processedBranchId.current !== branchId) {
      const branch = branches.find(b => b.id === branchId)
      if (branch) {
        processedBranchId.current = branchId
        handleViewDetail(branch)
      }
    }
    // Reset processed flag when branchId is cleared
    if (!branchId && processedBranchId.current) {
      processedBranchId.current = null
    }
  }, [searchParams, branches])

  // Load branches
  const loadBranches = async () => {
    setLoading(true)
    try {
      // Fetch ALL branches (no pagination) to properly filter client-side
      const response = await adminBranchService.getBranches({
        page: 1,
        limit: 999, // Fetch all
        search: undefined, // Don't send search to API, filter client-side for better accuracy
      })

      // Normalize search query for better Vietnamese search
      const normalizedSearch = searchQuery ? normalizeSearchText(searchQuery) : ""

      // Client-side filter by search
      let filteredData = response.data
      if (normalizedSearch) {
        filteredData = filteredData.filter((branch) => {
          const normalizedName = normalizeSearchText(branch.name)
          const normalizedCode = normalizeSearchText(branch.code)
          const normalizedAddress = normalizeSearchText(branch.address)
          const normalizedPhone = branch.phone.replace(/\s+/g, "")
          
          return (
            normalizedName.includes(normalizedSearch) ||
            normalizedCode.includes(normalizedSearch) ||
            normalizedAddress.includes(normalizedSearch) ||
            normalizedPhone.includes(searchQuery.replace(/\s+/g, ""))
          )
        })
      }

      // Client-side filter by status
      if (statusFilter === "active") {
        filteredData = filteredData.filter(b => b.isActive)
      } else if (statusFilter === "inactive") {
        filteredData = filteredData.filter(b => !b.isActive)
      }

      setBranches(filteredData)
      setPagination({
        ...pagination,
        total: filteredData.length, // Total of filtered data
      })
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách chi nhánh")
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await adminBranchService.getOverviewStats()
      setStatistics(response.data)
    } catch (error: any) {
      message.error("Không thể tải thống kê")
    }
  }

  useEffect(() => {
    loadStatistics()
  }, [])

  useEffect(() => {
    loadBranches()
  }, [pagination.current, pagination.pageSize, searchQuery, statusFilter])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  // Handle view detail
  const handleViewDetail = async (record: Branch) => {
    try {
      const [detailResponse, statsResponse] = await Promise.all([
        adminBranchService.getBranchById(record.id),
        adminBranchService.getBranchStats(record.id),
      ])
      setSelectedBranch(detailResponse.data)
      setBranchStats(statsResponse.data)
      setIsDetailModalOpen(true)
    } catch (error: any) {
      message.error("Không thể tải thông tin chi nhánh")
    }
  }

  // Handle close detail modal and clear query param
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    // Remove branchId from URL to prevent re-opening
    const currentPath = window.location.pathname
    router.push(currentPath)
  }

  // Handle edit
  const handleEdit = async (record: Branch) => {
    setSelectedBranch(record)
    
    // Load available managers
    try {
      const response = await adminBranchService.getAvailableManagers(record.managerId || undefined)
      setAvailableManagers(response.data)
    } catch (error) {
      console.error('Failed to load managers:', error)
    }
    
    setIsEditModalOpen(true)
  }

  // Handle add branch
  const handleAdd = async () => {
    setSelectedBranch(null)
    
    // Load available managers
    try {
      const response = await adminBranchService.getAvailableManagers()
      setAvailableManagers(response.data)
    } catch (error) {
      console.error('Failed to load managers:', error)
    }
    
    setIsAddModalOpen(true)
  }

  // Handle delete
  const handleDelete = (record: Branch) => {
    const staffCount = record._count?.staff || 0
    const hasStaff = staffCount > 0

    if (hasStaff) {
      // Chỉ show thông báo, không có nút xóa
      modal.warning({
        title: "Không thể xóa chi nhánh",
        content: (
          <div>
            <p className="mb-3">Chi nhánh <strong>"{record.name}"</strong> hiện có <strong>{staffCount} nhân viên</strong>.</p>
            <p className="text-sm text-slate-600">
              Vui lòng chuyển nhân viên sang chi nhánh khác trước khi xóa.
            </p>
          </div>
        ),
        okText: "Đã hiểu",
      })
      return
    }

    // Cho phép xóa khi không có nhân viên
    modal.confirm({
      title: "Xóa chi nhánh",
      content: (
        <div>
          <p className="mb-2">Bạn có chắc chắn muốn xóa chi nhánh <strong>"{record.name}"</strong>?</p>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-slate-600">
              <strong>Lưu ý:</strong> Thao tác này sẽ xóa vĩnh viễn:
            </p>
            <ul className="text-sm text-slate-600 mt-2 ml-4 list-disc">
              <li>Tất cả sản phẩm của chi nhánh</li>
              <li>Tất cả bàn ăn</li>
              <li>Tất cả đơn hàng</li>
              <li>Tất cả yêu cầu kho, giao dịch kho</li>
              <li>Tất cả hóa đơn và mẫu in</li>
            </ul>
            <p className="text-sm text-green-600 mt-2">
              Nhân viên sẽ KHÔNG bị xóa (chỉ bị hủy gán chi nhánh)
            </p>
          </div>
        </div>
      ),
      okText: "Xác nhận xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await adminBranchService.deleteBranch(record.id)
          message.success("Đã xóa chi nhánh thành công")
          loadBranches()
          loadStatistics()
        } catch (error: any) {
          message.error(error.response?.data?.message || "Không thể xóa chi nhánh")
        }
      },
    })
  }

  // Submit edit
  const handleSubmitEdit = async (values: any) => {
    if (!selectedBranch) return

    setFormLoading(true)
    try {
      await adminBranchService.updateBranch(selectedBranch.id, values)
      message.success("Đã cập nhật thông tin chi nhánh")
      setIsEditModalOpen(false)
      loadBranches()
      loadStatistics()
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật thông tin")
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  // Submit add branch
  const handleSubmitAdd = async (values: any) => {
    setFormLoading(true)
    try {
      await adminBranchService.createBranch(values)
      message.success("Đã thêm chi nhánh mới")
      setIsAddModalOpen(false)
      loadBranches()
      loadStatistics()
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể thêm chi nhánh")
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  // Table columns
  const columns: TableColumnsType<Branch> = [
    {
      title: "Chi nhánh",
      dataIndex: "name",
      key: "name",
      width: 280,
      fixed: "left",
      render: (text, record) => (
        <Space>
          <ShopOutlined className="text-lg text-blue-600" />
          <div>
            <div className="font-medium text-slate-900">{text}</div>
            <div className="text-xs text-slate-500">{record.code}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Quản lý",
      key: "manager",
      width: 220,
      render: (_, record) =>
        record.manager ? (
          <Space>
            <Avatar src={record.manager.avatar} icon={<UserOutlined />} size="small" />
            <div>
              <div className="text-sm font-medium">{record.manager.name}</div>
              <div className="text-xs text-slate-500">{record.manager.email}</div>
            </div>
          </Space>
        ) : (
          <span className="text-slate-400">Chưa có</span>
        ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text) => (
        <span className="text-sm text-slate-600">
          <EnvironmentOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 140,
      render: (_, record) => (
        <Tag color={record.isActive ? "success" : "error"}>
          {record.isActive ? "Hoạt động" : "Vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              size="small"
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
                  <Col span={6}>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <Statistic
                        title="Tổng chi nhánh"
                        value={statistics.totalBranches}
                        prefix={<ShopOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <Statistic
                        title="Số chi nhánh đang hoạt động"
                        value={statistics.activeBranches}
                        suffix={`/ ${statistics.totalBranches}`}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <Statistic
                        title="Số lượng nhân viên trung bình"
                        value={statistics.averageStaff}
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <Statistic
                        title="Doanh thu trung bình"
                        value={statistics.averageRevenue}
                        prefix={<DollarOutlined />}
                        suffix="₫"
                        valueStyle={{ color: "#9333ea" }}
                        formatter={(value) =>
                          new Intl.NumberFormat("vi-VN").format(value as number)
                        }
                      />
                    </div>
                  </Col>
                </Row>
              )}

              {/* Filters */}
              <div className="flex justify-between items-center">
                <Space size="middle">
                  <Input
                    placeholder="Tìm theo tên chi nhánh, mã, địa chỉ"
                    prefix={<SearchOutlined />}
                    style={{ width: 350 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                  />
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 180 }}
                    className={statusFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                    options={[
                      { label: "Tất cả trạng thái", value: "all" },
                      { label: "Hoạt động", value: "active" },
                      { label: "Vô hiệu hóa", value: "inactive" },
                    ]}
                  />
                </Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Thêm chi nhánh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Table */}
            <Table
              columns={columns}
              dataSource={branches}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Hiển thị ${total} chi nhánh`,
                onChange: (page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize })
                },
              }}
              bordered={false}
              className="ant-table-custom"
            />
          </CardContent>
        </Card>
      </Spin>

      {/* Detail Modal */}
      <BranchDetailModal
        branch={selectedBranch}
        stats={branchStats}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onNavigateToUsers={(branchId) => {
          handleCloseDetailModal()
          router.push(`/admin/users?branchId=${branchId}`)
        }}
        onNavigateToProducts={(branchId) => {
          handleCloseDetailModal()
          router.push(`/admin/products?branchId=${branchId}`)
        }}
      />

      {/* Edit Modal */}
      <BranchForm
        mode="edit"
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
        initialValues={selectedBranch ? {
          name: selectedBranch.name,
          address: selectedBranch.address,
          phone: selectedBranch.phone,
          email: selectedBranch.email,
          managerId: selectedBranch.managerId,
          isActive: selectedBranch.isActive,
        } : undefined}
        availableManagers={availableManagers}
        loading={formLoading}
      />

      {/* Add Branch Modal */}
      <BranchForm
        mode="create"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitAdd}
        availableManagers={availableManagers}
        loading={formLoading}
      />
    </div>
  )
}

export default function AdminBranchesPage() {
  return (
    <AdminLayout title="Quản lý chi nhánh">
      <App>
        <BranchesContent />
      </App>
    </AdminLayout>
  )
}
