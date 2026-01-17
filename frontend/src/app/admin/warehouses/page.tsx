"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { useState, useEffect } from "react";
import { Table, Space, Button, Tag, Modal, App, Statistic, Row, Col, Select, Input, Form, InputNumber, Spin, Descriptions, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined, InboxOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined, StopOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import { adminWarehouseService, type WarehouseRequest, type LogisticsStaff, type WarehouseStatistics } from "@/services/admin-warehouse.service";
import apiClient from "@/lib/api-client";

const { Option } = Select;
const { TextArea } = Input;

interface WarehouseRequestTableData extends WarehouseRequest {
  key: string;
}

function WarehouseContent() {
  const { message, modal } = App.useApp();
  const [requests, setRequests] = useState<WarehouseRequestTableData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequest | null>(null);
  const [logisticsStaff, setLogisticsStaff] = useState<LogisticsStaff[]>([]);
  const [statistics, setStatistics] = useState<WarehouseStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [branches, setBranches] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [searchText, setSearchText] = useState<string>("");
  
  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  // Forms
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [cancelForm] = Form.useForm();
  
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

      console.log('Fetching requests with params:', params);
      const response = await adminWarehouseService.getWarehouseRequests(params);
      console.log('Response:', response);
      
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

  const fetchLogisticsStaff = async () => {
    try {
      const response = await adminWarehouseService.getLogisticsStaff();
      setLogisticsStaff(response.data);
    } catch (error: any) {
      console.error("Failed to fetch logistics staff:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiClient.get('/admin/branches', {
        params: { limit: 1000 },
      });
      console.log('Branches response:', response.data);
      if (response.data.status === "success" || response.data.success) {
        setBranches(response.data.data);
        console.log('Branches loaded:', response.data.data.length);
      }
    } catch (error: any) {
      console.error("Failed to fetch branches:", error);
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchLogisticsStaff();
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
    setLoading(true);
    try {
      // Fetch full request details including shipments
      const response = await adminWarehouseService.getWarehouseRequestById(request.id);
      setSelectedRequest(response.data);
      console.log('Detail request:', response.data);
    } catch (error: any) {
      message.error("Không thể tải chi tiết yêu cầu");
      console.error("Failed to fetch request details:", error);
      setSelectedRequest(request); // Fallback to table data
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprove = (request: WarehouseRequest) => {
    setSelectedRequest(request);
    approveForm.setFieldsValue({
      approvedQuantity: request.requestedQuantity,
    });
    setIsApproveModalOpen(true);
  };

  const handleOpenReject = (request: WarehouseRequest) => {
    setSelectedRequest(request);
    rejectForm.resetFields();
    setIsRejectModalOpen(true);
  };

  const handleOpenAssign = async (request: WarehouseRequest) => {
    setSelectedRequest(request);
    assignForm.resetFields();
    setIsAssignModalOpen(true);
    
    // Fetch logistics staff for this branch only
    try {
      const response = await adminWarehouseService.getLogisticsStaff(request.branchId);
      setLogisticsStaff(response.data);
    } catch (error: any) {
      message.error("Không thể tải danh sách nhân viên logistics");
      console.error("Failed to fetch logistics staff:", error);
    }
  };

  const handleOpenCancel = (request: WarehouseRequest) => {
    setSelectedRequest(request);
    cancelForm.resetFields();
    setIsCancelModalOpen(true);
  };

  const handleApprove = async (values: any) => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await adminWarehouseService.approveRequest(selectedRequest.id, {
        approvedQuantity: values.approvedQuantity,
        notes: values.notes,
      });
      
      message.success("Đã duyệt yêu cầu thành công");
      setIsApproveModalOpen(false);
      approveForm.resetFields();
      fetchRequests(pagination.current, pagination.pageSize);
      fetchStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể duyệt yêu cầu");
      console.error("Failed to approve request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values: any) => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await adminWarehouseService.rejectRequest(selectedRequest.id, {
        rejectedReason: values.rejectedReason,
      });
      
      message.success("Đã từ chối yêu cầu");
      setIsRejectModalOpen(false);
      rejectForm.resetFields();
      fetchRequests(pagination.current, pagination.pageSize);
      fetchStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể từ chối yêu cầu");
      console.error("Failed to reject request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (values: any) => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await adminWarehouseService.assignToLogistics(selectedRequest.id, {
        logisticsStaffId: values.logisticsStaffId,
        notes: values.notes,
      });
      
      message.success("Đã giao cho nhân viên logistics thành công");
      setIsAssignModalOpen(false);
      assignForm.resetFields();
      fetchRequests(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể giao cho logistics");
      console.error("Failed to assign to logistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (values: any) => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await adminWarehouseService.cancelRequest(selectedRequest.id, {
        cancelReason: values.cancelReason,
      });
      
      message.success("Đã hủy yêu cầu thành công");
      setIsCancelModalOpen(false);
      cancelForm.resetFields();
      fetchRequests(pagination.current, pagination.pageSize);
      fetchStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể hủy yêu cầu");
      console.error("Failed to cancel request:", error);
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
      ADJUSTMENT: "Điều chỉnh",
      RETURN: "Trả hàng",
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
      showSorterTooltip: { title: "Sắp xếp theo số lượng yêu cầu" },
    },
    {
      title: "SL duyệt",
      dataIndex: "approvedQuantity",
      key: "approvedQuantity",
      width: 100,
      align: "center",
      sorter: (a, b) => (a.approvedQuantity || 0) - (b.approvedQuantity || 0),
      showSorterTooltip: { title: "Sắp xếp theo số lượng duyệt" },
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
      showSorterTooltip: { title: "Sắp xếp theo ngày yêu cầu" },
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
      render: (_, record) => (
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
            <Tooltip title="Giao cho logistics">
              <Button
                type="primary"
                icon={<TruckOutlined />}
                size="small"
                onClick={() => handleOpenAssign(record)}
              />
            </Tooltip>
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
      ),
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
                <Option value="ADJUSTMENT">Điều chỉnh</Option>
                <Option value="RETURN">Trả hàng</Option>
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

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã yêu cầu" span={2}>
              <Tag color="blue">{selectedRequest.requestNumber}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh" span={2}>
              {selectedRequest.branch.name} ({selectedRequest.branch.code})
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm" span={2}>
              <div className="flex items-center gap-2">
                {selectedRequest.product.image && (
                  <img
                    src={selectedRequest.product.image}
                    alt={selectedRequest.product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">{selectedRequest.product.name}</div>
                  <div className="text-sm text-gray-500">SKU: {selectedRequest.product.code}</div>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Loại yêu cầu">
              {getTypeText(selectedRequest.type)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedRequest.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng yêu cầu">
              {selectedRequest.requestedQuantity}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng duyệt">
              {selectedRequest.approvedQuantity || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {selectedRequest.requestedDate
                ? dayjs(selectedRequest.requestedDate).format("DD/MM/YYYY HH:mm")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày dự kiến">
              {selectedRequest.expectedDate
                ? dayjs(selectedRequest.expectedDate).format("DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Người yêu cầu" span={2}>
              {selectedRequest.requestedBy.name} ({selectedRequest.requestedBy.email})
            </Descriptions.Item>
            {selectedRequest.approvedBy && (
              <Descriptions.Item label="Người duyệt" span={2}>
                {selectedRequest.approvedBy.name} ({selectedRequest.approvedBy.email})
              </Descriptions.Item>
            )}
            {selectedRequest.status === "COMPLETED" && selectedRequest.shipments && selectedRequest.shipments.length > 0 && (
              <Descriptions.Item label="Nhân viên logistics" span={2}>
                <div className="space-y-2">
                  {selectedRequest.shipments.map((shipment: any) => (
                    <div key={shipment.id} className="flex items-center gap-2">
                      <Tag color="green">{shipment.shipmentNumber}</Tag>
                      <span>
                        {shipment.assignedTo?.name || "Chưa giao"}
                        {shipment.assignedTo?.email && ` (${shipment.assignedTo.email})`}
                        {shipment.assignedTo?.phone && ` - ${shipment.assignedTo.phone}`}
                      </span>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
            {selectedRequest.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedRequest.notes}
              </Descriptions.Item>
            )}
            {selectedRequest.rejectedReason && (
              <Descriptions.Item label="Lý do từ chối" span={2}>
                <span className="text-red-500">{selectedRequest.rejectedReason}</span>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Duyệt yêu cầu"
        open={isApproveModalOpen}
        onCancel={() => {
          setIsApproveModalOpen(false);
          approveForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={approveForm}
          layout="vertical"
          onFinish={handleApprove}
        >
          <Form.Item
            label="Số lượng duyệt"
            name="approvedQuantity"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng duyệt!" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập số lượng duyệt"
            />
          </Form.Item>
          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={3} placeholder="Ghi chú thêm (không bắt buộc)" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsApproveModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Duyệt yêu cầu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu"
        open={isRejectModalOpen}
        onCancel={() => {
          setIsRejectModalOpen(false);
          rejectForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleReject}
        >
          <Form.Item
            label="Lý do từ chối"
            name="rejectedReason"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối!" }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do từ chối..." />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsRejectModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Từ chối yêu cầu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign to Logistics Modal */}
      <Modal
        title="Giao cho nhân viên Logistics"
        open={isAssignModalOpen}
        onCancel={() => {
          setIsAssignModalOpen(false);
          assignForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssign}
        >
          <Form.Item
            label="Nhân viên Logistics"
            name="logisticsStaffId"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
          >
            <Select
              placeholder="Chọn nhân viên logistics"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {logisticsStaff.map((staff) => (
                <Option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.email}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={3} placeholder="Ghi chú cho logistics (không bắt buộc)" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsAssignModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Giao cho Logistics
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title="Hủy yêu cầu"
        open={isCancelModalOpen}
        onCancel={() => {
          setIsCancelModalOpen(false);
          cancelForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={cancelForm}
          layout="vertical"
          onFinish={handleCancel}
        >
          <Form.Item
            label="Lý do hủy"
            name="cancelReason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do hủy!" },
              { min: 5, message: "Lý do phải có ít nhất 5 ký tự!" },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập lý do hủy..." />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsCancelModalOpen(false)}>
                Đóng
              </Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Xác nhận hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
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
