"use client";

import { Form, Input, Select, Row, Col, InputNumber, Upload, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import type { UploadFile, UploadProps } from "antd";

const { Option } = Select;
const { TextArea } = Input;

interface ProductsFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isEdit?: boolean;
}

export default function ProductsForm({
  initialValues,
  onSubmit,
  isEdit = false,
}: ProductsFormProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      // Set image if exists
      if (initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: initialValues.image,
          },
        ]);
      }
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const submitData = {
      ...values,
      image: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : null,
    };
    onSubmit(submitData);
    if (!isEdit) {
      form.resetFields();
      setFileList([]);
    }
  };

  const handleUploadChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
      size="large"
      initialValues={{
        status: "available",
        featured: false,
        stock: 0,
      }}
    >
      <Row gutter={16}>
        {/* Product Name */}
        <Col span={12}>
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              { required: true, message: "Please enter product name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
        </Col>

        {/* Category */}
        <Col span={12}>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select category">
              <Option value="Main Course">Main Course</Option>
              <Option value="Side Dish">Side Dish</Option>
              <Option value="Appetizer">Appetizer</Option>
              <Option value="Dessert">Dessert</Option>
              <Option value="Beverage">Beverage</Option>
              <Option value="Combo">Combo</Option>
              <Option value="Snack">Snack</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Price */}
        <Col span={8}>
          <Form.Item
            label="Price (VND)"
            name="price"
            rules={[
              { required: true, message: "Please enter price" },
              { type: "number", min: 1000, message: "Price must be at least 1,000 VND" },
            ]}
          >
            <InputNumber
              placeholder="50000"
              style={{ width: "100%" }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
              min={1000}
              step={1000}
            />
          </Form.Item>
        </Col>

        {/* Stock */}
        <Col span={8}>
          <Form.Item
            label="Stock Quantity"
            name="stock"
            rules={[
              { required: true, message: "Please enter stock quantity" },
              { type: "number", min: 0, message: "Stock cannot be negative" },
            ]}
          >
            <InputNumber
              placeholder="100"
              style={{ width: "100%" }}
              min={0}
              step={1}
            />
          </Form.Item>
        </Col>

        {/* Status */}
        <Col span={8}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="available">Available</Option>
              <Option value="unavailable">Unavailable</Option>
              <Option value="out-of-stock">Out of Stock</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* SKU */}
        <Col span={12}>
          <Form.Item
            label="SKU (Stock Keeping Unit)"
            name="sku"
            rules={[
              { pattern: /^[A-Z0-9-]+$/, message: "SKU must contain only uppercase letters, numbers, and dashes" },
            ]}
          >
            <Input placeholder="PROD-001" style={{ textTransform: "uppercase" }} />
          </Form.Item>
        </Col>

        {/* Barcode */}
        <Col span={12}>
          <Form.Item
            label="Barcode"
            name="barcode"
            rules={[
              { pattern: /^[0-9]+$/, message: "Barcode must contain only numbers" },
            ]}
          >
            <Input placeholder="1234567890123" />
          </Form.Item>
        </Col>

        {/* Description */}
        <Col span={24}>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 500, message: "Description cannot exceed 500 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter product description"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Col>

        {/* Image Upload */}
        <Col span={12}>
          <Form.Item label="Product Image" name="image">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>
        </Col>

        {/* Featured Toggle */}
        <Col span={12}>
          <Form.Item
            label="Featured Product"
            name="featured"
            valuePropName="checked"
            tooltip="Featured products will be highlighted on the homepage"
          >
            <Switch />
          </Form.Item>
          <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "8px" }}>
            Mark this product as featured to display it prominently
          </p>
        </Col>

        {/* Ingredients/Tags */}
        <Col span={24}>
          <Form.Item
            label="Ingredients/Tags"
            name="tags"
            tooltip="Comma-separated list of ingredients or tags"
          >
            <Input placeholder="chicken, spicy, gluten-free" />
          </Form.Item>
        </Col>

        {/* Calories */}
        <Col span={8}>
          <Form.Item
            label="Calories (kcal)"
            name="calories"
            rules={[
              { type: "number", min: 0, message: "Calories cannot be negative" },
            ]}
          >
            <InputNumber
              placeholder="250"
              style={{ width: "100%" }}
              min={0}
              step={10}
            />
          </Form.Item>
        </Col>

        {/* Preparation Time */}
        <Col span={8}>
          <Form.Item
            label="Prep Time (minutes)"
            name="prepTime"
            rules={[
              { type: "number", min: 1, message: "Prep time must be at least 1 minute" },
            ]}
          >
            <InputNumber
              placeholder="15"
              style={{ width: "100%" }}
              min={1}
              step={1}
            />
          </Form.Item>
        </Col>

        {/* Spice Level */}
        <Col span={8}>
          <Form.Item label="Spice Level" name="spiceLevel">
            <Select placeholder="Select spice level">
              <Option value="none">None</Option>
              <Option value="mild">Mild</Option>
              <Option value="medium">Medium</Option>
              <Option value="hot">Hot</Option>
              <Option value="extra-hot">Extra Hot</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
