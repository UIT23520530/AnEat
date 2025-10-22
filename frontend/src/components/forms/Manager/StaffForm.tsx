"use client";

import { useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, App, InputNumber, DatePicker } from "antd";
import dayjs from "dayjs";

interface StaffData {
  key: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "manager" | "staff";
  position: "cashier" | "kitchen" | "delivery" | "supervisor";
  store: string;
  status: "active" | "inactive" | "on-leave";
  shift: "morning" | "afternoon" | "evening" | "full-time";
  joinDate: string;
  salary?: number;
  lastActive: string;
}

interface StaffFormProps {
  staff?: StaffData;
  onSuccess?: () => void;
}

export function StaffForm({ staff, onSuccess }: StaffFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const isEditing = !!staff;

  useEffect(() => {
    if (staff) {
      form.setFieldsValue({
        ...staff,
        joinDate: staff.joinDate ? dayjs(staff.joinDate) : null,
      });
    } else {
      // Reset form when creating new staff
      form.resetFields();
    }
  }, [staff, form]);

  const handleSubmit = async (values: any) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Format the data - ensure joinDate is properly converted
      const formattedValues = {
        ...values,
        joinDate: values.joinDate && dayjs.isDayjs(values.joinDate) 
          ? values.joinDate.format("YYYY-MM-DD") 
          : values.joinDate,
      };

      console.log("Formatted values:", formattedValues);

      if (isEditing) {
        message.success("Cập nhật nhân viên thành công!");
      } else {
        message.success("Thêm nhân viên thành công!");
      }

      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      message.error(isEditing ? "Cập nhật nhân viên thất bại" : "Thêm nhân viên thất bại");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={staff || {
        role: "staff",
        position: "cashier",
        status: "active",
        shift: "morning",
        store: "Downtown Store",
      }}
      className="staff-form"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { min: 3, message: "Họ tên phải có ít nhất 3 ký tự!" },
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
            <Input placeholder="example@fastfood.com" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại phải có 10 chữ số!" },
            ]}
          >
            <Input placeholder="0901234567" size="large" maxLength={10} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Ngày vào làm"
            name="joinDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày vào làm!" },
            ]}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : null,
            })}
            normalize={(value) => {
              return value ? dayjs(value) : null;
            }}
          >
            <DatePicker
              placeholder="Chọn ngày"
              style={{ width: "100%" }}
              size="large"
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select size="large" placeholder="Chọn vai trò">
              <Select.Option value="staff">Nhân viên</Select.Option>
              <Select.Option value="manager">Quản lý</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Vị trí"
            name="position"
            rules={[{ required: true, message: "Vui lòng chọn vị trí!" }]}
          >
            <Select size="large" placeholder="Chọn vị trí">
              <Select.Option value="supervisor">Giám sát (Supervisor)</Select.Option>
              <Select.Option value="cashier">Thu ngân (Cashier)</Select.Option>
              <Select.Option value="kitchen">Bếp (Kitchen)</Select.Option>
              <Select.Option value="delivery">Giao hàng (Delivery)</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Ca làm việc"
            name="shift"
            rules={[{ required: true, message: "Vui lòng chọn ca làm việc!" }]}
          >
            <Select size="large" placeholder="Chọn ca làm việc">
              <Select.Option value="morning">Sáng (6AM-2PM)</Select.Option>
              <Select.Option value="afternoon">Chiều (2PM-10PM)</Select.Option>
              <Select.Option value="evening">Tối (10PM-6AM)</Select.Option>
              <Select.Option value="full-time">Toàn thời gian</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select size="large" placeholder="Chọn trạng thái">
              <Select.Option value="active">Đang làm việc</Select.Option>
              <Select.Option value="on-leave">Nghỉ phép</Select.Option>
              <Select.Option value="inactive">Không hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Lương (VND)"
            name="salary"
            rules={[
              { required: true, message: "Vui lòng nhập lương!" },
              { type: "number", min: 0, message: "Lương phải lớn hơn 0!" },
            ]}
          >
            <InputNumber
              placeholder="8000000"
              style={{ width: "100%" }}
              size="large"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || 0) as any}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Cửa hàng"
            name="store"
          >
            <Input disabled size="large" placeholder="Downtown Store" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="mb-0 mt-6">
        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onSuccess}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" size="large" className="bg-blue-500 hover:bg-blue-600">
            {isEditing ? "Cập nhật" : "Thêm nhân viên"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
