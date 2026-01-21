"use client"

import { Form, Input, InputNumber, Select, Row, Col, Switch, Alert, Tag } from "antd"
import { Customer } from "@/services/admin-customer.service"
import { useEffect, useState } from "react"
import { calculateTierFromPoints, CustomerTier } from "@/services/manager-customer.service"
import { CrownOutlined, TrophyOutlined, StarOutlined, UserOutlined } from "@ant-design/icons"

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
  const [calculatedTier, setCalculatedTier] = useState<CustomerTier | null>(null)
  const [currentPoints, setCurrentPoints] = useState<number>(0)

  useEffect(() => {
    if (isEdit && selectedCustomer) {
      form.setFieldsValue({
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        email: selectedCustomer.email,
        tier: selectedCustomer.tier,
        currentPoints: selectedCustomer.points,
        isActive: true,
      })
      setCurrentPoints(selectedCustomer.points)
      setCalculatedTier(calculateTierFromPoints(selectedCustomer.points))
    } else if (!isEdit) {
      form.resetFields()
      form.setFieldsValue({ tier: "BRONZE", points: 0 })
      setCurrentPoints(0)
      setCalculatedTier("BRONZE")
    }
  }, [isEdit, selectedCustomer, form])

  // Handle points change to auto-calculate tier
  const handlePointsChange = (value: number | null) => {
    const points = value || 0
    setCurrentPoints(points)
    const newTier = calculateTierFromPoints(points)
    setCalculatedTier(newTier)
    
    // Auto-update tier field if in edit mode
    if (isEdit) {
      form.setFieldValue('tier', newTier)
    }
  }

  // Get tier display properties
  const getTierDisplay = (tier: CustomerTier) => {
    const displays = {
      VIP: { label: "Hạng VIP", color: "purple", icon: <CrownOutlined /> },
      GOLD: { label: "Hạng Vàng", color: "gold", icon: <TrophyOutlined /> },
      SILVER: { label: "Hạng Bạc", color: "blue", icon: <StarOutlined /> },
      BRONZE: { label: "Hạng Đồng", color: "default", icon: <UserOutlined /> },
    }
    return displays[tier]
  }

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
        <>
          {calculatedTier && (
            <Alert
              message="Tự động tính hạng từ điểm"
              description={
                <div>
                  <p className="mb-2">
                    Với <strong>{currentPoints.toLocaleString()}</strong> điểm, khách hàng sẽ được xếp vào{" "}
                    <Tag color={getTierDisplay(calculatedTier).color} icon={getTierDisplay(calculatedTier).icon}>
                      {getTierDisplay(calculatedTier).label}
                    </Tag>
                  </p>
                  <p className="text-xs text-gray-500">
                    • BRONZE: 0-99 điểm • SILVER: 100-499 điểm • GOLD: 500-999 điểm • VIP: 1000+ điểm
                  </p>
                </div>
              }
              type="info"
              showIcon
              className="mb-4"
            />
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Điểm tích lũy" name="currentPoints">
                <InputNumber 
                  style={{ width: "100%" }} 
                  min={0} 
                  onChange={handlePointsChange}
                  placeholder="Nhập số điểm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Hạng thành viên" 
                name="tier" 
                rules={[{ required: true }]}
                tooltip="Hạng sẽ tự động cập nhật khi thay đổi điểm"
              >
                <Select placeholder="Chọn hạng thành viên">
                  <Select.Option value="BRONZE">Hạng Đồng</Select.Option>
                  <Select.Option value="SILVER">Hạng Bạc</Select.Option>
                  <Select.Option value="GOLD">Hạng Vàng</Select.Option>
                  <Select.Option value="VIP">Hạng VIP</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Trạng thái"
            name="isActive"
            valuePropName="checked"
            tooltip="Bật để khôi phục khách hàng đã xóa"
          >
            <Switch
              checkedChildren="Đang hoạt động"
              unCheckedChildren="Đã xóa"
            />
          </Form.Item>
        </>
      ) : (
        <>
          {calculatedTier && (
            <Alert
              message="Tự động tính hạng từ điểm"
              description={
                <div>
                  <p className="mb-2">
                    Với <strong>{currentPoints.toLocaleString()}</strong> điểm, khách hàng sẽ được xếp vào{" "}
                    <Tag color={getTierDisplay(calculatedTier).color} icon={getTierDisplay(calculatedTier).icon}>
                      {getTierDisplay(calculatedTier).label}
                    </Tag>
                  </p>
                  <p className="text-xs text-gray-500">
                    • BRONZE: 0-99 điểm • SILVER: 100-499 điểm • GOLD: 500-999 điểm • VIP: 1000+ điểm
                  </p>
                </div>
              }
              type="info"
              showIcon
              className="mb-4"
            />
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Điểm tích lũy" name="points" initialValue={0}>
                <InputNumber 
                  placeholder="0" 
                  style={{ width: "100%" }} 
                  min={0}
                  onChange={handlePointsChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Hạng thành viên" 
                name="tier" 
                initialValue="BRONZE" 
                rules={[{ required: true }]}
                tooltip="Hạng sẽ tự động tính từ điểm"
              >
                <Select placeholder="Chọn hạng thành viên" disabled>
                  <Select.Option value="BRONZE">Hạng Đồng</Select.Option>
                  <Select.Option value="SILVER">Hạng Bạc</Select.Option>
                  <Select.Option value="GOLD">Hạng Vàng</Select.Option>
                  <Select.Option value="VIP">Hạng VIP</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </Form>
  )
}
