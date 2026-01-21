"use client"

import { Modal, Descriptions, Tag, Space } from "antd"
import { CrownOutlined, TrophyOutlined, StarOutlined, UserOutlined } from "@ant-design/icons"
import { Customer, CustomerTier } from "@/services/admin-customer.service"

interface CustomersDetailModalProps {
  customer: Customer | null
  open: boolean
  onCancel: () => void
}

export default function CustomersDetailModal({
  customer,
  open,
  onCancel,
}: CustomersDetailModalProps) {
  // Get tier color
  const getTierColor = (tier: CustomerTier) => {
    switch (tier) {
      case "VIP":
        return "purple"
      case "GOLD":
        return "gold"
      case "SILVER":
        return "blue"
      case "BRONZE":
        return "orange"
      default:
        return "default"
    }
  }

  // Get tier icon
  const getTierIcon = (tier: CustomerTier) => {
    switch (tier) {
      case "VIP":
        return <CrownOutlined />
      case "GOLD":
        return <TrophyOutlined />
      case "SILVER":
        return <StarOutlined />
      default:
        return <UserOutlined />
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  return (
    <Modal
      title="Chi tiết khách hàng"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {customer && (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên" span={2}>
            {customer.name}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {customer.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {customer.email || "Chưa có"}
          </Descriptions.Item>
          <Descriptions.Item label="Hạng">
            <Tag color={getTierColor(customer.tier)} icon={getTierIcon(customer.tier)}>
              {customer.tier}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Điểm tích lũy">
            <span className="text-orange-600 font-semibold">
              {customer.points.toLocaleString()}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng chi tiêu" span={2}>
            <span className="font-semibold">
              {formatCurrency(customer.totalSpent)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Số đơn hàng">
            {customer._count?.orders || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Số đánh giá">
            {customer._count?.reviews || 0}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  )
}
