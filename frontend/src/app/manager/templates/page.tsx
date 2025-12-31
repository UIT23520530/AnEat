"use client";

import { ManagerLayout } from "@/components/layouts/manager-layout";
import { useState, useEffect } from "react";
import { Table, Button, Input, Space, Tag, Modal, App, Spin } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FileTextOutlined, EyeOutlined, PrinterOutlined, StarOutlined, CopyOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplatesForm } from "@/components/forms/manager/TemplatesForm";
import { templateService, Template, TemplateCategory, TemplateStatus } from "@/services/template.service";

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
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Load templates
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await templateService.getAll(
        { search: searchTerm || undefined },
        currentPage,
        pageSize,
        "-createdAt"
      );
      setTemplates(response.data);
      setTotalItems(response.meta.total_items);
    } catch (error: any) {
      message.error("Không thể tải danh sách mẫu");
      console.error("Load templates error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [currentPage, pageSize, searchTerm]);

  const handleDeleteTemplate = (template: Template) => {
    modal.confirm({
      title: `Xóa mẫu: ${template.name}`,
      content: "Bạn có chắc chắn muốn xóa mẫu này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await templateService.delete(template.id);
          message.success("Xóa mẫu thành công");
          loadTemplates();
        } catch (error: any) {
          message.error("Xóa mẫu thất bại");
        }
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
      onOk: async () => {
        try {
          await templateService.duplicate(template.id);
          message.success("Sao chép mẫu thành công");
          loadTemplates();
        } catch (error: any) {
          message.error("Sao chép mẫu thất bại");
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
    loadTemplates();
  };

  const columns: ColumnsType<Template> = [
    {
      title: "Mã mẫu",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (text: string) => (
        <span className="font-mono text-xs font-semibold text-blue-600">{text.substring(0, 8)}</span>
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
        { text: "Hóa đơn", value: TemplateCategory.INVOICE },
        { text: "Đơn hàng", value: TemplateCategory.ORDER },
        { text: "Biên lai", value: TemplateCategory.RECEIPT },
        { text: "Báo cáo", value: TemplateCategory.REPORT },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category: TemplateCategory) => {
        const colors: Record<TemplateCategory, string> = {
          [TemplateCategory.INVOICE]: "blue",
          [TemplateCategory.ORDER]: "green",
          [TemplateCategory.RECEIPT]: "orange",
          [TemplateCategory.REPORT]: "purple",
        };
        const labels: Record<TemplateCategory, string> = {
          [TemplateCategory.INVOICE]: "HÓA ĐƠN",
          [TemplateCategory.ORDER]: "ĐƠN HÀNG",
          [TemplateCategory.RECEIPT]: "BIÊN LAI",
          [TemplateCategory.REPORT]: "BÁO CÁO",
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
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
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
        { text: "Đang hoạt động", value: TemplateStatus.ACTIVE },
        { text: "Không hoạt động", value: TemplateStatus.INACTIVE },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: TemplateStatus) => (
        <Tag color={status === TemplateStatus.ACTIVE ? "green" : "default"}>
          {status === TemplateStatus.ACTIVE ? "HOẠT ĐỘNG" : "TẠM DỪNG"}
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
      <Spin spinning={loading}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Quản lý Mẫu hoá đơn
                </CardTitle>
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
              dataSource={templates}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalItems,
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
      </Spin>

      {/* Add Template Modal */}
      <Modal
        title={<span className="text-lg font-semibold">Tạo mẫu mới</span>}
        open={isAddDialogOpen}
        onCancel={() => {
          setIsAddDialogOpen(false);
          setSelectedTemplate(null);
        }}
        footer={null}
        width={900}
        centered
        destroyOnHidden
        maskClosable={false}
      >
        <p className="text-slate-500 mb-6">Tạo mẫu mới cho hóa đơn, đơn hàng hoặc báo cáo.</p>
        <TemplatesForm onSuccess={handleFormSuccess} />
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        title={<span className="text-lg font-semibold">Chỉnh sửa mẫu: {selectedTemplate?.name}</span>}
        open={isEditDialogOpen}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setSelectedTemplate(null);
        }}
        footer={null}
        width={900}
        centered
        destroyOnHidden
        maskClosable={false}
      >
        <p className="text-slate-500 mb-6">Cập nhật thông tin và nội dung mẫu.</p>
        <TemplatesForm template={selectedTemplate!} onSuccess={handleFormSuccess} />
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
        destroyOnHidden
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Mã mẫu</p>
                <p className="font-mono text-sm font-semibold text-blue-600">{selectedTemplate.id.substring(0, 8)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Loại</p>
                <p className="text-sm font-medium">{selectedTemplate.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Danh mục</p>
                <Tag color={
                  selectedTemplate.category === TemplateCategory.INVOICE ? "blue" :
                  selectedTemplate.category === TemplateCategory.ORDER ? "green" :
                  selectedTemplate.category === TemplateCategory.RECEIPT ? "orange" : "purple"
                }>
                  {selectedTemplate.category === TemplateCategory.INVOICE ? "HÓA ĐƠN" :
                   selectedTemplate.category === TemplateCategory.ORDER ? "ĐƠN HÀNG" :
                   selectedTemplate.category === TemplateCategory.RECEIPT ? "BIÊN LAI" : "BÁO CÁO"}
                </Tag>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Trạng thái</p>
                <Tag color={selectedTemplate.status === TemplateStatus.ACTIVE ? "green" : "default"}>
                  {selectedTemplate.status === TemplateStatus.ACTIVE ? "HOẠT ĐỘNG" : "TẠM DỪNG"}
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
                <p className="text-sm">{new Date(selectedTemplate.updatedAt).toLocaleString('vi-VN')}</p>
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
        destroyOnHidden
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