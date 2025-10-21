"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import InvoicesForm from "@/components/forms/InvoicesForm";

interface InvoiceData {
  key: string;
  id: string;
  invoiceNumber: string;
  store: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  invoiceDate: string;
  dueDate: string;
  paymentMethod: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  notes?: string;
  items: any[];
}

const mockInvoices: InvoiceData[] = [
  {
    key: "1",
    id: "1",
    invoiceNumber: "INV-0001",
    store: "Store #1",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@example.com",
    customerPhone: "0901234567",
    invoiceDate: "2025-10-05",
    dueDate: "2025-10-12",
    paymentMethod: "cash",
    status: "paid",
    subtotal: 227273,
    tax: 22727,
    taxRate: 10,
    total: 250000,
    items: [
      { key: "1", product: "Gà Rán Giòn", quantity: 2, price: 50000, total: 100000 },
      { key: "2", product: "Burger Bò", quantity: 1, price: 45000, total: 45000 },
      { key: "3", product: "Coca Cola", quantity: 2, price: 15000, total: 30000 },
      { key: "4", product: "Khoai Tây Chiên", quantity: 2, price: 25000, total: 50000 },
    ],
  },
  {
    key: "2",
    id: "2",
    invoiceNumber: "INV-0002",
    store: "Store #2",
    customerName: "Trần Thị B",
    customerEmail: "tranthib@example.com",
    customerPhone: "0902345678",
    invoiceDate: "2025-10-05",
    dueDate: "2025-10-12",
    paymentMethod: "card",
    status: "pending",
    subtotal: 136364,
    tax: 13636,
    taxRate: 10,
    total: 150000,
    items: [
      { key: "1", product: "Pizza Hải Sản", quantity: 1, price: 120000, total: 120000 },
      { key: "2", product: "Coca Cola", quantity: 1, price: 15000, total: 15000 },
    ],
  },
  {
    key: "3",
    id: "3",
    invoiceNumber: "INV-0003",
    store: "Store #1",
    customerName: "Lê Văn C",
    customerEmail: "levanc@example.com",
    invoiceDate: "2025-10-04",
    dueDate: "2025-10-11",
    paymentMethod: "momo",
    status: "paid",
    subtotal: 290909,
    tax: 29091,
    taxRate: 10,
    total: 320000,
    items: [
      { key: "1", product: "Combo Gia Đình", quantity: 1, price: 250000, total: 250000 },
      { key: "2", product: "Kem Sundae", quantity: 2, price: 20000, total: 40000 },
    ],
  },
  {
    key: "4",
    id: "4",
    invoiceNumber: "INV-0004",
    store: "Store #3",
    customerName: "Phạm Thị D",
    customerPhone: "0904567890",
    invoiceDate: "2025-10-03",
    dueDate: "2025-10-10",
    paymentMethod: "cash",
    status: "cancelled",
    subtotal: 72727,
    tax: 7273,
    taxRate: 10,
    total: 80000,
    items: [
      { key: "1", product: "Gà Rán Giòn", quantity: 1, price: 50000, total: 50000 },
      { key: "2", product: "Khoai Tây Chiên", quantity: 1, price: 25000, total: 25000 },
    ],
  },
  {
    key: "5",
    id: "5",
    invoiceNumber: "INV-0005",
    store: "Store #2",
    customerName: "Hoàng Văn E",
    customerEmail: "hoangvane@example.com",
    customerPhone: "0905678901",
    invoiceDate: "2025-10-02",
    dueDate: "2025-09-28",
    paymentMethod: "zalopay",
    status: "overdue",
    subtotal: 181818,
    tax: 18182,
    taxRate: 10,
    total: 200000,
    items: [
      { key: "1", product: "Burger Bò", quantity: 2, price: 45000, total: 90000 },
      { key: "2", product: "Gà Cay Hàn Quốc", quantity: 1, price: 65000, total: 65000 },
      { key: "3", product: "Coca Cola", quantity: 2, price: 15000, total: 30000 },
    ],
  },
  {
    key: "6",
    id: "6",
    invoiceNumber: "INV-0006",
    store: "Store #1",
    customerName: "Nguyễn Thị F",
    customerEmail: "nguyenthif@example.com",
    invoiceDate: "2025-10-01",
    dueDate: "2025-10-08",
    paymentMethod: "bank-transfer",
    status: "paid",
    subtotal: 454545,
    tax: 45455,
    taxRate: 10,
    total: 500000,
    items: [
      { key: "1", product: "Combo Gia Đình", quantity: 2, price: 250000, total: 500000 },
    ],
  },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>(mockInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "overdue":
        return "error";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Cash",
      card: "Card",
      momo: "MoMo",
      zalopay: "ZaloPay",
      "bank-transfer": "Bank Transfer",
    };
    return labels[method] || method;
  };

  const handleAddInvoice = (values: any) => {
    const newInvoice: InvoiceData = {
      key: String(invoices.length + 1),
      id: String(invoices.length + 1),
      ...values,
    };
    setInvoices([...invoices, newInvoice]);
    setIsAddModalOpen(false);
    message.success("Invoice created successfully!");
  };

  const handleEditInvoice = (values: any) => {
    const updatedInvoices = invoices.map((invoice) =>
      invoice.id === selectedInvoice?.id ? { ...invoice, ...values } : invoice
    );
    setInvoices(updatedInvoices);
    setIsEditModalOpen(false);
    setSelectedInvoice(null);
    message.success("Invoice updated successfully!");
  };

  const handleEdit = (record: InvoiceData) => {
    setSelectedInvoice(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record: InvoiceData) => {
    setSelectedInvoice(record);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id));
    message.success("Invoice deleted successfully!");
  };

  const handleExport = () => {
    message.success("Exporting invoices report...");
  };

  const columns: TableColumnsType<InvoiceData> = [
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      fixed: "left",
      width: 150,
      sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber),
      render: (invoiceNumber: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileTextOutlined style={{ color: "#3B82F6" }} />
          <span style={{ fontWeight: 600 }}>{invoiceNumber}</span>
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      width: 180,
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          {record.customerEmail && (
            <div style={{ fontSize: "12px", color: "#6B7280" }}>
              {record.customerEmail}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Store",
      dataIndex: "store",
      key: "store",
      width: 140,
      filters: [
        { text: "Store #1", value: "Store #1" },
        { text: "Store #2", value: "Store #2" },
        { text: "Store #3", value: "Store #3" },
        { text: "Store #4", value: "Store #4" },
        { text: "Store #5", value: "Store #5" },
      ],
      onFilter: (value, record) => record.store === value,
      render: (store: string) => <Tag color="blue">{store}</Tag>,
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      width: 130,
      sorter: (a, b) => a.invoiceDate.localeCompare(b.invoiceDate),
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 130,
      sorter: (a, b) => a.dueDate.localeCompare(b.dueDate),
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
      filters: [
        { text: "Cash", value: "cash" },
        { text: "Card", value: "card" },
        { text: "MoMo", value: "momo" },
        { text: "ZaloPay", value: "zalopay" },
        { text: "Bank Transfer", value: "bank-transfer" },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
      render: (method: string) => (
        <Tag>{getPaymentMethodLabel(method)}</Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "total",
      key: "total",
      width: 150,
      sorter: (a, b) => a.total - b.total,
      render: (total: number) => (
        <span style={{ fontWeight: 600, fontSize: "15px", color: "#3B82F6" }}>
          {total.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Paid", value: "paid" },
        { text: "Pending", value: "pending" },
        { text: "Overdue", value: "overdue" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              View
            </Button>
          </Tooltip>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete invoice"
            description="Are you sure you want to delete this invoice?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
              Invoice Management
            </h1>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>
              Manage all invoices and billing
            </p>
          </div>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleExport}
            >
              Export Report
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsAddModalOpen(true)}
            >
              Create Invoice
            </Button>
          </Space>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "24px" }}>
          <Input
            placeholder="Search invoices by number, customer, or store..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "500px" }}
            size="large"
          />
        </div>

        {/* Statistics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Total Invoices</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}>
              {invoices.length}
            </div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Paid</div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#10B981",
              }}
            >
              {invoices.filter((i) => i.status === "paid").length}
            </div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Pending</div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#F59E0B",
              }}
            >
              {invoices.filter((i) => i.status === "pending").length}
            </div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Total Revenue</div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#3B82F6",
              }}
            >
              {invoices
                .filter((i) => i.status === "paid")
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}{" "}
              ₫
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} invoices`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          scroll={{ x: 1500 }}
        />

        {/* Add Invoice Modal */}
        <Modal
          title="Create New Invoice"
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <InvoicesForm onSubmit={handleAddInvoice} isEdit={false} />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button onClick={() => setIsAddModalOpen(false)} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                const form = document.querySelector("form");
                if (form) {
                  const submitButton = form.querySelector(
                    'button[type="submit"]'
                  ) as HTMLButtonElement;
                  if (submitButton) submitButton.click();
                }
              }}
            >
              Create Invoice
            </Button>
          </div>
        </Modal>

        {/* Edit Invoice Modal */}
        <Modal
          title="Edit Invoice"
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedInvoice(null);
          }}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <InvoicesForm
            onSubmit={handleEditInvoice}
            initialValues={selectedInvoice}
            isEdit={true}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedInvoice(null);
              }}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                const form = document.querySelector("form");
                if (form) {
                  const submitButton = form.querySelector(
                    'button[type="submit"]'
                  ) as HTMLButtonElement;
                  if (submitButton) submitButton.click();
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </Modal>

        {/* View Invoice Modal */}
        <Modal
          title={`Invoice Details - ${selectedInvoice?.invoiceNumber}`}
          open={isViewModalOpen}
          onCancel={() => {
            setIsViewModalOpen(false);
            setSelectedInvoice(null);
          }}
          footer={[
            <Button
              key="close"
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedInvoice(null);
              }}
            >
              Close
            </Button>,
            <Button key="download" type="primary" icon={<DownloadOutlined />}>
              Download PDF
            </Button>,
          ]}
          width={800}
        >
          {selectedInvoice && (
            <div style={{ padding: "20px 0" }}>
              {/* Customer Info */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
                  Customer Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  <div>
                    <span style={{ color: "#6B7280" }}>Name: </span>
                    <strong>{selectedInvoice.customerName}</strong>
                  </div>
                  {selectedInvoice.customerEmail && (
                    <div>
                      <span style={{ color: "#6B7280" }}>Email: </span>
                      <strong>{selectedInvoice.customerEmail}</strong>
                    </div>
                  )}
                  {selectedInvoice.customerPhone && (
                    <div>
                      <span style={{ color: "#6B7280" }}>Phone: </span>
                      <strong>{selectedInvoice.customerPhone}</strong>
                    </div>
                  )}
                  <div>
                    <span style={{ color: "#6B7280" }}>Store: </span>
                    <Tag color="blue">{selectedInvoice.store}</Tag>
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
                  Invoice Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  <div>
                    <span style={{ color: "#6B7280" }}>Invoice Date: </span>
                    <strong>{new Date(selectedInvoice.invoiceDate).toLocaleDateString("vi-VN")}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#6B7280" }}>Due Date: </span>
                    <strong>{new Date(selectedInvoice.dueDate).toLocaleDateString("vi-VN")}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#6B7280" }}>Payment Method: </span>
                    <Tag>{getPaymentMethodLabel(selectedInvoice.paymentMethod)}</Tag>
                  </div>
                  <div>
                    <span style={{ color: "#6B7280" }}>Status: </span>
                    <Tag color={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status.toUpperCase()}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
                  Items
                </h3>
                <Table
                  columns={[
                    { title: "Product", dataIndex: "product", key: "product" },
                    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: 100 },
                    {
                      title: "Price",
                      dataIndex: "price",
                      key: "price",
                      width: 120,
                      render: (price: number) => `${price.toLocaleString()} ₫`,
                    },
                    {
                      title: "Total",
                      dataIndex: "total",
                      key: "total",
                      width: 120,
                      render: (total: number) => `${total.toLocaleString()} ₫`,
                    },
                  ]}
                  dataSource={selectedInvoice.items}
                  pagination={false}
                  size="small"
                />
              </div>

              {/* Summary */}
              <div
                style={{
                  backgroundColor: "#F9FAFB",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>Subtotal:</span>
                  <strong>{selectedInvoice.subtotal.toLocaleString()} ₫</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>Tax ({selectedInvoice.taxRate}%):</span>
                  <strong>{selectedInvoice.tax.toLocaleString()} ₫</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                    paddingTop: "8px",
                    borderTop: "2px solid #E5E7EB",
                  }}
                >
                  <strong>Total:</strong>
                  <strong style={{ color: "#3B82F6" }}>
                    {selectedInvoice.total.toLocaleString()} ₫
                  </strong>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div style={{ marginTop: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
                    Notes
                  </h3>
                  <p style={{ color: "#6B7280" }}>{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}