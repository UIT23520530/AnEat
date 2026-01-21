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
import { adminBranchService } from "@/services/admin-branch.service";
import { TemplateForm } from "@/components/forms/admin/templates/TemplateForm";
import { TemplateDetailModal } from "@/components/forms/admin/templates/TemplateDetailModal";
import { InvoicePrintModal } from "@/components/forms/admin/invoices/InvoicePrintModal";
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

// Helper to generate sample content for preview
const generateSampleContent = (template: TemplateDTO) => {
  let content = template.content;

  // Sample data for iteration
  const sampleItems = [
    { name: 'Gà Rán Giòn (2 miếng)', quantity: 2, price: '35,000đ', total: '70,000đ' },
    { name: 'Khoai Tây Chiên (Lớn)', quantity: 1, price: '25,000đ', total: '25,000đ' },
    { name: 'Pepsi Tươi (Lớn)', quantity: 2, price: '15,000đ', total: '30,000đ' }
  ];

  // Handle {{#items}}...{{/items}} block (Handlebars style)
  const itemsBlockRegex = /{{#items}}([\s\S]*?){{\/items}}/g;
  content = content.replace(itemsBlockRegex, (match, innerContent) => {
    return sampleItems.map(item => {
      let itemRow = innerContent;
      itemRow = itemRow.replace(/{{name}}/g, item.name);
      itemRow = itemRow.replace(/{{quantity}}/g, String(item.quantity));
      itemRow = itemRow.replace(/{{price}}/g, item.price);
      itemRow = itemRow.replace(/{{total}}/g, item.total);
      return itemRow;
    }).join('');
  });

  // Common placeholders
  content = content.replace(/{{billNumber}}/g, 'BILL-2026-0001');
  content = content.replace(/{{billId}}/g, 'BILL-2026-0001');
  content = content.replace(/{{orderNumber}}/g, 'ORD-2026-0001');
  content = content.replace(/{{orderId}}/g, 'ORD-2026-0001');
  content = content.replace(/{{receiptNumber}}/g, 'REC-2026-0001');
  content = content.replace(/{{customerName}}/g, 'Nguyễn Văn A');
  content = content.replace(/{{customerPhone}}/g, '0901234567');
  content = content.replace(/{{customerAddress}}/g, '123 Nguyễn Huệ, Quận 1, TP.HCM');
  content = content.replace(/{{address}}/g, '123 Nguyễn Huệ, Quận 1, TP.HCM');

  // Financial
  content = content.replace(/{{total}}/g, '125,000đ');
  content = content.replace(/{{grandTotal}}/g, '125,000đ');
  content = content.replace(/{{subtotal}}/g, '113,636đ');
  content = content.replace(/{{tax}}/g, '11,364đ');
  content = content.replace(/{{discount}}/g, '0đ');
  content = content.replace(/{{finalTotal}}/g, '125,000đ');

  content = content.replace(/{{date}}/g, new Date().toLocaleDateString('vi-VN'));
  content = content.replace(/{{time}}/g, new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  content = content.replace(/{{tableNumber}}/g, 'Bàn 5');
  content = content.replace(/{{branchName}}/g, 'AnEat - Chi nhánh Quận 1');
  content = content.replace(/{{branchAddress}}/g, '456 Lê Lợi, Quận 1, TP.HCM');
  content = content.replace(/{{branchPhone}}/g, '028 3822 1111');
  content = content.replace(/{{staffName}}/g, 'Trần Thị Thu Ngân');
  content = content.replace(/{{paymentMethod}}/g, 'Tiền mặt');

  // Fallback for simple {{itemsList}} placeholder
  const sampleItemsList = sampleItems.map(i => `${i.quantity} x ${i.name} = ${i.total}`).join('<br/>');
  content = content.replace(/{{itemsList}}/g, sampleItemsList);

  // Fallback for simple {{items}} placeholder if block syntax not used
  // Note: Only replace specifically if loop wasn't processed, though regex above consumes loop blocks.
  // This is for simple templates like: <table> {{items}} </table>
  const sampleItemsRows = sampleItems.map(item => `
    <tr>
      <td>${item.name}</td>
      <td align="center">${item.quantity}</td>
      <td align="right">${item.price}</td>
      <td align="right">${item.total}</td>
    </tr>
  `).join('');
  content = content.replace(/{{items}}/g, sampleItemsRows);

  // Report specific
  content = content.replace(/{{reportDate}}/g, new Date().toLocaleDateString('vi-VN'));
  content = content.replace(/{{totalSales}}/g, '15,000,000đ');
  content = content.replace(/{{revenue}}/g, '13,500,000đ');
  content = content.replace(/{{profit}}/g, '3,200,000đ');
  content = content.replace(/{{orderCount}}/g, '45');

  return content;
};

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
  const [branchFilter, setBranchFilter] = useState<string>("all");
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

      if (branchFilter === "system") {
        filters.branchId = null;
      } else if (branchFilter && branchFilter !== "all") {
        filters.branchId = branchFilter;
      }

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
      let bId: string | undefined = undefined;
      if (branchFilter === "system") bId = "null";
      else if (branchFilter !== "all") bId = branchFilter;

      const data = await adminTemplateService.getStats(bId);
      setStats(data);
    } catch (error) {
      console.error("Load stats error:", error);
    }
  };

  // Load branches
  const loadBranches = async () => {
    try {
      const response = await adminBranchService.getBranches({ limit: 100 });
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
              <div className="flex justify-between items-center gap-2">
                <Space size="middle">
                  <Input
                    placeholder="Tìm kiếm mẫu..."
                    prefix={<SearchOutlined />}
                    style={{ width: 230 }}
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
                    value={branchFilter}
                    onChange={setBranchFilter}
                    placeholder="Lọc theo chi nhánh"
                    style={{ minWidth: 260 }}
                    popupMatchSelectWidth={false}
                    className={branchFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                    optionFilterProp="label"
                  >
                    <Select.Option value="all" label="Tất cả chi nhánh">
                      <div className="flex items-center gap-2 py-1">
                        <span>Tất cả chi nhánh</span>
                      </div>
                    </Select.Option>

                    {branches.map((b) => (
                      <Select.Option key={b.id} value={b.id} label={b.name}>
                        <div className="flex items-center gap-2 py-1">
                          <span>{b.name}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
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

      {/* Preview Modal using InvoicePrintModal */}
      {selectedTemplate && (
        <InvoicePrintModal
          open={isPreviewModalOpen}
          invoice={null}
          customHtmlContent={generateSampleContent(selectedTemplate)}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedTemplate(null);
          }}
          onConfirmPrint={handleConfirmPrint}
        />
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <AdminLayout title="Quản lý Mẫu">
      <App>
        <TemplatesContent />
      </App>
    </AdminLayout>
  );
}