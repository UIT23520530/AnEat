import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";
import type { WarehouseRequest } from "@/services/admin-warehouse.service";

interface RequestDetailModalProps {
    open: boolean;
    request: WarehouseRequest | null;
    onCancel: () => void;
}

export const RequestDetailModal = ({
    open,
    request,
    onCancel,
}: RequestDetailModalProps) => {
    if (!request) return null;

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            PENDING: { color: "default", text: "Chờ duyệt" },
            APPROVED: { color: "success", text: "Đã duyệt" },
            REJECTED: { color: "error", text: "Từ chối" },
            COMPLETED: { color: "blue", text: "Hoàn thành" },
            CANCELLED: { color: "default", text: "Đã hủy" },
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getTypeText = (type: string) => {
        const types: Record<string, string> = {
            RESTOCK: "Nhập hàng",
            ADJUSTMENT: "Điều chỉnh",
            RETURN: "Trả hàng",
        };
        return types[type] || type;
    };

    return (
        <Modal
            title="Chi tiết yêu cầu"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã yêu cầu" span={2}>
                    <Tag color="blue">{request.requestNumber}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Chi nhánh" span={2}>
                    {request.branch.name} ({request.branch.code})
                </Descriptions.Item>
                <Descriptions.Item label="Sản phẩm" span={2}>
                    <div className="flex items-center gap-2">
                        {request.product.image && (
                            <img
                                src={request.product.image}
                                alt={request.product.name}
                                className="w-12 h-12 rounded object-cover"
                            />
                        )}
                        <div>
                            <div className="font-medium">{request.product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {request.product.code}</div>
                        </div>
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Loại yêu cầu">
                    {getTypeText(request.type)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    {getStatusTag(request.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng yêu cầu">
                    {request.requestedQuantity}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng duyệt">
                    {request.approvedQuantity || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày yêu cầu">
                    {request.requestedDate
                        ? dayjs(request.requestedDate).format("DD/MM/YYYY HH:mm")
                        : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày dự kiến">
                    {request.expectedDate
                        ? dayjs(request.expectedDate).format("DD/MM/YYYY")
                        : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Người yêu cầu" span={2}>
                    {request.requestedBy.name} ({request.requestedBy.email})
                </Descriptions.Item>
                {request.approvedBy && (
                    <Descriptions.Item label="Người duyệt" span={2}>
                        {request.approvedBy.name} ({request.approvedBy.email})
                    </Descriptions.Item>
                )}
                {request.shipments && request.shipments.length > 0 && (
                    <Descriptions.Item label="Nhân viên logistics" span={2}>
                        <div className="space-y-2">
                            {request.shipments.map((shipment: any) => (
                                <div key={shipment.id} className="flex items-center gap-2">
                                    <Tag color="green">{shipment.shipmentNumber}</Tag>
                                    <span>
                                        {shipment.assignedTo?.name || "Chưa giao"}
                                        {shipment.assignedTo?.email && ` (${shipment.assignedTo.email})`}
                                        {shipment.assignedTo?.phone && ` - ${shipment.assignedTo.phone}`}
                                    </span>
                                    <Tag color={shipment.status === "DELIVERED" ? "blue" : "orange"}>
                                        {shipment.status}
                                    </Tag>
                                </div>
                            ))}
                        </div>
                    </Descriptions.Item>
                )}
                {request.notes && (
                    <Descriptions.Item label="Ghi chú" span={2}>
                        {request.notes}
                    </Descriptions.Item>
                )}
                {request.rejectedReason && (
                    <Descriptions.Item label="Lý do từ chối" span={2}>
                        <span className="text-red-500">{request.rejectedReason}</span>
                    </Descriptions.Item>
                )}
            </Descriptions>
        </Modal>
    );
};
