"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { useState, useEffect } from "react";
import { Table, Button, Input, Space, Tag, Modal, App, Select, Tooltip, Row, Col, Statistic, Form, Spin } from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CopyOutlined,
  EyeOutlined,
  StarOutlined,
  FilterOutlined,
  FileAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminTemplateService, TemplateDTO, TemplateCategory, TemplateStatus, CreateTemplateDto, UpdateTemplateDto } from "@/services/admin-template.service";
import { TemplateForm } from "@/components/forms/Admin/TemplateForm";
import { TemplateDetailModal } from "@/components/forms/Admin/TemplateDetailModal";
import { TemplatePreviewModal } from "@/components/forms/Admin/TemplatePreviewModal";
import dayjs from "dayjs";

const { Option } = Select;

// Search normalization helper
const normalizeSearchString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .trim()
}

function TemplatesContent() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();

  // State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDTO | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [branches, setBranches] = useState<any[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byCategory: { invoice: 0, order: 0, receipt: 0, report: 0 },
  });

  // Load templates
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      if (searchTerm) filters.search = searchTerm;
      if (categoryFilter && categoryFilter !== "all") filters.category = categoryFilter as TemplateCategory;
      if (statusFilter && statusFilter !== "all") filters.status = statusFilter as TemplateStatus;
      if (branchFilter) filters.branchId = branchFilter;

      const response = await adminTemplateService.getAll(
        filters,
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

  // Load stats
  const loadStats = async () => {
    try {
      const data = await adminTemplateService.getStats(branchFilter || undefined);
      setStats(data);
    } catch (error) {
      console.error("Load stats error:", error);
    }
  };

  // Load branches
  const loadBranches = async () => {
    try {
      const { adminBranchService } = await import("@/services/admin-branch.service");
      const response = await adminBranchService.getBranches();
      setBranches(response.data);
    } catch (error) {
      console.error("Load branches error:", error);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [currentPage, pageSize, searchTerm, categoryFilter, statusFilter, branchFilter]);

  useEffect(() => {
    loadStats();
  }, [branchFilter]);

  // Handlers
  const handleCreate = async (values: CreateTemplateDto | UpdateTemplateDto) => {
    setSubmitting(true);
    try {
      await adminTemplateService.create(values as CreateTemplateDto);
      message.success("Tạo mẫu thành công");
      setIsAddModalOpen(false);
      form.resetFields();
      loadTemplates();
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Tạo mẫu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (values: CreateTemplateDto | UpdateTemplateDto) => {
    if (!selectedTemplate) return;

    console.log("📤 Update template values:", values);
    setSubmitting(true);
    try {
      const result = await adminTemplateService.update(selectedTemplate.id, values as UpdateTemplateDto);
      console.log("✅ Update result:", result);
      message.success("Cập nhật mẫu thành công");
      setIsEditModalOpen(false);
      setSelectedTemplate(null);
      form.resetFields();
      loadTemplates();
      loadStats();
    } catch (error: any) {
      console.error("❌ Update error:", error);
      message.error(error.response?.data?.message || "Cập nhật mẫu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (template: TemplateDTO) => {
    modal.confirm({
      title: `Xóa mẫu: ${template.name}`,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa mẫu này?</p>
          <p className="text-red-500 mt-2">Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
        type: "primary",
      },
      onOk: async () => {
        try {
          await adminTemplateService.delete(template.id);
          message.success("Xóa mẫu thành công");
          loadTemplates();
          loadStats();
        } catch (error: any) {
          message.error(error.response?.data?.message || "Xóa mẫu thất bại");
        }
      },
    });
  };

  const handleDuplicate = (template: TemplateDTO) => {
    modal.confirm({
      title: `Sao chép mẫu: ${template.name}`,
      content: "Tạo một bản sao của mẫu này để chỉnh sửa?",
      okText: "Sao chép",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await adminTemplateService.duplicate(template.id);
          message.success("Sao chép mẫu thành công");
          loadTemplates();
          loadStats();
        } catch (error: any) {
          message.error(error.response?.data?.message || "Sao chép mẫu thất bại");
        }
      },
    });
  };

  const handlePrint = (template: TemplateDTO) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleConfirmPrint = () => {
    if (!selectedTemplate) return;
    
    const templateName = selectedTemplate.name;
    
    // Setup after print handler (fires when print dialog closes)
    const afterPrintHandler = () => {
      // Close modal
      setIsPreviewModalOpen(false);
      
      // Show success message
      message.success(`Đã in mẫu "${templateName}" thành công`);
      
      // Reload page to ensure layout is preserved
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      // Remove event listener
      window.removeEventListener('afterprint', afterPrintHandler);
    };
    
    // Add event listener for after print
    window.addEventListener('afterprint', afterPrintHandler);
    
    // Trigger print (modal stays open so content is visible)
    window.print();
  };

  const getCategoryText = (category: TemplateCategory) => {
    const map: Record<TemplateCategory, string> = {
      INVOICE: "Hóa đơn",
      ORDER: "Đơn hàng",
      RECEIPT: "Biên lai",
      REPORT: "Báo cáo",
    };
    return map[category];
  };

  const getCategoryColor = (category: TemplateCategory) => {
    const map: Record<TemplateCategory, string> = {
      INVOICE: "blue",
      ORDER: "green",
      RECEIPT: "orange",
      REPORT: "purple",
    };
    return map[category];
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const columns: TableColumnsType<TemplateDTO> = [
    {
      title: "Mã mẫu",
      dataIndex: "id",
      key: "id",
      width: 130,
      fixed: "left",
      render: (text: string) => (
        <span className="font-mono text-xs font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: "Tên mẫu",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 190,
      render: (text: string, record: TemplateDTO) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{text}</span>
            {record.isDefault && (
              <StarOutlined className="text-yellow-500" title="Mẫu mặc định" />
            )}
          </div>
          {record.type && (
            <div className="text-xs text-slate-500">{record.type}</div>
          )}
        </div>
      ),
    },
    {
      title: "Phân loại",
      dataIndex: "category",
      key: "category",
      width: 120,
      fixed: "left",
      align: "center",
      render: (category: TemplateCategory) => (
        <Tag color={getCategoryColor(category)}>{getCategoryText(category)}</Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <span className="text-slate-600">{text || "-"}</span>
      ),
    },
    {
      title: "Chi nhánh",
      key: "branch",
      width: 180,
      align: "center",
      render: (text: string, record: TemplateDTO) => {
        if (!record.branchId) {
          return <Tag color="blue">Toàn hệ thống</Tag>;
        }
        return <span className="text-sm">{record.branchName || record.branchId}</span>;
      },
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: true,
      showSorterTooltip: { title: 'Sắp xếp theo ngày cập nhật' },
      width: 170,
      align: "right",
      render: (date: string) => (
        <span className="text-sm text-slate-600">
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 170,
      render: (status: TemplateStatus) => (
        <Tag color={status === "ACTIVE" ? "green" : "default"}>
          {status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 210,
      fixed: "right",
      render: (_, record: TemplateDTO) => (
        <Space size="small">
          <Tooltip title="In mẫu">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => {
                setSelectedTemplate(record);
                setIsDetailModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Sao chép">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedTemplate(record);
                form.setFieldsValue({
                  name: record.name,
                  type: record.type,
                  category: record.category,
                  description: record.description,
                  content: record.content,
                  status: record.status === "ACTIVE",
                  isDefault: record.isDefault,
                });
                setIsEditModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8">
      <Spin spinning={loading}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4">
              {/* Stats Cards */}
              <Row gutter={16}>
                <Col span={8}>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Statistic
                      title="Tổng số mẫu"
                      value={stats.total}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <Statistic
                      title="Đang hoạt động"
                      value={stats.active}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <Statistic
                      title="Ngừng hoạt động"
                      value={stats.inactive}
                      prefix={<CloseCircleOutlined />}
                      valueStyle={{ color: "#ff4d4f" }}
                    />
                  </div>
                </Col>
              </Row>

              {/* Filters */}
              <div className="flex justify-between items-center">
                <Space size="middle">
                  <Input
                    placeholder="Tìm kiếm mẫu..."
                    prefix={<SearchOutlined />}
                    style={{ width: 280 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />

                  <Select
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    style={{ width: 200 }}
                    className={categoryFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                  >
                    <Select.Option value="all">Tất cả phân loại</Select.Option>
                    <Select.Option value="INVOICE">Hóa đơn</Select.Option>
                    <Select.Option value="ORDER">Đơn hàng</Select.Option>
                    <Select.Option value="RECEIPT">Biên lai</Select.Option>
                    <Select.Option value="REPORT">Báo cáo</Select.Option>
                  </Select>

                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 200 }}
                    className={statusFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                  >
                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                    <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
                    <Select.Option value="INACTIVE">Ngừng hoạt động</Select.Option>
                  </Select>

                  <Select
                    showSearch
                    allowClear
                    value={branchFilter}
                    onChange={(value) => setBranchFilter(value || null)}
                    placeholder="Lọc theo chi nhánh"
                    style={{ width: 200 }}
                    className={branchFilter ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={branches.map((b) => ({
                      value: b.id,
                      label: `${b.code} # ${b.name}`,
                    }))}
                  />
                </Space>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Thêm mẫu
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table
              columns={columns}
              dataSource={templates}
              rowKey="id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalItems,
                showSizeChanger: true,
                showTotal: (total) => `Hiển thị ${total} mẫu`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              onChange={handleTableChange}
              bordered={false}
              className="ant-table-custom"
              scroll={{ x: 1400 }}
            />
          </CardContent>
        </Card>
      </Spin>

      {/* Add Template Modal */}
      <Modal
        title="Thêm mẫu mới"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={900}
        centered
        destroyOnHidden
      >
        <TemplateForm 
          form={form} 
          onSubmit={handleCreate} 
          onCancel={() => {
            setIsAddModalOpen(false);
            form.resetFields();
          }}
          loading={submitting} 
        />
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        title={`Chỉnh sửa mẫu - ${selectedTemplate?.name}`}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedTemplate(null);
          form.resetFields();
        }}
        footer={null}
        width={900}
        centered
        destroyOnHidden
      >
        <TemplateForm
          form={form}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedTemplate(null);
            form.resetFields();
          }}
          loading={submitting}
          initialTemplate={selectedTemplate!}
        />
      </Modal>

      {/* Detail Modal */}
      {selectedTemplate && (
        <TemplateDetailModal
          open={isDetailModalOpen}
          template={selectedTemplate}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTemplate(null);
          }}
          onEdit={() => {
            setIsDetailModalOpen(false);
            if (selectedTemplate) {
              form.setFieldsValue({
                name: selectedTemplate.name,
                type: selectedTemplate.type,
                category: selectedTemplate.category,
                description: selectedTemplate.description,
                content: selectedTemplate.content,
                status: selectedTemplate.status === "ACTIVE",
                isDefault: selectedTemplate.isDefault,
              });
              setIsEditModalOpen(true);
            }
          }}
          onPreview={() => {
            setIsDetailModalOpen(false);
            setIsPreviewModalOpen(true);
          }}
          onPrint={() => selectedTemplate && handlePrint(selectedTemplate)}
        />
      )}

      {/* Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          open={isPreviewModalOpen}
          template={selectedTemplate}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedTemplate(null);
          }}
          onPrint={handleConfirmPrint}
        />
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          /* Hide everything */
          body * {
            visibility: hidden;
          }
          
          /* Show only template preview content */
          #template-preview-content,
          #template-preview-content * {
            visibility: visible;
          }
          
          /* Position template content for print */
          #template-preview-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <AdminLayout title="Quản lý Mẫu">
      <TemplatesContent />
    </AdminLayout>
  );
}