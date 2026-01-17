"use client"

import { useEffect } from "react"
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Select,
  Switch,
  App,
} from "antd"
import {
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons"

interface Manager {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

interface BranchFormData {
  name: string
  address: string
  phone: string
  email: string
  managerId?: string | null
  isActive: boolean
}

interface BranchFormProps {
  mode: "create" | "edit"
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: BranchFormData) => Promise<void>
  initialValues?: Partial<BranchFormData>
  availableManagers: Manager[]
  loading?: boolean
}

export function BranchForm({
  mode,
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  availableManagers,
  loading = false,
}: BranchFormProps) {
  const [form] = Form.useForm()
  const { modal, message } = App.useApp()

  // Reset form when modal opens/closes or initialValues change
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialValues) {
        form.setFieldsValue(initialValues)
      } else if (mode === "create") {
        form.resetFields()
      }
    }
  }, [isOpen, mode, initialValues, form])

  // Auto-fill email from name for create mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === "create") {
      const name = e.target.value
      const dashIndex = name.indexOf(" - ")
      if (dashIndex > 0) {
        const cityPart = name.substring(dashIndex + 3).trim()
        // Convert to lowercase and remove diacritics for email
        const emailPrefix = cityPart
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]/g, "")
        form.setFieldsValue({ email: `${emailPrefix}@aneat.com` })
      }
    }
  }

  // Handle manager change
  const handleManagerChange = (value: string | null) => {
    const isActive = form.getFieldValue("isActive")
    
    if (!value && isActive) {
      // Khi xóa quản lý, tự động vô hiệu hóa chi nhánh
      if (mode === "edit") {
        modal.confirm({
          title: "Xác nhận xóa quản lý",
          content: "Xóa quản lý sẽ tự động vô hiệu hóa chi nhánh. Bạn có chắc chắn?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: () => {
            form.setFieldsValue({ isActive: false })
          },
          onCancel: () => {
            // Restore previous value
            const currentManager = initialValues?.managerId
            form.setFieldsValue({ managerId: currentManager })
          },
        })
      } else {
        // Create mode - just auto-disable
        form.setFieldsValue({ isActive: false })
        message.info("Đã tự động vô hiệu hóa chi nhánh")
      }
    }
  }

  // Handle active status change
  const handleActiveChange = (checked: boolean) => {
    const managerId = form.getFieldValue("managerId")
    
    if (!checked && managerId) {
      // Khi vô hiệu hóa chi nhánh, tự động bỏ gán quản lý
      modal.confirm({
        title: "Xác nhận vô hiệu hóa",
        content: "Chi nhánh vô hiệu hóa sẽ tự động bỏ gán quản lý. Bạn có chắc chắn?",
        okText: "Xác nhận",
        cancelText: "Hủy",
        onOk: () => {
          form.setFieldsValue({ managerId: null })
        },
        onCancel: () => {
          form.setFieldsValue({ isActive: true })
        },
      })
    }
  }

  const handleFinish = async (values: BranchFormData) => {
    try {
      await onSubmit(values)
      form.resetFields()
    } catch (error) {
      // Error handling is done in parent
    }
  }

  return (
    <Modal
      title={mode === "create" ? "Thêm chi nhánh mới" : "Chỉnh sửa thông tin chi nhánh"}
      open={isOpen}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={mode === "create" ? "Thêm" : "Lưu"}
      cancelText="Hủy"
      width={700}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Thông tin cơ bản */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-700 mb-3">Thông tin cơ bản</div>
          <Form.Item
            label="Tên chi nhánh"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input
              prefix={<ShopOutlined />}
              placeholder="VD: AnEat - Tuy Hòa"
              onChange={handleNameChange}
            />
          </Form.Item>
          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="VD: 127 Nguyễn Huệ, Tuy Hòa, Phú Yên"
            />
          </Form.Item>
        </div>

        {/* Thông tin liên hệ */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-700 mb-3">Thông tin liên hệ</div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập SĐT" },
                  { pattern: /^[0-9]{10}$/, message: "SĐT phải có 10 chữ số" },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="VD: 0257123456" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="VD: tuyhoa@aneat.com" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Quản lý */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-700 mb-3">Quản lý</div>
          <Form.Item name="managerId">
            <Select
              showSearch
              allowClear
              placeholder="Chọn quản lý (có thể để trống)"
              notFoundContent={
                <div className="text-center py-4 text-slate-500">
                  <UserOutlined className="text-2xl mb-2" />
                  <div className="text-sm">Chưa có quản lý nào khả dụng</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Phải có người dùng có vai trò quản lý được tạo trước khi gắn vào chi nhánh
                  </div>
                </div>
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={availableManagers.map((m) => ({
                value: m.id,
                label: `${m.name} (${m.email})`,
              }))}
              onChange={handleManagerChange}
            />
          </Form.Item>
          <div className="text-xs text-slate-500 mt-1">
            Xóa quản lý sẽ tự động vô hiệu hóa chi nhánh
          </div>
        </div>

        {/* Trạng thái */}
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-3">Trạng thái</div>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.managerId !== curr.managerId || prev.isActive !== curr.isActive}>
            {({ getFieldValue }) => {
              const managerId = getFieldValue("managerId")
              const isActive = getFieldValue("isActive")

              return (
                <>
                  <Form.Item
                    name="isActive"
                    valuePropName="checked"
                    initialValue={mode === "create" ? false : undefined}
                  >
                    <Switch
                      checkedChildren="Hoạt động"
                      unCheckedChildren="Vô hiệu hóa"
                      disabled={!managerId}
                      onChange={handleActiveChange}
                    />
                  </Form.Item>
                  {!managerId && (
                    <div className="text-xs text-amber-600 mt-1">
                      Phải có quản lý được gán trước khi kích hoạt chi nhánh
                    </div>
                  )}
                  {managerId && isActive && (
                    <div className="text-xs text-blue-600 mt-1">
                      Vô hiệu hóa chi nhánh sẽ tự động bỏ gán quản lý
                    </div>
                  )}
                </>
              )
            }}
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
