"use client"

import { Form, Input, InputNumber, Select, Row, Col } from "antd"
import { Customer } from "@/services/admin-customer.service"
import { useEffect } from "react"

interface CustomersFormProps {
  form: any
  onFinish: (values: any) => void
  isEdit?: boolean
  selectedCustomer?: Customer | null
}

export default function CustomersForm({
  form,
  onFinish,
  isEdit = false,
  selectedCustomer,
}: CustomersFormProps) {
  useEffect(() => {
    if (isEdit && selectedCustomer) {
      form.setFieldsValue({
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        email: selectedCustomer.email,
        tier: selectedCustomer.tier,
        currentPoints: selectedCustomer.points,
      })
    } else if (!isEdit) {
      form.resetFields()
      form.setFieldsValue({ tier: "BRONZE", points: 0 })
    }
  }, [isEdit, selectedCustomer, form])

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập SĐT" },
              { pattern: /^[0-9]{10}$/, message: "SĐT phải 10 số" }
            ]}
          >
            <Input placeholder="0123456789" maxLength={10} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Email không hợp lệ" }]}>
        <Input placeholder="email@example.com" allowClear />
      </Form.Item>

      {isEdit ? (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Hạng thành viên" name="tier" rules={[{ required: true }]}>
              <Select placeholder="Chọn hạng thành viên">
                <Select.Option value="BRONZE">Hạng Đồng</Select.Option>
                <Select.Option value="SILVER">Hạng Bạc</Select.Option>
                <Select.Option value="GOLD">Hạng Vàng</Select.Option>
                <Select.Option value="VIP">Hạng VIP</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Điểm tích lũy" name="currentPoints">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
        </Row>
      ) : (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Hạng thành viên" name="tier" initialValue="BRONZE" rules={[{ required: true }]}>
              <Select placeholder="Chọn hạng thành viên">
                <Select.Option value="BRONZE">Hạng Đồng</Select.Option>
                <Select.Option value="SILVER">Hạng Bạc</Select.Option>
                <Select.Option value="GOLD">Hạng Vàng</Select.Option>
                <Select.Option value="VIP">Hạng VIP</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Điểm tích lũy" name="points" initialValue={0}>
              <InputNumber placeholder="0" style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
        </Row>
      )}
    </Form>
  )
}
