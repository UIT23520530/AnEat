// src/components/forms/Manager/TemplatesForm.tsx
"use client";

import { useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, App } from "antd";

const { TextArea } = Input;

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

interface TemplatesFormProps {
  template?: Template;
  onSuccess?: () => void;
}

export function TemplatesForm({ template, onSuccess }: TemplatesFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      form.setFieldsValue({
        ...template,
      });
    }
  }, [template, form]);

  const handleSubmit = async (values: any) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (isEditing) {
        message.success("Cập nhật mẫu thành công!");
      } else {
        message.success("Tạo mẫu thành công!");
      }

      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(isEditing ? "Cập nhật mẫu thất bại" : "Tạo mẫu thất bại");
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
        isDefault: false,
      }}
      className="stores-form"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tên mẫu"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên mẫu" },
              { min: 3, message: "Tên mẫu phải có ít nhất 3 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên mẫu" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Loại mẫu"
            name="type"
            rules={[{ required: true, message: "Vui lòng nhập loại mẫu" }]}
          >
            <Input placeholder="VD: Hóa đơn, Biên lai, Đơn hàng" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select size="large" placeholder="Chọn danh mục">
              <Select.Option value="invoice">Hóa đơn</Select.Option>
              <Select.Option value="order">Đơn hàng</Select.Option>
              <Select.Option value="receipt">Biên lai</Select.Option>
              <Select.Option value="report">Báo cáo</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select size="large" placeholder="Chọn trạng thái">
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="inactive">Không hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Mặc định"
            name="isDefault"
            valuePropName="checked"
          >
            <Select size="large">
              <Select.Option value={true}>Có (Mẫu mặc định)</Select.Option>
              <Select.Option value={false}>Không</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea 
              placeholder="Mô tả ngắn gọn về mẫu" 
              rows={2}
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Nội dung mẫu"
            name="content"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung mẫu" },
              { min: 10, message: "Nội dung phải có ít nhất 10 ký tự" },
            ]}
            extra="Sử dụng các biến như {{orderId}}, {{customerName}}, {{total}}, {{items}}, v.v."
          >
            <TextArea 
              placeholder="Nhập nội dung HTML/JSON của mẫu..." 
              rows={8}
              size="large"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="mb-0 mt-6">
        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onSuccess}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" size="large">
            {isEditing ? "Cập nhật mẫu" : "Tạo mẫu"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
