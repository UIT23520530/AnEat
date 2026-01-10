"use client";

import { Form, Input, InputNumber, Select, DatePicker, Switch, Row, Col } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PromotionsFormProps {
  form: any;
  initialValues?: any;
  onFinish: (values: any) => void;
}

export default function PromotionsForm({ form, initialValues, onFinish }: PromotionsFormProps) {
  useEffect(() => {
    if (initialValues) {
      // Convert date strings to dayjs objects for RangePicker
      const formValues = {
        ...initialValues,
        dateRange: initialValues.startDate && initialValues.endDate 
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
      };
      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tên chương trình"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên chương trình!" }]}
          >
            <Input placeholder="Nhập tên chương trình" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Mã khuyến mãi"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã!" },
              { pattern: /^[A-Z0-9]+$/, message: "Mã chỉ chứa chữ in hoa và số!" }
            ]}
          >
            <Input placeholder="VD: SALE20" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Loại khuyến mãi"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
          >
            <Select placeholder="Chọn loại khuyến mãi">
              <Select.Option value="percentage">Giảm theo %</Select.Option>
              <Select.Option value="fixed">Giảm cố định</Select.Option>
              <Select.Option value="freeship">Miễn phí vận chuyển</Select.Option>
              <Select.Option value="bogo">Mua 1 tặng 1</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Giá trị"
            name="value"
            rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
          >
            <InputNumber
              placeholder="Nhập giá trị"
              min={0}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Thời gian áp dụng"
            name="dateRange"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Đơn tối thiểu"
            name="minOrderValue"
            rules={[{ required: true, message: "Vui lòng nhập giá trị đơn tối thiểu!" }]}
          >
            <InputNumber
              placeholder="Giá trị đơn tối thiểu"
              min={0}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Giới hạn sử dụng"
            name="usageLimit"
          >
            <InputNumber
              placeholder="Không giới hạn nếu để trống"
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Đã sử dụng"
            name="usedCount"
          >
            <InputNumber
              placeholder="0"
              min={0}
              disabled
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Mô tả"
        name="description"
      >
        <TextArea
          rows={3}
          placeholder="Nhập mô tả chi tiết về chương trình khuyến mãi"
        />
      </Form.Item>

      <Form.Item
        label="Kích hoạt"
        name="active"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* Hidden submit button */}
      <button type="submit" style={{ display: 'none' }} />
    </Form>
  );
}
