"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Modal, App, Statistic, Row, Col, Tabs, Popconfirm, Form } from "antd";
import type { TableColumnsType } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, PercentageOutlined, GiftOutlined, TruckOutlined, TagsOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { PromotionsForm } from "@/components/forms/admin/PromotionsForm";
import dayjs from "dayjs";

interface Promotion {
  key: string;
  id: string;
  name: string;
  code: string;
  discount: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  type: "percentage" | "fixed" | "freeship" | "bogo";
  value: number;
  status: "active" | "expired" | "scheduled";
  startDate: string;
  endDate: string;
  minOrderValue: number;
  usageLimit?: number;
  usageCount: number;
  usedCount: number;
  description?: string;
  active: boolean;
}

const initialPromotions: Promotion[] = [
  {
    key: "1",
    id: "PROMO01",
    name: "Giảm 20% cho đơn hàng đầu tiên",
    code: "WELCOME20",
    discount: "20%",
    discountType: "percentage",
    discountValue: 20,
    type: "percentage",
    value: 20,
    status: "active",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    minOrderValue: 0,
    usageLimit: 1000,
    usageCount: 450,
    usedCount: 450,
    description: "Dành cho khách hàng mới",
    active: true,
  },
  {
    key: "2",
    id: "PROMO02",
    name: "Miễn phí vận chuyển",
    code: "FREESHIP",
    discount: "100%",
    discountType: "percentage",
    discountValue: 100,
    type: "freeship",
    value: 0,
    status: "active",
    startDate: "2025-09-15",
    endDate: "2025-11-15",
    minOrderValue: 200000,
    usageCount: 1250,
    usedCount: 1250,
    description: "Miễn phí ship cho đơn từ 200k",
    active: true,
  },
  {
    key: "3",
    id: "PROMO03",
    name: "Giảm 50K cho đơn từ 200K",
    code: "50KOFF",
    discount: "50,000đ",
    discountType: "fixed",
    discountValue: 50000,
    type: "fixed",
    value: 50000,
    status: "expired",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    minOrderValue: 200000,
    usageLimit: 500,
    usageCount: 500,
    usedCount: 500,
    description: "Giảm 50k cho đơn từ 200k",
    active: false,
  },
  {
    key: "4",
    id: "PROMO04",
    name: "Giảm 15% toàn bộ đơn hàng",
    code: "SAVE15",
    discount: "15%",
    discountType: "percentage",
    discountValue: 15,
    type: "percentage",
    value: 15,
    status: "active",
    startDate: "2025-10-10",
    endDate: "2025-12-31",
    minOrderValue: 300000,
    usageLimit: 2000,
    usageCount: 780,
    usedCount: 780,
    description: "Giảm 15% toàn bộ đơn hàng",
    active: true,
  },
  {
    key: "5",
    id: "PROMO05",
    name: "Giảm 100K cho đơn từ 500K",
    code: "100KOFF",
    discount: "100,000đ",
    discountType: "fixed",
    discountValue: 100000,
    type: "fixed",
    value: 100000,
    status: "active",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    minOrderValue: 500000,
    usageLimit: 300,
    usageCount: 125,
    usedCount: 125,
    description: "Giảm 100k cho đơn từ 500k",
    active: true,
  },
  {
    key: "6",
    id: "PROMO06",
    name: "Flash Sale - Giảm 30%",
    code: "FLASH30",
    discount: "30%",
    discountType: "percentage",
    discountValue: 30,
    type: "percentage",
    value: 30,
    status: "expired",
    startDate: "2025-09-20",
    endDate: "2025-09-22",
    minOrderValue: 0,
    usageLimit: 100,
    usageCount: 100,
    usedCount: 100,
    description: "Flash sale cuối tuần",
    active: false,
  },
  {
    key: "7",
    id: "PROMO07",
    name: "Khuyến mãi Black Friday",
    code: "BLACKFRIDAY",
    discount: "40%",
    discountType: "percentage",
    discountValue: 40,
    type: "percentage",
    value: 40,
    status: "scheduled",
    startDate: "2025-11-25",
    endDate: "2025-11-30",
    minOrderValue: 0,
    usageLimit: 5000,
    usageCount: 0,
    usedCount: 0,
    description: "Black Friday sale",
    active: true,
  },
  {
    key: "8",
    id: "PROMO08",
    name: "Giảm 25K cho đơn từ 100K",
    code: "25KOFF",
    discount: "25,000đ",
    discountType: "fixed",
    discountValue: 25000,
    type: "fixed",
    value: 25000,
    status: "active",
    startDate: "2025-10-05",
    endDate: "2025-10-25",
    minOrderValue: 100000,
    usageLimit: 1500,
    usageCount: 890,
    usedCount: 890,
    description: "Giảm 25k cho đơn từ 100k",
    active: true,
  },
];

function PromotionsContent() {
  const { message } = App.useApp();
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  const handleAdd = () => {
    setEditingPromotion(undefined);
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
          />
          <Popconfirm
            title="Xóa khuyến mãi"
            description="Bạn có chắc muốn xóa khuyến mãi này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
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
                Tạo và quản lý các chương trình khuyến mãi cho tất cả cửa hàng
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
        onCancel={() => {
          setIsModalOpen(false);
          setEditingPromotion(undefined);
        }}
        footer={null}
        width={900}
        destroyOnHidden
        centered
        maskClosable={false}
        transitionName="ant-fade"
        maskTransitionName="ant-fade"
      >
        <PromotionsForm
          promotion={editingPromotion}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingPromotion(undefined);
          }}
        />
      </Modal>
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <AdminLayout>
      <PromotionsContent />
    </AdminLayout>
  );
}