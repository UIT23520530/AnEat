"use client";

import { useState } from "react";
import { Table, Button, Input, Space, Tag, Modal, App } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { PromotionsForm } from "@/components/forms/PromotionsForm";

interface Promotion {
  id: string;
  name: string;
  code: string;
  discount: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  status: "active" | "expired" | "scheduled";
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
}

const mockPromotions: Promotion[] = [
  {
    id: "PROMO01",
    name: "Giảm 20% cho đơn hàng đầu tiên",
    code: "WELCOME20",
    discount: "20%",
    discountType: "percentage",
    discountValue: 20,
    status: "active",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    usageLimit: 1000,
    usageCount: 450,
  },
  {
    id: "PROMO02",
    name: "Miễn phí vận chuyển",
    code: "FREESHIP",
    discount: "100%",
    discountType: "percentage",
    discountValue: 100,
    status: "active",
    startDate: "2025-09-15",
    endDate: "2025-11-15",
    usageCount: 1250,
  },
  {
    id: "PROMO03",
    name: "Giảm 50K cho đơn từ 200K",
    code: "50KOFF",
    discount: "50,000đ",
    discountType: "fixed",
    discountValue: 50000,
    status: "expired",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    usageLimit: 500,
    usageCount: 500,
  },
  {
    id: "PROMO04",
    name: "Giảm 15% toàn bộ đơn hàng",
    code: "SAVE15",
    discount: "15%",
    discountType: "percentage",
    discountValue: 15,
    status: "active",
    startDate: "2025-10-10",
    endDate: "2025-12-31",
    usageLimit: 2000,
    usageCount: 780,
  },
  {
    id: "PROMO05",
    name: "Giảm 100K cho đơn từ 500K",
    code: "100KOFF",
    discount: "100,000đ",
    discountType: "fixed",
    discountValue: 100000,
    status: "active",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    usageLimit: 300,
    usageCount: 125,
  },
  {
    id: "PROMO06",
    name: "Flash Sale - Giảm 30%",
    code: "FLASH30",
    discount: "30%",
    discountType: "percentage",
    discountValue: 30,
    status: "expired",
    startDate: "2025-09-20",
    endDate: "2025-09-22",
    usageLimit: 100,
    usageCount: 100,
  },
  {
    id: "PROMO07",
    name: "Khuyến mãi Black Friday",
    code: "BLACKFRIDAY",
    discount: "40%",
    discountType: "percentage",
    discountValue: 40,
    status: "scheduled",
    startDate: "2025-11-25",
    endDate: "2025-11-30",
    usageLimit: 5000,
    usageCount: 0,
  },
  {
    id: "PROMO08",
    name: "Giảm 25K cho đơn từ 100K",
    code: "25KOFF",
    discount: "25,000đ",
    discountType: "fixed",
    discountValue: 25000,
    status: "active",
    startDate: "2025-10-05",
    endDate: "2025-10-25",
    usageLimit: 1500,
    usageCount: 890,
  },
];

export default function PromotionsPage() {
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const handleDelete = (promo: Promotion) => {
    Modal.confirm({
      title: `Xóa khuyến mãi: ${promo.name}`,
      content: "Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        message.success("Đã xóa khuyến mãi thành công");
      },
    });
  };

  const handleEdit = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setIsEditModalOpen(true);
  };

  const filteredPromotions = mockPromotions.filter(
    (promo) =>
      promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.discount.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Promotion) => (
        <div>
          <div className="font-semibold text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">Mã: {record.code}</div>
        </div>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      sorter: (a, b) => a.discountValue - b.discountValue,
      render: (text: string, record: Promotion) => (
        <span className="font-semibold text-green-600">{text}</span>
      ),
    },
    {
      title: "Thời gian",
      key: "duration",
      render: (_, record: Promotion) => (
        <div className="text-sm">
          <div className="text-slate-600">
            Từ: <span className="font-medium">{record.startDate}</span>
          </div>
          <div className="text-slate-600">
            Đến: <span className="font-medium">{record.endDate}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Lượt sử dụng",
      key: "usage",
      align: "center",
      sorter: (a, b) => a.usageCount - b.usageCount,
      render: (_, record: Promotion) => (
        <div className="text-sm">
          <div className="font-semibold text-blue-600">{record.usageCount}</div>
          {record.usageLimit && (
            <div className="text-xs text-slate-500">/ {record.usageLimit}</div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Đang hoạt động", value: "active" },
        { text: "Đã hết hạn", value: "expired" },
        { text: "Sắp diễn ra", value: "scheduled" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const statusConfig = {
          active: { color: "green", text: "Đang hoạt động" },
          expired: { color: "default", text: "Đã hết hạn" },
          scheduled: { color: "blue", text: "Sắp diễn ra" },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      width: 120,
      render: (_, record: Promotion) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Quản lý khuyến mãi
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Quản lý các chương trình khuyến mãi và mã giảm giá
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Input
                  placeholder="Tìm kiếm khuyến mãi..."
                  prefix={<SearchOutlined className="text-slate-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Tạo khuyến mãi
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table
              columns={columns}
              dataSource={filteredPromotions}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredPromotions.length,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khuyến mãi`,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
              onChange={handleTableChange}
              className="ant-table-custom"
              bordered={false}
            />
          </CardContent>
        </Card>

        {/* Add Promotion Modal */}
        <Modal
          title={<span className="text-lg font-semibold">Tạo khuyến mãi mới</span>}
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          width={900}
          centered
          destroyOnHidden
          maskClosable={false}
          transitionName="ant-fade"
          maskTransitionName="ant-fade"
        >
          <p className="text-slate-500 mb-6">Tạo chương trình khuyến mãi và mã giảm giá mới.</p>
          <PromotionsForm onSuccess={() => setIsAddModalOpen(false)} />
        </Modal>

        {/* Edit Promotion Modal */}
        <Modal
          title={<span className="text-lg font-semibold">Chỉnh sửa: {selectedPromotion?.name}</span>}
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
          width={900}
          centered
          destroyOnHidden
          maskClosable={false}
          transitionName="ant-fade"
          maskTransitionName="ant-fade"
        >
          <p className="text-slate-500 mb-6">Cập nhật thông tin chương trình khuyến mãi.</p>
          <PromotionsForm 
            promotion={selectedPromotion!} 
            onSuccess={() => setIsEditModalOpen(false)} 
          />
        </Modal>
      </div>
    </AdminLayout>
  );
}