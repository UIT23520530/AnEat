"use client";

import { Form, Input, Upload, Button, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import type { UploadFile } from "antd";

interface CategoriesFormProps {
  onSubmit: (values: any) => void;
  initialValues?: any;
  isEdit?: boolean;
}

export default function CategoriesForm({
  onSubmit,
  initialValues,
  isEdit = false,
}: CategoriesFormProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
    if (!isEdit) {
      form.resetFields();
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialValues}
      style={{ marginTop: "24px" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Form.Item
          label="Category Name"
          name="name"
          rules={[
            { required: true, message: "Please enter category name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input placeholder="e.g., Main Course, Beverages" size="large" />
        </Form.Item>

        <Form.Item
          label="Category Image"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />} size="large">
              Upload Image
            </Button>
          </Upload>
        </Form.Item>
      </div>

      <Form.Item
        label="Description"
        name="description"
        rules={[
          { required: true, message: "Please enter description" },
        ]}
      >
        <Input.TextArea
          placeholder="Enter category description"
          rows={4}
          size="large"
        />
      </Form.Item>

      <button type="submit" style={{ display: "none" }} />
    </Form>
  );
}
