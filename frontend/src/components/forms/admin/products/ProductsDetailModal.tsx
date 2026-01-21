"use client"

import { Modal, Descriptions, Tag, Image, Space, Typography, Row, Col } from "antd"
import {
  CheckCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  TagOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  DashboardOutlined,
  FieldTimeOutlined
} from "@ant-design/icons"
import { Product } from "@/services/admin-product.service"

const { Text } = Typography

interface ProductsDetailModalProps {
  product: Product | null
  open: boolean
  onCancel: () => void
}

export default function ProductsDetailModal({
  product,
  open,
  onCancel,
}: ProductsDetailModalProps) {
  if (!product) return null

  return (
    <Modal
      title={
        <Space>
          <AppstoreOutlined className="text-blue-500" />
          <span>Chi tiết sản phẩm: {product.name}</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
    >
      <div className="py-2">
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="object-cover"
                    fallback="https://via.placeholder.com/300?text=No+Image"
                  />
                ) : (
                  <AppstoreOutlined className="text-6xl text-gray-300" />
                )}
              </div>
              <Tag color={product.isAvailable ? "success" : "error"} className="px-3 py-1 rounded-full text-sm font-medium">
                {product.isAvailable ? "Đang kinh doanh" : "Đã tạm ẩn"}
              </Tag>
            </div>
          </Col>
          <Col span={16}>
            <Descriptions
              column={2}
              bordered
              size="small"
              styles={{ label: { fontWeight: 600, backgroundColor: "#fafafa" } }}
            >
              <Descriptions.Item label="Mã sản phẩm" span={2}>
                <Text copyable={{ text: product.code }}>
                  <Tag color="processing">{product.code}</Tag>
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tên sản phẩm" span={2}>
                <Text strong>{product.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                <Tag color="cyan">{product.category?.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán">
                <Text type="danger" strong>
                  {product.price.toLocaleString("vi-VN")}đ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho">
                <Space>
                  <DashboardOutlined />
                  <Text>{product.quantity} sản phẩm</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Giá vốn">
                <Text>
                  {product.costPrice ? product.costPrice.toLocaleString("vi-VN") + "đ" : "N/A"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian chuẩn bị" span={2}>
                <Space>
                  <FieldTimeOutlined />
                  <Text>{product.prepTime} phút</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={2}>
                <Space>
                  <CalendarOutlined className="text-gray-400" />
                  <Text>{new Date(product.createdAt).toLocaleDateString("vi-VN", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                <div className="max-h-32 overflow-y-auto">
                  {product.description ? (
                    <Text italic className="text-gray-600">{product.description}</Text>
                  ) : (
                    <Text disabled>Chưa có mô tả cho sản phẩm này</Text>
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
