"use client";

import { ManagerLayout } from "@/components/layouts/manager-layout";
import { useState } from "react";
import { Table, Space, Button, Tag, Modal, Form, Popconfirm, App, Statistic, Row, Col, Tabs } from "antd";
import type { TableColumnsType } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, PercentageOutlined, GiftOutlined, TruckOutlined, TagsOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PromotionsForm from "@/components/forms/manager/PromotionsForm";
import dayjs from "dayjs";

interface Promotion {
  key: string;
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "freeship" | "bogo";
  value: number;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  usageLimit?: number;
  usedCount: number;
  description?: string;
  active: boolean;
  status: "active" | "scheduled" | "expired";
}

// Mock data for Downtown Store promotions
const initialPromotions: Promotion[] = [
  {
    key: "1",
    id: "PROMO001",
    name: "Giảm 20% đơn hàng trên 500k",
    code: "SALE20",
    type: "percentage",
    value: 20,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    minOrderValue: 500000,
    usageLimit: 1000,
    usedCount: 456,
    description: "Áp dụng cho tất cả món ăn",
    active: true,
    status: "active",
  },
  {
    key: "2",
    id: "PROMO002",
    name: "Miễn phí vận chuyển",
    code: "FREESHIP",
    type: "freeship",
    value: 0,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    minOrderValue: 200000,
    usedCount: 892,
    description: "Miễn phí ship cho đơn từ 200k",
    active: true,
    status: "active",
  },
  {
    key: "3",
    id: "PROMO003",
    name: "Giảm 50k đơn đầu tiên",
    code: "WELCOME50",
    type: "fixed",
    value: 50000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    minOrderValue: 100000,
    usageLimit: 500,
    usedCount: 234,
    description: "Dành cho khách hàng mới",
    active: true,
    status: "active",
  },
  {
    key: "4",
    id: "PROMO004",
    name: "Mua 1 tặng 1 Cà phê",
    code: "BOGO-COFFEE",
    type: "bogo",
    value: 0,
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    minOrderValue: 0,
    usageLimit: 200,
    usedCount: 167,
    description: "Áp dụng cho menu cà phê",
    active: false,
    status: "expired",
  },
  {
    key: "5",
    id: "PROMO005",
    name: "Flash Sale Cuối Tuần",
    code: "WEEKEND30",
    type: "percentage",
    value: 30,
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    minOrderValue: 300000,
    usageLimit: 100,
    usedCount: 0,
    description: "Giảm 30% vào thứ 7 & CN",
    active: true,
    status: "scheduled",
  },
  {
    key: "6",
    id: "PROMO006",
    name: "Sinh Nhật Cửa Hàng",
    code: "BDAY50",
    type: "percentage",
    value: 50,
    startDate: "2024-05-01",
    endDate: "2024-05-07",
    minOrderValue: 0,
    usageLimit: 1000,
    usedCount: 856,
    description: "Kỷ niệm 5 năm thành lập",
    active: false,
    status: "expired",
  },
];

function PromotionsContent() {
  const { message } = App.useApp();
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");

  const handleAdd = () => {
    setEditingPromotion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    setIsModalOpen(true);
  };

  const handleDelete = (key: string) => {
    setPromotions(promotions.filter((item) => item.key !== key));
    message.success("Xóa khuyến mãi thành công!");
  };

  const handleSubmit = (values: any) => {
    const [startDate, endDate] = values.dateRange;
    const formattedValues = {
      ...values,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
    };

    if (editingPromotion) {
      // Edit existing promotion
      setPromotions(
        promotions.map((item) =>
          item.key === editingPromotion.key
            ? {
                ...item,
                ...formattedValues,
                status: dayjs().isBefore(startDate) ? "scheduled" as const : dayjs().isAfter(endDate) ? "expired" as const : "active" as const,
              }
            : item
        )
      );
      message.success("Cập nhật khuyến mãi thành công!");
    } else {
      // Add new promotion
      const newPromotion: Promotion = {
        key: Date.now().toString(),
        id: `PROMO${String(promotions.length + 1).padStart(3, "0")}`,
        ...formattedValues,
        usedCount: 0,
        status: dayjs().isBefore(startDate) ? "scheduled" as const : "active" as const,
      };
      setPromotions([...promotions, newPromotion]);
      message.success("Tạo khuyến mãi thành công!");
    }

    setIsModalOpen(false);
    form.resetFields();
  };

  const handleModalOk = () => {
    form.submit();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <PercentageOutlined />;
      case "fixed":
        return <TagsOutlined />;
      case "freeship":
        return <TruckOutlined />;
      case "bogo":
        return <GiftOutlined />;
      default:
        return null;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "percentage":
        return "Giảm %";
      case "fixed":
        return "Giảm cố định";
      case "freeship":
        return "Freeship";
      case "bogo":
        return "BOGO";
      default:
        return type;
    }
  };

  const columns: TableColumnsType<Promotion> = [
    {
      title: "Mã KM",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code) => <strong style={{ color: "#52c41a" }}>{code}</strong>,
    },
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (type) => (
        <Tag icon={getTypeIcon(type)} color="blue">
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 100,
      render: (value, record) => {
        if (record.type === "percentage") {
          return `${value}%`;
        } else if (record.type === "fixed") {
          return `${value.toLocaleString()}đ`;
        }
        return "-";
      },
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderValue",
      key: "minOrderValue",
      width: 130,
      render: (value) => `${value.toLocaleString()}đ`,
    },
    {
      title: "Thời gian",
      key: "period",
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          <div>{record.startDate}</div>
          <div>{record.endDate}</div>
        </div>
      ),
    },
    {
      title: "Sử dụng",
      key: "usage",
      width: 120,
      render: (_, record) => (
        <span>
          {record.usedCount}
          {record.usageLimit && ` / ${record.usageLimit}`}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "default";
        let text = status;
        if (status === "active") {
          color = "green";
          text = "Đang chạy";
        } else if (status === "scheduled") {
          color = "blue";
          text = "Sắp diễn ra";
        } else if (status === "expired") {
          color = "red";
          text = "Đã kết thúc";
        }
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: "Đang chạy", value: "active" },
        { text: "Sắp diễn ra", value: "scheduled" },
        { text: "Đã kết thúc", value: "expired" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
          </Button>
          <Popconfirm
            title="Xóa khuyến mãi"
            description="Bạn có chắc muốn xóa khuyến mãi này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter promotions based on active tab
  const filteredPromotions = promotions.filter((promo) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return promo.status === "active";
    if (activeTab === "scheduled") return promo.status === "scheduled";
    if (activeTab === "expired") return promo.status === "expired";
    return true;
  });

  // Calculate stats
  const activeCount = promotions.filter((p) => p.status === "active").length;
  const scheduledCount = promotions.filter((p) => p.status === "scheduled").length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usedCount, 0);

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Quản lý Khuyến mãi
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Tạo và quản lý các chương trình khuyến mãi cho cửa hàng Downtown Store
              </p>
            </div>

            {/* Stats Cards */}
            <Row gutter={16}>
              <Col span={6}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Tổng chương trình"
                    value={promotions.length}
                    prefix={<GiftOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <Statistic
                    title="Đang chạy"
                    value={activeCount}
                    prefix={<TagsOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Sắp diễn ra"
                    value={scheduledCount}
                    prefix={<PercentageOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <Statistic
                    title="Lượt sử dụng"
                    value={totalUsage}
                    prefix={<TruckOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </div>
              </Col>
            </Row>

            {/* Action Button */}
            <div>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600">
                Tạo khuyến mãi mới
              </Button>
            </div>

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "all",
                  label: `Tất cả (${promotions.length})`,
                },
                {
                  key: "active",
                  label: `Đang chạy (${activeCount})`,
                },
                {
                  key: "scheduled",
                  label: `Sắp diễn ra (${scheduledCount})`,
                },
                {
                  key: "expired",
                  label: `Đã kết thúc (${promotions.filter((p) => p.status === "expired").length})`,
                },
              ]}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredPromotions}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} khuyến mãi`,
            }}
            scroll={{ x: 1200 }}
            bordered={false}
            className="ant-table-custom"
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        title={<span className="text-lg font-semibold">{editingPromotion ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}</span>}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        width={900}
        okText={editingPromotion ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnHidden
        centered
        maskClosable={false}
        transitionName="ant-fade"
        maskTransitionName="ant-fade"
      >
        <PromotionsForm
          form={form}
          initialValues={editingPromotion}
          onFinish={handleSubmit}
        />
      </Modal>
    </div>
  );
}

export default function ManagerPromotionsPage() {
  return (
    <ManagerLayout>
      <PromotionsContent />
    </ManagerLayout>
  );
}