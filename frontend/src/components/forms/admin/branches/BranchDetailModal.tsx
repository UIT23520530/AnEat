"use client"

import { Modal, Descriptions, Space, Avatar, Tag, Button, Tooltip } from "antd"
import {
  EnvironmentOutlined,
  UserOutlined,
  DollarOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons"

interface Branch {
  id: string
  code: string
  name: string
  address: string
  phone: string
  email?: string
  isActive: boolean
  managerId?: string | null
  manager?: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
  } | null
  createdAt: string
  updatedAt: string
  _count?: {
    staff: number
    products: number
    orders: number
    tables: number
  }
}

interface BranchStats {
  branchId: string
  staffCount: number
  productCount: number
  orderCount: number
  totalRevenue: number
}

interface BranchDetailModalProps {
  branch: Branch | null
  stats: BranchStats | null
  isOpen: boolean
  onClose: () => void
  onNavigateToUsers?: (branchId: string) => void
  onNavigateToProducts?: (branchId: string) => void
}

export function BranchDetailModal({
  branch,
  stats,
  isOpen,
  onClose,
  onNavigateToUsers,
  onNavigateToProducts,
}: BranchDetailModalProps) {
  if (!branch) return null

  return (
    <Modal
      title={
        <span>
          Chi tiết chi nhánh - <Tag className="ml-2 -translate-y-0.5">{branch.code}</Tag>
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={850}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Tên chi nhánh" span={2}>
          <span className="font-medium">{branch.name}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          <EnvironmentOutlined className="mr-2" />
          {branch.address}
        </Descriptions.Item>
        <Descriptions.Item label="Quản lý" span={2}>
          {branch.manager ? (
            <Space>
              <Avatar src={branch.manager.avatar} icon={<UserOutlined />} size="small" />
              <div>
                <div className="text-sm font-medium">{branch.manager.name}</div>
                <div className="text-xs text-slate-500">{branch.manager.email}</div>
              </div>
            </Space>
          ) : (
            <span className="text-slate-400">Chưa có</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Doanh thu" span={2}>
          {stats ? (
            <span className="font-medium text-slate-900">
              <DollarOutlined className="mr-2" />
              {new Intl.NumberFormat("vi-VN").format(stats.totalRevenue)} ₫
            </span>
          ) : (
            <span className="text-slate-400">Đang tải...</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          <PhoneOutlined className="mr-2" />
          {branch.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          <MailOutlined className="mr-2" />
          {branch.email || "Chưa có"}
        </Descriptions.Item>
        <Descriptions.Item label="Nhân viên">
          <Space>
            <Tag icon={<TeamOutlined />} color="blue">
              {branch._count?.staff || 0}
            </Tag>
            {onNavigateToUsers && (
              <Tooltip title="Xem nhân viên chi nhánh">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => onNavigateToUsers(branch.id)}
                />
              </Tooltip>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Sản phẩm">
          <Space>
            <Tag icon={<ShoppingOutlined />} color="green">
              {branch._count?.products || 0}
            </Tag>
            {onNavigateToProducts && (
              <Tooltip title="Xem sản phẩm chi nhánh">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => onNavigateToProducts(branch.id)}
                />
              </Tooltip>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Bàn ăn">
          <Tag color="cyan">{branch._count?.tables || 0}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Đơn hàng">
          <Tag icon={<FileTextOutlined />} color="orange">
            {branch._count?.orders || 0}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={branch.isActive ? "success" : "error"}>
            {branch.isActive ? "Hoạt động" : "Vô hiệu hóa"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {new Date(branch.createdAt).toLocaleDateString("vi-VN")}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật lần cuối" span={2}>
          {new Date(branch.updatedAt).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}
