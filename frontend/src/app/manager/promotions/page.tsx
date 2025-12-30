"use client";

import React, { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layouts/manager-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  Input,
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
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  promotionService,
  type Promotion,
  type CreatePromotionDto,
  type PromotionStatistics,
} from "@/services/promotion.service";
import dayjs from "dayjs";

const { Search } = Input;

function PromotionsContent() {
  const { message } = App.useApp();

  // States
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [statistics, setStatistics] = useState<PromotionStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form] = Form.useForm();

  // Load promotions
  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getPromotions({
        page: pagination.current,
        limit: pagination.pageSize,
        isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "active",
        search: searchQuery || undefined,
      });

      setPromotions(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.totalItems,
      }));
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await promotionService.getStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      console.error("Failed to load statistics:", error);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [pagination.current, pagination.pageSize, searchQuery, isActiveFilter]);

  // Handle create/edit
  const handleOpenModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      form.setFieldsValue({
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
        maxUses: promotion.maxUses,
        isActive: promotion.isActive,
        expiryDate: promotion.expiryDate ? dayjs(promotion.expiryDate) : undefined,
        minOrderAmount: promotion.minOrderAmount,
      });
    } else {
      setEditingPromotion(null);
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        type: "PERCENTAGE",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: CreatePromotionDto) => {
    try {
      const data = {
        ...values,
        expiryDate: values.expiryDate ? dayjs(values.expiryDate).toISOString() : undefined,
      };

      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, data);
        message.success("Cập nhật khuyến mãi thành công!");
      } else {
        await promotionService.createPromotion(data);
        message.success("Tạo khuyến mãi thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingPromotion(null);
      loadPromotions();
      loadStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể lưu khuyến mãi");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await promotionService.deletePromotion(id);
      message.success("Xóa khuyến mãi thành công!");
      loadPromotions();
      loadStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa khuyến mãi");
    }
  };

  // Get promotion status
  const getPromotionStatus = (promotion: Promotion) => {
    if (!promotion.isActive) {
      return { color: "default", text: "Ngừng hoạt động" };
    }
    if (promotion.expiryDate && new Date(promotion.expiryDate) < new Date()) {
      return { color: "error", text: "Đã hết hạn" };
    }
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return { color: "warning", text: "Đã hết lượt" };
    }
    return { color: "success", text: "Đang hoạt động" };
  };

  // Columns
  const columns: ColumnsType<Promotion> = [
    {
      title: "Mã khuyến mãi",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <Tag color={type === "PERCENTAGE" ? "orange" : "green"} icon={type === "PERCENTAGE" ? <PercentageOutlined /> : <DollarOutlined />}>
          {type === "PERCENTAGE" ? "Phần trăm" : "Cố định"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 120,
      align: "center",
      render: (value: number, record: Promotion) =>
        record.type === "PERCENTAGE" ? `${value}%` : `${value.toLocaleString()} ₫`,
    },
    {
      title: "Điều kiện tối thiểu",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      width: 150,
      align: "right",
      render: (amount: number | null) =>
        amount ? `${amount.toLocaleString()} ₫` : "-",
    },
    {
      title: "Số lượt",
      key: "usage",
      width: 120,
      align: "center",
      render: (_, record: Promotion) => (
        <div>
          <div className="font-medium">{record.usedCount}</div>
          <div className="text-xs text-gray-500">
            {record.maxUses ? `/ ${record.maxUses}` : "Không giới hạn"}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 120,
      render: (date: string | null) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "Không giới hạn",
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record: Promotion) => {
        const status = getPromotionStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record: Promotion) => (
        <Space>
          <Button
            type="link"
            icon={<SearchOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa khuyến mãi?"
            description="Bạn có chắc muốn xóa khuyến mãi này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Quản lý Khuyến mãi
              </CardTitle>
            </div>

            {/* Stats Cards */}
            <Row gutter={16}>
              <Col span={6}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Tổng khuyến mãi"
                    value={statistics?.totalPromotions || 0}
                    prefix={<TagOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <Statistic
                    title="Đang hoạt động"
                    value={statistics?.activePromotions || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <Statistic
                    title="Đã hết hạn"
                    value={statistics?.expiredPromotions || 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <Statistic
                    title="Tổng lượt sử dụng"
                    value={statistics?.totalUses || 0}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </div>
              </Col>
            </Row>

            {/* Filters */}
            <div className="flex justify-between items-center">
              <Space>
                <Search
                  placeholder="Tìm mã khuyến mãi..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={setSearchQuery}
                  onChange={(e) => {
                    if (!e.target.value) setSearchQuery("");
                  }}
                  style={{ width: 300 }}
                />
                <Select
                  value={isActiveFilter}
                  onChange={setIsActiveFilter}
                  style={{ width: 180 }}
                  size="large"
                >
                  <Select.Option value="all">Tất cả</Select.Option>
                  <Select.Option value="active">Đang hoạt động</Select.Option>
                  <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
                </Select>
              </Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => handleOpenModal()}
              >
                Tạo khuyến mãi
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Spin spinning={loading}>
            {/* Promotions Table */}
            <Table
              columns={columns}
              dataSource={promotions}
              rowKey="id"
              pagination={{
                ...pagination,
                onChange: (page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize });
                },
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} khuyến mãi`,
              }}
              scroll={{ x: 1200 }}
              bordered={false}
              className="ant-table-custom"
            />
          </Spin>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingPromotion ? "Sửa khuyến mãi" : "Tạo khuyến mãi"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingPromotion(null);
        }}
        footer={null}
        width={600}
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
            ]}
          >
            <Input
              size="large"
              placeholder="VD: SALE20"
              style={{ textTransform: "uppercase" }}
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
                  <Select.Option value="FIXED">Cố định (₫)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá trị"
                name="value"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị!" },
                  {
                    type: "number",
                    min: 0,
                    message: "Giá trị phải lớn hơn 0!",
                  },
                ]}
              >
                <InputNumber size="large" style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số lượt sử dụng tối đa" name="maxUses">
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="Không giới hạn"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá trị đơn hàng tối thiểu" name="minOrderAmount">
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ngày hết hạn" name="expiryDate">
            <DatePicker
              size="large"
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Không giới hạn"
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                  setEditingPromotion(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPromotion ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <ManagerLayout>
        <App>
            <PromotionsContent />
        </App>
    </ManagerLayout>
  );
}
