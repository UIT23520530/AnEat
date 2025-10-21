// src/components/forms/TemplatesForm.tsx
"use client";

import { useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, App, Transfer } from "antd";

const { TextArea } = Input;

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

interface TemplatesFormProps {
  template?: Template;
  onSuccess?: () => void;
}

// Mock stores data
const mockStores = [
  { key: "1", title: "Downtown Store", description: "123 Main St, District 1" },
  { key: "2", title: "Uptown Store", description: "456 High St, District 3" },
  { key: "3", title: "Suburban Store", description: "789 Park Ave, District 7" },
  { key: "4", title: "Riverside Store", description: "321 River Rd, District 2" },
  { key: "5", title: "Hillside Store", description: "654 Hill Ave, District 5" },
  { key: "6", title: "Beachfront Store", description: "987 Beach Blvd, District 7" },
  { key: "7", title: "Airport Store", description: "147 Airport Way, Tan Binh" },
  { key: "8", title: "Mall Store", description: "258 Mall St, District 1" },
];

export function TemplatesForm({ template, onSuccess }: TemplatesFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      form.setFieldsValue({
        ...template,
        assignedStores: template.assignedStores || [],
      });
    }
  }, [template, form]);

  const handleSubmit = async (values: any) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (isEditing) {
        message.success("Template updated successfully!");
      } else {
        message.success("Template created successfully!");
      }

      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(isEditing ? "Failed to update template" : "Failed to create template");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={template || {
        status: "active",
        category: "invoice",
        assignedStores: [],
        isDefault: false,
      }}
      className="stores-form"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Template Name"
            name="name"
            rules={[
              { required: true, message: "Please enter template name" },
              { min: 3, message: "Template name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter template name" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Template Type"
            name="type"
            rules={[{ required: true, message: "Please enter template type" }]}
          >
            <Input placeholder="e.g., Invoice, Receipt, Order" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select size="large" placeholder="Select category">
              <Select.Option value="invoice">Invoice (Hóa đơn)</Select.Option>
              <Select.Option value="order">Order (Đơn hàng)</Select.Option>
              <Select.Option value="receipt">Receipt (Biên lai)</Select.Option>
              <Select.Option value="report">Report (Báo cáo)</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select size="large" placeholder="Select status">
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Set as Default"
            name="isDefault"
            valuePropName="checked"
          >
            <Select size="large">
              <Select.Option value={true}>Yes (Default template)</Select.Option>
              <Select.Option value={false}>No</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea 
              placeholder="Brief description of the template" 
              rows={2}
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Template Content"
            name="content"
            rules={[
              { required: true, message: "Please enter template content" },
              { min: 10, message: "Content must be at least 10 characters" },
            ]}
            extra="Use placeholders like {{orderId}}, {{customerName}}, {{total}}, {{items}}, etc."
          >
            <TextArea 
              placeholder="Enter template HTML/JSON content here..." 
              rows={8}
              size="large"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Assign to Stores"
            name="assignedStores"
            extra="Select stores that will use this template. Leave empty to make available to all stores."
          >
            <Transfer
              dataSource={mockStores}
              titles={['Available Stores', 'Assigned Stores']}
              targetKeys={form.getFieldValue('assignedStores') || []}
              onChange={(targetKeys) => {
                form.setFieldsValue({ assignedStores: targetKeys });
              }}
              render={item => `${item.title} - ${item.description}`}
              listStyle={{
                width: '100%',
                height: 300,
              }}
              showSearch
              filterOption={(inputValue, item) =>
                item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
                item.description.toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="mb-0 mt-6">
        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" size="large">
            {isEditing ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
