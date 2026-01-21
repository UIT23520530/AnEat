"use client";

import React, { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layouts/manager-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Spin,
  Select,
  Tabs,
  App,
  Typography,
  Modal
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { stockRequestService, type StockRequest } from "@/services/stock-request.service";
import { staffWarehouseService, type InventoryItemDTO } from "@/services/staff-warehouse.service";
import { managerCategoryService } from "@/services/manager-category.service";
import { type Category } from "@/services/admin-category.service";
import dayjs from "dayjs";
import StockRequestFormModal from "@/components/forms/manager/StockRequestFormModal";
import StockRequestDetailModal from "@/components/forms/manager/StockRequestDetailModal";

const { Search } = Input;
const { Text } = Typography;

function WarehouseContent() {
  const { message } = App.useApp();

  // States
  const [activeTab, setActiveTab] = useState("inventory");
  const [products, setProducts] = useState<InventoryItemDTO[]>([]);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal states
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItemDTO | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<StockRequest | null>(null);

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await managerCategoryService.getCategories({
        page: 1,
        limit: 100,
      });
      setCategories(response.data);
    } catch (error: any) {
      console.error("Failed to load categories:", error);
    }
  };

  // Load products (inventory)
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await staffWarehouseService.getInventoryList({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      });

      setProducts(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.total_items,
      }));
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Load stock requests
  const loadStockRequests = async () => {
    try {
      setLoading(true);
      const response = await stockRequestService.getStockRequests({
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      });

      setStockRequests(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.totalItems,
      }));
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await stockRequestService.getStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      console.error("Failed to load statistics:", error);
    }
  };

  useEffect(() => {
    loadStatistics();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "inventory") {
      loadProducts();
    } else if (activeTab === "requests") {
      loadStockRequests();
    }
  }, [activeTab, pagination.current, pagination.pageSize, searchQuery, statusFilter, categoryFilter]);

  // Handlers
  const handleOpenRequestForm = (product: InventoryItemDTO | null = null) => {
    setSelectedProduct(product);
    setEditingRequest(null);
    setIsRequestFormOpen(true);
  };

  const handleOpenEditRequest = (request: StockRequest) => {
    setEditingRequest(request);
    setSelectedProduct(null);
    setIsRequestFormOpen(true);
  };

  const handleViewRequest = (request: StockRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleCancelRequest = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận hủy yêu cầu",
      content: (
        <div>
          <p className="mb-2">Bạn có chắc chắn muốn hủy yêu cầu này?</p>
          <Input.TextArea
            id="cancel-reason-input"
            placeholder="Nhập lý do hủy yêu cầu (bắt buộc)"
            rows={3}
            maxLength={200}
          />
        </div>
      ),
      okText: "Xác nhận hủy",
      cancelText: "Đóng",
      okType: "danger",
      onOk: async () => {
        const reasonInput = document.getElementById("cancel-reason-input") as HTMLTextAreaElement;
        const reason = reasonInput?.value?.trim();
        
        if (!reason) {
          message.error("Vui lòng nhập lý do hủy");
          return Promise.reject();
        }

        try {
          await stockRequestService.cancelStockRequest(id, reason);
          message.success("Hủy yêu cầu thành công");
          loadStockRequests();
          loadStatistics();
        } catch (error: any) {
          message.error(error.response?.data?.message || "Không thể hủy yêu cầu");
          return Promise.reject();
        }
      },
    });
  };

  // Status and Style helpers
  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { text: "Hết hàng", color: "error", icon: <CloseCircleOutlined /> };
    if (quantity < 50)
      return { text: "Sắp hết", color: "warning", icon: <WarningOutlined /> };
    return { text: "Bình thường", color: "success", icon: <CheckCircleOutlined /> };
  };

  const getRequestStatus = (status: string) => {
    const configs: Record<string, { text: string; color: string }> = {
      PENDING: { text: "Chờ duyệt", color: "warning" },
      APPROVED: { text: "Đã duyệt", color: "processing" },
      COMPLETED: { text: "Hoàn thành", color: "success" },
      REJECTED: { text: "Từ chối", color: "error" },
      CANCELLED: { text: "Đã hủy", color: "default" },
    };
    return configs[status] || { text: status, color: "default" };
  };

  // Inventory Table Columns
  const inventoryColumns: ColumnsType<InventoryItemDTO> = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {/* Image removed for performance */}
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-500">SKU: {record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
      width: 150,
      render: (name: string) => (
        <Tag color="blue">{name || "N/A"}</Tag>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "center",
      render: (quantity: number) => {
        const status = getStockStatus(quantity);
        return (
          <Tag color={status.color} icon={status.icon}>
            {quantity}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => {
        const status = getStockStatus(record.quantity);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Giá vốn",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 120,
      align: "right",
      render: (price: number) => `${price.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenRequestForm(record)}
          disabled={!record.isAvailable}
        >
          Yêu cầu nhập
        </Button>
      ),
    },
  ];

  // Stock requests columns
  const requestsColumns: ColumnsType<StockRequest> = [
    {
      title: "Mã yêu cầu",
      dataIndex: "requestNumber",
      key: "requestNumber",
      width: 200,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product.name}</div>
          <div className="text-xs text-gray-500 font-mono">SKU: {record.product.code}</div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => {
        const types: Record<string, string> = {
          RESTOCK: "Nhập hàng",
          ADJUSTMENT: "Điều chỉnh",
          RETURN: "Trả hàng",
        };
        return <Tag>{types[type] || type}</Tag>;
      },
    },
    {
      title: "SL yêu cầu",
      dataIndex: "requestedQuantity",
      key: "requestedQuantity",
      width: 80,
      align: "center",
      render: (q: number) => <Text strong>{q}</Text>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const config = getRequestStatus(status);
        return <Tag color={config.color} className="rounded-full px-3">{config.text}</Tag>;
      },
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Hạn dự kiến",
      dataIndex: "expectedDate",
      key: "expectedDate",
      width: 120,
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<SearchOutlined />}
            onClick={() => handleViewRequest(record)}
          >
            Xem
          </Button>

          {record.status === "PENDING" && (
            <>
              <Button
                type="text"
                size="small"
                className="text-blue-500"
                onClick={() => handleOpenEditRequest(record)}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Hủy yêu cầu?"
                description="Bạn có chắc muốn hủy yêu cầu này?"
                onConfirm={() => handleCancelRequest(record.id)}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger size="small">
                  Hủy
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-2">

            {/* Stats Cards */}
            <Row gutter={16}>
              <Col span={4}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Tổng yêu cầu"
                    value={statistics?.totalRequests || 0}
                    prefix={<InboxOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={4}>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <Statistic
                    title="Chờ duyệt"
                    value={statistics?.pendingRequests || 0}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </div>
              </Col>
              <Col span={4}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Đã duyệt"
                    value={statistics?.approvedRequests || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={4}>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <Statistic
                    title="Hoàn thành"
                    value={statistics?.completedRequests || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </div>
              </Col>
              <Col span={4}>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <Statistic
                    title="Từ chối"
                    value={statistics?.rejectedRequests || 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </div>
              </Col>
              <Col span={4}>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <Statistic
                    title="Đã hủy"
                    value={statistics?.cancelledRequests || 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: "#8c8c8c" }}
                  />
                </div>
              </Col>
            </Row>

          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Filters Row */}
          <div className="flex justify-between items-center mb-4">
            <Space size="middle">

              <Search
                placeholder={activeTab === "inventory" ? "Tìm sản phẩm..." : "Tìm theo mã yêu cầu hoặc sản phẩm..."}
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                onSearch={setSearchQuery}
                onChange={(e) => {
                  if (!e.target.value) setSearchQuery("");
                }}
                style={{ width: 300 }}
              />
              <Select
                value={activeTab}
                onChange={setActiveTab}
                style={{ width: 180 }}
                size="middle"
                className="font-medium"
              >
                <Select.Option value="inventory">Tồn kho</Select.Option>
                <Select.Option value="requests">Yêu cầu</Select.Option>
              </Select>

              {activeTab === "inventory" ? (
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  style={{ width: 220 }}
                  size="middle"
                  placeholder="Chọn danh mục"
                >
                  <Select.Option value="all">Tất cả danh mục</Select.Option>
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 180 }}
                  size="middle"
                >
                  <Select.Option value="all">Tất cả trạng thái</Select.Option>
                  <Select.Option value="PENDING">Chờ duyệt</Select.Option>
                  <Select.Option value="APPROVED">Đã duyệt</Select.Option>
                  <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                  <Select.Option value="REJECTED">Từ chối</Select.Option>
                  <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                </Select>
              )}
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="middle"
              onClick={() => handleOpenRequestForm()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Tạo yêu cầu nhập
            </Button>
          </div>
          {activeTab === "inventory" && (
            <>
              <Spin spinning={loading}>
                <Table
                  columns={inventoryColumns}
                  dataSource={products}
                  rowKey="id"
                  pagination={{
                    ...pagination,
                    onChange: (page, pageSize) => {
                      setPagination({ ...pagination, current: page, pageSize });
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                  }}
                  scroll={{ x: 1200 }}
                  bordered={false}
                  className="ant-table-custom"
                />
              </Spin>
            </>
          )}

          {activeTab === "requests" && (
            <>
              <Spin spinning={loading}>
                <Table
                  columns={requestsColumns}
                  dataSource={stockRequests}
                  rowKey="id"
                  pagination={{
                    ...pagination,
                    onChange: (page, pageSize) => {
                      setPagination({ ...pagination, current: page, pageSize });
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} yêu cầu`,
                  }}
                  scroll={{ x: 1400 }}
                  bordered={false}
                  className="ant-table-custom"
                />
              </Spin>
            </>
          )}
        </CardContent>
      </Card>

      <StockRequestFormModal
        open={isRequestFormOpen}
        onCancel={() => setIsRequestFormOpen(false)}
        onSuccess={() => {
          if (activeTab === "requests") {
            loadStockRequests();
          } else {
            loadProducts();
          }
          loadStatistics();
        }}
        products={products}
        selectedProduct={selectedProduct}
        editingRequest={editingRequest}
      />

      <StockRequestDetailModal
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
}

export default function WarehousePage() {
  return (
    <ManagerLayout title="Quản lý kho hàng">
      <App>
        <WarehouseContent />
      </App>
    </ManagerLayout>
  );
}
