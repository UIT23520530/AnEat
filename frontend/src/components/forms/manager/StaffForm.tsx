"use client"

import { Form, Input, Switch, Divider, Row, Col, Button, Avatar } from "antd"
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  KeyOutlined, 
  CheckCircleOutlined,
  CameraOutlined
} from "@ant-design/icons"
import { useEffect, useState } from "react"
import { StaffDTO, CreateStaffRequest, UpdateStaffRequest } from "@/types/staff"
import { getCurrentUser } from "@/lib/auth"

interface StaffFormProps {
  staff?: StaffDTO
  onSuccess?: () => void
  onSubmit: (data: CreateStaffRequest | UpdateStaffRequest) => Promise<{ success: boolean; data?: StaffDTO; message?: string }>
}

export function StaffForm({ staff, onSuccess, onSubmit }: StaffFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEditing = !!staff

  useEffect(() => {
    if (staff) {
      form.setFieldsValue({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        isActive: staff.isActive,
        avatar: staff.avatar || null,
        password: "", // Reset password field on edit
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ isActive: true })
    }
  }, [staff, form])

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const currentUser = getCurrentUser()
      
      // Generate a stronger random password (at least 8 characters)
      const randomPassword = Math.random().toString(36).substring(2, 10) + 
                            Math.random().toString(36).substring(2, 4)
      const finalPassword = values.password || (isEditing ? undefined : randomPassword)

      const submitData: any = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        isActive: values.isActive ?? true,
        avatar: values.avatar || undefined,
        branchId: isEditing ? (staff.branchId || currentUser?.branchId) : currentUser?.branchId,
        role: "STAFF",
      }

      if (finalPassword) {
        submitData.password = finalPassword
      }

      console.log('📤 Submitting staff data:', {
        email: submitData.email,
        hasPassword: !!submitData.password,
        passwordLength: submitData.password?.length
      })

      const result = await onSubmit(submitData)

      if (result.success) {
        // If we generated a password, we need to pass it back to parent to show in modal
        if (!values.password && !isEditing) {
          // This relies on the parent's generatedPassword being set via the result or state
          // But since the parent handles the modal, we just need to make sure the sent data is correct.
          // Note: The parent's onSubmit logic in page.tsx already tries to handle this.
        }
        form.resetFields()
        onSuccess?.()
      }
    } catch (error: any) {
      console.error("Staff form submission error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-2">
      <Row gutter={24}>
        {/* Left Column: Basic Info */}
        <Col span={14}>
          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            Thông tin cơ bản
          </div>
          
          <Form.Item 
            label="Họ tên nhân viên" 
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input prefix={<UserOutlined className="text-slate-400" />} placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                label="Email công việc" 
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" }
                ]}
              >
                <Input prefix={<MailOutlined className="text-slate-400" />} placeholder="staff@aneat.com" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Số điện thoại" 
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại phải có 10-11 chữ số" }
            ]}
          >
            <Input prefix={<PhoneOutlined className="text-slate-400" />} placeholder="0123456789" size="large" maxLength={11} />
          </Form.Item>

          <Divider className="my-6" />

          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <KeyOutlined className="text-amber-500" />
            Bảo mật & Tài khoản
          </div>

          <Form.Item
            label={isEditing ? "Đổi mật khẩu (Để trống nếu không đổi)" : "Mật khẩu truy cập"}
            name="password"
            rules={[
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
            ]}
          >
            <Input.Password prefix={<KeyOutlined className="text-slate-400" />} placeholder={isEditing ? "••••••••" : "Để trống để tạo tự động"} size="large" />
          </Form.Item>
          {!isEditing && (
            <div className="text-xs text-slate-500 mt-[-12px]">
              Nếu để trống, hệ thống sẽ tự động tạo mật khẩu ngẫu nhiên cho nhân viên.
            </div>
          )}
        </Col>

        {/* Right Column: Avatar & Status */}
        <Col span={10}>
          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <CameraOutlined className="text-purple-500" />
            Ảnh đại diện & Trạng thái
          </div>

          <div className="flex flex-col items-center mb-6 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Form.Item shouldUpdate={(prev, curr) => prev.avatar !== curr.avatar || prev.name !== curr.name}>
              {({ getFieldValue }) => {
                const avatar = getFieldValue("avatar")
                const name = getFieldValue("name")
                return (
                  <Avatar 
                    size={100} 
                    src={avatar || null} 
                    icon={<UserOutlined />} 
                    className="shadow-md border-4 border-white"
                  >
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </Avatar>
                )
              }}
            </Form.Item>
            
            <Form.Item 
              name="avatar" 
              className="w-full mt-4 mb-0"
              label={<span className="text-xs text-slate-500">Link ảnh đại diện</span>}
            >
              <Input placeholder="https://example.com/avatar.jpg" size="small" />
            </Form.Item>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Trạng thái làm việc</div>
            <Form.Item name="isActive" valuePropName="checked" className="mb-0">
              <Switch 
                checkedChildren="Đang hoạt động" 
                unCheckedChildren="Đã nghỉ việc"
                className="bg-slate-400"
              />
            </Form.Item>
            <div className="text-xs text-slate-400 mt-2">
              Nhân viên bị vô hiệu hóa sẽ không thể đăng nhập vào hệ thống quản lý.
            </div>
          </div>
        </Col>
      </Row>

      <Divider className="my-6" />

      <div className="flex justify-end gap-3 mt-4">
        <Button size="large" onClick={onSuccess} className="px-8 rounded-xl border-slate-200 text-slate-600 font-medium">
          Hủy bỏ
        </Button>
        <Button 
          type="primary" 
          htmlType="submit" 
          size="large" 
          loading={loading}
          className="px-10 rounded-xl bg-slate-900 hover:bg-slate-800 border-none font-bold shadow-lg shadow-slate-200"
        >
          {isEditing ? "CẬP NHẬT THÔNG TIN" : "THÊM NHÂN VIÊN"}
        </Button>
      </div>
    </Form>
  )
}
