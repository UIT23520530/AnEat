"use client"

import { Form, Input, Select, Switch, message, Tooltip, Divider } from "antd"
import { ShopOutlined, UserOutlined, MailOutlined, PhoneOutlined, CopyOutlined, KeyOutlined, CheckCircleOutlined } from "@ant-design/icons"
import { useEffect } from "react"
import { User, UserRole } from "@/services/admin-user.service"
import { Branch } from "@/services/admin-branch.service"

interface UsersFormProps {
  form: any
  onFinish: (values: any) => void
  isEdit?: boolean
  selectedUser?: User | null
  branches: Branch[]
  users?: User[] 
}

export default function UsersForm({
  form,
  onFinish,
  isEdit = false,
  selectedUser,
  branches,
  users = [],
}: UsersFormProps) {
  useEffect(() => {
    if (isEdit && selectedUser) {
      form.setFieldsValue({
        name: selectedUser.name,
        phone: selectedUser.phone,
        email: selectedUser.email,
        role: selectedUser.role,
        branchId: selectedUser.branchId || selectedUser.managedBranches?.id || null,
        isActive: selectedUser.isActive,
        _initialIsActive: selectedUser.isActive,
        password: "", // Reset password field on edit
      })
    } else if (!isEdit) {
      form.resetFields()
      form.setFieldsValue({ isActive: false, role: "STAFF" })
    }
  }, [isEdit, selectedUser, form])

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            Thông tin cơ bản
          </div>
          <Form.Item 
            label="Email" 
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item 
            label="Họ tên" 
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item 
            label="Số điện thoại" 
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại phải có đúng 10 chữ số" }
            ]}
          >
            <Input placeholder="0123456789" maxLength={10} />
          </Form.Item>
          
          <Divider className="my-4" />
          
          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <KeyOutlined className="text-amber-500" />
            {isEdit ? "Đổi mật khẩu (Tùy chọn)" : "Mật khẩu"}
          </div>
          <Form.Item
            name="password"
            rules={[
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
            ]}
          >
            <Input.Password 
              placeholder={isEdit ? "Nhập mật khẩu mới nếu muốn thay đổi" : "Để trống để tạo tự động"} 
              autoComplete="new-password"
            />
          </Form.Item>
          {!isEdit && (
            <div className="text-xs text-slate-500 mt-[-12px]">
              Nếu để trống, hệ thống sẽ tự động tạo mật khẩu ngẫu nhiên.
            </div>
          )}
          {isEdit && (
            <div className="text-xs text-slate-500 mt-[-12px]">
              Để trống nếu không muốn thay đổi mật khẩu hiện tại.
            </div>
          )}
        </div>
        
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <ShopOutlined className="text-purple-500" />
            Phân quyền & Công tác
          </div>
          <Form.Item 
            label="Vai trò" 
            name="role" 
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select
              placeholder="Chọn vai trò"
              options={[
                { label: "Quản trị hệ thống", value: "ADMIN_SYSTEM" },
                { label: "Quản lý chi nhánh", value: "ADMIN_BRAND" },
                { label: "Nhân viên", value: "STAFF" },
                { label: "Nhân viên logistics", value: "LOGISTICS_STAFF" },
              ]}
              onChange={(value) => {
                if (value === "ADMIN_SYSTEM") {
                  form.setFieldsValue({ branchId: null })
                }
              }}
            />
          </Form.Item>
          
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role || prev.isActive !== curr.isActive || prev.branchId !== curr.branchId}>
            {({ getFieldValue, setFieldsValue }) => {
              const currentRole = getFieldValue("role")
              const branchId = getFieldValue("branchId")
              const isActive = getFieldValue("isActive")
              
              if (currentRole === "ADMIN_SYSTEM") return null
              
              const availableBranches = currentRole === "ADMIN_BRAND"
                ? branches.filter(b => !b.managerId || (isEdit && b.managerId === selectedUser?.id))
                : branches

              return (
                <>
                  <Form.Item name="branchId" label="Chi nhánh">
                    <Select
                      showSearch
                      allowClear
                      placeholder={currentRole === "ADMIN_BRAND" ? "Chọn chi nhánh quản lý" : "Chọn chi nhánh công tác"}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={availableBranches.map((b) => ({
                        value: b.id,
                        label: `${b.name} (${b.code})`,
                      }))}
                      notFoundContent={
                        currentRole === "ADMIN_BRAND" ? (
                          <div className="text-center text-slate-500 py-2">
                            <ShopOutlined className="mr-2" />
                            Tất cả chi nhánh đã có quản lý
                          </div>
                        ) : null
                      }
                      onChange={(value) => {
                        const wasActive = getFieldValue("_initialIsActive")
                        const currentActive = getFieldValue("isActive")
                        if (!value && currentActive && (isEdit ? wasActive : true)) {
                          setFieldsValue({ isActive: false })
                          message.info("Đã tự động vô hiệu hóa người dùng")
                        }
                      }}
                    />
                  </Form.Item>
                  {currentRole === "ADMIN_BRAND" && (
                    <div className="text-xs text-blue-600 mb-2">
                      {isEdit 
                        ? "Chỉ hiển thị chi nhánh chưa có quản lý hoặc do người dùng này quản lý"
                        : "Chỉ hiển thị chi nhánh chưa có quản lý"}
                    </div>
                  )}
                </>
              )
            }}
          </Form.Item>

          <Divider className="my-4" />
          
          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <CheckCircleOutlined className="text-green-500" />
            Trạng thái tài khoản
          </div>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.branchId !== curr.branchId || prev.role !== curr.role || prev.isActive !== curr.isActive}>
            {({ getFieldValue, setFieldsValue }) => {
              const currentRole = getFieldValue("role")
              const branchId = getFieldValue("branchId")
              
              return (
                <>
                  <Form.Item name="isActive" valuePropName="checked">
                    <Switch 
                      checkedChildren="Hoạt động" 
                      unCheckedChildren="Vô hiệu hóa"
                      disabled={currentRole !== "ADMIN_SYSTEM" && !branchId}
                      onChange={(checked) => {
                        if (checked && currentRole === "ADMIN_SYSTEM") {
                          const activeAdmins = users.filter(u => u.role === "ADMIN_SYSTEM" && u.isActive && (isEdit ? u.id !== selectedUser?.id : true))
                          if (activeAdmins.length > 0) {
                            message.error(`Chỉ được phép một Admin Hệ thống hoạt động`)
                            setFieldsValue({ isActive: false })
                          }
                        }
                      }}
                    />
                  </Form.Item>
                  {currentRole !== "ADMIN_SYSTEM" && !branchId && (
                    <div className="text-xs text-amber-600">
                      Cần gán chi nhánh trước khi kích hoạt tài khoản
                    </div>
                  )}
                </>
              )
            }}
          </Form.Item>
        </div>
      </div>
    </Form>
  )
}
