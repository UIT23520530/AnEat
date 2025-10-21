// src/components/forms/StoresForm.tsx
"use client";

import { useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, message } from "antd";
import { Store } from "@/types";
import { createStore, updateStore } from "@/lib/actions/store.action";

const { TextArea } = Input;

interface StoresFormProps {
  store?: Store;
  onSuccess?: () => void;
}

export function StoresForm({ store, onSuccess }: StoresFormProps) {
  const [form] = Form.useForm();
  const isEditing = !!store;

  useEffect(() => {
    if (store) {
      form.setFieldsValue(store);
    }
  }, [store, form]);

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });

      if (isEditing) {
        await updateStore(store.id, formData);
        message.success("Store updated successfully!");
      } else {
        await createStore(formData);
        message.success("Store created successfully!");
      }

      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(isEditing ? "Failed to update store" : "Failed to create store");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={store || {
        status: "active",
      }}
      className="stores-form"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Store Name"
            name="name"
            rules={[
              { required: true, message: "Please enter store name" },
              { min: 3, message: "Store name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter store name" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Manager"
            name="manager"
            rules={[{ required: true, message: "Please enter manager name" }]}
          >
            <Input placeholder="Enter manager name" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="store@aneat.com" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              { required: true, message: "Please enter phone number" },
              { pattern: /^[0-9+\s-()]+$/, message: "Please enter a valid phone number" },
            ]}
          >
            <Input placeholder="+84 123 456 789" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Address"
            name="address"
            rules={[
              { required: true, message: "Please enter address" },
              { min: 10, message: "Address must be at least 10 characters" },
            ]}
          >
            <TextArea 
              placeholder="Enter full store address" 
              rows={3}
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select size="large" placeholder="Select status">
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="maintenance">Maintenance</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        {isEditing && (
          <>
            <Col span={8}>
              <Form.Item
                label="Revenue (VND)"
                name="revenue"
              >
                <Input 
                  type="number" 
                  placeholder="0" 
                  size="large"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Orders"
                name="orders"
              >
                <Input 
                  type="number" 
                  placeholder="0" 
                  size="large"
                  disabled
                />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      <Form.Item className="mb-0 mt-6">
        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" size="large">
            {isEditing ? "Update Store" : "Create Store"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}