"use client";

import { useState } from "react";
import { Table, Button, Input, Space, Tag, Modal, App } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FileTextOutlined, EyeOutlined, PrinterOutlined, ShopOutlined, StarOutlined, CopyOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { TemplatesForm } from "@/components/forms/Admin/TemplatesForm";

interface Template {
  id: string;
  name: string;
  type: string;
  description?: string;
  content: string;
  category: "invoice" | "order" | "receipt" | "report";
  status: "active" | "inactive";
  assignedStores?: string[];
  isDefault?: boolean;
  lastUpdated: string;
}

function TemplatesContent() {
  const { message, modal } = App.useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDeleteTemplate = (template: Template) => {
    modal.confirm({
      title: `Delete Template: ${template.name}`,
      content: "Are you sure you want to delete this template? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        message.success("Template deleted successfully");
      },
    });
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handlePrintTemplate = (template: Template) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Replace placeholders with sample data
      let content = template.content;
      content = content.replace(/{{orderId}}/g, 'ORD-12345');
      content = content.replace(/{{customerName}}/g, 'John Doe');
      content = content.replace(/{{total}}/g, '500,000 VND');
      content = content.replace(/{{discount}}/g, '50,000 VND');
      content = content.replace(/{{finalTotal}}/g, '450,000 VND');
      content = content.replace(/{{date}}/g, new Date().toLocaleDateString('vi-VN'));
      content = content.replace(/{{tableNumber}}/g, 'T-15');
      content = content.replace(/{{address}}/g, '123 Main St, HCMC');
      content = content.replace(/{{items}}/g, 'Burger (x2), Fries (x1), Coke (x2)');
      
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      message.success('Opening print preview...');
    }
  };

  const handleDuplicateTemplate = (template: Template) => {
    modal.confirm({
      title: `Duplicate Template: ${template.name}`,
      content: "Create a copy of this template?",
      okText: "Duplicate",
      cancelText: "Cancel",
      onOk: () => {
        message.success("Template duplicated successfully");
      },
    });
  };

  const filteredTemplates = mockTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnsType<Template> = [
    {
      title: "Template ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (text: string) => (
        <span className="font-mono text-xs font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: "Template Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Template) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{text}</span>
            {record.isDefault && (
              <StarOutlined className="text-yellow-500" title="Default Template" />
            )}
          </div>
          <div className="text-xs text-slate-500">{record.type}</div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Invoice", value: "invoice" },
        { text: "Order", value: "order" },
        { text: "Receipt", value: "receipt" },
        { text: "Report", value: "report" },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category: string) => {
        const colors: Record<string, string> = {
          invoice: "blue",
          order: "green",
          receipt: "orange",
          report: "purple",
        };
        return <Tag color={colors[category]}>{category.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => (
        <span className="text-slate-600">{text || "-"}</span>
      ),
    },
    {
      title: "Assigned Stores",
      dataIndex: "assignedStores",
      key: "assignedStores",
      render: (stores: string[] | undefined) => {
        if (!stores || stores.length === 0) {
          return <Tag color="blue">All Stores</Tag>;
        }
        return (
          <div className="flex gap-1 flex-wrap">
            <Tag color="green">{stores.length} stores</Tag>
          </div>
        );
      },
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      sorter: (a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">
          {new Date(date).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 200,
      render: (_, record: Template) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewTemplate(record)}
            title="Preview"
          />
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintTemplate(record)}
            title="Print"
          />
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleViewTemplate(record)}
            title="View Details"
          />
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleDuplicateTemplate(record)}
            title="Duplicate"
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTemplate(record);
              setIsEditDialogOpen(true);
            }}
            title="Edit"
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTemplate(record)}
            title="Delete"
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
                  Quản lý mẫu
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Manage invoice, order, and receipt templates
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Input
                  placeholder="Search templates..."
                  prefix={<SearchOutlined className="text-slate-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Add Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table
              columns={columns}
              dataSource={filteredTemplates}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredTemplates.length,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} templates`,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
              onChange={handleTableChange}
              className="ant-table-custom"
              bordered={false}
            />
          </CardContent>
        </Card>

        {/* Add Template Modal */}
        <Modal
          title={<span className="text-lg font-semibold">Add New Template</span>}
          open={isAddDialogOpen}
          onCancel={() => setIsAddDialogOpen(false)}
          footer={null}
          width={900}
          centered
          destroyOnHidden
          maskClosable={false}
        >
          <p className="text-slate-500 mb-6">Create a new template for invoices, orders, or receipts.</p>
          <TemplatesForm onSuccess={() => setIsAddDialogOpen(false)} />
        </Modal>

        {/* Edit Template Modal */}
        <Modal
          title={<span className="text-lg font-semibold">Edit Template: {selectedTemplate?.name}</span>}
          open={isEditDialogOpen}
          onCancel={() => setIsEditDialogOpen(false)}
          footer={null}
          width={900}
          centered
          destroyOnHidden
          maskClosable={false}
        >
          <p className="text-slate-500 mb-6">Update the template details and content.</p>
          <TemplatesForm template={selectedTemplate!} onSuccess={() => setIsEditDialogOpen(false)} />
        </Modal>

        {/* View Template Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-blue-500" />
              <span className="text-lg font-semibold">Template Details: {selectedTemplate?.name}</span>
            </div>
          }
          open={isViewDialogOpen}
          onCancel={() => setIsViewDialogOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>,
            <Button
              key="preview"
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsPreviewDialogOpen(true);
              }}
            >
              Preview
            </Button>,
            <Button
              key="print"
              onClick={() => {
                if (selectedTemplate) handlePrintTemplate(selectedTemplate);
              }}
            >
              <PrinterOutlined /> Print
            </Button>,
            <Button
              key="edit"
              type="primary"
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsEditDialogOpen(true);
              }}
            >
              Edit Template
            </Button>,
          ]}
          width={900}
          centered
          destroyOnHidden
        >
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Template ID</p>
                  <p className="font-mono text-sm font-semibold text-blue-600">{selectedTemplate.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Type</p>
                  <p className="text-sm font-medium">{selectedTemplate.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Category</p>
                  <Tag color={
                    selectedTemplate.category === "invoice" ? "blue" :
                    selectedTemplate.category === "order" ? "green" :
                    selectedTemplate.category === "receipt" ? "orange" : "purple"
                  }>
                    {selectedTemplate.category.toUpperCase()}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                  <Tag color={selectedTemplate.status === "active" ? "green" : "default"}>
                    {selectedTemplate.status.toUpperCase()}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Default Template</p>
                  <Tag color={selectedTemplate.isDefault ? "gold" : "default"}>
                    {selectedTemplate.isDefault ? "YES" : "NO"}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Last Updated</p>
                  <p className="text-sm">{new Date(selectedTemplate.lastUpdated).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <ShopOutlined /> Assigned Stores
                </p>
                <div className="p-3 bg-slate-50 rounded-lg">
                  {!selectedTemplate.assignedStores || selectedTemplate.assignedStores.length === 0 ? (
                    <Tag color="blue">Available to All Stores</Tag>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {selectedTemplate.assignedStores.map((storeId) => {
                        const stores = [
                          { id: "1", name: "Downtown Store" },
                          { id: "2", name: "Uptown Store" },
                          { id: "3", name: "Suburban Store" },
                          { id: "4", name: "Riverside Store" },
                          { id: "5", name: "Hillside Store" },
                        ];
                        const store = stores.find(s => s.id === storeId);
                        return <Tag key={storeId} color="green">{store?.name || storeId}</Tag>;
                      })}
                    </div>
                  )}
                </div>
              </div>

              {selectedTemplate.description && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Description</p>
                  <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                    {selectedTemplate.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Template Content</p>
                <div className="p-4 bg-slate-900 rounded-lg overflow-auto max-h-96">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Preview Template Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EyeOutlined className="text-green-500" />
              <span className="text-lg font-semibold">Preview: {selectedTemplate?.name}</span>
            </div>
          }
          open={isPreviewDialogOpen}
          onCancel={() => setIsPreviewDialogOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>,
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => {
                if (selectedTemplate) handlePrintTemplate(selectedTemplate);
              }}
            >
              Print
            </Button>,
          ]}
          width={800}
          centered
          destroyOnHidden
        >
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Preview Mode:</strong> This is a sample preview with mock data. Actual data will be populated when used.
                </p>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-white">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: selectedTemplate.content
                      .replace(/{{orderId}}/g, '<strong>ORD-12345</strong>')
                      .replace(/{{customerName}}/g, '<strong>John Doe</strong>')
                      .replace(/{{total}}/g, '<strong>500,000 VND</strong>')
                      .replace(/{{discount}}/g, '<strong>50,000 VND</strong>')
                      .replace(/{{finalTotal}}/g, '<strong>450,000 VND</strong>')
                      .replace(/{{date}}/g, `<strong>${new Date().toLocaleDateString('vi-VN')}</strong>`)
                      .replace(/{{tableNumber}}/g, '<strong>T-15</strong>')
                      .replace(/{{address}}/g, '<strong>123 Main St, HCMC</strong>')
                      .replace(/{{items}}/g, '<strong>Burger (x2), Fries (x1), Coke (x2)</strong>')
                      .replace(/{{cardCode}}/g, '<strong>GC-ABC123</strong>')
                      .replace(/{{amount}}/g, '<strong>200,000 VND</strong>')
                      .replace(/{{totalSales}}/g, '<strong>5,000,000 VND</strong>')
                      .replace(/{{originalOrder}}/g, '<strong>ORD-12340</strong>')
                      .replace(/{{refundAmount}}/g, '<strong>100,000 VND</strong>')
                  }}
                  className="template-preview"
                  style={{ minHeight: '200px' }}
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default function TemplatesPage() {
  return <TemplatesContent />;
}

// Mock data
const mockTemplates: Template[] = [
  {
    id: "TPL001",
    name: "Standard Invoice",
    type: "Invoice Template",
    description: "Default invoice template for regular transactions",
    content: `<!DOCTYPE html>
<html>
<head><title>Invoice</title></head>
<body>
  <h1>INVOICE</h1>
  <p>Order ID: {{orderId}}</p>
  <p>Total: {{total}}</p>
</body>
</html>`,
    category: "invoice",
    status: "active",
    isDefault: true,
    assignedStores: [],
    lastUpdated: "2025-10-15",
  },
  {
    id: "TPL002",
    name: "Dine-in Order",
    type: "Order Template",
    description: "Template for dine-in orders with table number",
    content: `<!DOCTYPE html>
<html>
<head><title>Order</title></head>
<body>
  <h1>TABLE ORDER</h1>
  <p>Table: {{tableNumber}}</p>
  <p>Items: {{items}}</p>
</body>
</html>`,
    category: "order",
    status: "active",
    isDefault: false,
    assignedStores: ["1", "2", "3"],
    lastUpdated: "2025-10-10",
  },
  {
    id: "TPL003",
    name: "Promotional Invoice",
    type: "Invoice Template",
    description: "Invoice template with discount and promotion details",
    content: `<!DOCTYPE html>
<html>
<head><title>Promotional Invoice</title></head>
<body>
  <h1>INVOICE - SPECIAL OFFER</h1>
  <p>Discount: {{discount}}</p>
  <p>Final Total: {{finalTotal}}</p>
</body>
</html>`,
    category: "invoice",
    status: "active",
    isDefault: false,
    assignedStores: ["1", "7", "8"],
    lastUpdated: "2025-10-01",
  },
  {
    id: "TPL004",
    name: "Takeaway Receipt",
    type: "Receipt Template",
    description: "Quick receipt for takeaway orders",
    content: `<!DOCTYPE html>
<html>
<head><title>Receipt</title></head>
<body>
  <h1>TAKEAWAY RECEIPT</h1>
  <p>Order: {{orderId}}</p>
  <p>Total: {{total}}</p>
</body>
</html>`,
    category: "receipt",
    status: "active",
    isDefault: false,
    assignedStores: [],
    lastUpdated: "2025-09-28",
  },
  {
    id: "TPL005",
    name: "Daily Sales Report",
    type: "Report Template",
    description: "Daily sales summary report template",
    content: `<!DOCTYPE html>
<html>
<head><title>Daily Report</title></head>
<body>
  <h1>DAILY SALES REPORT</h1>
  <p>Date: {{date}}</p>
  <p>Total Sales: {{totalSales}}</p>
</body>
</html>`,
    category: "report",
    status: "active",
    isDefault: true,
    assignedStores: ["1", "2"],
    lastUpdated: "2025-09-25",
  },
  {
    id: "TPL006",
    name: "Gift Card Invoice",
    type: "Invoice Template",
    description: "Invoice template for gift card purchases",
    content: `<!DOCTYPE html>
<html>
<head><title>Gift Card</title></head>
<body>
  <h1>GIFT CARD INVOICE</h1>
  <p>Card Code: {{cardCode}}</p>
  <p>Amount: {{amount}}</p>
</body>
</html>`,
    category: "invoice",
    status: "inactive",
    isDefault: false,
    assignedStores: ["8"],
    lastUpdated: "2025-08-20",
  },
  {
    id: "TPL007",
    name: "Delivery Order",
    type: "Order Template",
    description: "Template for delivery orders with address",
    content: `<!DOCTYPE html>
<html>
<head><title>Delivery</title></head>
<body>
  <h1>DELIVERY ORDER</h1>
  <p>Address: {{address}}</p>
  <p>Items: {{items}}</p>
</body>
</html>`,
    category: "order",
    status: "active",
    isDefault: false,
    assignedStores: [],
    lastUpdated: "2025-09-15",
  },
  {
    id: "TPL008",
    name: "Refund Receipt",
    type: "Receipt Template",
    description: "Receipt template for refund transactions",
    content: `<!DOCTYPE html>
<html>
<head><title>Refund</title></head>
<body>
  <h1>REFUND RECEIPT</h1>
  <p>Original Order: {{originalOrder}}</p>
  <p>Refund Amount: {{refundAmount}}</p>
</body>
</html>`,
    category: "receipt",
    status: "active",
    isDefault: false,
    assignedStores: ["1", "2", "3", "4", "5"],
    lastUpdated: "2025-09-10",
  },
];