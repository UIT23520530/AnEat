"use client";

import { Form, Input, Select, Row, Col, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Option } = Select;
const { TextArea } = Input;

interface UsersFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isEdit?: boolean;
}

export default function UsersForm({
  initialValues,
  onSubmit,
  isEdit = false,
}: UsersFormProps) {
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState(
    initialValues?.role || "customer"
  );

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setSelectedRole(initialValues.role);
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
    if (!isEdit) {
      form.resetFields();
    }
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    // Clear store field if role is admin or customer
    if (value === "admin" || value === "customer") {
      form.setFieldsValue({ store: undefined });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
      size="large"
    >
      <Row gutter={16}>
        {/* Full Name */}
        <Col span={12}>
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: "Please enter full name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter full name"
            />
          </Form.Item>
        </Col>

        {/* Email */}
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input
              type="email"
              placeholder="user@example.com"
              disabled={isEdit}
            />
          </Form.Item>
        </Col>

        {/* Phone */}
        <Col span={12}>
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { pattern: /^[0-9]{10,11}$/, message: "Please enter valid phone number" },
            ]}
          >
            <Input placeholder="0901234567" />
          </Form.Item>
        </Col>

        {/* Role */}
        <Col span={12}>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select
              placeholder="Select role"
              onChange={handleRoleChange}
            >
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="staff">Staff</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Store - Only show for Manager and Staff */}
        {(selectedRole === "manager" || selectedRole === "staff") && (
          <Col span={12}>
            <Form.Item
              label="Assigned Store"
              name="store"
              rules={[
                {
                  required: true,
                  message: "Please select store for manager/staff",
                },
              ]}
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
        )}

        {/* Status */}
        <Col span={12}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Password - Only show when creating new user */}
        {!isEdit && (
          <>
            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>
            </Col>
          </>
        )}

        {/* Address */}
        <Col span={24}>
          <Form.Item label="Address" name="address">
            <TextArea
              rows={2}
              placeholder="Enter address (optional)"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Col>

        {/* Notes - Admin only */}
        {isEdit && (
          <Col span={24}>
            <Form.Item label="Admin Notes" name="notes">
              <TextArea
                rows={3}
                placeholder="Internal notes (not visible to user)"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
}
