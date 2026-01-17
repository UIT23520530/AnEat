"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Switch,
} from "antd"
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  CopyOutlined,
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import {
  adminUserService,
  type User,
  type UserStats,
  type UserRole,
} from "@/services/admin-user.service"
import { adminBranchService, type Branch } from "@/services/admin-branch.service"

const roleLabels: Record<UserRole, string> = {
  ADMIN_SYSTEM: "Admin Hệ thống",
  ADMIN_BRAND: "Quản lý Chi nhánh",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
  LOGISTICS_STAFF: "Nhân viên Logistics",
}

const roleColors: Record<UserRole, string> = {
  ADMIN_SYSTEM: "red",
  ADMIN_BRAND: "purple",
  STAFF: "blue",
  CUSTOMER: "green",
  LOGISTICS_STAFF: "orange",
}

function UsersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message, modal } = App.useApp()
  const [users, setUsers] = useState<User[]>([])
  const [statistics, setStatistics] = useState<UserStats | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string>('')
  const [createdUserInfo, setCreatedUserInfo] = useState<{ name: string; email: string } | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [branchFilter, setBranchFilter] = useState<string | null>(null)

  // Forms
  const [editForm] = Form.useForm()
  const [addForm] = Form.useForm()

  // Handle query params on mount
  useEffect(() => {
    const branchId = searchParams.get('branchId')
    if (branchId) {
      setBranchFilter(branchId)
    }
  }, [searchParams])

  // Load data on mount
  useEffect(() => {
    loadUsers()
    loadBranches()
  }, [searchQuery, roleFilter, statusFilter, branchFilter])

  // Re-load statistics when branch filter changes
  useEffect(() => {
    loadStatistics()
  }, [branchFilter])

  // Load users
  const loadUsers = async () => {
    setLoading(true)
    try {
      // Fetch ALL users to properly filter client-side
      const response = await adminUserService.getUsers({
        page: 1,
        limit: 999,
        search: searchQuery || undefined,
      })

      console.log("📋 Users fetched from API:", response.data.length)

      // Client-side filter by role, status, and branch
      let filteredData = response.data
      if (roleFilter !== "all") {
        filteredData = filteredData.filter((u: User) => u.role === roleFilter)
      }
      if (statusFilter === "active") {
        filteredData = filteredData.filter((u: User) => u.isActive)
      } else if (statusFilter === "inactive") {
        filteredData = filteredData.filter((u: User) => !u.isActive)
      }
      if (branchFilter) {
        filteredData = filteredData.filter((u: User) => 
          u.branchId === branchFilter || u.managedBranches?.id === branchFilter
        )
      }

      console.log("✅ Filtered users:", filteredData.length)

      setUsers(filteredData)
      setPagination({
        ...pagination,
        total: filteredData.length,
      })
    } catch (error: any) {
      console.error("❌ Load users error:", error)
      message.error(error.response?.data?.message || "Không thể tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await adminUserService.getUsersStats(branchFilter || undefined)
      console.log("📊 Statistics loaded:", response.data)
      setStatistics(response.data)
    } catch (error: any) {
      console.error("❌ Load statistics error:", error)
    }
  }

  // Load branches for dropdown
  const loadBranches = async () => {
    try {
      const response = await adminBranchService.getBranches({ page: 1, limit: 999 })
      console.log("🏢 Branches loaded:", response.data.length)
      setBranches(response.data)
    } catch (error) {
      console.error("❌ Load branches error:", error)
    }
  }

  // Handle view detail
  const handleViewDetail = async (record: User) => {
    setSelectedUser(record)
    setIsDetailModalOpen(true)
  }

  // Handle edit
  const handleEdit = async (record: User) => {
    setSelectedUser(record)
    editForm.setFieldsValue({
      name: record.name,
      phone: record.phone,
      email: record.email,
      role: record.role,
      branchId: record.branchId || record.managedBranches?.id || null,
      isActive: record.isActive,
      // Store initial state to track changes
      _initialIsActive: record.isActive,
    })
    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDelete = (record: User) => {
    modal.confirm({
      title: "Xác nhận xóa người dùng",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa người dùng <strong>{record.name}</strong>?
          </p>
          <p className="text-red-600 text-sm mt-2">
            ⚠️ <strong>Lưu ý:</strong> Đây là thao tác xóa mềm. Người dùng sẽ bị vô hiệu hóa và không thể đăng nhập.
          </p>
        </div>
      ),
      okText: "Xác nhận xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        console.log("🗑️ Deleting user:", { id: record.id, name: record.name })
        try {
          await adminUserService.deleteUser(record.id)
          message.success("Đã xóa người dùng thành công")
          loadUsers()
          loadStatistics()
        } catch (error: any) {
          // Safely extract error message
          let errorMessage = "Không thể xóa người dùng"
          
          try {
            if (error.response?.data) {
              const data = error.response.data
              errorMessage = data.message || data.error || JSON.stringify(data)
            } else if (error.message) {
              errorMessage = error.message
            }
          } catch (e) {
            console.error("Error parsing error response:", e)
          }
          
          console.error("❌ Delete failed:", errorMessage)
          message.error(errorMessage)
        }
      },
    })
  }

  // Submit edit
  const handleSubmitEdit = async (values: any) => {
    if (!selectedUser) return

    const submitData = { ...values }
    delete submitData._initialIsActive // Remove helper field

    // Logic: Clear branchId only when disabling FROM active state
    const wasActive = values._initialIsActive
    if (wasActive && !submitData.isActive && submitData.branchId) {
      submitData.branchId = null
    }

    try {
      const response = await adminUserService.updateUser(selectedUser.id, submitData)
      message.success("Đã cập nhật thông tin người dùng")
      setIsEditModalOpen(false)
      loadUsers()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể cập nhật thông tin"
      message.error(errorMessage)
    }
  }

  // Submit add user
  const handleSubmitAdd = async (values: any) => {
    try {
      const response = await adminUserService.createUser(values)
      
      // Always show password modal when user is created successfully
      // Use generated password from backend, or the manual password from form
      const passwordToShow = response.generatedPassword || values.password
      
      if (passwordToShow) {
        setGeneratedPassword(passwordToShow)
        setCreatedUserInfo({
          name: response.data?.name || values.name,
          email: response.data?.email || values.email,
        })
        setIsPasswordModalOpen(true)
      } else {
        message.success("Đã thêm người dùng mới")
      }
      
      setIsAddModalOpen(false)
      addForm.resetFields()
      loadUsers()
      loadStatistics()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể thêm người dùng"
      message.error(errorMessage)
    }
  }

  // Table columns
  const columns: TableColumnsType<User> = [
    {
      title: "Người dùng",
      dataIndex: "name",
      key: "name",
      width: 280,
      fixed: "left",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-medium text-slate-900">{text}</div>
            <div className="text-xs text-slate-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      key: "role",
      width: 180,
      render: (_, record) => (
        <Tag color={roleColors[record.role]}>{roleLabels[record.role]}</Tag>
      ),
    },
    {
      title: "Chi nhánh",
      key: "branch",
      width: 200,
      render: (_, record) =>
        record.branch ? (
          <div>
            <div className="text-sm font-medium">{record.branch.name}</div>
            <div className="text-xs text-slate-500">{record.branch.code}</div>
          </div>
        ) : record.managedBranches ? (
          <div>
            <Tag color="purple" icon={<ShopOutlined />}>
              Quản lý: {record.managedBranches.name}
            </Tag>
          </div>
        ) : record.role === "ADMIN_SYSTEM" ? (
          <span className="text-slate-500 italic">Không yêu cầu chi nhánh</span>
        ) : (
          <span className="text-slate-400">Chưa gán</span>
        ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (text) => (
        <span className="text-sm text-slate-600">
          <PhoneOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 120,
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
                        title="Tổng số người dùng"
                        value={statistics.totalUsers}
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <Statistic
                        title="Số người dùng đang hoạt động"
                        value={statistics.activeUsers}
                        suffix={`/ ${statistics.totalUsers}`}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <Statistic
                        title="Tổng số quản lý"
                        value={statistics.totalManagers}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <Statistic
                        title="Tổng số nhân viên"
                        value={statistics.totalStaff}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: "#fa8c16" }}
                      />
                    </div>
                  </Col>
                </Row>
              )}

              {/* Filters */}
              <div className="flex justify-between items-center">
                <Space size="middle">
                  <Input
                    placeholder="Tìm theo tên, email, SĐT"
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                  />
                  <Select
                    value={roleFilter}
                    onChange={setRoleFilter}
                    style={{ width: 180 }}
                    className={roleFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                    options={[
                      { label: "Tất cả vai trò", value: "all" },
                      { label: "Quản trị hệ thống", value: "ADMIN_SYSTEM" },
                      { label: "Quản lý chi nhánh", value: "ADMIN_BRAND" },
                      { label: "Nhân viên", value: "STAFF" },
                      { label: "Nhân viên logistics", value: "LOGISTICS_STAFF" },
                    ]}
                  />
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 160 }}
                    className={statusFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                    options={[
                      { label: "Tất cả trạng thái", value: "all" },
                      { label: "Hoạt động", value: "active" },
                      { label: "Vô hiệu hóa", value: "inactive" },
                    ]}
                  />
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
                  onClick={() => {
                    addForm.resetFields()
                    addForm.setFieldsValue({ isActive: false, role: "STAFF" })
                    setIsAddModalOpen(true)
                  }}
                >
                  Thêm người dùng
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Table */}
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Hiển thị ${total} người dùng`,
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
          selectedUser && (
            <span>
              Chi tiết người dùng
            </span>
          )
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={850}
      >
        {selectedUser && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Họ và tên" span={2}>
              <Space>
                <Avatar src={selectedUser.avatar} icon={<UserOutlined />} />
                <strong>{selectedUser.name}</strong>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <MailOutlined className="mr-2" />
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <PhoneOutlined className="mr-2" />
              {selectedUser.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={roleColors[selectedUser.role]}>{roleLabels[selectedUser.role]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedUser.isActive ? "success" : "error"}>
                {selectedUser.isActive ? "Hoạt động" : "Vô hiệu hóa"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh làm việc" span={2}>
              {selectedUser.branch ? (
                <Space>
                  <div>
                    <div className="font-medium">{selectedUser.branch.name}</div>
                    <div className="text-xs text-slate-500">{selectedUser.branch.code}</div>
                  </div>
                  <Button
                    type="link"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      router.push(`/admin/branches?branchId=${selectedUser.branch?.id}`)
                    }}
                  >
                    Xem chi tiết chi nhánh
                  </Button>
                </Space>
              ) : selectedUser.managedBranches ? (
                <Space>
                  <Tag color="purple" icon={<ShopOutlined />}>
                    Quản lý: {selectedUser.managedBranches.name} ({selectedUser.managedBranches.code})
                  </Tag>
                  <Button
                    type="link"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      router.push(`/admin/branches?branchId=${selectedUser.managedBranches?.id}`)
                    }}
                  >
                    Xem chi tiết chi nhánh
                  </Button>
                </Space>
              ) : selectedUser.role === "ADMIN_SYSTEM" ? (
                <span className="text-slate-500 italic">Không yêu cầu chi nhánh</span>
              ) : (
                <span className="text-slate-400">Chưa được gán chi nhánh</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Đăng nhập lần cuối">
              {selectedUser.lastLogin
                ? new Date(selectedUser.lastLogin).toLocaleString("vi-VN")
                : "Chưa đăng nhập"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa người dùng"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={700}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSubmitEdit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3">Thông tin cơ bản</div>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Họ tên" name="name">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Số điện thoại" name="phone">
                <Input disabled />
              </Form.Item>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3">Phân quyền</div>
              <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
                <Select
                  options={[
                    { label: "Quản trị hệ thống", value: "ADMIN_SYSTEM" },
                    { label: "Quản lý chi nhánh", value: "ADMIN_BRAND" },
                    { label: "Nhân viên", value: "STAFF" },
                    { label: "Nhân viên logistics", value: "LOGISTICS_STAFF" },
                  ]}
                  onChange={(value) => {
                    // Khi chuyển sang ADMIN_SYSTEM, xóa branchId
                    if (value === "ADMIN_SYSTEM") {
                      editForm.setFieldsValue({ branchId: null })
                    }
                  }}
                />
              </Form.Item>
              
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role || prev.isActive !== curr.isActive || prev.branchId !== curr.branchId}>
                {({ getFieldValue, setFieldsValue }) => {
                  const currentRole = getFieldValue("role")
                  const branchId = getFieldValue("branchId")
                  const isActive = getFieldValue("isActive")
                  
                  // Ẩn chi nhánh nếu là ADMIN_SYSTEM
                  if (currentRole === "ADMIN_SYSTEM") return null
                  
                  // Nếu role là MANAGER, chỉ hiện chi nhánh chưa có manager
                  const availableBranches = currentRole === "ADMIN_BRAND"
                    ? branches.filter(b => !b.managerId || b.managerId === selectedUser?.id)
                    : branches

                  return (
                    <>
                      <Form.Item name="branchId" label="Chi nhánh">
                        <Select
                          showSearch
                          allowClear
                          placeholder={currentRole === "ADMIN_BRAND" ? "Chọn chi nhánh quản lý" : "Chọn chi nhánh"}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={availableBranches.map((b) => ({
                            value: b.id,
                            label: `${b.name} (${b.code})`,
                          }))}
                          notFoundContent={
                            currentRole === "ADMIN_BRAND" ? (
                              <div className="text-center text-slate-500 py-2">
                                <ShopOutlined className="mr-2" />
                                Tất cả chi nhánh đã có quản lý
                              </div>
                            ) : null
                          }
                          onChange={(value) => {
                            const wasActive = getFieldValue("_initialIsActive")
                            const currentActive = getFieldValue("isActive")
                            // Chỉ tự động disable khi xóa chi nhánh TỪ trạng thái đang active
                            if (!value && wasActive && currentActive) {
                              setFieldsValue({ isActive: false })
                              message.info("Đã tự động vô hiệu hóa người dùng")
                            }
                          }}
                        />
                      </Form.Item>
                      {currentRole === "ADMIN_BRAND" && (
                        <div className="text-xs text-blue-600 mt-1">
                          💡 Chỉ hiển thị chi nhánh chưa có quản lý hoặc do người dùng này quản lý
                        </div>
                      )}
                      {!currentRole.includes("ADMIN") && !branchId && (
                        <div className="text-xs text-slate-500 mt-1">
                          💡 Xóa chi nhánh khi đang hoạt động sẽ tự động vô hiệu hóa
                        </div>
                      )}
                      {!currentRole.includes("ADMIN") && branchId && !getFieldValue("_initialIsActive") && !isActive && (
                        <div className="text-xs text-blue-600 mt-1">
                          💡 Chi nhánh đã được gán, có thể kích hoạt người dùng
                        </div>
                      )}
                    </>
                  )
                }}
              </Form.Item>

              <div className="text-sm font-semibold text-slate-700 mb-3">Trạng thái</div>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.branchId !== curr.branchId || prev.role !== curr.role || prev.isActive !== curr.isActive}>
                {({ getFieldValue, setFieldsValue }) => {
                  const currentRole = getFieldValue("role")
                  const branchId = getFieldValue("branchId")
                  const isActive = getFieldValue("isActive")
                  
                  return (
                    <>
                      <Form.Item name="isActive" valuePropName="checked">
                        <Switch 
                          checkedChildren="Hoạt động" 
                          unCheckedChildren="Vô hiệu hóa"
                          disabled={currentRole !== "ADMIN_SYSTEM" && !branchId}
                          onChange={(checked) => {
                            // Validation cho ADMIN_SYSTEM
                            if (checked && currentRole === "ADMIN_SYSTEM" && !selectedUser?.isActive) {
                              const activeAdmins = users.filter(u => u.role === "ADMIN_SYSTEM" && u.isActive && u.id !== selectedUser?.id)
                              if (activeAdmins.length > 0) {
                                message.error(`Chỉ được phép một Admin Hệ thống hoạt động`)
                                setFieldsValue({ isActive: false })
                              }
                            }
                          }}
                        />
                      </Form.Item>
                      {currentRole !== "ADMIN_SYSTEM" && !branchId && (
                        <div className="text-xs text-amber-600 mt-1">
                          ⚠️ Phải gán chi nhánh trước khi kích hoạt tài khoản
                        </div>
                      )}
                    </>
                  )
                }}
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        title="Thêm người dùng mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
        width={700}
        okText="Tạo"
        cancelText="Hủy"
      >
        <div className="text-blue-600 text-xs mb-4 bg-blue-50 p-2 rounded">
          💡 Mật khẩu tạm thời sẽ được gửi cho người dùng. Người dùng cần đổi mật khẩu sau khi đăng nhập lần đầu.
        </div>
        <Form form={addForm} layout="vertical" onFinish={handleSubmitAdd}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3">Thông tin cơ bản</div>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" }
                ]}
              >
                <Input placeholder="user@example.com" />
              </Form.Item>
              <Form.Item
                label="Họ tên"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9]{10}$/, message: "Số điện thoại phải có đúng 10 chữ số" }
                ]}
              >
                <Input placeholder="0123456789" maxLength={10} />
              </Form.Item>
              <Form.Item
                label="Mật khẩu (Tùy chọn)"
                name="password"
                rules={[
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                ]}
              >
                <Input.Password placeholder="Để trống để tạo tự động" />
              </Form.Item>
              <div className="text-xs text-slate-500 mt-[-12px] mb-3">
                💡 Nếu để trống, hệ thống sẽ tự động tạo mật khẩu
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3">Phân quyền</div>
              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                initialValue="STAFF"
              >
                <Select placeholder="Chọn vai trò">
                  <Select.Option value="STAFF">Nhân viên</Select.Option>
                  <Select.Option value="ADMIN_BRAND">Quản lý chi nhánh</Select.Option>
                  <Select.Option value="ADMIN_SYSTEM">Quản trị hệ thống</Select.Option>
                  <Select.Option value="LOGISTICS_STAFF">Nhân viên logistics</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role || prev.isActive !== curr.isActive}>
                {({ getFieldValue, setFieldsValue }) => {
                  const currentRole = getFieldValue("role")
                  if (currentRole === "ADMIN_SYSTEM") return null
                  
                  // Nếu role là MANAGER, chỉ hiện chi nhánh chưa có manager
                  const availableBranches = currentRole === "ADMIN_BRAND"
                    ? branches.filter(b => !b.managerId)
                    : branches

                  return (
                    <>
                      <Form.Item name="branchId">
                        <Select 
                          placeholder={currentRole === "ADMIN_BRAND" ? "Chọn chi nhánh quản lý" : "Chọn chi nhánh (tùy chọn)"}
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={availableBranches.map((branch) => ({
                            value: branch.id,
                            label: `${branch.name} - ${branch.address}`,
                          }))}
                          notFoundContent={
                            currentRole === "ADMIN_BRAND" ? (
                              <div className="text-center text-slate-500 py-2">
                                <ShopOutlined className="mr-2" />
                                Tất cả chi nhánh đã có quản lý
                              </div>
                            ) : null
                          }
                          onChange={(value) => {
                            const currentActive = getFieldValue("isActive")
                            // Chỉ tự động disable khi xóa chi nhánh và đang active
                            if (!value && currentActive) {
                              setFieldsValue({ isActive: false })
                              message.info("Đã tự động vô hiệu hóa người dùng")
                            }
                          }}
                        />
                      </Form.Item>
                      {currentRole === "ADMIN_BRAND" && (
                        <div className="text-xs text-blue-600 mt-1">
                          💡 Chỉ hiển thị chi nhánh chưa có quản lý
                        </div>
                      )}
                      {!currentRole.includes("ADMIN") && (
                        <div className="text-xs text-slate-500 mt-1">
                          💡 Xóa chi nhánh sẽ tự động vô hiệu hóa người dùng
                        </div>
                      )}
                    </>
                  )
                }}
              </Form.Item>

              <div className="text-sm font-semibold text-slate-700 mb-3">Trạng thái</div>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.branchId !== curr.branchId || prev.role !== curr.role || prev.isActive !== curr.isActive}>
                {({ getFieldValue, setFieldsValue }) => {
                  const currentRole = getFieldValue("role")
                  const branchId = getFieldValue("branchId")
                  const isActive = getFieldValue("isActive")
                  
                  return (
                    <>
                      <Form.Item name="isActive" valuePropName="checked" initialValue={false}>
                        <Switch 
                          checkedChildren="Hoạt động" 
                          unCheckedChildren="Vô hiệu hóa"
                          disabled={currentRole !== "ADMIN_SYSTEM" && !branchId}
                          onChange={(checked) => {
                            // Validation cho ADMIN_SYSTEM
                            if (checked && currentRole === "ADMIN_SYSTEM") {
                              const activeAdmins = users.filter(u => u.role === "ADMIN_SYSTEM" && u.isActive)
                              if (activeAdmins.length > 0) {
                                message.error(`Chỉ được phép một Admin Hệ thống hoạt động`)
                                setFieldsValue({ isActive: false })
                              }
                            }
                          }}
                        />
                      </Form.Item>
                      {currentRole !== "ADMIN_SYSTEM" && !branchId && (
                        <div className="text-xs text-amber-600 mt-1">
                          ⚠️ Phải gán chi nhánh trước khi kích hoạt tài khoản
                        </div>
                      )}
                    </>
                  )
                }}
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Password Display Modal */}
      <Modal
        title={null}
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false)
          setGeneratedPassword('')
          setCreatedUserInfo(null)
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsPasswordModalOpen(false)
              setGeneratedPassword('')
              setCreatedUserInfo(null)
            }}
          >
            Đóng
          </Button>,
          <Button
            key="send"
            type="primary"
            icon={<MailOutlined />}
            onClick={() => {
              message.info('Chức năng gửi email sẽ được triển khai sau')
            }}
          >
            Gửi Email
          </Button>,
        ]}
        width={500}
        centered
      >
        <div className="text-center py-6">
          <div className="mb-6">
            <MailOutlined className="text-blue-500" style={{ fontSize: '80px' }} />
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Người dùng đã được tạo!</h3>
            <p className="text-slate-600">
              Thông tin đăng nhập đã được tạo cho <span className="font-semibold">{createdUserInfo?.name}</span>
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-slate-600 mb-2">Email đăng nhập:</div>
            <div className="font-mono text-base font-semibold text-slate-800 mb-3">{createdUserInfo?.email}</div>
            <div className="text-sm text-slate-600 mb-2">Mật khẩu tạm thời:</div>
            <div className="flex items-center justify-center gap-2">
              <div className="font-mono text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded border border-blue-200">
                {generatedPassword}
              </div>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword)
                  message.success('Đã sao chép mật khẩu')
                }}
              />
            </div>
          </div>
          <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded">
            ⚠️ Vui lòng sao chép và gửi thông tin này cho nhân viên. Mật khẩu sẽ không hiển thị lại.
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminLayout title="Quản lý Người dùng">
      <App>
        <UsersContent />
      </App>
    </AdminLayout>
  )
}
