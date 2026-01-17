"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Select, InputNumber, Row, Col, Divider, Table, Button, Space, Tooltip, App } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";

const { Option } = Select;
const { TextArea } = Input;

interface InvoiceItem {
  id: string; // order item id for rowKey
  productId: string; // product id for backend update
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

interface InvoiceEditFormProps {
  form: FormInstance;
  initialInvoice: {
    billNumber: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: string;
    paymentMethod: "cash" | "card" | "transfer" | "momo" | null;
    paymentStatus: "paid" | "pending" | "failed" | "refunded";
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paidAmount: number;
    notes?: string;
    internalNotes?: string;
  };
}

export const InvoiceEditForm: React.FC<InvoiceEditFormProps> = ({ form, initialInvoice }) => {
  const { message, modal } = App.useApp();
  const [items, setItems] = useState<InvoiceItem[]>(initialInvoice.items);
  const [subtotal, setSubtotal] = useState(initialInvoice.subtotal);
  const [tax, setTax] = useState(initialInvoice.tax);
  const [discount, setDiscount] = useState(initialInvoice.discount);
  const [total, setTotal] = useState(initialInvoice.total);

  // Reset state when initialInvoice changes (e.g., after update)
  useEffect(() => {
    setItems(initialInvoice.items);
    setSubtotal(initialInvoice.subtotal);
    setTax(initialInvoice.tax);
    setDiscount(initialInvoice.discount);
    setTotal(initialInvoice.total);

    // Keep form values in sync for submission
    form.setFieldsValue({
      items: initialInvoice.items,
      subtotal: initialInvoice.subtotal,
      tax: initialInvoice.tax,
      discount: initialInvoice.discount,
      totalAmount: initialInvoice.total,
    });
  }, [initialInvoice, form]);

  // Auto-calculate totals
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    const newTax = newSubtotal * 0.1; // 10% VAT
    const newTotal = newSubtotal + newTax - discount;
    
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
    
    // Update form values
    form.setFieldsValue({
      items,
      subtotal: newSubtotal,
      tax: newTax,
      discount,
      totalAmount: newTotal,
    });
  }, [items, discount, form]);

  const handleItemChange = (index: number, field: "quantity" | "price", value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    newItems[index].total = newItems[index].quantity * newItems[index].price;
    setItems(newItems);
    
    // Update form
    form.setFieldsValue({ items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      message.warning("Phải có ít nhất 1 món!");
      return;
    }

    const itemToRemove = items[index];
    modal.confirm({
      title: "Xác nhận xóa món ăn",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa món <strong>{itemToRemove.name}</strong>?</p>
          <p style={{ color: "#ff4d4f", marginTop: 8 }}>Hành động này sẽ ảnh hưởng đến tổng tiền hóa đơn.</p>
        </div>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        form.setFieldsValue({ items: newItems });
        message.success(`Đã xóa món "${itemToRemove.name}"`);
      },
    });
  };

  const itemColumns = [
    {
      title: "Tên món",
      dataIndex: "name",
      key: "name",
      width: "40%",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "15%",
      render: (_: any, record: InvoiceItem, index: number) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(index, "quantity", value || 1)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: "20%",
      render: (_: any, record: InvoiceItem, index: number) => (
        <InputNumber
          min={0}
          value={record.price}
          onChange={(value) => handleItemChange(index, "price", value || 0)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as unknown as number}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      width: "20%",
      render: (total: number) => <strong>{total.toLocaleString()}đ</strong>,
    },
    {
      title: "",
      key: "action",
      width: "5%",
      render: (_: any, __: any, index: number) => (
        <Tooltip title="Xóa món">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveItem(index)}
            disabled={items.length <= 1}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Form form={form} layout="vertical">
      {/* Bill Info - Readonly */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mã hóa đơn">
            <Tooltip title="Không được phép chỉnh sửa">
              <Input value={initialInvoice.billNumber} disabled />
            </Tooltip>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Mã đơn hàng">
            <Tooltip title="Không được phép chỉnh sửa">
              <Input value={initialInvoice.orderNumber} disabled />
            </Tooltip>
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Thông tin khách hàng</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tên khách hàng"
            name="customerName"
            rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên khách hàng" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="customerPhone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="customerEmail"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập email (tùy chọn)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Địa chỉ giao hàng" name="customerAddress">
            <Input placeholder="Địa chỉ khách hàng (mặc định là địa chỉ chi nhánh)" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Chi tiết đơn hàng</Divider>

      <Table
        dataSource={items}
        columns={itemColumns}
        pagination={false}
        rowKey={(record) => record.id}
        size="small"
        bordered
        footer={() => (
          <div style={{ textAlign: "right" }}>
            <Space direction="vertical" style={{ width: "100%", alignItems: "flex-end" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: 300 }}>
                <span>Tạm tính:</span>
                <strong>{subtotal.toLocaleString()}đ</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: 300 }}>
                <span>VAT (10%):</span>
                <strong>{tax.toLocaleString()}đ</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: 300 }}>
                <span>Giảm giá:</span>
                <InputNumber
                  min={0}
                  max={subtotal}
                  value={discount}
                  onChange={(value) => setDiscount(value || 0)}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as unknown as number}
                  suffix="đ"
                  style={{ width: 150 }}
                />
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", width: 300, fontSize: 16 }}>
                <span>Tổng cộng:</span>
                <strong style={{ color: "#52c41a", fontSize: 18 }}>{total.toLocaleString()}đ</strong>
              </div>
            </Space>
          </div>
        )}
      />

      {/* Hidden fields for form submission */}
      <Form.Item name="items" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="subtotal" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item name="tax" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item name="discount" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item name="totalAmount" hidden>
        <InputNumber />
      </Form.Item>

      <Divider orientation="left">Thông tin thanh toán</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Phương thức thanh toán"
            name="paymentMethod"
            rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
          >
            <Select>
              <Option value="cash">Tiền mặt</Option>
              <Option value="card">Thẻ</Option>
              <Option value="transfer">Chuyển khoản</Option>
              <Option value="momo">MoMo</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Trạng thái thanh toán"
            name="paymentStatus"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="PENDING">Chờ thanh toán</Option>
              <Option value="PAID">Đã thanh toán</Option>
              <Option value="FAILED">Thất bại</Option>
              <Option value="REFUNDED">Đã hoàn tiền</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Số tiền đã trả" name="paidAmount">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => (Number(value?.replace(/\$\s?|(,*)/g, "") || 0) as any)}
              suffix="đ"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Ghi chú</Divider>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Ghi chú khách hàng" name="notes">
            <TextArea rows={2} placeholder="Ghi chú cho khách hàng (hiển thị trên hóa đơn)" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Ghi chú nội bộ" name="internalNotes">
            <TextArea rows={2} placeholder="Ghi chú nội bộ (chỉ admin xem được)" />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Lý do chỉnh sửa"
            name="editReason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do chỉnh sửa" },
              { min: 10, message: "Lý do phải có ít nhất 10 ký tự" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Nhập chi tiết lý do chỉnh sửa hóa đơn này (bắt buộc để ghi vào lịch sử)..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
