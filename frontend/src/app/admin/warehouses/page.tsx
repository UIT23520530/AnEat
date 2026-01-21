"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { useState, useEffect } from "react";
import { Table, Space, Button, Tag, App, Statistic, Row, Col, Select, Input, Tooltip, Spin } from "antd";
import type { TableColumnsType } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined, InboxOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined, StopOutlined, EditOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import dayjs from "dayjs";
import { adminWarehouseService, type WarehouseRequest, type LogisticsStaff, type WarehouseStatistics } from "@/services/admin-warehouse.service";
import apiClient from "@/lib/api-client";

// Import Modal Components
import { ApproveRequestModal } from "@/components/forms/admin/stock-requests/ApproveRequestModal";
import { RejectRequestModal } from "@/components/forms/admin/stock-requests/RejectRequestModal";
import { AssignLogisticsModal } from "@/components/forms/admin/stock-requests/AssignLogisticsModal";
import { CancelRequestModal } from "@/components/forms/admin/stock-requests/CancelRequestModal";
import { RequestDetailModal } from "@/components/forms/admin/stock-requests/RequestDetailModal";
import { CreateShipmentModal } from "@/components/forms/admin/stock-requests/CreateShipmentModal";

const { Option } = Select;

interface WarehouseRequestTableData extends WarehouseRequest {
  key: string;
}

function WarehouseContent() {
  const { message } = App.useApp();
  const [requests, setRequests] = useState<WarehouseRequestTableData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequest | null>(null);
  const [logisticsStaff, setLogisticsStaff] = useState<LogisticsStaff[]>([]);
  const [statistics, setStatistics] = useState<WarehouseStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [branches, setBranches] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [searchText, setSearchText] = useState<string>("");

  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isCreateShipmentModalOpen, setIsCreateShipmentModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Load data
  const fetchRequests = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
      };

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (typeFilter && typeFilter !== "all") {
        params.type = typeFilter;
      }

      if (branchFilter) {
        params.branchId = branchFilter;
      }

      if (searchText) {
        params.search = searchText;
      }

      const response = await adminWarehouseService.getWarehouseRequests(params);

      const tableData: WarehouseRequestTableData[] = response.data.map(req => ({
        ...req,
        key: req.id,
      }));

      setRequests(tableData);
      setPagination({
        current: response.meta.currentPage,
        pageSize: response.meta.limit,
        total: response.meta.totalItems,
      });
    } catch (error: any) {
      message.error("Không thể tải danh sách yêu cầu");
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (branchId?: string | null) => {
    try {
      const response = await adminWarehouseService.getStatistics(branchId || undefined);
      setStatistics(response.data);
    } catch (error: any) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiClient.get('/admin/branches', {
        params: { limit: 1000 },
      });
      if (response.data.status === "success" || response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch branches:", error);
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchStatistics(branchFilter);
  }, [branchFilter]);

  useEffect(() => {
    fetchRequests(pagination.current, pagination.pageSize);
  }, [statusFilter, typeFilter, branchFilter, searchText]);

  // Handlers

  const handleViewDetail = async (request: WarehouseRequest) => {
    setIsDetailModalOpen(true);
    // Fetch full detail when viewing to ensure we have latest shipments info
    try {
      const response = await adminWarehouseService.getWarehouseRequestById(request.id);
      setSelectedRequest(response.data);
    } catch (error) {
      setSelectedRequest(request);
    }
  };

  const handleOpenApprove = async (request: WarehouseRequest) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);

    // Fetch logistics staff for this branch (for optional assignment based on approval)
    try {
      const response = await adminWarehouseService.getLogisticsStaff(
        request.branchId,
        request.expectedDate || undefined // Filter availability by expected date
      );
      setLogisticsStaff(response.data);
    } catch (error: any) {
      console.warn("Could not fetch logistics staff for approval modal", error);
    }
  };

  const handleOpenReject = (request: WarehouseRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleOpenAssign = async (request: WarehouseRequest) => {
    setSelectedRequest(request);
    setIsAssignModalOpen(true);

    // Fetch logistics staff for this branch
    try {
      const response = await adminWarehouseService.getLogisticsStaff(
        request.branchId,
        request.expectedDate || undefined // Filter availability
      );
      setLogisticsStaff(response.data);
    } catch (error: any) {
      message.error("Không thể tải danh sách nhân viên logistics");
    }
  };

  const handleOpenReassign = async (request: WarehouseRequest) => {
    setSelectedRequest(request);
    setIsReassignModalOpen(true);

    try {
      const response = await adminWarehouseService.getLogisticsStaff(
        request.branchId,
        request.expectedDate || undefined // Filter availability
      );
      setLogisticsStaff(response.data);
    } catch (error: any) {
      message.error("Không thể tải danh sách nhân viên logistics");
    }
  };

  const handleOpenCancel = (request: WarehouseRequest) => {
    setSelectedRequest(request);
    setIsCancelModalOpen(true);
  };

  const handleApprove = async (values: { approvedQuantity: number; notes?: string; logisticsStaffId?: string }) => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      // 1. Approve request
      await adminWarehouseService.approveRequest(selectedRequest.id, {
        approvedQuantity: values.approvedQuantity,
        notes: values.notes,
      });

      // 2. Assign to logistics if selected
      if (values.logisticsStaffId) {
        try {
          await adminWarehouseService.assignToLogistics(selectedRequest.id, {
            logisticsStaffId: values.logisticsStaffId,
            notes: values.notes,
          });
          message.success("Đã duyệt và giao việc thành công");
        } catch (assignError) {
          console.error("Assign error after approval:", assignError);
          message.warning("Đã duyệt yêu cầu nhưng không thể giao việc. Vui lòng thử lại chức năng giao việc.");
        }
      } else {
        message.success("Đã duyệt yêu cầu thành công");
      }

      setIsApproveModalOpen(false);
      fetchRequests(pagination.current, pagination.pageSize);
      fetchStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể duyệt yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values: { rejectedReason: string }) => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      await adminWarehouseService.rejectRequest(selectedRequest.id, {
        rejectedReason: values.rejectedReason,
      });

      message.success("Đã từ chối yêu cầu");
      setIsRejectModalOpen(false);
      fetchRequests(pagination.current, pagination.pageSize);
      fetchStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể từ chối yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (values: { logisticsStaffId: string; notes?: string }) => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      // Logic for assignment: uses existing assignToLogistics endpoint
      await adminWarehouseService.assignToLogistics(selectedRequest.id, {
        logisticsStaffId: values.logisticsStaffId,
        notes: values.notes,
      });

      message.success("Đã giao cho nhân viên logistics thành công");
      setIsAssignModalOpen(false);
      setIsReassignModalOpen(false);
      fetchRequests(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể giao cho logistics");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (values: { cancelReason: string }) => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      await adminWarehouseService.cancelRequest(selectedRequest.id, {
        cancelReason: values.cancelReason,
      });

      message.success("Đã hủy yêu cầu thành công");
      setIsCancelModalOpen(false);
      fetchRequests(pagination.current, pagination.pageSize);
      fetchStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể hủy yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    fetchRequests(newPagination.current, newPagination.pageSize);
  };

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
    };
    return types[type] || type;
  };

  const columns: TableColumnsType<WarehouseRequestTableData> = [
    {
      title: "Mã yêu cầu",
      dataIndex: "requestNumber",
      key: "requestNumber",
      width: 130,
      fixed: "left",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Chi nhánh",
      key: "branch",
      width: 150,
      fixed: "left",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.branch.name}</div>
          <div className="text-xs text-gray-500">{record.branch.code}</div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 200,
      fixed: "left",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.product.image && (
            <img
              src={record.product.image}
              alt={record.product.name}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div>
            <div className="font-medium">{record.product.name}</div>
            <div className="text-xs text-gray-500">SKU: {record.product.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 110,
      render: (type: string) => getTypeText(type),
    },
    {
      title: "SL yêu cầu",
      dataIndex: "requestedQuantity",
      key: "requestedQuantity",
      width: 100,
      align: "center",
      sorter: (a, b) => a.requestedQuantity - b.requestedQuantity,
    },
    {
      title: "SL duyệt",
      dataIndex: "approvedQuantity",
      key: "approvedQuantity",
      width: 100,
      align: "center",
      sorter: (a, b) => (a.approvedQuantity || 0) - (b.approvedQuantity || 0),
      render: (qty: number | null) => qty || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestedDate",
      key: "requestedDate",
      width: 120,
      sorter: (a, b) => {
        if (!a.requestedDate) return -1;
        if (!b.requestedDate) return 1;
        return dayjs(a.requestedDate).unix() - dayjs(b.requestedDate).unix();
      },
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Người yêu cầu",
      key: "requestedBy",
      width: 150,
      render: (_, record) => record.requestedBy.name,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        // Check if allow reassign (approved + has shipments but none delivered/picked up yet)
        const canReassign = record.status === 'APPROVED' &&
          record.shipments &&
          record.shipments.length > 0 &&
          record.shipments.every((s: any) => s.status !== 'DELIVERED' && s.status !== 'PICKED_UP');

        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            {record.status === "PENDING" && (
              <>
                <Tooltip title="Duyệt yêu cầu">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    size="small"
                    onClick={() => handleOpenApprove(record)}
                  />
                </Tooltip>
                <Tooltip title="Từ chối yêu cầu">
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={() => handleOpenReject(record)}
                  />
                </Tooltip>
              </>
            )}
            {record.status === "APPROVED" && (
              <>
                <Tooltip title="Giao cho logistics">
                  <Button
                    type="primary"
                    icon={<TruckOutlined />}
                    size="small"
                    onClick={() => handleOpenAssign(record)}
                  />
                </Tooltip>

                {/* Re-assign button */}
                {canReassign && (
                  <Tooltip title="Đổi nhân viên vận chuyển">
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleOpenReassign(record)}
                    />
                  </Tooltip>
                )}
              </>
            )}
            {(record.status === "PENDING" || record.status === "APPROVED") && (
              <Tooltip title="Hủy yêu cầu">
                <Button
                  danger
                  icon={<StopOutlined />}
                  size="small"
                  onClick={() => handleOpenCancel(record)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            {/* Statistics */}
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
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </div>
              </Col>
              <Col span={4}>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <Statistic
                    title="Đã duyệt"
                    value={statistics?.approvedRequests || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </div>
              </Col>
              <Col span={4}>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
                  <Statistic
                    title="Hoàn thành"
                    value={statistics?.completedRequests || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#13c2c2" }}
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

        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex justify-between items-center gap-4">
            <Space>
              <Input
                placeholder="Tìm kiếm yêu cầu..."
                allowClear
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 180 }}
                className={statusFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="PENDING">Chờ duyệt</Option>
                <Option value="APPROVED">Đã duyệt</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="REJECTED">Từ chối</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 150 }}
                className={typeFilter !== "all" ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
              >
                <Option value="all">Tất cả loại</Option>
                <Option value="RESTOCK">Nhập hàng</Option>
              </Select>
              <Select
                showSearch
                allowClear
                value={branchFilter}
                onChange={(value) => setBranchFilter(value || null)}
                placeholder="Lọc theo chi nhánh"
                style={{ width: 200 }}
                className={branchFilter ? "[&>.ant-select-selector]:!bg-blue-50 [&>.ant-select-selector]:!border-blue-500" : ""}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={branches.map((b) => ({
                  value: b.id,
                  label: `${b.code} # ${b.name}`,
                }))}
              />
            </Space>
            <Button
              type="primary"
              icon={<TruckOutlined />}
              onClick={() => setIsCreateShipmentModalOpen(true)}
            >
              Tạo vận đơn
            </Button>
          </div>

          {/* Table */}
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={requests}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `Hiển thị ${total} yêu cầu`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 1600 }}
              bordered={false}
              className="ant-table-custom"
            />
          </Spin>
        </CardContent>
      </Card>

      {/* Modals */}
      <ApproveRequestModal
        open={isApproveModalOpen}
        loading={loading}
        onCancel={() => setIsApproveModalOpen(false)}
        onApprove={handleApprove}
        initialQuantity={selectedRequest?.requestedQuantity}
        logisticsStaff={logisticsStaff}
      />

      <RejectRequestModal
        open={isRejectModalOpen}
        loading={loading}
        onCancel={() => setIsRejectModalOpen(false)}
        onReject={handleReject}
      />

      <AssignLogisticsModal
        open={isAssignModalOpen}
        loading={loading}
        logisticsStaff={logisticsStaff}
        onCancel={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
        title="Giao cho nhân viên Logistics"
        initialAssignedStaffId={selectedRequest?.shipments?.[0]?.assignedTo?.id}
      />

      <AssignLogisticsModal
        open={isReassignModalOpen}
        loading={loading}
        logisticsStaff={logisticsStaff}
        onCancel={() => setIsReassignModalOpen(false)}
        onAssign={handleAssign}
        title="Thay đổi nhân viên vận chuyển"
        submitText="Cập nhật"
        initialAssignedStaffId={selectedRequest?.shipments?.[0]?.assignedTo?.id}
      />

      <CancelRequestModal
        open={isCancelModalOpen}
        loading={loading}
        onCancel={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleCancel}
      />

      <RequestDetailModal
        open={isDetailModalOpen}
        request={selectedRequest}
        onCancel={() => setIsDetailModalOpen(false)}
      />

      <CreateShipmentModal
        open={isCreateShipmentModalOpen}
        onCancel={() => setIsCreateShipmentModalOpen(false)}
        onSuccess={() => {
          setIsCreateShipmentModalOpen(false);
          fetchRequests(pagination.current, pagination.pageSize);
          fetchStatistics();
        }}
      />
    </div>
  );
}

export default function AdminWarehousePage() {
  return (
    <AdminLayout title="Quản lý Yêu cầu kho">
      <App>
        <WarehouseContent />
      </App>
    </AdminLayout>
  );
}
