"use client";

import React from "react";
import { Modal, Tag, Button, Descriptions } from "antd";
import { FileTextOutlined, PrinterOutlined, EditOutlined } from "@ant-design/icons";
import { TemplateDTO } from "@/services/admin-template.service";
import dayjs from "dayjs";

interface TemplateDetailModalProps {
  open: boolean;
  onClose: () => void;
  template: TemplateDTO | null;
  onEdit: (template: TemplateDTO) => void;
  onPreview: (template: TemplateDTO) => void;
  onPrint: (template: TemplateDTO) => void;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  open,
  onClose,
  template,
  onEdit,
  onPreview,
  onPrint,
}) => {
  if (!template) return null;

  const getCategoryText = (category: string) => {
    const map: Record<string, string> = {
      INVOICE: "Hóa đơn",
      ORDER: "Đơn hàng",
      RECEIPT: "Biên lai",
      REPORT: "Báo cáo",
    };
    return map[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const map: Record<string, string> = {
      INVOICE: "blue",
      ORDER: "green",
      RECEIPT: "orange",
      REPORT: "purple",
    };
    return map[category] || "default";
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined style={{ fontSize: 20, color: "#1890ff" }} />
          <span className="text-lg font-semibold">Chi tiết mẫu</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={1000}
      centered
      maskClosable={false}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Basic Info */}
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Mã mẫu" span={1}>
            <span className="font-mono text-sm font-semibold text-blue-600">
              {template.id.substring(0, 12)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Loại" span={1}>
            {template.type}
          </Descriptions.Item>
          <Descriptions.Item label="Tên mẫu" span={2}>
            <strong>{template.name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục" span={1}>
            <Tag color={getCategoryColor(template.category)}>
              {getCategoryText(template.category)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={template.status === "ACTIVE" ? "green" : "default"}>
              {template.status === "ACTIVE" ? "Hoạt động" : "Tắt"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mẫu mặc định" span={1}>
            <Tag color={template.isDefault ? "gold" : "default"}>
              {template.isDefault ? "Có" : "Không"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Chi nhánh" span={1}>
            {template.branchId ? (
              <span className="font-medium">{template.branchName || template.branchId}</span>
            ) : (
              <Tag color="blue">Toàn hệ thống</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={1}>
            {dayjs(template.createdAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối" span={1}>
            {dayjs(template.updatedAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo" span={2}>
            {template.creatorName ? (
              <span className="font-medium">{template.creatorName}</span>
            ) : (
              <span className="text-gray-400">Chưa có thông tin</span>
            )}
          </Descriptions.Item>
        </Descriptions>

        {/* Description */}
        {template.description && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Mô tả</p>
            <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
              {template.description}
            </p>
          </div>
        )}

        {/* Content */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Nội dung template</p>
          <div className="p-4 bg-slate-900 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
              {template.content}
            </pre>
          </div>
        </div>
      </div>
    </Modal>
  );
};
