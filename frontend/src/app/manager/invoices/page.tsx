"use client";

import { ManagerLayout } from "@/components/layouts/manager-layout";
import { useState } from "react";
import { Table, Space, Button, Tag, Modal, Descriptions, App, Statistic, Row, Col, DatePicker, Select, Tabs } from "antd";
import type { TableColumnsType } from "antd";
import { EyeOutlined, PrinterOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  key: string;
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer" | "momo";
  status: "paid" | "pending" | "cancelled" | "refunded";
  staffName: string;
  notes?: string;
}

// Mock data for Downtown Store invoices
const initialInvoices: Invoice[] = [
  {
    key: "1",
    id: "INV-2024-001",
    orderNumber: "ORD-001",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    customerEmail: "nguyenvana@email.com",
    date: "2024-10-15",
    time: "10:30",
    items: [
      { name: "Phở Bò Tái", quantity: 2, price: 65000, total: 130000 },
      { name: "Cà phê sữa đá", quantity: 2, price: 25000, total: 50000 },
    ],
    subtotal: 180000,
    tax: 18000,
    discount: 0,
    total: 198000,
    paymentMethod: "cash",
    status: "paid",
    staffName: "Trần Thị B",
    notes: "Khách yêu cầu không hành",
  },
  {
    key: "2",
    id: "INV-2024-002",
    orderNumber: "ORD-002",
    customerName: "Lê Thị C",
    customerPhone: "0912345678",
    date: "2024-10-15",
    time: "11:45",
    items: [
      { name: "Bún chả Hà Nội", quantity: 1, price: 55000, total: 55000 },
      { name: "Trà đào cam sả", quantity: 1, price: 30000, total: 30000 },
    ],
    subtotal: 85000,
    tax: 8500,
    discount: 17000,
    total: 76500,
    paymentMethod: "card",
    status: "paid",
    staffName: "Phạm Văn D",
    notes: "Áp dụng mã SALE20",
  },
  {
    key: "3",
    id: "INV-2024-003",
    orderNumber: "ORD-003",
    customerName: "Hoàng Văn E",
    customerPhone: "0923456789",
    customerEmail: "hoangvane@email.com",
    date: "2024-10-15",
    time: "12:20",
    items: [
      { name: "Cơm tấm sườn bì chả", quantity: 3, price: 50000, total: 150000 },
      { name: "Nước chanh dây", quantity: 3, price: 20000, total: 60000 },
    ],
    subtotal: 210000,
    tax: 21000,
    discount: 0,
    total: 231000,
    paymentMethod: "momo",
    status: "paid",
    staffName: "Võ Thị F",
  },
  {
    key: "4",
    id: "INV-2024-004",
    orderNumber: "ORD-004",
    customerName: "Đặng Thị G",
    customerPhone: "0934567890",
    date: "2024-10-15",
    time: "13:15",
    items: [
      { name: "Bánh mì thịt nướng", quantity: 2, price: 30000, total: 60000 },
    ],
    subtotal: 60000,
    tax: 6000,
    discount: 0,
    total: 66000,
    paymentMethod: "transfer",
    status: "pending",
    staffName: "Trần Văn H",
  },
  {
    key: "5",
    id: "INV-2024-005",
    orderNumber: "ORD-005",
    customerName: "Bùi Văn I",
    customerPhone: "0945678901",
    date: "2024-10-14",
    time: "14:30",
    items: [
      { name: "Gỏi cuốn tôm thịt", quantity: 2, price: 35000, total: 70000 },
      { name: "Nem rán", quantity: 1, price: 40000, total: 40000 },
    ],
    subtotal: 110000,
    tax: 11000,
    discount: 0,
    total: 121000,
    paymentMethod: "cash",
    status: "cancelled",
    staffName: "Nguyễn Thị J",
    notes: "Khách hủy do thay đổi kế hoạch",
  },
  {
    key: "6",
    id: "INV-2024-006",
    orderNumber: "ORD-006",
    customerName: "Mai Văn K",
    customerPhone: "0956789012",
    customerEmail: "maivank@email.com",
    date: "2024-10-14",
    time: "15:45",
    items: [
      { name: "Hủ tiếu Nam Vang", quantity: 2, price: 60000, total: 120000 },
      { name: "Chả giò", quantity: 1, price: 45000, total: 45000 },
    ],
    subtotal: 165000,
    tax: 16500,
    discount: 0,
    total: 181500,
    paymentMethod: "card",
    status: "refunded",
    staffName: "Lê Thị L",
    notes: "Hoàn tiền theo yêu cầu khách hàng",
  },
  {
    key: "7",
    id: "INV-2024-007",
    orderNumber: "ORD-007",
    customerName: "Phan Thị M",
    customerPhone: "0967890123",
    date: "2024-10-14",
    time: "16:20",
    items: [
      { name: "Mì Quảng", quantity: 1, price: 55000, total: 55000 },
      { name: "Cà phê đen đá", quantity: 1, price: 20000, total: 20000 },
    ],
    subtotal: 75000,
    tax: 7500,
    discount: 15000,
    total: 67500,
    paymentMethod: "momo",
    status: "paid",
    staffName: "Trần Văn N",
    notes: "Áp dụng freeship",
  },
  {
    key: "8",
    id: "INV-2024-008",
    orderNumber: "ORD-008",
    customerName: "Vũ Văn O",
    customerPhone: "0978901234",
    date: "2024-10-13",
    time: "17:30",
    items: [
      { name: "Bò kho bánh mì", quantity: 2, price: 55000, total: 110000 },
      { name: "Sữa chua", quantity: 2, price: 15000, total: 30000 },
    ],
    subtotal: 140000,
    tax: 14000,
    discount: 0,
    total: 154000,
    paymentMethod: "cash",
    status: "paid",
    staffName: "Hoàng Thị P",
  },
];

function InvoicesContent() {
  const { message } = App.useApp();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | undefined>(undefined);

  const handleViewDetails = (record: Invoice) => {
    setSelectedInvoice(record);
    setIsDetailModalOpen(true);
  };

  const handlePrint = (invoice: Invoice) => {
    message.info(`In hóa đơn ${invoice.id}`);
    // Implement print functionality
  };

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Tiền mặt",
      card: "Thẻ",
      transfer: "Chuyển khoản",
      momo: "MoMo",
    };
    return methods[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: "green",
      card: "blue",
      transfer: "purple",
      momo: "magenta",
    };
    return colors[method] || "default";
  };

  const columns: TableColumnsType<Invoice> = [
    {
      title: "Mã HĐ",
      dataIndex: "id",
      key: "id",
      width: 140,
      fixed: "left",
      render: (id) => <strong style={{ color: "#1890ff" }}>{id}</strong>,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customerName}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.customerPhone}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày giờ",
      key: "datetime",
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.date}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.time}</div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.date + " " + a.time).unix() - dayjs(b.date + " " + b.time).unix(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 130,
      render: (total) => (
        <strong style={{ color: "#52c41a" }}>
          {total.toLocaleString()}đ
        </strong>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      render: (method) => (
        <Tag color={getPaymentMethodColor(method)}>
          {getPaymentMethodText(method)}
        </Tag>
      ),
      filters: [
        { text: "Tiền mặt", value: "cash" },
        { text: "Thẻ", value: "card" },
        { text: "Chuyển khoản", value: "transfer" },
        { text: "MoMo", value: "momo" },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        let color = "default";
        let text = status;
        let icon = null;
        if (status === "paid") {
          color = "green";
          text = "Đã thanh toán";
          icon = <CheckCircleOutlined />;
        } else if (status === "pending") {
          color = "orange";
          text = "Chờ thanh toán";
          icon = <ClockCircleOutlined />;
        } else if (status === "cancelled") {
          color = "red";
          text = "Đã hủy";
        } else if (status === "refunded") {
          color = "purple";
          text = "Đã hoàn tiền";
        }
        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        );
      },
      filters: [
        { text: "Đã thanh toán", value: "paid" },
        { text: "Chờ thanh toán", value: "pending" },
        { text: "Đã hủy", value: "cancelled" },
        { text: "Đã hoàn tiền", value: "refunded" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      width: 130,
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
          >
            In
          </Button>
        </Space>
      ),
    },
  ];

  // Filter invoices based on active tab and filters
  const filteredInvoices = invoices.filter((invoice) => {
    // Tab filter
    if (activeTab !== "all" && invoice.status !== activeTab) {
      return false;
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const invoiceDate = dayjs(invoice.date);
      if (
        invoiceDate.isBefore(dateRange[0], "day") ||
        invoiceDate.isAfter(dateRange[1], "day")
      ) {
        return false;
      }
    }

    // Payment method filter
    if (paymentFilter && invoice.paymentMethod !== paymentFilter) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingCount = invoices.filter((inv) => inv.status === "pending").length;
  const todayRevenue = paidInvoices
    .filter((inv) => dayjs(inv.date).isSame(dayjs(), "day"))
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Quản lý Hóa đơn
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Xem và quản lý lịch sử hóa đơn của cửa hàng Downtown Store
              </p>
            </div>

            {/* Stats Cards */}
            <Row gutter={16}>
              <Col span={6}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Tổng hóa đơn"
                    value={invoices.length}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <Statistic
                    title="Tổng doanh thu"
                    value={totalRevenue}
                    prefix={<DollarOutlined />}
                    suffix="đ"
                    valueStyle={{ color: "#52c41a" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <Statistic
                    title="Doanh thu hôm nay"
                    value={todayRevenue}
                    prefix={<DollarOutlined />}
                    suffix="đ"
                    valueStyle={{ color: "#faad14" }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <Statistic
                    title="Chờ thanh toán"
                    value={pendingCount}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </div>
              </Col>
            </Row>

            {/* Filters */}
            <div>
              <Space>
                <RangePicker
                  placeholder={["Từ ngày", "Đến ngày"]}
                  format="YYYY-MM-DD"
                  onChange={setDateRange}
                  style={{ width: 240 }}
                />
                <Select
                  placeholder="Phương thức thanh toán"
                  allowClear
                  style={{ width: 200 }}
                  onChange={setPaymentFilter}
                  options={[
                    { label: "Tiền mặt", value: "cash" },
                    { label: "Thẻ", value: "card" },
                    { label: "Chuyển khoản", value: "transfer" },
                    { label: "MoMo", value: "momo" },
                  ]}
                />
              </Space>
            </div>

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "all",
                  label: `Tất cả (${invoices.length})`,
                },
                {
                  key: "paid",
                  label: `Đã thanh toán (${paidInvoices.length})`,
                },
                {
                  key: "pending",
                  label: `Chờ thanh toán (${pendingCount})`,
                },
                {
                  key: "cancelled",
                  label: `Đã hủy (${invoices.filter((i) => i.status === "cancelled").length})`,
                },
                {
                  key: "refunded",
                  label: `Đã hoàn tiền (${invoices.filter((i) => i.status === "refunded").length})`,
                },
              ]}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredInvoices}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hóa đơn`,
            }}
            scroll={{ x: 1400 }}
            bordered={false}
            className="ant-table-custom"
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={<span className="text-lg font-semibold">Chi tiết hóa đơn {selectedInvoice?.id}</span>}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={800}
        centered
        maskClosable={false}
        transitionName="ant-fade"
        maskTransitionName="ant-fade"
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => selectedInvoice && handlePrint(selectedInvoice)} className="bg-blue-500 hover:bg-blue-600">
            In hóa đơn
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã hóa đơn" span={1}>
                {selectedInvoice.id}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng" span={1}>
                {selectedInvoice.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                {selectedInvoice.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {selectedInvoice.customerPhone}
              </Descriptions.Item>
              {selectedInvoice.customerEmail && (
                <Descriptions.Item label="Email" span={2}>
                  {selectedInvoice.customerEmail}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày giờ" span={1}>
                {selectedInvoice.date} {selectedInvoice.time}
              </Descriptions.Item>
              <Descriptions.Item label="Nhân viên" span={1}>
                {selectedInvoice.staffName}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán" span={1}>
                <Tag color={getPaymentMethodColor(selectedInvoice.paymentMethod)}>
                  {getPaymentMethodText(selectedInvoice.paymentMethod)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={
                    selectedInvoice.status === "paid"
                      ? "green"
                      : selectedInvoice.status === "pending"
                        ? "orange"
                        : selectedInvoice.status === "cancelled"
                          ? "red"
                          : "purple"
                  }
                >
                  {selectedInvoice.status === "paid"
                    ? "Đã thanh toán"
                    : selectedInvoice.status === "pending"
                      ? "Chờ thanh toán"
                      : selectedInvoice.status === "cancelled"
                        ? "Đã hủy"
                        : "Đã hoàn tiền"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12, fontWeight: "bold" }}>Chi tiết món ăn</h4>
              <Table
                dataSource={selectedInvoice.items.map((item, index) => ({
                  ...item,
                  key: index,
                }))}
                columns={[
                  { title: "Tên món", dataIndex: "name", key: "name" },
                  { title: "SL", dataIndex: "quantity", key: "quantity", width: 80, align: "center" },
                  {
                    title: "Đơn giá",
                    dataIndex: "price",
                    key: "price",
                    width: 120,
                    align: "right",
                    render: (price) => `${price.toLocaleString()}đ`,
                  },
                  {
                    title: "Thành tiền",
                    dataIndex: "total",
                    key: "total",
                    width: 120,
                    align: "right",
                    render: (total) => `${total.toLocaleString()}đ`,
                  },
                ]}
                pagination={false}
                size="small"
              />
            </div>

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Space direction="vertical" style={{ width: "100%", alignItems: "flex-end" }}>
                <div>
                  <span style={{ marginRight: 16 }}>Tạm tính:</span>
                  <strong>{selectedInvoice.subtotal.toLocaleString()}đ</strong>
                </div>
                <div>
                  <span style={{ marginRight: 16 }}>VAT (10%):</span>
                  <strong>{selectedInvoice.tax.toLocaleString()}đ</strong>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div>
                    <span style={{ marginRight: 16 }}>Giảm giá:</span>
                    <strong style={{ color: "#ff4d4f" }}>
                      -{selectedInvoice.discount.toLocaleString()}đ
                    </strong>
                  </div>
                )}
                <div style={{ fontSize: 16, paddingTop: 8, borderTop: "1px solid #d9d9d9" }}>
                  <span style={{ marginRight: 16 }}>Tổng cộng:</span>
                  <strong style={{ color: "#52c41a", fontSize: 18 }}>
                    {selectedInvoice.total.toLocaleString()}đ
                  </strong>
                </div>
              </Space>
            </div>

            {selectedInvoice.notes && (
              <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
                <strong>Ghi chú:</strong>
                <p style={{ margin: "8px 0 0 0" }}>{selectedInvoice.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ManagerInvoicesPage() {
  return (
    <ManagerLayout>
      <InvoicesContent />
    </ManagerLayout>
  );
}