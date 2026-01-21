"use client"

import { Modal, Descriptions, Space, Avatar, Tag, Button } from "antd"
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { User, UserRole } from "@/services/admin-user.service"

interface UsersDetailModalProps {
  user: User | null
  open: boolean
  onCancel: () => void
}

const roleLabels: Record<UserRole, string> = {
  ADMIN_SYSTEM: "Admin Hệ thống",
  ADMIN_BRAND: "Quản lý Chi nhánh",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
  LOGISTICS_STAFF: "Nhân viên Logistics",
}

const roleColors: Record<UserRole, string> = {
  ADMIN_SYSTEM: "red",
  ADMIN_BRAND: "purple",
  STAFF: "blue",
  CUSTOMER: "green",
  LOGISTICS_STAFF: "orange",
}

export default function UsersDetailModal({ user, open, onCancel }: UsersDetailModalProps) {
  const router = useRouter()

  if (!user) return null

  return (
    <Modal
      title={user && (<span>Chi tiết người dùng</span>)}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={850}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Họ và tên" span={2}>
          <Space>
            <Avatar src={user.avatar} icon={<UserOutlined />} />
            <strong>{user.name}</strong>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          <MailOutlined className="mr-2" />
          {user.email}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          <PhoneOutlined className="mr-2" />
          {user.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Vai trò">
          <Tag color={roleColors[user.role]}>{roleLabels[user.role]}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={user.isActive ? "success" : "error"}>
            {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Chi nhánh làm việc" span={2}>
          {user.branch ? (
            <Space>
              <div>
                <div className="font-medium">{user.branch.name}</div>
                <div className="text-xs text-slate-500">{user.branch.code}</div>
              </div>
              <Button
                type="link"
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  onCancel()
                  router.push(`/admin/branches?branchId=${user.branch?.id}`)
                }}
              >
                Xem chi tiết chi nhánh
              </Button>
            </Space>
          ) : user.managedBranches ? (
            <Space>
              <Tag color="purple" icon={<ShopOutlined />}>
                Quản lý: {user.managedBranches.name} ({user.managedBranches.code})
              </Tag>
              <Button
                type="link"
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  onCancel()
                  router.push(`/admin/branches?branchId=${user.managedBranches?.id}`)
                }}
              >
                Xem chi tiết chi nhánh
              </Button>
            </Space>
          ) : user.role === "ADMIN_SYSTEM" ? (
            <span className="text-slate-500 italic">Không yêu cầu chi nhánh</span>
          ) : (
            <span className="text-slate-400">Chưa được gán chi nhánh</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Đăng nhập lần cuối">
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleString("vi-VN")
            : "Chưa đăng nhập"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}
