"use client"

import React, { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  Button,
  Modal,
  Form,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Spin,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  App,
  TreeSelect,
  Tooltip,
  Input,
} from "antd"
import {
  PlusOutlined,
  SearchOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined,
  DollarOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import {
  promotionService,
  type Promotion,
  type CreatePromotionDto,
  type PromotionStatistics,
} from "@/services/promotion.service"
import { adminProductService, type Product } from "@/services/admin-product.service"
import { adminCategoryService, type Category } from "@/services/admin-category.service"
import dayjs from "dayjs"

const { Search } = Input

function PromotionsContent() {
  const { message } = App.useApp()

  // States
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [productTreeData, setProductTreeData] = useState<any[]>([])
  const [statistics, setStatistics] = useState<PromotionStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [form] = Form.useForm()

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await promotionService.getStatistics()
      setStatistics(response.data)
    } catch (error: any) {
      console.error("Failed to load statistics:", error)
    }
  }

  // Load products for selection
  const loadProductTree = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        adminProductService.getProducts({ page: 1, limit: 999 }),
        adminCategoryService.getCategories({ page: 1, limit: 999 })
      ])
      
      const products: Product[] = productsRes.data
      const categories: Category[] = categoriesRes.data

      // Build tree data
      const tree = categories.map((cat) => {
        const catProducts = products.filter((p) => p.categoryId === cat.id)
        return {
          title: cat.name,
          value: `cat-${cat.id}`,
          key: `cat-${cat.id}`,
          children: catProducts.map((p) => ({
            title: `${p.code} - ${p.name}`,
            value: p.id,
            key: p.id,
          })),
        }
      }).filter(node => node.children.length > 0)

      // Add uncategorized products
      const noCatProducts = products.filter((p) => !p.categoryId)
      if (noCatProducts.length > 0) {
        tree.push({
          title: "Khác",
          value: "cat-other",
          key: "cat-other",
          children: noCatProducts.map((p) => ({
            title: `${p.code} - ${p.name}`,
            value: p.id,
            key: p.id,
          })),
        })
      }

      setProductTreeData(tree)
    } catch (error) {
      console.error("Failed to load products/categories:", error)
    }
  }

  // Load promotions with Client-side filtering
  const loadPromotions = async () => {
    setLoading(true)
    try {
      // Fetch ALL promotions
      const response = await promotionService.getPromotions({
        page: 1,
        limit: 999, // Fetch all for client-side filtering
      })

      let filteredData = response.data

      // Filter by Search Query (Code)
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase()
        filteredData = filteredData.filter((p) => 
          p.code.toLowerCase().includes(lowerQuery)
        )
      }

      // Filter by Active Status
      if (isActiveFilter === "active") {
        filteredData = filteredData.filter((p) => p.isActive)
      } else if (isActiveFilter === "inactive") {
        filteredData = filteredData.filter((p) => !p.isActive)
      } else if (isActiveFilter === "expired") {
        filteredData = filteredData.filter((p) => p.expiryDate && dayjs(p.expiryDate).isBefore(dayjs()))
      }

      // Filter by Type
      if (typeFilter !== "all") {
        filteredData = filteredData.filter((p) => p.type === typeFilter)
      }

      setPromotions(filteredData)
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }))
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách khuyến mãi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
    loadProductTree()
  }, [])

  useEffect(() => {
    loadPromotions()
  }, [searchQuery, isActiveFilter, typeFilter])

  // Handle create/edit
  const handleOpenModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion)
      let productIds: string[] = []
      try {
        if (promotion.applicableProducts) {
          productIds = JSON.parse(promotion.applicableProducts)
        }
      } catch (e) { console.error("Error parsing product IDs", e) }

      form.setFieldsValue({
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
        maxUses: promotion.maxUses,
        isActive: promotion.isActive,
        expiryDate: promotion.expiryDate ? dayjs(promotion.expiryDate) : undefined,
        minOrderAmount: promotion.minOrderAmount,
        applicableProducts: productIds,
      })
    } else {
      setEditingPromotion(null)
      form.resetFields()
      form.setFieldsValue({
        isActive: true,
        type: "PERCENTAGE",
        applicableProducts: [],
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePromotionDto = {
        ...values,
        expiryDate: values.expiryDate ? dayjs(values.expiryDate).toISOString() : undefined,
        applicableProducts: values.applicableProducts?.length ? JSON.stringify(values.applicableProducts) : undefined,
      }

      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, data)
        message.success("Cập nhật khuyến mãi thành công!")
      } else {
        await promotionService.createPromotion(data)
        message.success("Tạo khuyến mãi thành công!")
      }

      setIsModalOpen(false)
      form.resetFields()
      setEditingPromotion(null)
      loadPromotions()
      loadStatistics()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Không thể lưu khuyến mãi"
      if (errorMsg.includes("Unique constraint")) {
        message.error("Mã khuyến mãi đã tồn tại!")
      } else {
        message.error(errorMsg)
      }
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await promotionService.deletePromotion(id)
      message.success("Xóa khuyến mãi thành công!")
      loadPromotions()
      loadStatistics()
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa khuyến mãi")
    }
  }

  // Handle Toggle Active
  const handleToggleActive = async (record: Promotion) => {
    const action = record.isActive ? "ẩn" : "hiện"
    try {
      await promotionService.updatePromotion(record.id, {
        isActive: !record.isActive,
      })
      message.success(`Đã ${action} khuyến mãi thành công`)
      loadPromotions()
      loadStatistics()
    } catch (error: any) {
      message.error(error.response?.data?.message || `Không thể ${action} khuyến mãi`)
    }
  }

  // Get promotion status
  const getPromotionStatus = (promotion: Promotion) => {
    if (!promotion.isActive) {
      return { color: "default", text: "Ngừng hoạt động", icon: <CloseCircleOutlined /> }
    }
    if (promotion.expiryDate && new Date(promotion.expiryDate) < new Date()) {
      return { color: "error", text: "Đã hết hạn", icon: <CloseCircleOutlined /> }
    }
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return { color: "warning", text: "Đã hết lượt", icon: <CloseCircleOutlined /> }
    }
    return { color: "success", text: "Đang hoạt động", icon: <CheckCircleOutlined /> }
  }

  // Columns
  const columns: TableColumnsType<Promotion> = [
    {
      title: "Mã khuyến mãi",
      dataIndex: "code",
      key: "code",
      width: 150,
      fixed: "left",
      render: (code: string, record: Promotion) => (
        <span style={{ opacity: record.isActive ? 1 : 0.5 }}>
          <Tag color="blue" style={{ fontWeight: 600 }}>{code}</Tag>
        </span>
      ),
    },
    {
      title: "Loại khuyến mãi",
      dataIndex: "type",
      key: "type",
      width: 140,
      render: (type: string, record: Promotion) => (
        <span style={{ opacity: record.isActive ? 1 : 0.5 }}>
          <Tag 
            color={type === "PERCENTAGE" ? "orange" : "green"} 
            icon={type === "PERCENTAGE" ? <PercentageOutlined /> : <DollarOutlined />}
          >
            {type === "PERCENTAGE" ? "Phần trăm" : "Cố định"}
          </Tag>
        </span>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 120,
      align: "right",
      render: (value: number, record: Promotion) => (
        <span className="font-medium" style={{ opacity: record.isActive ? 1 : 0.5 }}>
          {record.type === "PERCENTAGE" ? `${value}%` : `${value.toLocaleString()} ₫`}
        </span>
      ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      width: 150,
      align: "right",
      render: (amount: number | null, record: Promotion) =>
        <span style={{ opacity: record.isActive ? 1 : 0.5 }}>
          {amount ? `${amount.toLocaleString()} ₫` : "-"}
        </span>,
    },
    {
      title: "Số lượt dùng",
      key: "usage",
      width: 140,
      align: "center",
      sorter: (a, b) => a.usedCount - b.usedCount,
      showSorterTooltip: { title: 'Sắp xếp theo số lượt dùng' },
      render: (_, record: Promotion) => (
        <div style={{ opacity: record.isActive ? 1 : 0.5 }}>
          <span className="font-medium">{record.usedCount}</span>
          <span className="text-xs text-gray-500">
            {record.maxUses ? `/ ${record.maxUses}` : "Không giới hạn"}
          </span>
        </div>
      ),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 150,
      align: "center",
      sorter: (a, b) => {
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : 0
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : 0
        return dateA - dateB
      },
      showSorterTooltip: { title: 'Sắp xếp theo ngày hết hạn' },
      render: (date: string | null, record: Promotion) =>
        <span style={{ opacity: record.isActive ? 1 : 0.5 }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : <span className="text-gray-400">Không giới hạn</span>}
        </span>,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 160,
      align: "center",
      render: (_, record: Promotion) => {
        const { color, text, icon } = getPromotionStatus(record)
        return <Tag color={color} icon={icon}>{text}</Tag>
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      align: "center",
      render: (_, record: Promotion) => (
        <Space size="small">
          <Tooltip title={record.isActive ? "Ẩn khuyến mãi" : "Hiện khuyến mãi"}>
            <Button
              type="text"
              icon={record.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleToggleActive(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa khuyến mãi?"
            description={
              <div>
                 <p>Bạn có chắc muốn xóa <strong>{record.code}</strong>?</p>
                 <p className="text-xs text-red-500 mt-1">Hành động này không thể hoàn tác.</p>
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
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
                        title="Tổng khuyến mãi"
                        value={statistics.totalPromotions}
                        prefix={<TagOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <Statistic
                        title="Đang hoạt động"
                        value={statistics.activePromotions}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <Statistic
                        title="Đã hết hạn"
                        value={statistics.expiredPromotions}
                        prefix={<CloseCircleOutlined />}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <Statistic
                        title="Tổng lượt sử dụng"
                        value={statistics.totalUses}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </div>
                  </Col>
                </Row>
              )}

              {/* Filters */}
              <div className="flex justify-between items-center">
                <Space size="middle">
                  <Input
                    placeholder="Tìm mã khuyến mãi..."
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                  />
                  <Select
                    value={typeFilter}
                    onChange={setTypeFilter}
                    style={{ width: 180 }}
                    className={typeFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                  >
                    <Select.Option value="all">Tất cả loại</Select.Option>
                    <Select.Option value="PERCENTAGE">Phần trăm (%)</Select.Option>
                    <Select.Option value="FIXED">Cố định (₫)</Select.Option>
                  </Select>
                  <Select
                    value={isActiveFilter}
                    onChange={setIsActiveFilter}
                    style={{ width: 200 }}
                    className={isActiveFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                  >
                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                    <Select.Option value="active">Đang hoạt động</Select.Option>
                    <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
                    <Select.Option value="expired">Đã hết hạn</Select.Option>
                  </Select>
                </Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  Tạo khuyến mãi
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Table */}
            <Table
              columns={columns}
              dataSource={promotions}
              rowKey="id"
              pagination={{
                ...pagination,
                onChange: (page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize })
                },
                showSizeChanger: true,
                showTotal: (total) => `Hiển thị ${total} khuyến mãi`,
              }}
              scroll={{ x: 1200 }}
              bordered={false}
              className="ant-table-custom"
            />
          </CardContent>
        </Card>
      </Spin>

      {/* Create/Edit Modal */}
      <Modal
        title={editingPromotion ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
          setEditingPromotion(null)
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Mã khuyến mãi"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã khuyến mãi!" },
              { min: 3, max: 20, message: "Mã phải từ 3-20 ký tự!" },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: "Mã chỉ chứa chữ cái, số và gạch ngang/dưới" }
            ]}
          >
            <Input
              size="large"
              placeholder="VD: SALE20"
              style={{ textTransform: "uppercase" }}
              onChange={(e) => {
                form.setFieldsValue({ code: e.target.value.toUpperCase() })
              }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại khuyến mãi"
                name="type"
                rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
              >
                <Select size="large">
                  <Select.Option value="PERCENTAGE">Phần trăm (%)</Select.Option>
                  <Select.Option value="FIXED">Số tiền cố định (₫)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.type !== curr.type}
              >
                {({ getFieldValue }) => {
                  const type = getFieldValue("type")
                  return (
                    <Form.Item
                      label={`Giá trị giảm (${type === "PERCENTAGE" ? "%" : "₫"})`}
                      name="value"
                      rules={[
                        { required: true, message: "Vui lòng nhập giá trị!" },
                        { 
                          type: "number", 
                          min: 0, 
                          max: type === "PERCENTAGE" ? 100 : undefined,
                          message: type === "PERCENTAGE" ? "Phần trăm từ 0-100" : "Giá trị phải > 0" 
                        },
                      ]}
                    >
                      <InputNumber<number>
                        size="large" 
                        style={{ width: "100%" }} 
                        min={0}
                        formatter={(value) => type !== "PERCENTAGE" && value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : `${value}`}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                      />
                    </Form.Item>
                  )
                }}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giá trị đơn hàng tối thiểu" name="minOrderAmount">
                <InputNumber<number>
                  size="large"
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0 (Không áp dụng)"
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                  suffix="₫"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Lượt sử dụng tối đa" name="maxUses">
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="Không giới hạn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ngày hết hạn" name="expiryDate">
            <DatePicker
              size="large"
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày hết hạn (Để trống nếu không giới hạn)"
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day")
              }}
            />
          </Form.Item>

          <Form.Item label="Áp dụng cho sản phẩm (Tùy chọn)" name="applicableProducts">
            <TreeSelect
              treeData={productTreeData}
              treeCheckable
              showCheckedStrategy={TreeSelect.SHOW_CHILD}
              placeholder="Chọn sản phẩm áp dụng (Chọn danh mục để chọn tất cả sản phẩm)"
              style={{ width: '100%' }}
              allowClear
              size="large"
              maxTagCount="responsive"
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              onClick={() => {
                setIsModalOpen(false)
                form.resetFields()
                setEditingPromotion(null)
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingPromotion ? "Lưu thay đổi" : "Tạo khuyến mãi"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default function AdminPromotionsPage() {
  return (
    <AdminLayout title="Quản lý Khuyến mãi">
      <App>
        <PromotionsContent />
      </App>
    </AdminLayout>
  )
}
