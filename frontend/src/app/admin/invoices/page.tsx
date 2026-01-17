"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { useState, useEffect } from "react";
import { Table, Space, Button, Tag, Modal, Descriptions, App, Statistic, Row, Col, Select, Input, Form, InputNumber, Divider, Timeline, Badge, Tooltip, Spin } from "antd";
import type { TableColumnsType } from "antd";
import { EyeOutlined, PrinterOutlined, FileTextOutlined, SearchOutlined, HistoryOutlined, ShopOutlined, UserOutlined, PhoneOutlined, MailOutlined, DollarOutlined, CreditCardOutlined, BankOutlined, WalletOutlined, EditOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import { adminBillService, BillDTO, UpdateBillDto } from "@/services/admin-bill.service";
import { adminBranchService } from "@/services/admin-branch.service";
import ThermalPrintReceipt from "@/components/invoice/ThermalPrintReceipt";
import { InvoiceEditForm } from "@/components/forms/Admin/InvoiceEditForm";
import { InvoiceHistoryModal } from "@/components/forms/Admin/InvoiceHistoryModal";import { InvoiceDetailModal } from "@/components/forms/Admin/InvoiceDetailModal";
import { InvoicePrintModal } from "@/components/forms/Admin/InvoicePrintModal";
const { Option } = Select;

interface InvoiceItem {
  id: string;
  productId: string; // Product ID for backend updates
  name: string;
  quantity: number;
  price: number;
  unitPrice: number;
  total: number;
  image?: string;
}

interface Invoice {
  key: string;
  id: string;
  billNumber: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  branchName: string;
  branchCode: string;
  branchAddress: string;
  date: string;
  time: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  totalAmount: number;
  paymentMethod: "cash" | "card" | "transfer" | "momo" | null;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  status: "draft" | "issued" | "paid" | "cancelled" | "refunded";
  staffName: string;
  notes?: string;
  internalNotes?: string;
  printedCount: number;
  isEdited: boolean;
  editCount: number;
  lastEditedAt?: string;
  paidAmount: number;
  changeAmount: number;
}

// Helper function to map backend data to frontend format
const mapBillToInvoice = (bill: BillDTO): Invoice => {
  const dateTime = dayjs(bill.createdAt);
  
  // Map payment method
  let paymentMethod: "cash" | "card" | "transfer" | "momo" | null = null;
  if (bill.paymentMethod === "CASH") paymentMethod = "cash";
  else if (bill.paymentMethod === "CARD") paymentMethod = "card";
  else if (bill.paymentMethod === "BANK_TRANSFER") paymentMethod = "transfer";
  else if (bill.paymentMethod === "E_WALLET") paymentMethod = "momo";

  // Map payment status
  let paymentStatus: "paid" | "pending" | "failed" | "refunded" = "pending";
  if (bill.paymentStatus === "PAID") paymentStatus = "paid";
  else if (bill.paymentStatus === "FAILED") paymentStatus = "failed";
  else if (bill.paymentStatus === "REFUNDED") paymentStatus = "refunded";

  // Map status
  let status: "draft" | "issued" | "paid" | "cancelled" | "refunded" = "issued";
  if (bill.status === "DRAFT") status = "draft";
  else if (bill.status === "ISSUED") status = "issued";
  else if (bill.status === "PAID") status = "paid";
  else if (bill.status === "CANCELLED") status = "cancelled";
  else if (bill.status === "REFUNDED") status = "refunded";

  // Map order items
  const items: InvoiceItem[] = bill.order?.items?.map(item => ({
    id: item.id, // Use order item id for unique key
    productId: item.product.id, // Store product ID for updates
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    unitPrice: item.price,
    total: item.price * item.quantity,
    image: item.product.image,
  })) || [];

  return {
    key: bill.id,
    id: bill.billNumber,
    billNumber: bill.billNumber,
    orderNumber: bill.order?.orderNumber || "N/A",
    customerName: bill.customerName || "Khách hàng",
    customerPhone: bill.customerPhone || "N/A",
    customerEmail: bill.customerEmail || undefined,
    customerAddress: bill.customerAddress || undefined,
    branchName: bill.branch?.name || "N/A",
    branchCode: bill.branch?.code || "N/A",
    branchAddress: bill.branch?.address || "Chưa có địa chỉ",
    date: dateTime.format("YYYY-MM-DD"),
    time: dateTime.format("HH:mm"),
    items,
    subtotal: bill.subtotal,
    tax: bill.taxAmount,
    discount: bill.discountAmount,
    total: bill.total,
    totalAmount: bill.total,
    paymentMethod,
    paymentStatus,
    status,
    staffName: bill.issuedBy?.name || "N/A",
    notes: bill.notes || undefined,
    internalNotes: bill.internalNotes || undefined,
    printedCount: bill.printedCount,
    isEdited: bill.isEdited,
    editCount: bill.editCount,
    lastEditedAt: bill.lastEditedAt || undefined,
    paidAmount: bill.paidAmount,
    changeAmount: bill.changeAmount,
  };
};

function InvoicesContent() {
  const { message, modal } = App.useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [billHistory, setBillHistory] = useState<any[]>([]);
  const [editForm] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    cancelledBills: 0,
    refundedBills: 0,
    totalRevenue: 0,
    averageBillAmount: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Load branches
  const loadBranches = async () => {
    try {
      const response = await adminBranchService.getBranches({ page: 1, limit: 999 });
      setBranches(response.data);
    } catch (error: any) {
      console.error("Failed to load branches:", error);
    }
  };

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
      if (statusFilter && statusFilter !== "all") {
        if (statusFilter === "PAID") params.status = "PAID";
        else if (statusFilter === "PENDING") params.paymentStatus = "PENDING";
        else if (statusFilter === "CANCELLED") params.status = "CANCELLED";
        else if (statusFilter === "REFUNDED") params.status = "REFUNDED";
        else if (statusFilter === "DRAFT") params.status = "DRAFT";
        else if (statusFilter === "ISSUED") params.status = "ISSUED";
      }

      if (paymentMethodFilter && paymentMethodFilter !== "all") {
        params.paymentMethod = paymentMethodFilter;
      }

      if (branchFilter) {
        params.branchId = branchFilter;
      }

      if (searchText) {
        params.search = searchText;
      }

      const response = await adminBillService.getBills(params);

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
      const response = await adminBillService.getBillStats(branchFilter);

      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Initial load
  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    fetchBills(1, pagination.pageSize);
  }, [statusFilter, paymentMethodFilter, branchFilter, searchText]);

  // Reload stats when branch filter changes
  useEffect(() => {
    fetchStats();
  }, [branchFilter]);

  const handleViewDetails = async (record: Invoice) => {
    setLoading(true);
    try {
      const billId = record.key;
      const response = await adminBillService.getBillById(billId);
      
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
        const response = await adminBillService.getBillById(billId);
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
      await adminBillService.printBill(billId);
      
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
      billNumber: invoice.billNumber,
      orderNumber: invoice.orderNumber,
      customerName: invoice.customerName,
      customerPhone: invoice.customerPhone,
      customerEmail: invoice.customerEmail,
      customerAddress: invoice.customerAddress,
      items: invoice.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        price: item.price,
        total: item.total,
        image: item.image,
      })),
      discount: invoice.discount || 0,
      subtotal: invoice.subtotal,
      tax: invoice.tax || 0,
      totalAmount: invoice.totalAmount,
      paymentMethod: invoice.paymentMethod,
      paymentStatus: invoice.paymentStatus === "paid" ? "PAID" : invoice.paymentStatus === "failed" ? "FAILED" : invoice.paymentStatus === "refunded" ? "REFUNDED" : "PENDING",
      paidAmount: invoice.paidAmount,
      notes: invoice.notes,
      internalNotes: invoice.internalNotes,
      editReason: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateBill = async () => {
    try {
      const values = await editForm.validateFields();
      let currentItems = editForm.getFieldValue("items") || [];
      if (!Array.isArray(currentItems)) {
        currentItems = [];
      }
      
      if (!selectedInvoice) return;

      setLoading(true);
      
      const updateData: UpdateBillDto = {
        editReason: values.editReason,
      };

      // Always include all fields (backend will track what changed)
      updateData.customerName = values.customerName;
      updateData.customerPhone = values.customerPhone;
      updateData.customerEmail = values.customerEmail;
      updateData.customerAddress = values.customerAddress;
      updateData.notes = values.notes;
      updateData.internalNotes = values.internalNotes;
      updateData.paidAmount = values.paidAmount;
      
      if (values.paymentMethod) {
        const methodMap: Record<string, any> = {
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

      // Handle items changes - always send if present
      let recalculatedSubtotal = 0;
      if (currentItems && currentItems.length > 0) {
        updateData.items = currentItems.map((item: any) => {
          const quantity = Number(item.quantity) || 0;
          const unitPrice = Number(item.price ?? item.unitPrice) || 0;
          recalculatedSubtotal += quantity * unitPrice;
          return {
            productId: item.productId,
            quantity,
            unitPrice,
          };
        });
      }

      // Always send calculated fields (recompute to avoid stale form values)
      const discountValue = Number(values.discount) || 0;
      const subtotalValue = recalculatedSubtotal || Number(values.subtotal) || 0;
      const taxValue = values.tax !== undefined ? Number(values.tax) : subtotalValue * 0.1;
      const totalValue = subtotalValue + taxValue - discountValue;

      updateData.discount = discountValue;
      updateData.subtotal = subtotalValue;
      updateData.tax = taxValue;
      updateData.totalAmount = totalValue;

      const response = await adminBillService.updateBill(selectedInvoice.key, updateData);
      
      if (response.success) {
        message.success("Cập nhật hóa đơn thành công");
        setIsEditModalOpen(false);
        editForm.resetFields();
        
        // Fetch updated bill details to refresh selectedInvoice
        const updatedResponse = await adminBillService.getBillById(selectedInvoice.key);
        if (updatedResponse.success) {
          const updatedInvoice = mapBillToInvoice(updatedResponse.data);
          setSelectedInvoice(updatedInvoice);
        }
        
        fetchBills(pagination.current, pagination.pageSize);
        fetchStats();
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
      const response = await adminBillService.getBillHistory(billId);
      
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

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    fetchBills(newPagination.current, newPagination.pageSize);
  };

  const getPaymentMethodText = (method: string | null) => {
    if (!method) return "Chưa chọn";
    const methods: Record<string, string> = {
      cash: "Tiền mặt",
      card: "Thẻ",
      transfer: "Chuyển khoản",
      momo: "MoMo",
    };
    return methods[method] || method;
  };

  const getPaymentMethodColor = (method: string | null) => {
    if (!method) return "default";
    const colors: Record<string, string> = {
      cash: "green",
      card: "blue",
      transfer: "purple",
      momo: "magenta",
    };
    return colors[method] || "default";
  };

  const getPaymentMethodIcon = (method: string | null) => {
    if (!method) return <DollarOutlined />;
    const icons: Record<string, React.ReactNode> = {
      cash: <DollarOutlined />,
      card: <CreditCardOutlined />,
      transfer: <BankOutlined />,
      momo: <WalletOutlined />,
    };
    return icons[method] || <DollarOutlined />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "default",
      issued: "blue",
      paid: "green",
      cancelled: "red",
      refunded: "purple",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      draft: "Nháp",
      issued: "Đã xuất",
      paid: "Đã thanh toán",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return texts[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "green",
      pending: "orange",
      failed: "red",
      refunded: "purple",
    };
    return colors[status] || "default";
  };

  const getPaymentStatusText = (status: string) => {
    const texts: Record<string, string> = {
      paid: "Đã thanh toán",
      pending: "Chờ thanh toán",
      failed: "Thất bại",
      refunded: "Đã hoàn tiền",
    };
    return texts[status] || status;
  };

  const columns: TableColumnsType<Invoice> = [
    {
      title: "Mã hóa đơn",
      dataIndex: "billNumber",
      key: "billNumber",
      width: 140,
      fixed: "left",
      render: (billNumber, record) => (
        <div>
          <strong style={{ color: "#1890ff" }}>{billNumber}</strong>
          {record.isEdited && (
            <div>
              <Badge count={record.editCount} style={{ backgroundColor: "#faad14" }} />
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 150,
    },
    {
      title: "Chi nhánh",
      key: "branch",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.branchName}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.branchCode}
          </div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 180,
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
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      width: 190,
    },
    {
      title: <Tooltip>Ngày giờ</Tooltip>,
      key: "datetime",
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.date}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.time}</div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.date + " " + a.time).unix() - dayjs(b.date + " " + b.time).unix(),
      showSorterTooltip: { title: "Sắp xếp theo ngày giờ" },
    },
    {
      title: <Tooltip>Tổng tiền</Tooltip>,
      dataIndex: "total",
      key: "total",
      width: 130,
      align: "right",
      render: (total) => (
        <strong>
          {total.toLocaleString()}đ
        </strong>
      ),
      sorter: (a, b) => a.total - b.total,
      showSorterTooltip: { title: "Sắp xếp theo tổng tiền" },
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      align: "center",
      width: 180,
      render: (method) => (
        <Tag color={getPaymentMethodColor(method)} icon={getPaymentMethodIcon(method)}>
          {getPaymentMethodText(method)}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      align: "center",
      width: 140,
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>
          {getPaymentStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 170,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditBill(record)}
            />
          </Tooltip>
          {record.editCount > 0 && (
            <Tooltip title="Xem lịch sử">
              <Button
                type="text"
                icon={<HistoryOutlined />}
                onClick={() => handleViewHistory(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Calculate counts for filters
  const totalCount = pagination.total;
  const paidCount = stats.paidBills;
  const pendingCount = stats.pendingBills;
  const cancelledCount = stats.cancelledBills;
  const refundedCount = stats.refundedBills;

  return (
    <div className="p-8">
      <Spin spinning={loading}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4">
              {/* Stats Cards */}
              <Row gutter={16}>
                <Col span={6}>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Statistic
                      title="Tổng hóa đơn"
                      value={stats.totalBills}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <Statistic
                      title="Đã thanh toán"
                      value={stats.paidBills}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <Statistic
                      title="Tổng doanh thu"
                      value={stats.totalRevenue}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: "#fa8c16" }}
                      suffix="đ"
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <Statistic
                      title="Chờ thanh toán"
                      value={stats.pendingBills}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: "#ff4d4f" }}
                    />
                  </div>
                </Col>
              </Row>

              {/* Filters */}
              <div className="flex justify-between items-center">
                <Space size="middle">
              {/* Search */}
              <Input
                placeholder="Tìm số hóa đơn, khách hàng..."
                prefix={<SearchOutlined />}
                style={{ width: 280 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
                className={statusFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
              >
                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                <Select.Option value="PAID">Đã thanh toán</Select.Option>
                <Select.Option value="PENDING">Chờ thanh toán</Select.Option>
                <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                <Select.Option value="REFUNDED">Đã hoàn tiền</Select.Option>
                <Select.Option value="DRAFT">Nháp</Select.Option>
                <Select.Option value="ISSUED">Đã xuất</Select.Option>
              </Select>

              {/* Payment Method Filter */}
              <Select
                value={paymentMethodFilter}
                onChange={setPaymentMethodFilter}
                style={{ width: 180 }}
                className={paymentMethodFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
              >
                <Select.Option value="all">Tất cả phương thức</Select.Option>
                <Select.Option value="CASH">Tiền mặt</Select.Option>
                <Select.Option value="CARD">Thẻ</Select.Option>
                <Select.Option value="BANK_TRANSFER">Chuyển khoản</Select.Option>
                <Select.Option value="E_WALLET">Ví điện tử</Select.Option>
              </Select>

              {/* Branch Filter */}
              <Select
                placeholder="Lọc theo chi nhánh"
                allowClear
                style={{ width: 240 }}
                value={branchFilter}
                onChange={setBranchFilter}
                className={branchFilter ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
              >
                {branches.map((branch) => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.code} # {branch.name}
                  </Option>
                ))}
              </Select>
                </Space>
              </div>
            </div>
          </CardHeader>

        <CardContent>
          {/* Table */}
          <Table
            columns={columns}
            dataSource={invoices}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Hiển thị ${total} hóa đơn`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1800 }}
            bordered={false}
            className="ant-table-custom"
          />
        </CardContent>
      </Card>
      </Spin>

      {/* Detail Modal - ENHANCED VERSION */}
      <InvoiceDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        invoice={selectedInvoice}
        onViewHistory={handleViewHistory}
        getPaymentMethodText={getPaymentMethodText}
        getPaymentMethodColor={getPaymentMethodColor}
        getPaymentMethodIcon={getPaymentMethodIcon}
        getPaymentStatusText={getPaymentStatusText}
        getPaymentStatusColor={getPaymentStatusColor}
        getStatusText={getStatusText}
        getStatusColor={getStatusColor}
      />

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa hóa đơn"
        open={isEditModalOpen}
        onOk={handleUpdateBill}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        width={900}
        centered
        confirmLoading={loading}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        {selectedInvoice && <InvoiceEditForm form={editForm} initialInvoice={selectedInvoice} />}
      </Modal>

      {/* History Modal */}
      <InvoiceHistoryModal
        open={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        billNumber={selectedInvoice?.billNumber || ""}
        history={billHistory}
      />

      {/* Print Modal */}
      <InvoicePrintModal
        open={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={selectedInvoice}
        onConfirmPrint={handleConfirmPrint}
        getPaymentMethodText={getPaymentMethodText}
      />
    </div>
  );
}

export default function AdminInvoicesPage() {
  return (
    <AdminLayout title="Quản lý Hóa đơn">
      <App>
        <InvoicesContent />
      </App>
    </AdminLayout>
  );
}
