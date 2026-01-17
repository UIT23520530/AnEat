"use client"

import { useState, useEffect } from "react"
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
  InputNumber,
  Row,
  Col,
  Descriptions,
  Spin,
  Avatar,
  Tooltip,
} from "antd"
import {
  SearchOutlined,
  UserOutlined,
  CrownOutlined,
  TrophyOutlined,
  StarOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  GiftOutlined,
  ShopOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import {
  adminCustomerService,
  type Customer,
  type CustomerTier,
} from "@/services/admin-customer.service"
import { adminBranchService, type Branch } from "@/services/admin-branch.service"
import { useRouter, useSearchParams } from "next/navigation"

function CustomersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message, modal } = App.useApp()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [branchFilter, setBranchFilter] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editForm] = Form.useForm()
  const [addForm] = Form.useForm()
  const [statistics, setStatistics] = useState<any>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Handle query params on mount
  useEffect(() => {
    const branchId = searchParams.get('branchId')
    if (branchId) {
      setBranchFilter(branchId)
    }
  }, [searchParams])

  // Load branches
  const loadBranches = async () => {
    try {
      const response = await adminBranchService.getBranches({ page: 1, limit: 999 })
      setBranches(response.data)
    } catch (error) {
      console.error("Failed to load branches:", error)
    }
  }

  // Load customers
  const loadCustomers = async () => {
    setLoading(true)
    try {
      const response = await adminCustomerService.getCustomers({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
        tier: selectedTier !== "all" ? (selectedTier as CustomerTier) : undefined,
        branchId: branchFilter || undefined,
      })

      setCustomers(response.data)
      setPagination({
        ...pagination,
        total: response.meta.total_items,
      })
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách khách hàng")
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await adminCustomerService.getStatistics(branchFilter || undefined)
      setStatistics(response.data)
    } catch (error: any) {
      message.error("Không thể tải thống kê")
    }
  }

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    loadStatistics()
  }, [branchFilter])

  useEffect(() => {
    loadCustomers()
  }, [pagination.current, pagination.pageSize, searchQuery, selectedTier, branchFilter])

  // Get tier color
  const getTierColor = (tier: CustomerTier) => {
    switch (tier) {
      case "VIP":
        return "purple"
      case "GOLD":
        return "gold"
      case "SILVER":
        return "blue"
      case "BRONZE":
        return "orange"
      default:
        return "default"
    }
  }

  // Get tier icon
  const getTierIcon = (tier: CustomerTier) => {
    switch (tier) {
      case "VIP":
        return <CrownOutlined />
      case "GOLD":
        return <TrophyOutlined />
      case "SILVER":
        return <StarOutlined />
      default:
        return <UserOutlined />
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  // Handle view detail
  const handleViewDetail = async (record: Customer) => {
    try {
      const response = await adminCustomerService.getCustomerById(record.id)
      setSelectedCustomer(response.data)
      setIsDetailModalOpen(true)
    } catch (error: any) {
      message.error("Không thể tải thông tin khách hàng")
    }
  }

  // Handle edit
  const handleEdit = (record: Customer) => {
    setSelectedCustomer(record)
    editForm.setFieldsValue({
      name: record.name,
      phone: record.phone,
      email: record.email,
      tier: record.tier,
      currentPoints: record.points,
      pointsAdjustment: 0,
    })
    setIsEditModalOpen(true)
  }

  // Handle delete
  const handleDelete = (record: Customer) => {
    modal.confirm({
      title: "Xác nhận xóa khách hàng",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa khách hàng <strong>{record.name}</strong>?</p>
          <p className="text-red-600 text-sm mt-2">⚠️ Hành động này không thể hoàn tác!</p>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await adminCustomerService.deleteCustomer(record.id)
          message.success("Đã xóa khách hàng thành công")
          loadCustomers()
          loadStatistics()
        } catch (error: any) {
          message.error(error.response?.data?.message || "Không thể xóa khách hàng")
        }
      },
    })
  }

  // Handle add customer
  const handleAdd = () => {
    addForm.resetFields()
    setIsAddModalOpen(true)
  }

  // Submit edit
  const handleSubmitEdit = async (values: any) => {
    if (!selectedCustomer) return

    try {
      const { currentPoints, pointsAdjustment, ...updateData } = values
      
      // Calculate new points if adjustment is made
      if (pointsAdjustment && pointsAdjustment !== 0) {
        updateData.points = currentPoints + pointsAdjustment
      }
      
      await adminCustomerService.updateCustomer(selectedCustomer.id, updateData)
      message.success("Đã cập nhật thông tin khách hàng")
      setIsEditModalOpen(false)
      loadCustomers()
      loadStatistics()
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật thông tin")
    }
  }



  // Submit add customer
  const handleSubmitAdd = async (values: any) => {
    try {
      await adminCustomerService.createCustomer(values)
      message.success("Đã thêm khách hàng mới")
      setIsAddModalOpen(false)
      addForm.resetFields()
      loadCustomers()
      loadStatistics()
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể thêm khách hàng")
    }
  }

  // Table columns
  const columns: TableColumnsType<Customer> = [
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-medium text-slate-900">{text}</div>
            <div className="text-xs text-slate-500">{record.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || <span className="text-slate-400">Chưa có</span>,
    },
    {
      title: "Hạng",
      dataIndex: "tier",
      key: "tier",
      align: "center",
      render: (tier: CustomerTier) => (
        <Tag color={getTierColor(tier)} icon={getTierIcon(tier)}>
          {tier}
        </Tag>
      ),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      align: "right",
      render: (value) => (
        <span className="font-medium text-slate-900">{formatCurrency(value)}</span>
      ),
      sorter: true,
      showSorterTooltip: { title: "Sắp xếp theo tổng chi tiêu" },
    },
    {
      title: "Điểm tích lũy",
      dataIndex: "points",
      key: "points",
      align: "center",
      render: (value) => (
        <span className="text-orange-600 font-semibold">{value.toLocaleString()}</span>
      ),
      sorter: true,
      showSorterTooltip: { title: "Sắp xếp theo điểm tích lũy" },
    },
    {
      title: "Số đơn hàng",
      key: "orders",
      align: "center",
      render: (_, record) => record._count?.orders || 0,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
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
                <Row gutter={16}>
                  <Col span={6}>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <Statistic
                        title="Tổng số khách hàng"
                        value={statistics.totalCustomers}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <Statistic
                        title="Chi tiêu trung bình"
                        value={statistics.averageSpent}
                        suffix="₫"
                        valueStyle={{ color: "#52c41a" }}
                        formatter={(value) =>
                          new Intl.NumberFormat("vi-VN").format(value as number)
                        }
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <Statistic
                        title="Tổng số đơn hàng"
                        value={statistics.totalOrders || 0}
                        prefix={<ShoppingCartOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <Statistic
                        title="Số khách VIP"
                        value={statistics.tierDistribution?.VIP || 0}
                        prefix={<CrownOutlined />}
                        valueStyle={{ color: "#9333ea" }}
                      />
                    </div>
                  </Col>
                </Row>
              )}

              {/* Filters */}
              <div className="flex justify-between items-center">
                <Space size="middle">
                  <Input
                    placeholder="Tìm theo tên, SĐT, email"
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                  />
                  <Select
                    style={{ width: 180 }}
                    value={selectedTier}
                    onChange={setSelectedTier}
                    className={selectedTier !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                  >
                    <Select.Option value="all">Tất cả hạng</Select.Option>
                    <Select.Option value="BRONZE">Hạng Đồng</Select.Option>
                    <Select.Option value="SILVER">Hạng Bạc</Select.Option>
                    <Select.Option value="GOLD">Hạng Vàng</Select.Option>
                    <Select.Option value="VIP">Hạng VIP</Select.Option>
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
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Thêm khách hàng
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Table */}
            <Table
              columns={columns}
              dataSource={customers}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Hiển thị ${total} khách hàng`,
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
        title="Chi tiết khách hàng"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedCustomer && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Tên" span={2}>
              {selectedCustomer.name}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedCustomer.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedCustomer.email || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Hạng">
              <Tag color={getTierColor(selectedCustomer.tier)} icon={getTierIcon(selectedCustomer.tier)}>
                {selectedCustomer.tier}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Điểm tích lũy">
              <span className="text-orange-600 font-semibold">
                {selectedCustomer.points.toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng chi tiêu" span={2}>
              <span className="font-semibold">
                {formatCurrency(selectedCustomer.totalSpent)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Số đơn hàng">
              {selectedCustomer._count?.orders || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Số đánh giá">
              {selectedCustomer._count?.reviews || 0}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin khách hàng"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSubmitEdit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Vui lòng nhập SĐT" }, { pattern: /^[0-9]{10}$/, message: "SĐT phải 10 số" }]}
              >
                <Input placeholder="0123456789" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hạng thành viên" name="tier" rules={[{ required: true }]}>
                <Select placeholder="Chọn hạng thành viên">
                  <Select.Option value="BRONZE">Hạng Đồng</Select.Option>
                  <Select.Option value="SILVER">Hạng Bạc</Select.Option>
                  <Select.Option value="GOLD">Hạng Vàng</Select.Option>
                  <Select.Option value="VIP">Hạng VIP</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Điểm hiện tại" name="currentPoints">
                <InputNumber disabled style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item 
            label="Điều chỉnh điểm" 
            name="pointsAdjustment"
            extra="Nhập số dương để cộng điểm, số âm để trừ điểm"
          >
            <InputNumber placeholder="0" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>



      {/* Add Customer Modal */}
      <Modal
        title="Thêm khách hàng mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
        width={600}
      >
        <Form form={addForm} layout="vertical" onFinish={handleSubmitAdd}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập SĐT" },
                  { pattern: /^[0-9]{10}$/, message: "SĐT phải 10 số" },
                ]}
              >
                <Input placeholder="0123456789" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hạng thành viên" name="tier" initialValue="BRONZE" rules={[{ required: true }]}>
                <Select placeholder="Chọn hạng thành viên">
                  <Select.Option value="BRONZE">Hạng Đồng</Select.Option>
                  <Select.Option value="SILVER">Hạng Bạc</Select.Option>
                  <Select.Option value="GOLD">Hạng Vàng</Select.Option>
                  <Select.Option value="VIP">Hạng VIP</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Điểm tích lũy" name="points" initialValue={0}>
                <InputNumber placeholder="0" style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default function AdminCustomersPage() {
  return (
    <AdminLayout title="Quản lý Khách hàng">
      <App>
        <CustomersContent />
      </App>
    </AdminLayout>
  )
}
