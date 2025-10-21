// src/components/forms/PromotionsForm.tsx
"use client";

import { useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, DatePicker, InputNumber, message } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Promotion {
  id: string;
  name: string;
  code: string;
  description?: string;
  discount: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  status: "active" | "expired" | "scheduled";
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  minOrderValue?: number;
}

interface PromotionsFormProps {
  promotion?: Promotion;
  onSuccess?: () => void;
}

export function PromotionsForm({ promotion, onSuccess }: PromotionsFormProps) {
  const [form] = Form.useForm();
  const isEditing = !!promotion;

  useEffect(() => {
    if (promotion) {
      form.setFieldsValue({
        ...promotion,
        dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)],
      });
    }
  }, [promotion, form]);

  const handleSubmit = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange;
      
      const promotionData = {
        ...values,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        discount: values.discountType === "percentage" 
          ? `${values.discountValue}%` 
          : `${values.discountValue.toLocaleString()}đ`,
      };

      // TODO: Call API to create/update promotion
      console.log("Promotion data:", promotionData);

      if (isEditing) {
        message.success("Cập nhật khuyến mãi thành công!");
      } else {
        message.success("Tạo khuyến mãi thành công!");
      }

      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(isEditing ? "Cập nhật khuyến mãi thất bại" : "Tạo khuyến mãi thất bại");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "active",
        discountType: "percentage",
        usageCount: 0,
      }}
      className="stores-form"
    >
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            label="Tên chương trình"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên chương trình" },
              { min: 5, message: "Tên chương trình phải có ít nhất 5 ký tự" },
            ]}
          >
            <Input placeholder="VD: Giảm 20% cho đơn hàng đầu tiên" size="large" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Mã khuyến mãi"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã" },
              { pattern: /^[A-Z0-9]+$/, message: "Mã chỉ gồm chữ HOA và số" },
            ]}
          >
            <Input placeholder="WELCOME20" size="large" style={{ textTransform: 'uppercase' }} />
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
              placeholder="Mô tả chi tiết về chương trình khuyến mãi" 
              rows={3}
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Loại giảm giá"
            name="discountType"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select size="large" placeholder="Chọn loại giảm giá">
              <Select.Option value="percentage">Phần trăm (%)</Select.Option>
              <Select.Option value="fixed">Số tiền cố định (VND)</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Giá trị giảm"
            name="discountValue"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị" },
              { type: 'number', min: 0, message: "Giá trị phải lớn hơn 0" },
            ]}
          >
            <InputNumber 
              placeholder="20" 
              size="large"
              style={{ width: '100%' }}
              min={0}
              max={100}
              formatter={value => `${value}`}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Giá trị đơn tối thiểu"
            name="minOrderValue"
          >
            <InputNumber 
              placeholder="0" 
              size="large"
              style={{ width: '100%' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Thời gian áp dụng"
            name="dateRange"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <RangePicker 
              size="large"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Giới hạn sử dụng"
            name="usageLimit"
          >
            <InputNumber 
              placeholder="Không giới hạn" 
              size="large"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select size="large" placeholder="Chọn trạng thái">
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="scheduled">Sắp diễn ra</Select.Option>
              <Select.Option value="expired">Đã hết hạn</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {isEditing && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Lượt đã sử dụng" name="usageCount">
              <InputNumber 
                size="large"
                style={{ width: '100%' }}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Form.Item className="mb-0 mt-6">
        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onSuccess}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" size="large">
            {isEditing ? "Cập nhật" : "Tạo khuyến mãi"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
