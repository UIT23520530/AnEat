"use client"

import React, { useEffect } from "react"
import {
  Form,
  Row,
  Col,
  Input,
  Select,
  InputNumber,
  DatePicker,
  TreeSelect,
  Switch,
  Button,
} from "antd"
import dayjs from "dayjs"
import { Promotion } from "@/services/promotion.service"

interface PromotionsFormProps {
  form: any
  onFinish: (values: any) => void
  isEdit?: boolean
  editingPromotion?: Promotion | null
  productTreeData: any[]
  onCancel: () => void
}

export default function PromotionsForm({
  form,
  onFinish,
  isEdit = false,
  editingPromotion,
  productTreeData,
  onCancel,
}: PromotionsFormProps) {
  useEffect(() => {
    if (isEdit && editingPromotion) {
      let productIds: string[] = []
      try {
        if (editingPromotion.applicableProducts) {
          productIds = JSON.parse(editingPromotion.applicableProducts)
        }
      } catch (e) {
        console.error("Error parsing product IDs", e)
      }

      form.setFieldsValue({
        code: editingPromotion.code,
        type: editingPromotion.type,
        value: editingPromotion.value,
        maxUses: editingPromotion.maxUses,
        isActive: editingPromotion.isActive,
        expiryDate: editingPromotion.expiryDate ? dayjs(editingPromotion.expiryDate) : undefined,
        minOrderAmount: editingPromotion.minOrderAmount,
        applicableProducts: productIds,
      })
    } else if (!isEdit) {
      form.resetFields()
      form.setFieldsValue({
        isActive: true,
        type: "PERCENTAGE",
        applicableProducts: [],
      })
    }
  }, [isEdit, editingPromotion, form])

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="mt-4"
    >
      <Form.Item
        label="Mã khuyến mãi"
        name="code"
        rules={[
          { required: true, message: "Vui lòng nhập mã khuyến mãi!" },
          { min: 3, max: 20, message: "Mã phải từ 3-20 ký tự!" },
          { pattern: /^[a-zA-Z0-9_-]+$/, message: "Mã chỉ chứa chữ cái, số và gạch ngang/dưới" }
        ]}
      >
        <Input
          size="large"
          placeholder="VD: SALE20"
          style={{ textTransform: "uppercase" }}
          onChange={(e) => {
            form.setFieldsValue({ code: e.target.value.toUpperCase() })
          }}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Loại khuyến mãi"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
          >
            <Select size="large">
              <Select.Option value="PERCENTAGE">Phần trăm (%)</Select.Option>
              <Select.Option value="FIXED">Số tiền cố định (₫)</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue("type")
              return (
                <Form.Item
                  label={`Giá trị giảm (${type === "PERCENTAGE" ? "%" : "₫"})`}
                  name="value"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá trị!" },
                    { 
                      type: "number", 
                      min: 0, 
                      max: type === "PERCENTAGE" ? 100 : undefined,
                      message: type === "PERCENTAGE" ? "Phần trăm từ 0-100" : "Giá trị phải > 0" 
                    },
                  ]}
                >
                  <InputNumber<number>
                    size="large" 
                    style={{ width: "100%" }} 
                    min={0}
                    formatter={(value) => type !== "PERCENTAGE" && value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : `${value}`}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                  />
                </Form.Item>
              )
            }}
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Giá trị đơn hàng tối thiểu" name="minOrderAmount">
            <InputNumber<number>
              size="large"
              style={{ width: "100%" }}
              min={0}
              placeholder="0 (Không áp dụng)"
              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
              suffix="₫"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Lượt sử dụng tối đa" name="maxUses">
            <InputNumber
              size="large"
              style={{ width: "100%" }}
              min={1}
              placeholder="Không giới hạn"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Ngày hết hạn" name="expiryDate">
        <DatePicker
          size="large"
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày hết hạn (Để trống nếu không giới hạn)"
          disabledDate={(current) => {
            return current && current < dayjs().startOf("day")
          }}
        />
      </Form.Item>

      <Form.Item label="Áp dụng cho sản phẩm (Tùy chọn)" name="applicableProducts">
        <TreeSelect
          treeData={productTreeData}
          treeCheckable
          showCheckedStrategy={TreeSelect.SHOW_CHILD}
          placeholder="Chọn sản phẩm áp dụng (Chọn danh mục để chọn tất cả sản phẩm)"
          style={{ width: '100%' }}
          allowClear
          size="large"
          maxTagCount="responsive"
          treeDefaultExpandAll
        />
      </Form.Item>

      <Form.Item
        label="Trạng thái"
        name="isActive"
        valuePropName="checked"
      >
        <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
      </Form.Item>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <Button onClick={onCancel}>
          Hủy
        </Button>
        <Button type="primary" htmlType="submit">
          {isEdit ? "Lưu thay đổi" : "Tạo khuyến mãi"}
        </Button>
      </div>
    </Form>
  )
}
