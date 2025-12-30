"use client";

import { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layouts/manager-layout";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Avatar,
  Tabs,
  Modal,
  Popconfirm,
  App,
  Spin,
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
} from "@ant-design/icons";
import type { TabsProps, TableColumnsType, TablePaginationConfig } from "antd";
import { StaffForm } from "@/components/forms/manager/StaffForm";
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
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffDTO | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

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

  // Debounced search - chỉ chạy khi đã auth
  useEffect(() => {
    if (!isAuthReady) return;

    const timer = setTimeout(() => {
      fetchStaffList({
        page: 1,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
        isActive: activeTab === "active" ? true : activeTab === "inactive" ? false : undefined,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, isAuthReady]);

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
      isActive: activeTab === "active" ? true : activeTab === "inactive" ? false : undefined,
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
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Popconfirm
            title="Xóa nhân viên"
            description="Bạn có chắc muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeStaffCount = staffList.filter((s) => s.isActive).length;
  const inactiveStaffCount = staffList.filter((s) => !s.isActive).length;

  const tabItems: TabsProps["items"] = [
    {
      key: "all",
      label: (
        <span>
          <TeamOutlined /> Tất cả ({pagination.total})
        </span>
      ),
    },
    {
      key: "active",
      label: (
        <span>
          <UserOutlined /> Đang hoạt động ({activeStaffCount})
        </span>
      ),
    },
    {
      key: "inactive",
      label: <span>Vô hiệu hóa ({inactiveStaffCount})</span>,
    },
  ];

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Quản lý nhân viên
              </CardTitle>
            </div>

            {/* Search and Add Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Input
                placeholder="Tìm kiếm theo tên, email, hoặc số điện thoại..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: "400px" }}
                size="large"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsAddModalOpen(true)}
              >
                Thêm nhân viên mới
              </Button>
            </div>

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
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
              style={{ marginTop: "16px" }}
            />
          </Spin>
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Modal
        title={<span className="text-lg font-semibold">Thêm nhân viên mới</span>}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={700}
        destroyOnHidden
        centered
        maskClosable={false}
      >
        <p className="text-slate-500 mb-6">Thêm nhân viên mới cho chi nhánh của bạn</p>
        <StaffForm 
          onSuccess={async () => {
            setIsAddModalOpen(false);
          }}
            onSubmit={async (data) => {
              const result = await createStaff(data as any);
              if (result) {
                message.success('Thêm nhân viên thành công!');
                setIsAddModalOpen(false);
              } else {
                message.error('Thêm nhân viên thất bại');
              }
              return result;
            }}
        />
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        title={<span className="text-lg font-semibold">Chỉnh sửa thông tin: {selectedStaff?.name}</span>}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedStaff(null);
        }}
        footer={null}
        width={700}
        destroyOnHidden
        centered
        maskClosable={false}
      >
        <p className="text-slate-500 mb-6">Cập nhật thông tin nhân viên</p>
        {selectedStaff && (
          <StaffForm 
            staff={selectedStaff} 
            onSuccess={async () => {
              setIsEditModalOpen(false);
              setSelectedStaff(null);
            }}
            onSubmit={async (data) => {
              const result = await updateStaff(selectedStaff.id, data);
              if (result) {
                message.success('Cập nhật nhân viên thành công!');
                setIsEditModalOpen(false);
                setSelectedStaff(null);
              } else {
                message.error( 'Cập nhật nhân viên thất bại');
              }
              return result;
            }}
          />
        )}
      </Modal>
    </div>
  );
}

export default function StaffManagementPage() {
  return (
    <ManagerLayout>
      <StaffContent />
    </ManagerLayout>
  );
}
