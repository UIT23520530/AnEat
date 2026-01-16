"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Descriptions,
  Spin,
  Avatar,
  Tooltip,
  InputNumber,
  Switch,
} from "antd"
import {
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import {
  adminBranchService,
  type Branch,
} from "@/services/admin-branch.service"

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
  const [editForm] = Form.useForm()
  const [addForm] = Form.useForm()
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
        search: searchQuery || undefined,
      })

      // Client-side filter by status
      let filteredData = response.data
      if (statusFilter === "active") {
        filteredData = response.data.filter(b => b.isActive)
      } else if (statusFilter === "inactive") {
        filteredData = response.data.filter(b => !b.isActive)
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
    editForm.setFieldsValue({
      name: record.name,
      address: record.address,
      phone: record.phone,
      email: record.email,
      managerId: record.managerId,
      isActive: record.isActive,
    })
    
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
    addForm.resetFields()
    // isActive will default to false from Form.Item initialValue
    
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
              <strong>⚠️ Lưu ý:</strong> Thao tác này sẽ xóa vĩnh viễn:
            </p>
            <ul className="text-sm text-slate-600 mt-2 ml-4 list-disc">
              <li>Tất cả sản phẩm của chi nhánh</li>
              <li>Tất cả bàn ăn</li>
              <li>Tất cả đơn hàng</li>
              <li>Tất cả yêu cầu kho, giao dịch kho</li>
              <li>Tất cả hóa đơn và mẫu in</li>
            </ul>
            <p className="text-sm text-green-600 mt-2">
              ✓ Nhân viên sẽ KHÔNG bị xóa (chỉ bị hủy gán chi nhánh)
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

    console.log('🔄 Submitting edit:', { branchId: selectedBranch.id, values })
    try {
      const response = await adminBranchService.updateBranch(selectedBranch.id, values)
      console.log('✅ Edit response:', response)
      message.success("Đã cập nhật thông tin chi nhánh")
      setIsEditModalOpen(false)
      loadBranches()
      loadStatistics()
    } catch (error: any) {
      console.error('❌ Edit error:', error)
      message.error(error.response?.data?.message || "Không thể cập nhật thông tin")
    }
  }

  // Submit add branch
  const handleSubmitAdd = async (values: any) => {
    console.log('➕ Submitting add:', values)
    try {
      const response = await adminBranchService.createBranch(values)
      console.log('✅ Add response:', response)
      message.success("Đã thêm chi nhánh mới")
      setIsAddModalOpen(false)
      addForm.resetFields()
      loadBranches()
      loadStatistics()
    } catch (error: any) {
      console.error('❌ Add error:', error)
      message.error(error.response?.data?.message || "Không thể thêm chi nhánh")
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
      <Modal
        title={
          selectedBranch && (
            <span>
              Chi tiết chi nhánh - <Tag className="ml-2 -translate-y-0.5">{selectedBranch.code}</Tag>
            </span>
          )
        }
        open={isDetailModalOpen}
        onCancel={handleCloseDetailModal}
        footer={null}
        width={850}
      >
        {selectedBranch && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Tên chi nhánh" span={2}>
              <span className="font-medium">{selectedBranch.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              <EnvironmentOutlined className="mr-2" />
              {selectedBranch.address}
            </Descriptions.Item>
            <Descriptions.Item label="Quản lý" span={2}>
              {selectedBranch.manager ? (
                <Space>
                  <Avatar src={selectedBranch.manager.avatar} icon={<UserOutlined />} size="small" />
                  <div>
                    <div className="text-sm font-medium">{selectedBranch.manager.name}</div>
                    <div className="text-xs text-slate-500">{selectedBranch.manager.email}</div>
                  </div>
                </Space>
              ) : (
                <span className="text-slate-400">Chưa có</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Doanh thu" span={2}>
              {branchStats ? (
                <span className="font-medium text-slate-900">
                  <DollarOutlined className="mr-2" />
                  {new Intl.NumberFormat("vi-VN").format(branchStats.totalRevenue)} ₫
                </span>
              ) : (
                <span className="text-slate-400">Đang tải...</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <PhoneOutlined className="mr-2" />
              {selectedBranch.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <MailOutlined className="mr-2" />
              {selectedBranch.email || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên">
              <Space>
                <Tag icon={<TeamOutlined />} color="blue">
                  {selectedBranch._count?.staff || 0}
                </Tag>
                <Tooltip title="Xem nhân viên chi nhánh">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      handleCloseDetailModal()
                      router.push(`/admin/users?branchId=${selectedBranch.id}`)
                    }}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm">
              <Space>
                <Tag icon={<ShoppingOutlined />} color="green">
                  {selectedBranch._count?.products || 0}
                </Tag>
                <Tooltip title="Xem sản phẩm chi nhánh">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      handleCloseDetailModal()
                      router.push(`/admin/products?branchId=${selectedBranch.id}`)
                    }}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Bàn ăn">
              <Tag color="cyan">
                {selectedBranch._count?.tables || 0}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn hàng">
              <Tag icon={<FileTextOutlined />} color="orange">
                {selectedBranch._count?.orders || 0}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedBranch.createdAt).toLocaleDateString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {new Date(selectedBranch.updatedAt).toLocaleString("vi-VN", {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin chi nhánh"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={700}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSubmitEdit}>
          <div className="mb-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">Thông tin cơ bản</div>
            <Form.Item label="Tên chi nhánh" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
              <Input prefix={<ShopOutlined />} placeholder="VD: AnEat - Tuy Hòa" />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
              <Input prefix={<EnvironmentOutlined />} placeholder="VD: 123 Đường Lê Lợi" />
            </Form.Item>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">Thông tin liên hệ</div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập SĐT" },
                    { pattern: /^[0-9]{10}$/, message: "SĐT phải có 10 chữ số" },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="VD: 0123456789" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="Email" 
                  name="email" 
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="VD: tuyhoa@aneat.com" />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">Quản lý</div>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isActive !== curr.isActive}>
              {({ getFieldValue, setFieldsValue }) => (
                <>
                  <Form.Item name="managerId">
                    <Select
                      showSearch
                      allowClear
                      placeholder="Chọn quản lý (có thể để trống)"
                      notFoundContent={
                        <div className="text-center py-4 text-slate-500">
                          <UserOutlined className="text-2xl mb-2" />
                          <div className="text-sm">Chưa có quản lý nào khả dụng</div>
                          <div className="text-xs text-slate-400 mt-1">Phải có người dùng có vai trò quản lý được tạo trước khi gắn vào chi nhánh</div>
                        </div>
                      }
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={availableManagers.map(m => ({
                        value: m.id,
                        label: `${m.name} (${m.email})`,
                      }))}
                      onChange={(value) => {
                        if (!value && getFieldValue("isActive")) {
                          // Khi xóa quản lý, tự động vô hiệu hóa chi nhánh
                          modal.confirm({
                            title: "Xác nhận xóa quản lý",
                            content: "Xóa quản lý sẽ tự động vô hiệu hóa chi nhánh. Bạn có chắc chắn?",
                            okText: "Xác nhận",
                            cancelText: "Hủy",
                            onOk: () => {
                              setFieldsValue({ isActive: false })
                            },
                            onCancel: () => {
                              // Restore previous value
                              const currentManager = editForm.getFieldValue("managerId")
                              setFieldsValue({ managerId: currentManager || selectedBranch?.managerId })
                            }
                          })
                        }
                      }}
                    />
                  </Form.Item>
                  <div className="text-xs text-slate-500 mt-1">
                    💡 Xóa quản lý sẽ tự động vô hiệu hóa chi nhánh
                  </div>
                </>
              )}
            </Form.Item>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-3">Trạng thái</div>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.managerId !== curr.managerId || prev.isActive !== curr.isActive}>
              {({ getFieldValue, setFieldsValue }) => {
                const managerId = getFieldValue("managerId")
                const isActive = getFieldValue("isActive")
                
                return (
                  <>
                    <Form.Item name="isActive" valuePropName="checked">
                      <Switch 
                        checkedChildren="Hoạt động" 
                        unCheckedChildren="Vô hiệu hóa"
                        disabled={!managerId}
                        onChange={(checked) => {
                          if (!checked && managerId) {
                            // Khi vô hiệu hóa chi nhánh, tự động bỏ gán quản lý
                            modal.confirm({
                              title: "Xác nhận vô hiệu hóa",
                              content: "Chi nhánh vô hiệu hóa sẽ tự động bỏ gán quản lý. Bạn có chắc chắn?",
                              okText: "Xác nhận",
                              cancelText: "Hủy",
                              onOk: () => {
                                setFieldsValue({ managerId: null })
                              },
                              onCancel: () => {
                                setFieldsValue({ isActive: true })
                              }
                            })
                          }
                        }}
                      />
                    </Form.Item>
                    {!managerId && (
                      <div className="text-xs text-amber-600 mt-1">
                        ⚠️ Phải có quản lý được gán trước khi kích hoạt chi nhánh
                      </div>
                    )}
                    {managerId && isActive && (
                      <div className="text-xs text-blue-600 mt-1">
                        💡 Vô hiệu hóa chi nhánh sẽ tự động bỏ gán quản lý
                      </div>
                    )}
                  </>
                )
              }}
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Add Branch Modal */}
      <Modal
        title="Thêm chi nhánh mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
        width={700}
      >
        <Form 
          form={addForm} 
          layout="vertical" 
          onFinish={handleSubmitAdd}
          onValuesChange={(changedValues, allValues) => {
            // Auto-fill email from name
            if (changedValues.name) {
              const name = changedValues.name
              const dashIndex = name.indexOf(' - ')
              if (dashIndex > 0) {
                const cityPart = name.substring(dashIndex + 3).trim()
                // Convert to lowercase and remove diacritics for email
                const emailPrefix = cityPart
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/đ/g, 'd')
                  .replace(/[^a-z0-9]/g, '')
                addForm.setFieldsValue({ email: `${emailPrefix}@aneat.com` })
              }
            }
          }}
        >
          <div className="mb-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">Thông tin cơ bản</div>
            <Form.Item label="Tên chi nhánh" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
              <Input prefix={<ShopOutlined />} placeholder="VD: AnEat - Tuy Hòa" />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
              <Input prefix={<EnvironmentOutlined />} placeholder="VD: 127 Nguyễn Huệ, Tuy Hòa, Phú Yên" />
            </Form.Item>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">Thông tin liên hệ</div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập SĐT" },
                    { pattern: /^[0-9]{10}$/, message: "SĐT phải có 10 chữ số" },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="VD: 0257123456" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="Email" 
                  name="email" 
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="VD: tuyhoa@aneat.com" />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">Quản lý</div>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isActive !== curr.isActive}>
              {({ getFieldValue, setFieldsValue }) => (
                <>
                  <Form.Item name="managerId">
                    <Select
                      showSearch
                      allowClear
                      placeholder="Chọn quản lý (có thể để trống)"
                      notFoundContent={
                        <div className="text-center py-4 text-slate-500">
                          <UserOutlined className="text-2xl mb-2" />
                          <div className="text-sm">Chưa có quản lý nào khả dụng</div>
                          <div className="text-xs text-slate-400 mt-1">Phải có người dùng có vai trò quản lý được tạo trước khi gắn vào chi nhánh</div>
                        </div>
                      }
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={availableManagers.map(m => ({
                        value: m.id,
                        label: `${m.name} (${m.email})`,
                      }))}
                      onChange={(value) => {
                        if (!value && getFieldValue("isActive")) {
                          // Khi xóa quản lý, tự động vô hiệu hóa chi nhánh
                          setFieldsValue({ isActive: false })
                          message.info("Đã tự động vô hiệu hóa chi nhánh")
                        }
                      }}
                    />
                  </Form.Item>
                  <div className="text-xs text-slate-500 mt-1">
                    💡 Xóa quản lý sẽ tự động vô hiệu hóa chi nhánh
                  </div>
                </>
              )}
            </Form.Item>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-3">Trạng thái</div>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.managerId !== curr.managerId || prev.isActive !== curr.isActive}>
              {({ getFieldValue, setFieldsValue }) => {
                const managerId = getFieldValue("managerId")
                const isActive = getFieldValue("isActive")
                
                return (
                  <>
                    <Form.Item name="isActive" valuePropName="checked" initialValue={false}>
                      <Switch 
                        checkedChildren="Hoạt động" 
                        unCheckedChildren="Vô hiệu hóa"
                        disabled={!managerId}
                        onChange={(checked) => {
                          if (!checked && managerId) {
                            // Khi vô hiệu hóa chi nhánh, tự động bỏ gán quản lý
                            modal.confirm({
                              title: "Xác nhận vô hiệu hóa",
                              content: "Chi nhánh vô hiệu hóa sẽ tự động bỏ gán quản lý. Bạn có chắc chắn?",
                              okText: "Xác nhận",
                              cancelText: "Hủy",
                              onOk: () => {
                                setFieldsValue({ managerId: null })
                              },
                              onCancel: () => {
                                setFieldsValue({ isActive: true })
                              }
                            })
                          }
                        }}
                      />
                    </Form.Item>
                    {!managerId && (
                      <div className="text-xs text-amber-600 mt-1">
                        ⚠️ Phải có quản lý được gán trước khi kích hoạt chi nhánh
                      </div>
                    )}
                    {managerId && isActive && (
                      <div className="text-xs text-blue-600 mt-1">
                        💡 Vô hiệu hóa chi nhánh sẽ tự động bỏ gán quản lý
                      </div>
                    )}
                  </>
                )
              }}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default function AdminBranchesPage() {
  return (
    <AdminLayout title="Quản lý Chi nhánh">
      <App>
        <BranchesContent />
      </App>
    </AdminLayout>
  )
}
