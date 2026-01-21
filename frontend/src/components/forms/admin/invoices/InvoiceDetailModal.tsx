"use client";

import React from "react";
import { Modal, Descriptions, Tag, Button, Divider, Table, Space, Badge } from "antd";
import {
  FileTextOutlined,
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface InvoiceItem {
  id: string;
  productId: string;
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

interface InvoiceDetailModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onViewHistory: (invoice: Invoice) => void;
  getPaymentMethodText: (method: string | null) => string;
  getPaymentMethodColor: (method: string | null) => string;
  getPaymentMethodIcon: (method: string | null) => React.ReactNode;
  getPaymentStatusText: (status: string) => string;
  getPaymentStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  open,
  onClose,
  invoice,
  onViewHistory,
  getPaymentMethodText,
  getPaymentMethodColor,
  getPaymentMethodIcon,
  getPaymentStatusText,
  getPaymentStatusColor,
  getStatusText,
  getStatusColor,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined style={{ fontSize: 20, color: "#1890ff" }} />
          <span className="text-lg font-semibold">Chi tiết hóa đơn</span>
          {invoice && invoice.isEdited && (
            <Tag color="orange">Đã chỉnh sửa {invoice.editCount} lần</Tag>
          )}
        </div>
      }
      open={open}
      onCancel={onClose}
      width={800}
      centered
      maskClosable={false}
      footer={[
        invoice && invoice.editCount > 0 && (
          <Button key="history" icon={<HistoryOutlined />} onClick={() => invoice && onViewHistory(invoice)}>
            Lịch sử ({invoice.editCount})
          </Button>
        ),
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      {invoice && (
        <div>
          {/* Bill Information */}
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label={<><FileTextOutlined /> Mã hóa đơn</>} span={1}>
              <strong>{invoice.billNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã đơn hàng" span={1}>
              {invoice.orderNumber}
            </Descriptions.Item>
            <Descriptions.Item label={<><ShopOutlined /> Chi nhánh</>} span={2}>
              <strong>{invoice.branchName}</strong>
              <span style={{ marginLeft: 8, color: "#666" }}>({invoice.branchCode})</span>
            </Descriptions.Item>
            {invoice.branchAddress && (
              <Descriptions.Item label="Địa chỉ chi nhánh" span={2}>
                {invoice.branchAddress}
              </Descriptions.Item>
            )}
            <Descriptions.Item label={<><UserOutlined /> Khách hàng</>} span={1}>
              {invoice.customerName}
            </Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>} span={1}>
              {invoice.customerPhone}
            </Descriptions.Item>
            {invoice.customerEmail && (
              <Descriptions.Item label={<><MailOutlined /> Email</>} span={2}>
                {invoice.customerEmail}
              </Descriptions.Item>
            )}
            {invoice.customerAddress && (
              <Descriptions.Item label="Địa chỉ khách hàng" span={2}>
                {invoice.customerAddress}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày giờ" span={1}>
              {invoice.date} {invoice.time}
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên xuất" span={1}>
              {invoice.staffName}
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán" span={1}>
              <Tag color={getPaymentMethodColor(invoice.paymentMethod)} icon={getPaymentMethodIcon(invoice.paymentMethod)}>
                {getPaymentMethodText(invoice.paymentMethod)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái thanh toán" span={1}>
              <Tag color={getPaymentStatusColor(invoice.paymentStatus)}>
                {getPaymentStatusText(invoice.paymentStatus)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái hóa đơn" span={1}>
              <Tag color={getStatusColor(invoice.status)}>
                {getStatusText(invoice.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số lần in" span={1}>
              <Badge count={invoice.printedCount} showZero style={{ backgroundColor: "#52c41a" }} />
            </Descriptions.Item>
            {invoice.lastEditedAt && (
              <Descriptions.Item label="Lần sửa cuối" span={2}>
                {dayjs(invoice.lastEditedAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          {/* Items Table */}
          <div>
            <h4 style={{ marginBottom: 12, fontWeight: "bold" }}>Chi tiết món ăn</h4>
            <Table
              dataSource={invoice.items}
              rowKey={(record) => record.id}
              columns={[
                { 
                  title: "Tên món", 
                  dataIndex: "name", 
                  key: "name",
                  render: (name, record) => (
                    <div className="flex items-center gap-2">
                      {record.image && (
                        <img src={record.image} alt={name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                      )}
                      <span>{name}</span>
                    </div>
                  ),
                },
                { title: "SL", dataIndex: "quantity", key: "quantity", width: 80, align: "center" as const },
                {
                  title: "Đơn giá",
                  dataIndex: "price",
                  key: "price",
                  width: 130,
                  align: "right" as const,
                  render: (price) => `${price.toLocaleString()}đ`,
                },
                {
                  title: "Thành tiền",
                  dataIndex: "total",
                  key: "total",
                  width: 130,
                  align: "right" as const,
                  render: (total) => <strong>{total.toLocaleString()}đ</strong>,
                },
              ]}
              pagination={false}
              size="small"
              bordered
            />
          </div>

          <Divider />

          {/* Payment Summary */}
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Space direction="vertical" style={{ width: "100%", alignItems: "flex-end" }}>
              <div>
                <span style={{ marginRight: 16 }}>Tạm tính:</span>
                <strong>{invoice.subtotal.toLocaleString()}đ</strong>
              </div>
              
              {invoice.discount > 0 && (
                <div>
                  <span style={{ marginRight: 16 }}>Giảm giá:</span>
                  <strong style={{ color: "#ff4d4f" }}>
                    -{invoice.discount.toLocaleString()}đ
                  </strong>
                </div>
              )}
              <div style={{ fontSize: 16, paddingTop: 8, borderTop: "1px solid #d9d9d9" }}>
                <span style={{ marginRight: 16 }}>Tổng cộng:</span>
                <strong style={{ color: "#52c41a", fontSize: 18 }}>
                  {invoice.total.toLocaleString()}đ
                </strong>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <div>
                    <span style={{ marginRight: 16 }}>Tiền khách đưa:</span>
                    <strong>{invoice.paidAmount.toLocaleString()}đ</strong>
                  </div>
                  {invoice.changeAmount > 0 && (
                    <div>
                      <span style={{ marginRight: 16 }}>Tiền thối:</span>
                      <strong style={{ color: "#1890ff" }}>{invoice.changeAmount.toLocaleString()}đ</strong>
                    </div>
                  )}
                </>
              )}
            </Space>
          </div>

          {(invoice.notes || invoice.internalNotes) && (
            <div style={{ marginTop: 16 }}>
              <Divider />
              {invoice.notes && (
                <div style={{ marginBottom: 12, padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
                  <strong>Ghi chú:</strong>
                  <p style={{ margin: "8px 0 0 0" }}>{invoice.notes}</p>
                </div>
              )}
              {invoice.internalNotes && (
                <div style={{ padding: 12, background: "#fff7e6", borderRadius: 4, border: "1px solid #ffd591" }}>
                  <strong>Ghi chú nội bộ:</strong>
                  <p style={{ margin: "8px 0 0 0" }}>{invoice.internalNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
