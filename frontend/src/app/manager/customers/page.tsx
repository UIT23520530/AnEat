"use client"

import { useState, useEffect, Suspense } from "react"
import { ManagerLayout } from "@/components/layouts/manager-layout"
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
  Card as AntCard,
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
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  StarOutlined,
  EditOutlined,
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import {
  managerCustomerService,
  type Customer,
  type CustomerTier,
} from "@/services/manager-customer.service"
import CustomersForm from "@/components/forms/admin/customers/CustomersForm"
import CustomersDetailModal from "@/components/forms/admin/customers/CustomersDetailModal"

function CustomersContent() {
  const { message, modal } = App.useApp()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTier, setSelectedTier] = useState<string>("all")
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

  // Load customers
  const loadCustomers = async () => {
    setLoading(true)
    try {
      const response = await managerCustomerService.getCustomers({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
        tier: selectedTier !== "all" ? (selectedTier as CustomerTier) : undefined,
        includeDeleted: true, // Show deleted customers with fade effect
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
      const response = await managerCustomerService.getStatistics()
      setStatistics(response.data)
    } catch (error: any) {
      message.error("Không thể tải thống kê")
    }
  }

  useEffect(() => {
    loadStatistics()
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [pagination.current, pagination.pageSize, searchQuery, selectedTier])

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
        return "default"
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
      const response = await managerCustomerService.getCustomerById(record.id)
      setSelectedCustomer(response.data)
      setIsDetailModalOpen(true)
    } catch (error: any) {
      message.error("Không thể tải thông tin khách hàng")
    }
  }

  // Handle edit
  const handleEdit = (record: Customer) => {
    setSelectedCustomer(record)
    setIsEditModalOpen(true)
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
      // General update
      const updateData = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        tier: values.tier,
        points: values.currentPoints,
        isActive: values.isActive, // For restore functionality
      }
      await managerCustomerService.updateCustomer(selectedCustomer.id, updateData)

      message.success("Đã cập nhật thông tin khách hàng")
      setIsEditModalOpen(false)
      loadCustomers()
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật thông tin")
    }
  }

  // Submit add customer
  const handleSubmitAdd = async (values: any) => {
    try {
      await managerCustomerService.createCustomer(values)
      message.success("Đã thêm khách hàng mới")
      setIsAddModalOpen(false)
      addForm.resetFields()
      loadCustomers()
      loadStatistics()
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể thêm khách hàng")
    }
  }

  // Handle delete customer
  const handleDelete = (record: Customer) => {
    modal.confirm({
      title: "Xác nhận xóa khách hàng",
      content: `Bạn có chắc chắn muốn xóa khách hàng "${record.name}" (${record.phone})? Thao tác này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await managerCustomerService.deleteCustomer(record.id)
          message.success("Đã xóa khách hàng thành công")
          loadCustomers()
          loadStatistics()
        } catch (error: any) {
          message.error(error.response?.data?.message || "Không thể xóa khách hàng")
        }
      },
    })
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
            <div className="font-medium text-slate-900">
              {text}
              {record.deletedAt && (
                <Tag color="red" className="ml-2">Đã xóa</Tag>
              )}
            </div>
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
      render: (value) => (
        <span className="font-medium text-slate-900">{formatCurrency(value)}</span>
      ),
      sorter: true,
    },
    {
      title: "Điểm tích lũy",
      dataIndex: "points",
      key: "points",
      render: (value) => (
        <span className="text-orange-600 font-semibold">{value.toLocaleString()}</span>
      ),
      sorter: true,
    },
    {
      title: "Số đơn hàng",
      key: "orders",
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
              disabled={!!record.deletedAt}
              className={record.deletedAt ? 'opacity-40' : ''}
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
              disabled={!!record.deletedAt}
              className={record.deletedAt ? 'opacity-40' : ''}
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
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Quản lý Khách hàng
                </CardTitle>
              </div>

              {/* Stats Cards */}
              {statistics && (
                <Row gutter={16}>
                  <Col span={6}>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <Statistic
                        title="Tổng khách hàng"
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
                        prefix="₫"
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
                        title="Khách Gold"
                        value={statistics.tierDistribution?.GOLD || 0}
                        prefix={<TrophyOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <Statistic
                        title="Khách VIP"
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
                  >
                    <Select.Option value="all">Tất cả hạng</Select.Option>
                    <Select.Option value="BRONZE">Hạng Đồng</Select.Option>
                    <Select.Option value="SILVER">Hạng Bạc</Select.Option>
                    <Select.Option value="GOLD">Hạng Vàng</Select.Option>
                    <Select.Option value="VIP">Hạng VIP</Select.Option>
                  </Select>
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
              rowClassName={(record) => record.deletedAt ? 'opacity-40' : ''}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} khách hàng`,
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
      <CustomersDetailModal
        customer={selectedCustomer}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setSelectedCustomer(null)
        }}
      />

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin khách hàng"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
          setSelectedCustomer(null)
        }}
        onOk={() => editForm.submit()}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={700}
      >
        <CustomersForm
          form={editForm}
          isEdit={true}
          selectedCustomer={selectedCustomer as any}
          onFinish={handleSubmitEdit}
        />
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        title="Thêm khách hàng mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
        okText="Thêm khách hàng"
        cancelText="Hủy"
        width={700}
      >
        <CustomersForm
          form={addForm}
          isEdit={false}
          onFinish={handleSubmitAdd}
        />
      </Modal>
    </div>
  )
}

export default function ManagerCustomersPage() {
  return (
    <ManagerLayout title="Quản lý khách hàng">
      <App>
        <Suspense fallback={<div>Loading...</div>}>
          <CustomersContent />
        </Suspense>
      </App>
    </ManagerLayout>
  )
}
