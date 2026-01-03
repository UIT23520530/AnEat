"use client";

import { ManagerLayout } from "@/components/layouts/manager-layout";
import { useState, useEffect } from "react";
import { Table, Space, Button, Tag, Modal, Descriptions, App, Statistic, Row, Col, DatePicker, Select, Tabs, Spin, Form, Input, Radio, InputNumber, Divider, Timeline, Badge } from "antd";
import type { TableColumnsType } from "antd";
import { EyeOutlined, PrinterOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, EditOutlined, HistoryOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import { billService, BillDTO } from "@/services/bill.service";
import ThermalPrintReceipt from "@/components/invoice/ThermalPrintReceipt";

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
  billNumber: string;
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
  printedCount?: number;
  isEdited: boolean;
  editCount: number;
}

// Helper function to map backend data to frontend format
const mapBillToInvoice = (bill: BillDTO): Invoice => {
  const dateTime = dayjs(bill.createdAt);
  
  // Map payment method
  let paymentMethod: "cash" | "card" | "transfer" | "momo" = "cash";
  if (bill.paymentMethod === "CASH") paymentMethod = "cash";
  else if (bill.paymentMethod === "CARD") paymentMethod = "card";
  else if (bill.paymentMethod === "BANK_TRANSFER") paymentMethod = "transfer";
  else if (bill.paymentMethod === "E_WALLET") paymentMethod = "momo";

  // Map status
  let status: "paid" | "pending" | "cancelled" | "refunded" = "pending";
  if (bill.status === "PAID") status = "paid";
  else if (bill.status === "CANCELLED") status = "cancelled";
  else if (bill.status === "REFUNDED") status = "refunded";
  else if (bill.status === "ISSUED" || bill.status === "DRAFT") {
    status = bill.paymentStatus === "PAID" ? "paid" : "pending";
  }

  // Map order items
  const items: InvoiceItem[] = bill.order?.items?.map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  })) || [];

  return {
    key: bill.id,
    id: bill.billNumber,
    billNumber: bill.billNumber,
    orderNumber: bill.order?.orderNumber || "N/A",
    customerName: bill.customerName || "Khách hàng",
    customerPhone: bill.customerPhone || "N/A",
    customerEmail: bill.customerEmail || undefined,
    date: dateTime.format("YYYY-MM-DD"),
    time: dateTime.format("HH:mm"),
    items,
    subtotal: bill.subtotal,
    tax: bill.taxAmount,
    discount: bill.discountAmount,
    total: bill.total,
    paymentMethod,
    status,
    staffName: bill.issuedBy?.name || "N/A",
    notes: bill.notes || undefined,
    printedCount: bill.printedCount,
    isEdited: bill.isEdited,
    editCount: bill.editCount,
  };
};

function InvoicesContent() {
  const { message } = App.useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [billHistory, setBillHistory] = useState<any[]>([]);
  const [editForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch bills from API
  const fetchBills = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
        sort: "-createdAt",
      };

      // Apply filters
      if (activeTab !== "all") {
        if (activeTab === "paid") params.status = "PAID";
        else if (activeTab === "pending") params.paymentStatus = "PENDING";
        else if (activeTab === "cancelled") params.status = "CANCELLED";
        else if (activeTab === "refunded") params.status = "REFUNDED";
      }

      if (dateRange && dateRange.length === 2) {
        params.dateFrom = dateRange[0].format("YYYY-MM-DD");
        params.dateTo = dateRange[1].format("YYYY-MM-DD");
      }

      if (paymentFilter) {
        if (paymentFilter === "cash") params.paymentMethod = "CASH";
        else if (paymentFilter === "card") params.paymentMethod = "CARD";
        else if (paymentFilter === "transfer") params.paymentMethod = "BANK_TRANSFER";
        else if (paymentFilter === "momo") params.paymentMethod = "E_WALLET";
      }

      const response = await billService.getBillList(params);

      if (response.success) {
        const mappedInvoices = response.data.map(mapBillToInvoice);
        setInvoices(mappedInvoices);
        setPagination({
          current: response.meta.current_page,
          pageSize: response.meta.limit,
          total: response.meta.total_items,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch bills:", error);
      message.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const params: any = {};
      if (dateRange && dateRange.length === 2) {
        params.dateFrom = dateRange[0].format("YYYY-MM-DD");
        params.dateTo = dateRange[1].format("YYYY-MM-DD");
      }

      const response = await billService.getBillStats(
        params.dateFrom,
        params.dateTo
      );

      if (response.success) {
        setStats({
          totalBills: response.data.totalBills,
          paidBills: response.data.paidBills,
          pendingBills: response.data.pendingBills,
          totalRevenue: response.data.totalRevenue,
          todayRevenue: 0, // Calculate separately if needed
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBills(pagination.current, pagination.pageSize);
    fetchStats();
  }, []);

  // Reload when filters change
  useEffect(() => {
    fetchBills(1, pagination.pageSize);
    fetchStats();
  }, [activeTab, dateRange, paymentFilter]);

  const handleViewDetails = async (record: Invoice) => {
    setLoading(true);
    try {
      // Fetch full bill details
      const billId = record.key; // Using key which is the bill ID
      const response = await billService.getBillById(billId);
      
      if (response.success) {
        const detailedInvoice = mapBillToInvoice(response.data);
        setSelectedInvoice(detailedInvoice);
        setIsDetailModalOpen(true);
      }
    } catch (error: any) {
      message.error("Không thể tải chi tiết hóa đơn");
      console.error("Failed to fetch bill details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (invoice: Invoice) => {
    try {
      const billId = invoice.key;
      
      // Fetch full bill details if not already loaded
      if (!invoice.items || invoice.items.length === 0) {
        const response = await billService.getBillById(billId);
        if (response.success) {
          const detailedInvoice = mapBillToInvoice(response.data);
          setSelectedInvoice(detailedInvoice);
        }
      } else {
        setSelectedInvoice(invoice);
      }
      
      // Open print modal
      setIsPrintModalOpen(true);
    } catch (error: any) {
      message.error("Không thể tải thông tin hóa đơn");
      console.error("Failed to load bill for printing:", error);
    }
  };

  const handleConfirmPrint = async () => {
    if (!selectedInvoice) return;
    
    try {
      const billId = selectedInvoice.key;
      
      // Mark as printed in backend
      await billService.printBill(billId);
      
      // Trigger browser print
      window.print();
      
      message.success(`Đã in hóa đơn ${selectedInvoice.id}`);
      
      // Close modal and refresh
      setIsPrintModalOpen(false);
      fetchBills(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error("Không thể in hóa đơn");
      console.error("Failed to print bill:", error);
    }
  };

  const handleEditBill = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    editForm.setFieldsValue({
      customerName: invoice.customerName,
      customerPhone: invoice.customerPhone,
      customerEmail: invoice.customerEmail,
      paymentMethod: invoice.paymentMethod,
      paymentStatus: invoice.status === "paid" ? "PAID" : "PENDING",
      paidAmount: invoice.total,
      notes: invoice.notes,
      editReason: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateBill = async () => {
    try {
      const values = await editForm.validateFields();
      
      if (!selectedInvoice) return;

      setLoading(true);
      
      const updateData: any = {
        editReason: values.editReason,
      };

      // Only include changed fields
      if (values.customerName !== selectedInvoice.customerName) {
        updateData.customerName = values.customerName;
      }
      if (values.customerPhone !== selectedInvoice.customerPhone) {
        updateData.customerPhone = values.customerPhone;
      }
      if (values.customerEmail !== selectedInvoice.customerEmail) {
        updateData.customerEmail = values.customerEmail;
      }
      if (values.paymentMethod !== selectedInvoice.paymentMethod) {
        const methodMap: Record<string, string> = {
          cash: "CASH",
          card: "CARD",
          transfer: "BANK_TRANSFER",
          momo: "E_WALLET",
        };
        updateData.paymentMethod = methodMap[values.paymentMethod];
      }
      if (values.paymentStatus) {
        updateData.paymentStatus = values.paymentStatus;
      }
      if (values.paidAmount !== undefined) {
        updateData.paidAmount = values.paidAmount;
      }
      if (values.notes !== selectedInvoice.notes) {
        updateData.notes = values.notes;
      }

      const response = await billService.updateBill(selectedInvoice.key, updateData);
      
      if (response.success) {
        message.success("Cập nhật hóa đơn thành công");
        setIsEditModalOpen(false);
        editForm.resetFields();
        fetchBills(pagination.current, pagination.pageSize);
      }
    } catch (error: any) {
      message.error("Không thể cập nhật hóa đơn");
      console.error("Failed to update bill:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (invoice: Invoice) => {
    setLoading(true);
    try {
      const billId = invoice.key;
      const response = await billService.getBillHistory(billId);
      
      if (response.success) {
        setBillHistory(response.data);
        setSelectedInvoice(invoice);
        setIsHistoryModalOpen(true);
      }
    } catch (error: any) {
      message.error("Không thể tải lịch sử hóa đơn");
      console.error("Failed to fetch bill history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    fetchBills(newPagination.current, newPagination.pageSize);
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
      width: 220,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            title="Xem chi tiết"
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
            title="In hóa đơn"
          >
            In
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditBill(record)}
            disabled={record.status === "cancelled" || record.status === "refunded"}
            title="Chỉnh sửa (khiếu nại)"
          >
            Sửa
          </Button>
          {record.editCount > 0 && (
            <Button
              type="link"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
              title="Xem lịch sử"
            >
              <Badge count={record.editCount} size="small">
                Lịch sử
              </Badge>
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Filter invoices based on active tab and filters (client-side for already fetched data)
  const filteredInvoices = invoices;

  // Calculate counts from stats
  const paidCount = stats.paidBills;
  const pendingCount = stats.pendingBills;
  const cancelledCount = invoices.filter((inv) => inv.status === "cancelled").length;
  const refundedCount = invoices.filter((inv) => inv.status === "refunded").length;
  const totalCount = stats.totalBills;

  return (
    <div className="p-8">
      <Spin spinning={loading}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Quản lý Hóa đơn
                </CardTitle>
              </div>

              {/* Stats Cards */}
              <Row gutter={16}>
                <Col span={6}>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Statistic
                      title="Tổng hóa đơn"
                      value={totalCount}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <Statistic
                      title="Tổng doanh thu"
                      value={stats.totalRevenue}
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
                      value={stats.todayRevenue}
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
                    label: `Tất cả (${totalCount})`,
                  },
                  {
                    key: "paid",
                    label: `Đã thanh toán (${paidCount})`,
                  },
                  {
                    key: "pending",
                    label: `Chờ thanh toán (${pendingCount})`,
                  },
                  {
                    key: "cancelled",
                    label: `Đã hủy (${cancelledCount})`,
                  },
                  {
                    key: "refunded",
                    label: `Đã hoàn tiền (${refundedCount})`,
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
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} hóa đơn`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 1400 }}
              bordered={false}
              className="ant-table-custom"
            />
          </CardContent>
        </Card>
      </Spin>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Chi tiết hóa đơn {selectedInvoice?.id}</span>
            {selectedInvoice && selectedInvoice.isEdited && (
              <Tag color="orange">Đã chỉnh sửa {selectedInvoice.editCount} lần</Tag>
            )}
          </div>
        }
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
          selectedInvoice && selectedInvoice.editCount > 0 && (
            <Button key="history" icon={<HistoryOutlined />} onClick={() => handleViewHistory(selectedInvoice)}>
              Xem lịch sử
            </Button>
          ),
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

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold">
            Chỉnh sửa hóa đơn {selectedInvoice?.id}
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        width={700}
        centered
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsEditModalOpen(false);
            editForm.resetFields();
          }}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleUpdateBill}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Cập nhật
          </Button>,
        ]}
      >
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Khi cập nhật hóa đơn do khiếu nại của khách hàng, 
            hệ thống sẽ tạo một phiên bản mới và lưu lại lịch sử chỉnh sửa. 
            Hóa đơn cũ sẽ không bị xóa.
          </p>
        </div>

        <Form
          form={editForm}
          layout="vertical"
          initialValues={{
            paymentMethod: "cash",
            paymentStatus: "PENDING",
          }}
        >
          <Divider orientation="left">Thông tin khách hàng</Divider>
          
          <Form.Item
            label="Tên khách hàng"
            name="customerName"
            rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="customerPhone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="customerEmail"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="Nhập email (tùy chọn)" />
          </Form.Item>

          <Divider orientation="left">Thông tin thanh toán</Divider>

          <Form.Item
            label="Phương thức thanh toán"
            name="paymentMethod"
            rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
          >
            <Radio.Group>
              <Radio value="cash">Tiền mặt</Radio>
              <Radio value="card">Thẻ</Radio>
              <Radio value="transfer">Chuyển khoản</Radio>
              <Radio value="momo">MoMo</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Trạng thái thanh toán"
            name="paymentStatus"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Radio.Group>
              <Radio value="PENDING">Chờ thanh toán</Radio>
              <Radio value="PAID">Đã thanh toán</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Số tiền thanh toán"
            name="paidAmount"
          >
            <Space.Compact style={{ width: "100%" }}>
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              />
              <Button disabled>VNĐ</Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Divider orientation="left" className="text-red-600">
            Lý do chỉnh sửa (Bắt buộc)
          </Divider>

          <Form.Item
            label="Lý do chỉnh sửa hóa đơn"
            name="editReason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do chỉnh sửa" },
              { min: 10, message: "Lý do phải có ít nhất 10 ký tự" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Khách hàng khiếu nại về số điện thoại sai, yêu cầu cập nhật thông tin..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold">
            Lịch sử chỉnh sửa - {selectedInvoice?.id}
          </span>
        }
        open={isHistoryModalOpen}
        onCancel={() => {
          setIsHistoryModalOpen(false);
          setBillHistory([]);
        }}
        width={900}
        centered
        footer={[
          <Button key="close" onClick={() => {
            setIsHistoryModalOpen(false);
            setBillHistory([]);
          }}>
            Đóng
          </Button>,
        ]}
      >
        {billHistory.length > 0 ? (
          <Timeline
            mode="left"
            items={billHistory.map((history, index) => ({
              color: index === 0 ? "green" : "blue",
              label: dayjs(history.editedAt).format("YYYY-MM-DD HH:mm:ss"),
              children: (
                <div>
                  <div className="mb-2">
                    <strong>Người chỉnh sửa:</strong> {history.editedBy?.name || "N/A"}
                  </div>
                  <div className="mb-2">
                    <strong>Lý do:</strong>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {history.editReason}
                    </div>
                  </div>
                  {history.changes && Object.keys(history.changes).length > 0 && (
                    <div>
                      <strong>Thay đổi:</strong>
                      <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                        {Object.entries(history.changes).map(([key, value]: [string, any]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span>{" "}
                            <span className="text-red-600 line-through">{value.old}</span>
                            {" → "}
                            <span className="text-green-600">{value.new}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không có lịch sử chỉnh sửa
          </div>
        )}
      </Modal>

      {/* Print Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold">
            Xem trước in hóa đơn
          </span>
        }
        open={isPrintModalOpen}
        onCancel={() => setIsPrintModalOpen(false)}
        width={400}
        centered
        footer={[
          <Button key="cancel" onClick={() => setIsPrintModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handleConfirmPrint}
            className="bg-blue-500 hover:bg-blue-600"
          >
            In hóa đơn
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <ThermalPrintReceipt
              billNumber={selectedInvoice.billNumber}
              orderNumber={selectedInvoice.orderNumber}
              date={selectedInvoice.date}
              time={selectedInvoice.time}
              customerName={selectedInvoice.customerName}
              customerPhone={selectedInvoice.customerPhone}
              items={selectedInvoice.items}
              subtotal={selectedInvoice.subtotal}
              tax={selectedInvoice.tax}
              discount={selectedInvoice.discount}
              total={selectedInvoice.total}
              paymentMethod={getPaymentMethodText(selectedInvoice.paymentMethod)}
              staffName={selectedInvoice.staffName}
              notes={selectedInvoice.notes}
            />
          </div>
        )}
      </Modal>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt,
          #thermal-receipt * {
            visibility: visible;
          }
          #thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
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