"use client";
import React, { useEffect, useState } from "react";
import { Button, Tag, Spin, Empty, message, Input, Tabs, Dropdown, Modal, Descriptions } from "antd";
import { SearchOutlined, MoreOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ShipmentService, Shipment, ShipmentStatus } from "@/services/shipment.service";

// Định nghĩa màu sắc trạng thái
const STATUS_MAP: Record<ShipmentStatus, { color: string; label: string }> = {
  READY: { color: "blue", label: "Sẵn sàng" },
  IN_TRANSIT: { color: "orange", label: "Đang giao" },
  COMPLETED: { color: "green", label: "Hoàn thành" },
  DELIVERED: { color: "gold", label: "Đã giao" },
  CANCELLED: { color: "red", label: "Hủy" },
};

export default function ShipmentDashboardPage() {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [tab, setTab] = useState<string>("Tất cả");
  const [search, setSearch] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // State cho Modal Detail
  const [detailModal, setDetailModal] = useState(false);
  const [detail, setDetail] = useState<Shipment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const router = useRouter();

  // --- FETCH DATA ---
  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await ShipmentService.getList({
        page: 1,
        limit: 50,
        search: search || undefined,
        sort: "-createdAt",
      });
      setShipments(response.data);
      
      // Tự động chọn đơn đầu tiên nếu chưa chọn
      if (response.data.length > 0 && !selectedId) {
        setSelectedId(response.data[0].id);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchShipments(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // --- ACTIONS ---
  const handleStatusAction = async (shipmentId: string, nextStatus: ShipmentStatus) => {
    try {
      await ShipmentService.updateStatus(shipmentId, nextStatus);
      message.success("Cập nhật trạng thái thành công!");
      
      // Reload list
      fetchShipments();
      
      // Reload detail modal nếu đang mở đúng đơn đó
      if (detailModal && detail && detail.id === shipmentId) {
        loadDetail(shipmentId);
      }
    } catch (error) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const openDetailModal = async (shipmentId: string) => {
    setDetailModal(true);
    // Load dữ liệu mới nhất
    loadDetail(shipmentId);
  };

  const loadDetail = async (shipmentId: string) => {
    setDetailLoading(true);
    try {
      const res = await ShipmentService.getDetail(shipmentId);
      setDetail(res.data);
    } catch (e) {
      message.error("Không thể tải chi tiết đơn hàng");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModal(false);
    setDetail(null);
  };

  // --- FILTER ---
  const filteredShipments = shipments.filter((s) => {
    if (tab === "Tất cả") return true;
    if (tab === "Đang giao") return s.status === "READY" || s.status === "IN_TRANSIT";
    if (tab === "Hoàn thành") return s.status === "COMPLETED" || s.status === "DELIVERED";
    return true;
  });

  // Menu Context (3 chấm)
  const getMenu = (shipment: Shipment) => {
    const items: any[] = [
      { key: "detail", label: "Xem chi tiết", onClick: () => openDetailModal(shipment.id) },
    ];
    if (shipment.status === "READY") {
      items.push({ key: "start", label: "Bắt đầu đi", onClick: () => handleStatusAction(shipment.id, "IN_TRANSIT") });
    }
    if (shipment.status === "IN_TRANSIT") {
      items.push({ key: "finish", label: "Xác nhận giao", onClick: () => handleStatusAction(shipment.id, "DELIVERED") });
    }
    return { items };
  };

  // --- RENDER ---
  return (
    <div className="flex w-full h-full relative">
      {/* ================= CỘT TRÁI: SIDEBAR LIST ================= */}
      <div className="w-[400px] flex-none flex flex-col border-r border-gray-200 bg-white h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        
        {/* 1. Filter Area */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <Input
            placeholder="Tìm mã đơn, địa chỉ..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
            size="large"
            allowClear
          />
          <Tabs
            activeKey={tab}
            onChange={setTab}
            items={[
              { key: "Tất cả", label: "Tất cả" },
              { key: "Đang giao", label: "Đang giao" },
              { key: "Chờ giao", label: "Chờ giao" },
              { key: "Hoàn thành", label: "Lịch sử" },
            ]}
            className="[&_.ant-tabs-nav]:mb-0"
          />
        </div>

        {/* 2. List Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-3 scroll-smooth">
          {loading ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : filteredShipments.length === 0 ? (
            <Empty description="Không tìm thấy đơn hàng" className="mt-10" />
          ) : (
            <div className="space-y-3">
              {filteredShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  onClick={() => {
                    setSelectedId(shipment.id);
                  }}
                  // Khi double click thì mở modal chi tiết (tuỳ chọn UX)
                  onDoubleClick={() => openDetailModal(shipment.id)}
                  className={`
                    group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md
                    ${selectedId === shipment.id 
                      ? "bg-white border-[#ff6600] shadow-md ring-1 ring-[#ff6600]" 
                      : "bg-white border-gray-200 hover:border-orange-200"
                    }
                  `}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800 line-clamp-1">{shipment.productName}</span>
                    <Tag color={STATUS_MAP[shipment.status]?.color || 'default'} className="mr-0">
                      {STATUS_MAP[shipment.status]?.label}
                    </Tag>
                  </div>

                  {/* Card Info */}
                  <div className="text-sm text-gray-500 space-y-1.5 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">#{shipment.shipmentNumber}</span>
                      {shipment.priority && <Tag color="red" className="m-0 text-[10px] leading-4 h-5 px-1">Ưu tiên</Tag>}
                    </div>
                    <div className="flex items-start gap-2">
                      <EnvironmentOutlined className="mt-1 text-gray-400" />
                      <span className="line-clamp-2">{shipment.toLocation}</span>
                    </div>
                  </div>

                  {/* Actions (Menu 3 chấm) */}
                  <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dropdown menu={getMenu(shipment)} trigger={['click']}>
                       <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= CỘT PHẢI: MAP ================= */}
      <div className="flex-1 flex flex-col relative bg-gray-100">
        {selectedId ? (
            <div className="w-full h-full flex items-center justify-center relative">
               <div className="text-center p-8">
                 <h2 className="text-2xl font-bold text-gray-700 mb-2">Bản đồ giao hàng</h2>
                 <p className="text-gray-500">Đang hiển thị lộ trình cho đơn: <span className="font-mono font-bold">{selectedId}</span></p>
                 <div className="mt-4 p-4 bg-white rounded shadow-sm inline-block">
                    (Vị trí Map Component full chiều cao)
                 </div>
                 {/* Nút mở chi tiết trên map */}
                 <div className="mt-4">
                    <Button onClick={() => openDetailModal(selectedId)}>Xem chi tiết đơn hàng</Button>
                 </div>
               </div>
               
               <div className="absolute bottom-8 right-8 space-y-2 flex flex-col">
                  <Button type="primary" size="large" className="shadow-lg bg-[#ff6600]">
                    Chỉ đường
                  </Button>
               </div>
            </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
             <EnvironmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
             <p>Chọn một đơn hàng để xem lộ trình</p>
          </div>
        )}
      </div>

      {/* ================= MODAL DETAIL (Nằm ngoài vòng lặp) ================= */}
      <Modal
        open={detailModal}
        onCancel={closeDetailModal}
        title={detail ? `Chi tiết đơn hàng #${detail.shipmentNumber}` : 'Đang tải...'}
        footer={[
           <Button key="back" onClick={closeDetailModal}>Đóng</Button>,
           detail?.status === 'READY' && (
             <Button key="start" type="primary" onClick={() => handleStatusAction(detail.id, 'IN_TRANSIT')}>
               Bắt đầu giao
             </Button>
           ),
           detail?.status === 'IN_TRANSIT' && (
             <Button key="deliver" type="primary" onClick={() => handleStatusAction(detail.id, 'DELIVERED')}>
               Xác nhận đã giao
             </Button>
           ),
           detail?.status === 'DELIVERED' && (
              <Button key="complete" type="primary" className="bg-green-600" onClick={() => handleStatusAction(detail.id, 'COMPLETED')}>
                Hoàn thành
              </Button>
           )
        ]}
        width={600}
        centered
      >
        {detailLoading || !detail ? (
          <div className="flex justify-center items-center py-10"><Spin /></div>
        ) : (
          <div className="space-y-4">
             {/* SỬA LỖI Ở DÒNG DƯỚI ĐÂY: Dùng styles={{ label: ... }} thay vì labelStyle */}
             <Descriptions 
                column={1} 
                bordered 
                size="small" 
                styles={{ label: { width: '140px', fontWeight: '500' } }}
             >
              <Descriptions.Item label="Sản phẩm">{detail.productName}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={STATUS_MAP[detail.status]?.color}>{STATUS_MAP[detail.status]?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn">{detail.shipmentNumber}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">{detail.quantity}</Descriptions.Item>
              <Descriptions.Item label="Nhiệt độ">{detail.temperature || 'Không yêu cầu'}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                <span className="text-red-500 font-medium">{detail.notes || 'Không có'}</span>
              </Descriptions.Item>
            </Descriptions>

            {/* Thông tin địa điểm & thời gian */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Descriptions column={1} size="small" layout="horizontal">
                    <Descriptions.Item label="Từ kho">{detail.fromLocation}</Descriptions.Item>
                    <Descriptions.Item label="Đến địa chỉ">{detail.toLocation}</Descriptions.Item>
                    <Descriptions.Item label="Chi nhánh">{detail.branch?.name}</Descriptions.Item>
                    <Descriptions.Item label="Người nhận">{detail.assignedTo?.name || '---'}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian tạo">
                        {detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : ''}
                    </Descriptions.Item>
                </Descriptions>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}