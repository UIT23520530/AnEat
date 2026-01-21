"use client"

import { Form, Input, InputNumber, Select, Row, Col, Switch, Upload, Button, message, Checkbox } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import { useEffect } from "react"
import { Product } from "@/services/admin-product.service"
import { Category } from "@/services/admin-category.service"
import { Branch } from "@/services/admin-branch.service"

interface ProductsFormProps {
  form: any
  onFinish: (values: any) => void
  isEdit?: boolean
  selectedProduct?: Product | null
  categories: Category[]
  branches: Branch[]
  hideBranch?: boolean
}

export default function ProductsForm({
  form,
  onFinish,
  isEdit = false,
  selectedProduct,
  categories,
  branches,
  hideBranch = false,
}: ProductsFormProps) {
  useEffect(() => {
    if (isEdit && selectedProduct) {
      form.setFieldsValue({
        code: selectedProduct.code,
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price, // Giá đã là VND
        image: selectedProduct.image,
        categoryId: selectedProduct.categoryId,
        branchIds: selectedProduct.branchId ? [selectedProduct.branchId] : [], // Convert to array
        quantity: selectedProduct.quantity,
        prepTime: selectedProduct.prepTime || undefined,
        isAvailable: selectedProduct.isAvailable,
        costPrice: selectedProduct.costPrice || undefined,
      })
    } else if (!isEdit) {
      form.resetFields()
      form.setFieldsValue({ isAvailable: true, quantity: 0, branchIds: [] }) // Empty array = global
    }
  }, [isEdit, selectedProduct, form])

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Mã sản phẩm"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã sản phẩm" },
              { max: 20, message: "Mã không quá 20 ký tự" },
            ]}
          >
            <Input placeholder="VD: GA_CAY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
              { max: 200, message: "Tên không quá 200 ký tự" },
            ]}
          >
            <Input placeholder="VD: Gà cay" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={3} placeholder="Mô tả về sản phẩm..." />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Giá bán (VNĐ)"
            name="price"
            rules={[
              { required: true, message: "Vui lòng nhập giá" },
              { type: "number", min: 0, message: "Giá phải >= 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="50000"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Giá vốn (VNĐ)"
            name="costPrice"
            rules={[
              { type: "number", min: 0, message: "Giá vốn phải >= 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="30000"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Số lượng tồn kho"
            name="quantity"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 0, message: "Số lượng phải >= 0" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} placeholder={isEdit ? "100" : "0"} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {(isEdit ? categories : categories.filter(c => c.isActive)).map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {!hideBranch ? (
          <Col span={24}>
            <Form.Item
              label="Áp dụng chi nhánh"
              name="branchIds"
              help="Để trống = Toàn hệ thống. Chọn 1 hoặc nhiều chi nhánh cụ thể để giới hạn."
            >
              <Select
                mode="multiple"
                placeholder="Chọn chi nhánh (để trống = toàn hệ thống)"
                allowClear
                maxTagCount="responsive"
              >
                {(isEdit ? branches : branches.filter(b => b.isActive)).map((branch) => (
                  <Select.Option key={branch.id} value={branch.id}>
                    {branch.code} - {branch.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        ) : null}
        <Col span={hideBranch ? 12 : 12}>
          <Form.Item label="Thời gian chuẩn bị (phút)" name="prepTime">
            <InputNumber style={{ width: "100%" }} placeholder="15" min={0} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Hình ảnh" required>
            <div className="flex gap-4 items-start">
              <Form.Item name="image" noStyle rules={[{ required: true, message: "Vui lòng nhập URL hoặc tải ảnh" }]}>
                <Input placeholder="/products/ten-mon-an.jpg" style={{ flex: 1 }} />
              </Form.Item>
              <Upload
                showUploadList={false}
                customRequest={async ({ file, onSuccess, onError }) => {
                  const formData = new FormData()
                  formData.append('file', file as File)

                  try {
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    })
                    const result = await response.json()
                    if (result.success) {
                      form.setFieldsValue({ image: result.url })
                      message.success('Tải ảnh thành công')
                      onSuccess?.(result)
                    } else {
                      message.error('Tải ảnh thất bại: ' + result.message)
                      onError?.(new Error(result.message))
                    }
                  } catch (err) {
                    message.error('Lỗi tải ảnh')
                    onError?.(err as Error)
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Hệ thống sẽ tự động chuẩn hóa tên file thành dạng: ten-mon-an.jpg
            </div>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Trạng thái" name="isAvailable" valuePropName="checked">
        <Switch checkedChildren="Đang bán" unCheckedChildren="Đã ẩn" />
      </Form.Item>
    </Form>
  )
}
