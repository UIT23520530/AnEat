"use client"

import { Modal, Descriptions, Tag, Image, Space, Typography, Row, Col } from "antd"
import {
  CheckCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  TagOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ClockCircleOutlined
} from "@ant-design/icons"
import { Category } from "@/services/admin-category.service"

const { Text } = Typography

interface CategoriesDetailModalProps {
  category: Category | null
  open: boolean
  onCancel: () => void
}

export default function CategoriesDetailModal({
  category,
  open,
  onCancel,
}: CategoriesDetailModalProps) {
  if (!category) return null

  return (
    <Modal
      title={
        <Space>
          <TagOutlined className="text-blue-500" />
          <span>Chi tiết danh mục: {category.name}</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
    >
      <div className="py-2">
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    className="object-cover"
                    fallback="https://via.placeholder.com/300?text=No+Image"
                  />
                ) : (
                  <AppstoreOutlined className="text-6xl text-gray-300" />
                )}
              </div>
              <Tag color={category.isActive ? "success" : "error"} className="px-3 py-1 rounded-full text-sm font-medium">
                {category.isActive ? "Đang hiển thị" : "Đã ẩn"}
              </Tag>
            </div>
          </Col>
          <Col span={16}>
            <Descriptions
              column={1}
              bordered
              size="small"
              styles={{ label: { width: "140px", fontWeight: 600, backgroundColor: "#fafafa" } }}
            >
              <Descriptions.Item label="Mã danh mục">
                <Text copyable={{ text: category.code }}>
                  <Tag color="processing">{category.code}</Tag>
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tên danh mục">
                <Text strong>{category.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số sản phẩm">
                <Space>
                  <AppstoreOutlined className="text-blue-500" />
                  <Text>{category.productCount} sản phẩm</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                <Space>
                  <CalendarOutlined className="text-gray-400" />
                  <Text>{new Date(category.createdAt).toLocaleDateString("vi-VN", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                <Space>
                  <ClockCircleOutlined className="text-gray-400" />
                  <Text>{new Date(category.updatedAt).toLocaleDateString("vi-VN", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                <div className="max-h-32 overflow-y-auto">
                  {category.description ? (
                    <Text italic className="text-gray-600">{category.description}</Text>
                  ) : (
                    <Text disabled>Chưa có mô tả cho danh mục này</Text>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </div>
    </Modal>
  )
}

