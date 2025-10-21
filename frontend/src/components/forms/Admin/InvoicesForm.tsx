"use client";

import { Form, Input, Select, Row, Col, InputNumber, DatePicker, Table } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type { TableColumnsType } from "antd";

const { Option } = Select;
const { TextArea } = Input;

interface InvoicesFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isEdit?: boolean;
}

interface InvoiceItem {
  key: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export default function InvoicesForm({
  initialValues,
  onSubmit,
  isEdit = false,
}: InvoicesFormProps) {
  const [form] = Form.useForm();
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (initialValues) {
      const formattedValues = {
        ...initialValues,
        invoiceDate: initialValues.invoiceDate
          ? dayjs(initialValues.invoiceDate)
          : null,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
      };
      form.setFieldsValue(formattedValues);
      if (initialValues.items) {
        setItems(initialValues.items);
      }
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const submitData = {
      ...values,
      invoiceDate: values.invoiceDate
        ? values.invoiceDate.format("YYYY-MM-DD")
        : null,
      dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
      items: items,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
    };
    onSubmit(submitData);
    if (!isEdit) {
      form.resetFields();
      setItems([]);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const taxRate = form.getFieldValue("taxRate") || 10;
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const itemColumns: TableColumnsType<InvoiceItem> = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
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
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
      size="large"
      initialValues={{
        status: "pending",
        paymentMethod: "cash",
        taxRate: 10,
      }}
    >
      <Row gutter={16}>
        {/* Invoice Number */}
        <Col span={12}>
          <Form.Item
            label="Invoice Number"
            name="invoiceNumber"
            rules={[
              { required: true, message: "Please enter invoice number" },
              {
                pattern: /^INV-\d{4,}$/,
                message: "Format: INV-0001",
              },
            ]}
          >
            <Input
              placeholder="INV-0001"
              disabled={isEdit}
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>
        </Col>

        {/* Store */}
        <Col span={12}>
          <Form.Item
            label="Store"
            name="store"
            rules={[{ required: true, message: "Please select store" }]}
          >
            <Select placeholder="Select store">
              <Option value="Store #1">Store #1 - Downtown</Option>
              <Option value="Store #2">Store #2 - Mall</Option>
              <Option value="Store #3">Store #3 - Airport</Option>
              <Option value="Store #4">Store #4 - University</Option>
              <Option value="Store #5">Store #5 - Business District</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Customer Name */}
        <Col span={12}>
          <Form.Item
            label="Customer Name"
            name="customerName"
            rules={[
              { required: true, message: "Please enter customer name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>
        </Col>

        {/* Customer Email */}
        <Col span={12}>
          <Form.Item
            label="Customer Email"
            name="customerEmail"
            rules={[
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="customer@example.com" />
          </Form.Item>
        </Col>

        {/* Customer Phone */}
        <Col span={12}>
          <Form.Item
            label="Customer Phone"
            name="customerPhone"
            rules={[
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Please enter valid phone number",
              },
            ]}
          >
            <Input placeholder="0901234567" />
          </Form.Item>
        </Col>

        {/* Payment Method */}
        <Col span={12}>
          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            rules={[{ required: true, message: "Please select payment method" }]}
          >
            <Select placeholder="Select payment method">
              <Option value="cash">Cash</Option>
              <Option value="card">Credit/Debit Card</Option>
              <Option value="momo">MoMo</Option>
              <Option value="zalopay">ZaloPay</Option>
              <Option value="bank-transfer">Bank Transfer</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Invoice Date */}
        <Col span={12}>
          <Form.Item
            label="Invoice Date"
            name="invoiceDate"
            rules={[{ required: true, message: "Please select invoice date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Select date"
            />
          </Form.Item>
        </Col>

        {/* Due Date */}
        <Col span={12}>
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[
              { required: true, message: "Please select due date" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const invoiceDate = getFieldValue("invoiceDate");
                  if (!value || !invoiceDate || value.isAfter(invoiceDate)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Due date must be after invoice date")
                  );
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Select date"
            />
          </Form.Item>
        </Col>

        {/* Status */}
        <Col span={12}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="paid">Paid</Option>
              <Option value="overdue">Overdue</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Tax Rate */}
        <Col span={12}>
          <Form.Item
            label="Tax Rate (%)"
            name="taxRate"
            rules={[
              { required: true, message: "Please enter tax rate" },
              { type: "number", min: 0, max: 100, message: "Tax rate must be between 0-100" },
            ]}
          >
            <InputNumber
              placeholder="10"
              style={{ width: "100%" }}
              min={0}
              max={100}
              step={0.5}
            />
          </Form.Item>
        </Col>

        {/* Notes */}
        <Col span={24}>
          <Form.Item label="Notes" name="notes">
            <TextArea
              rows={2}
              placeholder="Additional notes (optional)"
              maxLength={300}
              showCount
            />
          </Form.Item>
        </Col>

        {/* Items Preview (if editing) */}
        {isEdit && items.length > 0 && (
          <Col span={24}>
            <Form.Item label="Invoice Items">
              <Table
                columns={itemColumns}
                dataSource={items}
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Subtotal</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{calculateSubtotal().toLocaleString()} ₫</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        Tax ({form.getFieldValue("taxRate") || 10}%)
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {calculateTax().toLocaleString()} ₫
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong style={{ fontSize: "16px" }}>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong style={{ fontSize: "16px", color: "#3B82F6" }}>
                          {calculateTotal().toLocaleString()} ₫
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
}
