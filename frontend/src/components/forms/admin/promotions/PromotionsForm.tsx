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
  Alert,
  Radio,
} from "antd"
import dayjs from "dayjs"
import { Promotion } from "@/services/promotion.service"
import { Branch } from "@/services/admin-branch.service"

interface PromotionsFormProps {
  form: any
  onFinish: (values: any) => void
  isEdit?: boolean
  editingPromotion?: Promotion | null
  productTreeData: any[]
  branches: Branch[]
  onCancel: () => void
}

export default function PromotionsForm({
  form,
  onFinish,
  isEdit = false,
  editingPromotion,
  productTreeData,
  branches,
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

      // ĐƠN GIẢN: null/undefined = "all", có giá trị = "specific"
      const branchScope = editingPromotion.branchId ? "specific" : "all"
      const branchIds = editingPromotion.branchId ? [editingPromotion.branchId] : []

      console.log('🔄 EDIT MODE - Setting form:', {
        branchId: editingPromotion.branchId,
        branchScope,
        branchIds,
        editingPromotion
      })

      // Set values directly without reset to avoid losing data
      form.setFieldsValue({
        code: editingPromotion.code,
        type: editingPromotion.type,
        value: editingPromotion.value,
        maxUses: editingPromotion.maxUses,
        isActive: editingPromotion.isActive,
        expiryDate: editingPromotion.expiryDate ? dayjs(editingPromotion.expiryDate) : undefined,
        minOrderAmount: editingPromotion.minOrderAmount,
        applicableProducts: productIds,
        branchScope: branchScope,
        branchIds: branchIds,
      })
    } else {
      // CREATE MODE: Mặc định toàn hệ thống
      console.log('✨ CREATE MODE - Reset form to defaults')
      form.resetFields()
      // Use setTimeout to ensure reset completes before setting values
      setTimeout(() => {
        form.setFieldsValue({
          isActive: true,
          type: "PERCENTAGE",
          applicableProducts: [],
          branchScope: "all", // MẶC ĐỊNH: Toàn hệ thống
          branchIds: [],
        })
      }, 0)
    }
  }, [isEdit, editingPromotion])

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="mt-4"
    >
      <Alert
        message="Hướng dẫn phạm vi áp dụng"
        description={
          <div className="text-sm">
            <p><strong>1. Toàn bộ chi nhánh:</strong> Khuyến mãi áp dụng cho TẤT CẢ chi nhánh trong hệ thống (Mặc định)</p>
            <p className="mt-1"><strong>2. 1 hoặc nhiều chi nhánh:</strong> Khuyến mãi áp dụng cho các chi nhánh được chọn</p>
            {!isEdit && (
              <p className="mt-1 text-blue-600"><strong>Mẹo:</strong> Bạn có thể chọn nhiều chi nhánh để tạo khuyến mãi cho từng chi nhánh cùng lúc!</p>
            )}
          </div>
        }
        type="info"
        showIcon
        className="mb-4"
      />

      <Form.Item
        label="Nơi áp dụng"
        name="branchScope"
        rules={[{ required: true, message: "Vui lòng chọn nơi áp dụng!" }]}
        tooltip="Chọn 'Toàn bộ chi nhánh' để áp dụng cho tất cả chi nhánh, hoặc '1 hoặc nhiều chi nhánh' để chọn các chi nhánh cụ thể"
      >
        <Radio.Group
          size="large"
          onChange={(e) => {
            console.log('🔄 Branch scope changed to:', e.target.value)
            // Xóa branchIds khi chuyển sang "all"
            if (e.target.value === "all") {
              form.setFieldsValue({ branchIds: [] })
              console.log('✅ Cleared branchIds (global mode)')
            }
          }}
        >
          <Radio.Button value="all">Toàn bộ chi nhánh</Radio.Button>
          <Radio.Button value="specific">1 hoặc nhiều chi nhánh</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.branchScope !== curr.branchScope}
      >
        {({ getFieldValue }) => {
          const branchScope = getFieldValue("branchScope")
          return branchScope === "specific" ? (
            <Form.Item
              label="Chọn chi nhánh"
              name="branchIds"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một chi nhánh!",
                  type: "array",
                  min: 1
                },
              ]}
              tooltip={isEdit
                ? "Chọn một hoặc nhiều chi nhánh. Nếu chọn nhiều chi nhánh, hệ thống sẽ vô hiệu hóa khuyến mãi hiện tại và tạo mới cho từng chi nhánh."
                : "Chọn một hoặc nhiều chi nhánh để áp dụng khuyến mãi. Hệ thống sẽ tạo một bản ghi riêng cho mỗi chi nhánh."
              }
            >
              <Select
                mode="multiple"
                size="large"
                placeholder="Chọn chi nhánh áp dụng"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={branches.map(branch => ({
                  label: `${branch.code} - ${branch.name}`,
                  value: branch.id,
                }))}
                maxTagCount="responsive"
              />
            </Form.Item>
          ) : (
            <Form.Item name="branchIds" hidden>
              <Input />
            </Form.Item>
          )
        }}
      </Form.Item>

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
