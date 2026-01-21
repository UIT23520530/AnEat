"use client";

import { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layouts/manager-layout";
import { StaffService } from "@/services/staff.service";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Avatar,
  Select,
  Modal,
  Popconfirm,
  App,
  Spin,
  Row,
  Col,
  Statistic,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { StaffForm } from "@/components/forms/manager/StaffForm";
import StaffDetailModal from "@/components/forms/manager/StaffDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStaff } from "@/hooks/useStaff";
import { StaffDTO } from "@/types/staff";
import { autoLoginForDev } from "@/lib/auto-login";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function StaffContent() {
  const { message } = App.useApp();
  
  // API Integration với useStaff hook
  const {
    staffList,
    loading,
    error,
    pagination,
    fetchStaffList,
    createStaff,
    updateStaff,
    deleteStaff,
  } = useStaff({ page: 1, limit: 10 });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffDTO | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [createdUserInfo, setCreatedUserInfo] = useState<StaffDTO | null>(null);

  // Display error message when error occurs
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error, message]);

  // Auto-login for development
  useEffect(() => {
    const initAuth = async () => {
      await autoLoginForDev();
      setIsAuthReady(true);
    };
    initAuth();
  }, []);

  // Fetch statistics for correct tab counts (independent of main data)
  useEffect(() => {
    if (!isAuthReady) return;

    // Debounce stats fetch to avoid excessive API calls
    const timer = setTimeout(async () => {
      try {
        // Use StaffService directly for stats to not affect main loading state
        // Backend expects 'status' not 'isActive'
        const [allData, activeData, inactiveData] = await Promise.all([
          StaffService.getList({ page: 1, limit: 1, search: searchQuery || undefined }),
          StaffService.getList({ page: 1, limit: 1, search: searchQuery || undefined, status: 'active' }),
          StaffService.getList({ page: 1, limit: 1, search: searchQuery || undefined, status: 'inactive' }),
        ]);

        setStats({
          total: allData.meta.totalItems,
          active: activeData.meta.totalItems,
          inactive: inactiveData.meta.totalItems,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthReady, searchQuery]);

  // Fetch data when status filter changes (immediate, no debounce)
  useEffect(() => {
    if (!isAuthReady) return;

    fetchStaffList({
      page: 1,
      limit: 10,
      search: searchQuery || undefined,
      status: statusFilter === "active" ? "active" : statusFilter === "inactive" ? "inactive" : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, isAuthReady]);

  // Debounced search
  useEffect(() => {
    if (!isAuthReady) return;

    const timer = setTimeout(() => {
      fetchStaffList({
        page: 1,
        limit: 10,
        search: searchQuery || undefined,
        status: statusFilter === "active" ? "active" : statusFilter === "inactive" ? "inactive" : undefined,
      });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isAuthReady]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "default";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Hoạt động" : "Vô hiệu hóa";
  };

  const formatLastActive = (lastLogin: string | null) => {
    if (!lastLogin) return "Chưa đăng nhập";
    return dayjs(lastLogin).fromNow();
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetchStaffList({
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
      search: searchQuery || undefined,
      status: statusFilter === "active" ? "active" : statusFilter === "inactive" ? "inactive" : undefined,
    });
  };

  const handleEdit = (record: StaffDTO) => {
    setSelectedStaff(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteStaff(id);
    if (result) {
      message.success('Xóa nhân viên thành công!');
    } else {
      message.error('Xóa nhân viên thất bại');
    }
  };

  const columns: TableColumnsType<StaffDTO> = [
    {
      title: "Nhân viên",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 280,
      render: (name: string, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {record.avatar ? (
            <Avatar size={48} src={record.avatar} />
          ) : (
            <Avatar
              size={48}
              style={{
                backgroundColor: record.isActive ? "#10B981" : "#94A3B8",
              }}
            >
              {getInitials(name)}
            </Avatar>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>{name}</div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              <MailOutlined style={{ marginRight: "4px" }} />
              {record.email}
            </div>
            {record.phone && (
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                <PhoneOutlined style={{ marginRight: "4px" }} />
                {record.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branchName",
      key: "branchName",
      width: 180,
      render: (_: any, record: StaffDTO) => (
        <Tag color="blue">{record.branch?.name || "Chưa phân bổ"}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 140,
      render: (isActive: boolean) => (
        <Tag color={getStatusColor(isActive)}>
          {getStatusText(isActive)}
        </Tag>
      ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (createdAt: string) => dayjs(createdAt).format("DD/MM/YYYY"),
    },
    {
      title: "Hoạt động gần đây",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 180,
      render: (lastLogin: string | null) => (
        <span style={{ fontSize: "13px", color: "#6B7280" }}>
          <ClockCircleOutlined style={{ marginRight: "6px" }} />
          {formatLastActive(lastLogin)}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_: any, record: StaffDTO) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined className="text-blue-500" />}
              onClick={() => {
                setSelectedStaff(record);
                setIsDetailModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-amber-500" />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa nhân viên"
            description="Bạn có chắc muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">

            {/* Stats Cards */}
            <Row gutter={16}>
              <Col span={8}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Tổng nhân viên"
                    value={stats.total}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <Statistic
                    title="Đang hoạt động"
                    value={stats.active}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <Statistic
                    title="Vô hiệu hóa"
                    value={stats.inactive}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </div>
              </Col>
            </Row>

            {/* Filters */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Input
                  placeholder="Tìm kiếm theo tên, email, hoặc số điện thoại..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, maxWidth: 400 }}
                  size="middle"
                  allowClear
                />
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  size="middle"
                  style={{ width: 250 }}
                  options={[
                    { value: "all", label: `Tất cả trạng thái` },
                    { value: "active", label: `Đang hoạt động` },
                    { value: "inactive", label: `Vô hiệu hóa` },
                  ]}
                />
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                onClick={() => setIsAddModalOpen(true)}
              >
                Thêm nhân viên mới
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Spin spinning={loading} indicator={<LoadingOutlined spin />}>
            <Table
              columns={columns}
              dataSource={staffList.map((staff) => ({ ...staff, key: staff.id }))}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} nhân viên`,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
              onChange={handleTableChange}
              scroll={{ x: 1400 }}
              bordered={false}
              className="ant-table-custom"
            />
          </Spin>
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Modal
        title={null}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={850}
        destroyOnHidden
        centered
        maskClosable={false}
      >
        <h2 className="text-xl font-bold text-slate-800 mb-0">Thêm nhân viên mới</h2>
        
        <StaffForm 
          onSuccess={async () => {
            setIsAddModalOpen(false);
          }}
            onSubmit={async (data) => {
              const result = await createStaff(data as any);
              if (result.success) {
                message.success('Thêm nhân viên thành công!');
                
                // If backend returned a password (meaning it was auto-generated) 
                // or we just want to show the creation info
                if ((data as any).password) {
                  setGeneratedPassword((data as any).password);
                } else {
                  // If backend returns the password in the response (common in these systems)
                  // or we assume a default if not returned. 
                  // In typical implementations, the backend returns the plain password only once.
                  setGeneratedPassword((result.data as any).password || 'Check Email');
                }
                
                setCreatedUserInfo(result.data || null);
                setIsAddModalOpen(false);
                setIsPasswordModalOpen(true);
              } else {
                message.error(result.message || 'Thêm nhân viên thất bại');
              }
              return result;
            }}
        />
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        title={null}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedStaff(null);
        }}
        footer={null}
        width={850}
        destroyOnHidden
        centered
        maskClosable={false}
      >
        <h2 className="text-xl font-bold text-slate-800 mb-0">Chỉnh sửa nhân viên</h2>
        
        {selectedStaff && (
          <StaffForm 
            staff={selectedStaff} 
            onSuccess={async () => {
              setIsEditModalOpen(false);
              setSelectedStaff(null);
            }}
            onSubmit={async (data) => {
              const result = await updateStaff(selectedStaff.id, data);
              if (result.success) {
                message.success('Cập nhật nhân viên thành công!');
                setIsEditModalOpen(false);
                setSelectedStaff(null);
              } else {
                message.error(result.message || 'Cập nhật nhân viên thất bại');
              }
              return result;
            }}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <StaffDetailModal 
        staff={selectedStaff}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedStaff(null);
        }}
      />

      {/* Password Display Modal */}
      <Modal
        title={null}
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false)
          setGeneratedPassword('')
          setCreatedUserInfo(null)
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsPasswordModalOpen(false)
              setGeneratedPassword('')
              setCreatedUserInfo(null)
            }}
          >
            Đóng
          </Button>,
          <Button
            key="send"
            type="primary"
            icon={<MailOutlined />}
            onClick={() => {
              message.info('Chức năng gửi email sẽ được triển khai sau')
            }}
          >
            Gửi Email
          </Button>,
        ]}
        width={500}
        centered
      >
        <div className="text-center py-6">
          <div className="mb-6">
            <MailOutlined className="text-blue-500" style={{ fontSize: '80px' }} />
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Người dùng đã được tạo!</h3>
            <p className="text-slate-600">
              Thông tin đăng nhập đã được tạo cho <span className="font-semibold">{createdUserInfo?.name}</span>
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-slate-600 mb-2">Email đăng nhập:</div>
            <div className="font-mono text-base font-semibold text-slate-800 mb-3">{createdUserInfo?.email}</div>
            <div className="text-sm text-slate-600 mb-2">Mật khẩu tạm thời:</div>
            <div className="flex items-center justify-center gap-2">
              <div className="font-mono text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded border border-blue-200">
                {generatedPassword}
              </div>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  if (generatedPassword) {
                    navigator.clipboard.writeText(generatedPassword)
                    message.success('Đã sao chép mật khẩu')
                  }
                }}
              />
            </div>
          </div>
          <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded">
            ⚠️ Vui lòng sao chép và gửi thông tin này cho nhân viên. Mật khẩu sẽ không hiển thị lại.
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function StaffManagementPage() {
  return (
    <ManagerLayout title="Quản lý nhân viên">
      <App>
      <StaffContent />
      </App>
    </ManagerLayout>
  );
}
