"use client";

import { Form, Input, Select, Row, Col, InputNumber, Switch } from "antd";
import { useEffect } from "react";

const { TextArea } = Input;

interface ManagerProductsFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isEdit?: boolean;
}

export default function ManagerProductsForm({
  initialValues,
  onSubmit,
  isEdit = false,
}: ManagerProductsFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
    if (!isEdit) {
      form.resetFields();
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
      size="large"
      initialValues={{
        category: "Main Course",
        stock: 0,
        minStock: 0,
        maxStock: 100,
        price: 0,
        calories: 0,
        prepTime: 0,
        featured: false,
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

        {/* SKU */}
        <Col span={12}>
          <Form.Item
            label="SKU (Stock Keeping Unit)"
            name="sku"
            rules={[
              { required: true, message: "Please enter SKU" },
              { pattern: /^[A-Z0-9-]+$/, message: "SKU must contain only uppercase letters, numbers, and dashes" },
            ]}
          >
            <Input placeholder="PROD-XXX" style={{ textTransform: "uppercase" }} />
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
              <Select.Option value="Main Course">Main Course</Select.Option>
              <Select.Option value="Side Dish">Side Dish</Select.Option>
              <Select.Option value="Appetizer">Appetizer</Select.Option>
              <Select.Option value="Dessert">Dessert</Select.Option>
              <Select.Option value="Beverage">Beverage</Select.Option>
              <Select.Option value="Combo">Combo</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Price */}
        <Col span={12}>
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

        {/* Stock Quantity */}
        <Col span={8}>
          <Form.Item
            label="Current Stock"
            name="stock"
            rules={[
              { required: true, message: "Please enter stock quantity" },
              { type: "number", min: 0, message: "Stock cannot be negative" },
            ]}
          >
            <InputNumber
              placeholder="0"
              style={{ width: "100%" }}
              min={0}
              step={1}
            />
          </Form.Item>
        </Col>

        {/* Min Stock Level */}
        <Col span={8}>
          <Form.Item
            label="Min Stock Level"
            name="minStock"
            rules={[
              { required: true, message: "Please enter min stock" },
              { type: "number", min: 0, message: "Min stock cannot be negative" },
            ]}
            tooltip="Alert when stock falls below this level"
          >
            <InputNumber
              placeholder="20"
              style={{ width: "100%" }}
              min={0}
              step={1}
            />
          </Form.Item>
        </Col>

        {/* Max Stock Level */}
        <Col span={8}>
          <Form.Item
            label="Max Stock Level"
            name="maxStock"
            rules={[
              { required: true, message: "Please enter max stock" },
              { type: "number", min: 1, message: "Max stock must be at least 1" },
            ]}
            tooltip="Maximum capacity for this product"
          >
            <InputNumber
              placeholder="100"
              style={{ width: "100%" }}
              min={1}
              step={1}
            />
          </Form.Item>
        </Col>

        {/* Supplier */}
        <Col span={12}>
          <Form.Item
            label="Supplier"
            name="supplier"
          >
            <Input placeholder="Enter supplier name" />
          </Form.Item>
        </Col>

        {/* Calories */}
        <Col span={6}>
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
        <Col span={6}>
          <Form.Item
            label="Prep Time (min)"
            name="prepTime"
            rules={[
              { type: "number", min: 0, message: "Prep time cannot be negative" },
            ]}
          >
            <InputNumber
              placeholder="15"
              style={{ width: "100%" }}
              min={0}
              step={1}
            />
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

        {/* Featured Toggle */}
        <Col span={24}>
          <Form.Item
            label="Featured Product"
            name="featured"
            valuePropName="checked"
            tooltip="Featured products will be highlighted"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      {/* Hidden submit button - will be triggered by modal OK button */}
      <button type="submit" style={{ display: "none" }} />
    </Form>
  );
}
