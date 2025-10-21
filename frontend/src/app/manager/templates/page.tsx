"use client";

import { ManagerLayout } from "@/components/layouts/manager-layout";
import { useState } from "react";
import { Table, Button, Input, Space, Tag, Modal, App } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FileTextOutlined, EyeOutlined, PrinterOutlined, StarOutlined, CopyOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplatesForm } from "@/components/forms/Manager/TemplatesForm";

interface Template {
  id: string;
  name: string;
  type: string;
  description?: string;
  content: string;
  category: "invoice" | "order" | "receipt" | "report";
  status: "active" | "inactive";
  isDefault?: boolean;
  lastUpdated: string;
}

// Mock data for Downtown Store templates
const mockTemplates: Template[] = [
  {
    id: "TPL001",
    name: "Hóa đơn chuẩn",
    type: "Mẫu hóa đơn",
    description: "Mẫu hóa đơn mặc định cho cửa hàng Downtown Store",
    content: `<!DOCTYPE html>
<html>
<head><title>Hóa đơn</title></head>
<body>
  <h1>HÓA ĐƠN</h1>
  <p>Mã đơn hàng: {{orderId}}</p>
  <p>Khách hàng: {{customerName}}</p>
  <p>Tổng tiền: {{total}}</p>
  <p>Ngày: {{date}}</p>
</body>
</html>`,
    category: "invoice",
    status: "active",
    isDefault: true,
    lastUpdated: "2025-10-15",
  },
  {
    id: "TPL002",
    name: "Đơn hàng tại bàn",
    type: "Mẫu đơn hàng",
    description: "Mẫu in phiếu order cho khách tại bàn",
    content: `<!DOCTYPE html>
<html>
<head><title>Đơn hàng</title></head>
<body>
  <h1>PHIẾU ORDER</h1>
  <p>Số bàn: {{tableNumber}}</p>
  <p>Món ăn: {{items}}</p>
  <p>Thời gian: {{date}}</p>
</body>
</html>`,
    category: "order",
    status: "active",
    isDefault: false,
    lastUpdated: "2025-10-10",
  },
  {
    id: "TPL003",
    name: "Hóa đơn khuyến mãi",
    type: "Mẫu hóa đơn",
    description: "Hóa đơn có áp dụng giảm giá và khuyến mãi",
    content: `<!DOCTYPE html>
<html>
<head><title>Hóa đơn KM</title></head>
<body>
  <h1>HÓA ĐƠN - ƯU ĐÃI ĐẶC BIỆT</h1>
  <p>Giảm giá: {{discount}}</p>
  <p>Tổng thanh toán: {{finalTotal}}</p>
  <p>Tiết kiệm: {{discount}}</p>
</body>
</html>`,
    category: "invoice",
    status: "active",
    isDefault: false,
    lastUpdated: "2025-10-01",
  },
  {
    id: "TPL004",
    name: "Biên lai mang đi",
    type: "Mẫu biên lai",
    description: "Biên lai nhanh cho đơn hàng mang đi",
    content: `<!DOCTYPE html>
<html>
<head><title>Biên lai</title></head>
<body>
  <h1>BIÊN LAI MANG ĐI</h1>
  <p>Đơn hàng: {{orderId}}</p>
  <p>Tổng tiền: {{total}}</p>
  <p>Cảm ơn quý khách!</p>
</body>
</html>`,
    category: "receipt",
    status: "active",
    isDefault: false,
    lastUpdated: "2025-09-28",
  },
  {
    id: "TPL005",
    name: "Báo cáo doanh thu ngày",
    type: "Mẫu báo cáo",
    description: "Báo cáo tổng kết doanh thu cuối ngày",
    content: `<!DOCTYPE html>
<html>
<head><title>Báo cáo</title></head>
<body>
  <h1>BÁO CÁO DOANH THU NGÀY</h1>
  <p>Ngày: {{date}}</p>
  <p>Tổng doanh thu: {{totalSales}}</p>
  <p>Cửa hàng: Downtown Store</p>
</body>
</html>`,
    category: "report",
    status: "active",
    isDefault: true,
    lastUpdated: "2025-09-25",
  },
  {
    id: "TPL006",
    name: "Đơn hàng giao hàng",
    type: "Mẫu đơn hàng",
    description: "Mẫu đơn hàng giao tận nơi có địa chỉ",
    content: `<!DOCTYPE html>
<html>
<head><title>Giao hàng</title></head>
<body>
  <h1>ĐƠN GIAO HÀNG</h1>
  <p>Địa chỉ: {{address}}</p>
  <p>Món ăn: {{items}}</p>
  <p>Khách hàng: {{customerName}}</p>
</body>
</html>`,
    category: "order",
    status: "active",
    isDefault: false,
    lastUpdated: "2025-09-15",
  },
];

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
      title: `Xóa mẫu: ${template.name}`,
      content: "Bạn có chắc chắn muốn xóa mẫu này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        message.success("Xóa mẫu thành công");
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
      content = content.replace(/{{customerName}}/g, 'Nguyễn Văn A');
      content = content.replace(/{{total}}/g, '500,000 VND');
      content = content.replace(/{{discount}}/g, '50,000 VND');
      content = content.replace(/{{finalTotal}}/g, '450,000 VND');
      content = content.replace(/{{date}}/g, new Date().toLocaleDateString('vi-VN'));
      content = content.replace(/{{tableNumber}}/g, 'T-15');
      content = content.replace(/{{address}}/g, '123 Nguyễn Huệ, Q.1, TP.HCM');
      content = content.replace(/{{items}}/g, 'Phở Bò (x2), Cà phê (x1), Bánh mì (x2)');
      content = content.replace(/{{totalSales}}/g, '5,000,000 VND');
      
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      message.success('Đang mở bản xem trước in...');
    }
  };

  const handleDuplicateTemplate = (template: Template) => {
    modal.confirm({
      title: `Sao chép mẫu: ${template.name}`,
      content: "Tạo bản sao của mẫu này?",
      okText: "Sao chép",
      cancelText: "Hủy",
      onOk: () => {
        message.success("Sao chép mẫu thành công");
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
      title: "Mã mẫu",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (text: string) => (
        <span className="font-mono text-xs font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: "Tên mẫu",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Template) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{text}</span>
            {record.isDefault && (
              <StarOutlined className="text-yellow-500" title="Mẫu mặc định" />
            )}
          </div>
          <div className="text-xs text-slate-500">{record.type}</div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Hóa đơn", value: "invoice" },
        { text: "Đơn hàng", value: "order" },
        { text: "Biên lai", value: "receipt" },
        { text: "Báo cáo", value: "report" },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category: string) => {
        const colors: Record<string, string> = {
          invoice: "blue",
          order: "green",
          receipt: "orange",
          report: "purple",
        };
        const labels: Record<string, string> = {
          invoice: "HÓA ĐƠN",
          order: "ĐƠN HÀNG",
          receipt: "BIÊN LAI",
          report: "BÁO CÁO",
        };
        return <Tag color={colors[category]}>{labels[category]}</Tag>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => (
        <span className="text-slate-600">{text || "-"}</span>
      ),
    },
    {
      title: "Cập nhật",
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Đang hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status === "active" ? "HOẠT ĐỘNG" : "TẠM DỪNG"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      width: 200,
      render: (_, record: Template) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewTemplate(record)}
            title="Xem trước"
          />
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintTemplate(record)}
            title="In"
          />
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleViewTemplate(record)}
            title="Chi tiết"
          />
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleDuplicateTemplate(record)}
            title="Sao chép"
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTemplate(record);
              setIsEditDialogOpen(true);
            }}
            title="Sửa"
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTemplate(record)}
            title="Xóa"
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
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Quản lý Mẫu
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Quản lý các mẫu hóa đơn, đơn hàng và báo cáo cho Downtown Store
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                placeholder="Tìm kiếm mẫu..."
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
                Tạo mẫu
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
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mẫu`,
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
        title={<span className="text-lg font-semibold">Tạo mẫu mới</span>}
        open={isAddDialogOpen}
        onCancel={() => setIsAddDialogOpen(false)}
        footer={null}
        width={900}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <p className="text-slate-500 mb-6">Tạo mẫu mới cho hóa đơn, đơn hàng hoặc báo cáo.</p>
        <TemplatesForm onSuccess={() => setIsAddDialogOpen(false)} />
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        title={<span className="text-lg font-semibold">Chỉnh sửa mẫu: {selectedTemplate?.name}</span>}
        open={isEditDialogOpen}
        onCancel={() => setIsEditDialogOpen(false)}
        footer={null}
        width={900}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <p className="text-slate-500 mb-6">Cập nhật thông tin và nội dung mẫu.</p>
        <TemplatesForm template={selectedTemplate!} onSuccess={() => setIsEditDialogOpen(false)} />
      </Modal>

      {/* View Template Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-blue-500" />
            <span className="text-lg font-semibold">Chi tiết mẫu: {selectedTemplate?.name}</span>
          </div>
        }
        open={isViewDialogOpen}
        onCancel={() => setIsViewDialogOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewDialogOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="preview"
            onClick={() => {
              setIsViewDialogOpen(false);
              setIsPreviewDialogOpen(true);
            }}
          >
            Xem trước
          </Button>,
          <Button
            key="print"
            onClick={() => {
              if (selectedTemplate) handlePrintTemplate(selectedTemplate);
            }}
          >
            <PrinterOutlined /> In
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsViewDialogOpen(false);
              setIsEditDialogOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={900}
        centered
        destroyOnClose
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Mã mẫu</p>
                <p className="font-mono text-sm font-semibold text-blue-600">{selectedTemplate.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Loại</p>
                <p className="text-sm font-medium">{selectedTemplate.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Danh mục</p>
                <Tag color={
                  selectedTemplate.category === "invoice" ? "blue" :
                  selectedTemplate.category === "order" ? "green" :
                  selectedTemplate.category === "receipt" ? "orange" : "purple"
                }>
                  {selectedTemplate.category === "invoice" ? "HÓA ĐƠN" :
                   selectedTemplate.category === "order" ? "ĐƠN HÀNG" :
                   selectedTemplate.category === "receipt" ? "BIÊN LAI" : "BÁO CÁO"}
                </Tag>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Trạng thái</p>
                <Tag color={selectedTemplate.status === "active" ? "green" : "default"}>
                  {selectedTemplate.status === "active" ? "HOẠT ĐỘNG" : "TẠM DỪNG"}
                </Tag>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Mẫu mặc định</p>
                <Tag color={selectedTemplate.isDefault ? "gold" : "default"}>
                  {selectedTemplate.isDefault ? "CÓ" : "KHÔNG"}
                </Tag>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Cập nhật lần cuối</p>
                <p className="text-sm">{new Date(selectedTemplate.lastUpdated).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            {selectedTemplate.description && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Mô tả</p>
                <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                  {selectedTemplate.description}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Nội dung mẫu</p>
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
            <span className="text-lg font-semibold">Xem trước: {selectedTemplate?.name}</span>
          </div>
        }
        open={isPreviewDialogOpen}
        onCancel={() => setIsPreviewDialogOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewDialogOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              if (selectedTemplate) handlePrintTemplate(selectedTemplate);
            }}
            className="bg-blue-500 hover:bg-blue-600"
          >
            In
          </Button>,
        ]}
        width={800}
        centered
        destroyOnClose
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Chế độ xem trước:</strong> Đây là bản xem trước với dữ liệu mẫu. Dữ liệu thực tế sẽ được điền khi sử dụng.
              </p>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-white">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: selectedTemplate.content
                    .replace(/{{orderId}}/g, '<strong>ORD-12345</strong>')
                    .replace(/{{customerName}}/g, '<strong>Nguyễn Văn A</strong>')
                    .replace(/{{total}}/g, '<strong>500,000 VND</strong>')
                    .replace(/{{discount}}/g, '<strong>50,000 VND</strong>')
                    .replace(/{{finalTotal}}/g, '<strong>450,000 VND</strong>')
                    .replace(/{{date}}/g, `<strong>${new Date().toLocaleDateString('vi-VN')}</strong>`)
                    .replace(/{{tableNumber}}/g, '<strong>T-15</strong>')
                    .replace(/{{address}}/g, '<strong>123 Nguyễn Huệ, Q.1, TP.HCM</strong>')
                    .replace(/{{items}}/g, '<strong>Phở Bò (x2), Cà phê (x1), Bánh mì (x2)</strong>')
                    .replace(/{{totalSales}}/g, '<strong>5,000,000 VND</strong>')
                }}
                className="template-preview"
                style={{ minHeight: '200px' }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ManagerTemplatesPage() {
  return (
    <ManagerLayout>
      <TemplatesContent />
    </ManagerLayout>
  );
}