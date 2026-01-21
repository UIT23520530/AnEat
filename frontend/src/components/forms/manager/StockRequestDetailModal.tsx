"use client"

import { Modal, Descriptions, Tag, Space, Button, Divider, Typography, Timeline } from "antd"
import { StockRequest } from "@/services/stock-request.service"
import dayjs from "dayjs"
import {
    InboxOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    UserOutlined,
    SolutionOutlined
} from "@ant-design/icons"

const { Text, Title } = Typography

interface StockRequestDetailModalProps {
    open: boolean
    onCancel: () => void
    request: StockRequest | null
}

export default function StockRequestDetailModal({
    open,
    onCancel,
    request,
}: StockRequestDetailModalProps) {
    if (!request) return null

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PENDING":
                return { color: "warning", text: "Chờ duyệt", icon: <ClockCircleOutlined /> }
            case "APPROVED":
                return { color: "processing", text: "Đã duyệt", icon: <CheckCircleOutlined /> }
            case "COMPLETED":
                return { color: "success", text: "Hoàn thành", icon: <CheckCircleOutlined /> }
            case "REJECTED":
                return { color: "error", text: "Bị từ chối", icon: <CloseCircleOutlined /> }
            case "CANCELLED":
                return { color: "default", text: "Đã hủy", icon: <CloseCircleOutlined /> }
            default:
                return { color: "default", text: status, icon: null }
        }
    }

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            RESTOCK: "Nhập hàng",
            ADJUSTMENT: "Điều chỉnh",
            RETURN: "Trả hàng",
        }
        return types[type] || type
    }

    const statusConfig = getStatusConfig(request.status)

    return (
        <Modal
            title={
                <Space>
                    <SolutionOutlined className="text-blue-500" />
                    <span>Chi tiết yêu cầu: {request.requestNumber}</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Đóng
                </Button>
            ]}
            width={700}
            centered
        >
            <div className="py-2">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                            {request.product.image ? (
                                <img src={request.product.image} alt={request.product.name} className="w-full h-full object-cover" />
                            ) : (
                                <InboxOutlined className="text-3xl text-gray-300" />
                            )}
                        </div>
                        <div>
                            <Title level={4} className="mb-1">{request.product.name}</Title>
                            <Text type="secondary">SKU: {request.product.code}</Text>
                            <div className="mt-1">
                                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                                    {statusConfig.text}
                                </Tag>
                                <Tag color="blue">{getTypeLabel(request.type)}</Tag>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <Text type="secondary">Số lượng yêu cầu</Text>
                        <div className="text-2xl font-bold text-blue-600">{request.requestedQuantity}</div>
                    </div>
                </div>

                <Descriptions bordered column={2} size="small" styles={{ label: { fontWeight: 600, width: '120px' } }}>
                    <Descriptions.Item label="Mã yêu cầu" span={2}>
                        <Text strong>{request.requestNumber}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày yêu cầu">
                        <Space><CalendarOutlined className="text-gray-400" /> {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}</Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày dự kiến">
                        <Space><CalendarOutlined className="text-gray-400" /> {request.expectedDate ? dayjs(request.expectedDate).format("DD/MM/YYYY") : "-"}</Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người yêu cầu">
                        <Space><UserOutlined className="text-gray-400" /> {request.requestedBy.name}</Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng thực nhận">
                        <Text strong>{request.approvedQuantity ?? "-"}</Text>
                    </Descriptions.Item>

                    {request.status === "REJECTED" && (
                        <Descriptions.Item label="Lý do từ chối" span={2}>
                            <Text type="danger">{request.rejectedReason || "Không có lý do chi tiết"}</Text>
                        </Descriptions.Item>
                    )}

                    {request.status === "CANCELLED" && request.rejectedReason && (
                        <Descriptions.Item label="Lý do hủy" span={2}>
                            <Text type="warning">{request.rejectedReason}</Text>
                        </Descriptions.Item>
                    )}

                    {request.status === "CANCELLED" && request.approvedBy && (
                        <Descriptions.Item label="Người hủy" span={2}>
                            <Space>
                                <UserOutlined className="text-gray-400" />
                                <Text>{request.approvedBy.name}</Text>
                                <Tag color="red">{request.approvedBy.role === 'ADMIN_BRAND' ? 'Quản lý' : 'Admin'}</Tag>
                            </Space>
                        </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Ghi chú" span={2}>
                        {request.notes || "Không có ghi chú"}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left" plain>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Trạng thái xử lý</Text>
                </Divider>

                <div className="px-4">
                    <Timeline
                        items={[
                            {
                                color: 'blue',
                                children: (
                                    <div>
                                        <Text strong>Tạo yêu cầu</Text>
                                        <div className="text-xs text-gray-400">{dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}</div>
                                    </div>
                                ),
                            },
                            ...(request.status === 'APPROVED' || request.status === 'COMPLETED' ? [
                                {
                                    color: 'green',
                                    children: (
                                        <div>
                                            <Text strong>Đã phê duyệt</Text>
                                            {request.approvedBy && <div className="text-xs text-gray-500">Bởi: {request.approvedBy.name}</div>}
                                        </div>
                                    ),
                                }
                            ] : []),
                            ...(request.status === 'REJECTED' ? [
                                {
                                    color: 'red',
                                    children: (
                                        <div>
                                            <Text strong>Đã từ chối</Text>
                                            {request.rejectedReason && <div className="text-xs text-red-400">{request.rejectedReason}</div>}
                                        </div>
                                    ),
                                }
                            ] : []),
                            ...(request.status === 'CANCELLED' ? [
                                {
                                    color: 'gray',
                                    children: (
                                        <div>
                                            <Text strong>Đã hủy</Text>
                                            {request.approvedBy && (
                                                <div className="text-xs text-gray-500">
                                                    Bởi: {request.approvedBy.name} ({request.approvedBy.role === 'ADMIN_BRAND' ? 'Quản lý' : 'Admin'})
                                                </div>
                                            )}
                                            {request.rejectedReason && (
                                                <div className="text-xs text-orange-500 mt-1">
                                                    Lý do: {request.rejectedReason}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-400">{dayjs(request.updatedAt).format("DD/MM/YYYY HH:mm")}</div>
                                        </div>
                                    ),
                                }
                            ] : []),
                            ...(request.status === 'COMPLETED' ? [
                                {
                                    color: 'green',
                                    children: (
                                        <div>
                                            <Text strong>Hoàn thành nhập kho</Text>
                                            <div className="text-xs text-gray-400">{request.completedDate ? dayjs(request.completedDate).format("DD/MM/YYYY HH:mm") : ""}</div>
                                        </div>
                                    ),
                                }
                            ] : []),
                        ]}
                    />
                </div>
            </div>
        </Modal>
    )
}
