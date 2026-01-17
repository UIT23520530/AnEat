"use client";

import React from "react";
import { Modal, Button, Timeline, Descriptions, Tag, Divider, Table } from "antd";
import { HistoryOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface BillHistoryItem {
  id: string;
  version: number;
  billNumber: string;
  editReason: string;
  changedFields: string;
  editedBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  // Actual field values at this version
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paidAmount?: number;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  total?: number;
  notes?: string;
  internalNotes?: string;
}

interface InvoiceHistoryModalProps {
  open: boolean;
  onClose: () => void;
  billNumber: string;
  history: BillHistoryItem[];
}

// Map field names to Vietnamese labels
const fieldLabels: Record<string, string> = {
  customerName: "Tên khách hàng",
  customerPhone: "Số điện thoại",
  customerEmail: "Email",
  customerAddress: "Địa chỉ",
  paymentMethod: "Phương thức thanh toán",
  paymentStatus: "Trạng thái thanh toán",
  paidAmount: "Số tiền đã trả",
  subtotal: "Tạm tính",
  taxAmount: "Thuế VAT",
  discountAmount: "Giảm giá",
  total: "Tổng cộng",
  notes: "Ghi chú",
  internalNotes: "Ghi chú nội bộ",
  items: "Chi tiết món ăn",
};

// Get field value from history item
const getFieldValue = (item: BillHistoryItem, field: string): any => {
  const fieldMap: Record<string, keyof BillHistoryItem> = {
    customerName: "customerName",
    customerPhone: "customerPhone",
    customerEmail: "customerEmail",
    customerAddress: "customerAddress",
    paymentMethod: "paymentMethod",
    paymentStatus: "paymentStatus",
    paidAmount: "paidAmount",
    subtotal: "subtotal",
    taxAmount: "taxAmount",
    discountAmount: "discountAmount",
    total: "total",
    notes: "notes",
    internalNotes: "internalNotes",
  };
  
  const mappedField = fieldMap[field];
  return mappedField ? item[mappedField] : undefined;
};

// Format value for display
const formatValue = (field: string, value: any): string => {
  if (value === null || value === undefined) return "Trống";
  
  if (field.includes("Amount") || field === "total" || field === "subtotal" || field === "paidAmount") {
    return `${Number(value).toLocaleString()}đ`;
  }
  
  if (field === "paymentMethod") {
    const methods: Record<string, string> = {
      CASH: "Tiền mặt",
      CARD: "Thẻ",
      BANK_TRANSFER: "Chuyển khoản",
      E_WALLET: "Ví điện tử",
    };
    return methods[value] || value;
  }
  
  if (field === "paymentStatus") {
    const statuses: Record<string, string> = {
      PENDING: "Chờ thanh toán",
      PAID: "Đã thanh toán",
      FAILED: "Thất bại",
      REFUNDED: "Đã hoàn tiền",
    };
    return statuses[value] || value;
  }
  
  return String(value);
};

// Parse changed fields (accept JSON string or array)
const parseChangedFields = (changedFieldsInput: any): string[] => {
  if (Array.isArray(changedFieldsInput)) {
    return changedFieldsInput;
  }

  if (typeof changedFieldsInput === "string") {
    try {
      const parsed = JSON.parse(changedFieldsInput);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return changedFieldsInput.split(",").map((f) => f.trim()).filter(Boolean);
    }
  }

  return [];
};

export const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  open,
  onClose,
  billNumber,
  history,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <HistoryOutlined style={{ fontSize: 20, color: "#1890ff" }} />
          <span className="text-lg font-semibold">Lịch sử chỉnh sửa hóa đơn {billNumber}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      centered
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <HistoryOutlined style={{ fontSize: 48, opacity: 0.3 }} />
          <p className="mt-4">Chưa có lịch sử chỉnh sửa</p>
        </div>
      ) : (
        <Timeline
          items={history.map((item, index) => ({
            color: index === 0 ? "green" : "blue",
            dot: index === 0 ? <ClockCircleOutlined style={{ fontSize: 16 }} /> : undefined,
            children: (
              <div key={item.id} className="mb-4">
                {/* Header */}
                <div style={{ marginBottom: 12 }}>
                  <Tag color={index === 0 ? "green" : "blue"} style={{ fontSize: 14, padding: "4px 12px" }}>
                    Phiên bản {item.version}
                  </Tag>
                  <span style={{ marginLeft: 8, color: "#666" }}>
                    {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                  </span>
                </div>

                {/* Editor Info */}
                <Descriptions size="small" column={1} bordered style={{ marginBottom: 12 }}>
                  <Descriptions.Item label={<><UserOutlined /> Người sửa</>}>
                    <strong>{item.editedBy?.name || "N/A"}</strong>
                    {item.editedBy?.email && (
                      <span style={{ marginLeft: 8, color: "#666" }}>({item.editedBy.email})</span>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lý do chỉnh sửa">
                    <div style={{ padding: "8px", background: "#f5f5f5", borderRadius: 4 }}>
                      {item.editReason}
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                {/* Changed Fields */}
                <div style={{ marginBottom: 12 }}>
                  {(() => {
                    const fields = parseChangedFields(item.changedFields);
                    return (
                      <strong style={{ display: "block", marginBottom: 8 }}>
                        📝 Các trường đã thay đổi ({fields.length}):
                      </strong>
                    );
                  })()}
                  <div style={{ padding: "12px", background: "#fafafa", borderRadius: 4, border: "1px solid #d9d9d9" }}>
                    {parseChangedFields(item.changedFields).map((field, idx) => {
                      const label = fieldLabels[field] || field;
                      // Get old value from previous version (next item in array since array is sorted desc)
                      const previousVersion = history[index + 1];
                      const oldValue = previousVersion ? getFieldValue(previousVersion, field) : undefined;
                      // Get new value from current version
                      const newValue = getFieldValue(item, field);

                      // Special case: items changed (thêm/xóa/cập nhật món)
                      const isItemsField = field === "items" || field.toLowerCase().includes("item");
                      if (isItemsField) {
                        return (
                          <div key={idx} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: idx < parseChangedFields(item.changedFields).length - 1 ? "1px dashed #e0e0e0" : "none" }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                              {label}:
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <Tag color="orange" style={{ width: "100%", textAlign: "center" }}>
                                Có thay đổi món ăn
                              </Tag>
                            </div>
                          </div>
                        );
                      }

                      // Skip if both values are the same or both undefined
                      if (oldValue === newValue && oldValue === undefined) {
                        return null;
                      }

                      return (
                        <div key={idx} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: idx < parseChangedFields(item.changedFields).length - 1 ? "1px dashed #e0e0e0" : "none" }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            {label}:
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <Tag color="red" style={{ width: "100%", textAlign: "center" }}>
                                {formatValue(field, oldValue)}
                              </Tag>
                            </div>
                            <span style={{ fontSize: 16, fontWeight: "bold" }}>→</span>
                            <div style={{ flex: 1 }}>
                              <Tag color="green" style={{ width: "100%", textAlign: "center" }}>
                                {formatValue(field, newValue)}
                              </Tag>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {index < history.length - 1 && <Divider style={{ margin: "20px 0" }} />}
              </div>
            ),
          }))}
        />
      )}
    </Modal>
  );
};
