"use client";

import { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, App, Switch } from "antd";
import { StaffDTO, CreateStaffRequest, UpdateStaffRequest } from "@/types/staff";

interface StaffFormProps {
  staff?: StaffDTO;
  onSuccess?: () => void;
  onSubmit: (data: CreateStaffRequest | UpdateStaffRequest) => Promise<boolean>;
}

export function StaffForm({ staff, onSuccess, onSubmit }: StaffFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditing = !!staff;

  useEffect(() => {
    if (staff) {
      form.setFieldsValue({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        isActive: staff.isActive,
        avatar: staff.avatar || undefined,
      });
    } else {
      // Reset form when creating new staff
      form.resetFields();
      form.setFieldsValue({
        isActive: true, // Default active
      });
    }
  }, [staff, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const submitData: CreateStaffRequest | UpdateStaffRequest = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        isActive: values.isActive ?? true,
        avatar: values.avatar || undefined,
      };

      // Thêm password nếu đang tạo mới hoặc có thay đổi password
      if (!isEditing || values.password) {
        (submitData as CreateStaffRequest).password = values.password;
      }

      const success = await onSubmit(submitData);

      if (success) {
        form.resetFields();
        onSuccess?.();
      }
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="staff-form"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { max: 100, message: "Họ tên không được quá 100 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập họ và tên" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input 
              placeholder="example@aneat.com" 
              size="large"
              disabled={isEditing} // Email không thể thay đổi khi edit
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { 
                pattern: /^[0-9]{10,11}$/, 
                message: "Số điện thoại phải có 10-11 chữ số!" 
              },
            ]}
          >
            <Input placeholder="0901234567" size="large" maxLength={11} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={isEditing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
            name="password"
            rules={
              isEditing 
                ? [
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]
                : [
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]
            }
          >
            <Input.Password 
              placeholder={isEditing ? "Để trống nếu không đổi" : "Nhập mật khẩu"} 
              size="large" 
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="URL Avatar (tùy chọn)"
            name="avatar"
          >
            <Input placeholder="https://example.com/avatar.jpg" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Trạng thái hoạt động"
            name="isActive"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Vô hiệu hóa"
              defaultChecked
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="mb-0 mt-6">
        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onSuccess} disabled={loading}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            className="bg-blue-500 hover:bg-blue-600"
            loading={loading}
          >
            {isEditing ? "Cập nhật" : "Thêm nhân viên"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
