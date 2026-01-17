"use client"

import { Form, Input, Switch } from "antd"
import { useEffect } from "react"
import { Category } from "@/services/admin-category.service"

interface CategoriesFormProps {
  form: any
  onFinish: (values: any) => void
  isEdit?: boolean
  selectedCategory?: Category | null
}

export default function CategoriesForm({
  form,
  onFinish,
  isEdit = false,
  selectedCategory,
}: CategoriesFormProps) {
  useEffect(() => {
    if (isEdit && selectedCategory) {
      form.setFieldsValue({
        code: selectedCategory.code,
        name: selectedCategory.name,
        description: selectedCategory.description,
        image: selectedCategory.image,
        isActive: selectedCategory.isActive,
      })
    } else if (!isEdit) {
      form.resetFields()
      form.setFieldsValue({ isActive: true })
    }
  }, [isEdit, selectedCategory, form])

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Mã danh mục"
        name="code"
        rules={[
          { required: true, message: "Vui lòng nhập mã danh mục" },
          { max: 20, message: "Mã danh mục không quá 20 ký tự" },
          { pattern: /^[A-Z0-9_]+$/, message: "Mã chỉ chứa chữ hoa, số và _" },
        ]}
      >
        <Input placeholder="VD: MAIN_DISH" />
      </Form.Item>

      <Form.Item
        label="Tên danh mục"
        name="name"
        rules={[
          { required: true, message: "Vui lòng nhập tên danh mục" },
          { max: 100, message: "Tên danh mục không quá 100 ký tự" },
        ]}
      >
        <Input placeholder="VD: Món chính" />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={3} placeholder="Mô tả về danh mục..." />
      </Form.Item>

      <Form.Item label="URL hình ảnh" name="image">
        <Input placeholder="https://example.com/image.jpg" />
      </Form.Item>

      <Form.Item 
        label="Trạng thái" 
        name="isActive" 
        valuePropName="checked"
      >
        <Switch 
          checkedChildren="Đang hiển thị" 
          unCheckedChildren="Đã ẩn"
        />
      </Form.Item>
    </Form>
  )
}
