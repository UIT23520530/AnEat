"use client";

import { useState } from "react";
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
  Badge,
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
} from "@ant-design/icons";
import type { TabsProps, TableColumnsType } from "antd";

interface StaffData {
  key: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "manager" | "staff";
  position: "cashier" | "kitchen" | "delivery" | "supervisor";
  store: string;
  status: "active" | "inactive" | "on-leave";
  shift: "morning" | "afternoon" | "evening" | "full-time";
  joinDate: string;
  salary?: number;
  lastActive: string;
}

// Mock data - chỉ nhân viên thuộc Downtown Store
const mockStaff: StaffData[] = [
  {
    key: "1",
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyen.vana@fastfood.com",
    phone: "0901234567",
    role: "manager",
    position: "supervisor",
    store: "Downtown Store",
    status: "active",
    shift: "full-time",
    joinDate: "2024-01-15",
    salary: 15000000,
    lastActive: "2025-10-21 09:30",
  },
  {
    key: "2",
    id: "2",
    name: "Trần Thị B",
    email: "tran.thib@fastfood.com",
    phone: "0902345678",
    role: "staff",
    position: "cashier",
    store: "Downtown Store",
    status: "active",
    shift: "morning",
    joinDate: "2024-03-20",
    salary: 8000000,
    lastActive: "2025-10-21 08:15",
  },
  {
    key: "3",
    id: "3",
    name: "Lê Văn C",
    email: "le.vanc@fastfood.com",
    phone: "0903456789",
    role: "staff",
    position: "kitchen",
    store: "Downtown Store",
    status: "active",
    shift: "morning",
    joinDate: "2024-02-10",
    salary: 9000000,
    lastActive: "2025-10-21 07:45",
  },
  {
    key: "4",
    id: "4",
    name: "Phạm Thị D",
    email: "pham.thid@fastfood.com",
    phone: "0904567890",
    role: "staff",
    position: "cashier",
    store: "Downtown Store",
    status: "active",
    shift: "afternoon",
    joinDate: "2024-05-12",
    salary: 8000000,
    lastActive: "2025-10-20 18:30",
  },
  {
    key: "5",
    id: "5",
    name: "Hoàng Văn E",
    email: "hoang.vane@fastfood.com",
    phone: "0905678901",
    role: "staff",
    position: "kitchen",
    store: "Downtown Store",
    status: "active",
    shift: "afternoon",
    joinDate: "2024-04-08",
    salary: 9500000,
    lastActive: "2025-10-20 19:00",
  },
  {
    key: "6",
    id: "6",
    name: "Nguyễn Thị F",
    email: "nguyen.thif@fastfood.com",
    phone: "0906789012",
    role: "staff",
    position: "delivery",
    store: "Downtown Store",
    status: "active",
    shift: "full-time",
    joinDate: "2024-06-15",
    salary: 10000000,
    lastActive: "2025-10-21 10:00",
  },
  {
    key: "7",
    id: "7",
    name: "Trần Văn G",
    email: "tran.vang@fastfood.com",
    phone: "0907890123",
    role: "staff",
    position: "cashier",
    store: "Downtown Store",
    status: "on-leave",
    shift: "evening",
    joinDate: "2024-07-20",
    salary: 8500000,
    lastActive: "2025-10-18 22:00",
  },
  {
    key: "8",
    id: "8",
    name: "Lê Thị H",
    email: "le.thih@fastfood.com",
    phone: "0908901234",
    role: "staff",
    position: "kitchen",
    store: "Downtown Store",
    status: "inactive",
    shift: "evening",
    joinDate: "2024-01-05",
    salary: 8000000,
    lastActive: "2025-09-30 21:00",
  },
  {
    key: "9",
    id: "9",
    name: "Phạm Văn I",
    email: "pham.vani@fastfood.com",
    phone: "0909012345",
    role: "staff",
    position: "delivery",
    store: "Downtown Store",
    status: "active",
    shift: "afternoon",
    joinDate: "2024-08-10",
    salary: 9500000,
    lastActive: "2025-10-21 09:00",
  },
  {
    key: "10",
    id: "10",
    name: "Hoàng Thị K",
    email: "hoang.thik@fastfood.com",
    phone: "0910123456",
    role: "staff",
    position: "cashier",
    store: "Downtown Store",
    status: "active",
    shift: "morning",
    joinDate: "2024-09-05",
    salary: 7500000,
    lastActive: "2025-10-21 08:00",
  },
];

function StaffContent() {
  const { message } = App.useApp();
  const [staff, setStaff] = useState<StaffData[]>(mockStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case "supervisor":
        return "purple";
      case "cashier":
        return "blue";
      case "kitchen":
        return "orange";
      case "delivery":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "on-leave":
        return "warning";
      case "inactive":
        return "default";
      default:
        return "default";
    }
  };

  const getShiftBadge = (shift: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      morning: { color: "#3B82F6", text: "Morning (6AM-2PM)" },
      afternoon: { color: "#F59E0B", text: "Afternoon (2PM-10PM)" },
      evening: { color: "#8B5CF6", text: "Evening (10PM-6AM)" },
      "full-time": { color: "#10B981", text: "Full-time" },
    };
    return badges[shift] || { color: "default", text: shift };
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone?.includes(searchQuery);

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && member.status === "active";
    if (activeTab === "on-leave") return matchesSearch && member.status === "on-leave";
    if (activeTab === "inactive") return matchesSearch && member.status === "inactive";

    return matchesSearch && member.position === activeTab;
  });

  const handleEdit = (record: StaffData) => {
    setSelectedStaff(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setStaff(staff.filter((member) => member.id !== id));
    message.success("Staff member removed successfully!");
  };

  const columns: TableColumnsType<StaffData> = [
    {
      title: "Staff Member",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 280,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            style={{
              backgroundColor: record.status === "active" ? "#10B981" : "#94A3B8",
            }}
          >
            {getInitials(name)}
          </Avatar>
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
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 140,
      filters: [
        { text: "Supervisor", value: "supervisor" },
        { text: "Cashier", value: "cashier" },
        { text: "Kitchen", value: "kitchen" },
        { text: "Delivery", value: "delivery" },
      ],
      onFilter: (value, record) => record.position === value,
      render: (position: string) => (
        <Tag color={getPositionColor(position)}>
          {position.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Shift",
      dataIndex: "shift",
      key: "shift",
      width: 180,
      filters: [
        { text: "Morning", value: "morning" },
        { text: "Afternoon", value: "afternoon" },
        { text: "Evening", value: "evening" },
        { text: "Full-time", value: "full-time" },
      ],
      onFilter: (value, record) => record.shift === value,
      render: (shift: string) => {
        const badge = getShiftBadge(shift);
        return (
          <Badge
            color={badge.color}
            text={<span style={{ fontSize: "13px" }}>{badge.text}</span>}
          />
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Active", value: "active" },
        { text: "On Leave", value: "on-leave" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === "on-leave" ? "ON LEAVE" : status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      width: 130,
      sorter: (a, b) => a.joinDate.localeCompare(b.joinDate),
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      width: 140,
      sorter: (a, b) => (a.salary || 0) - (b.salary || 0),
      render: (salary) =>
        salary ? `${salary.toLocaleString()} VND` : "-",
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      width: 160,
      sorter: (a, b) => a.lastActive.localeCompare(b.lastActive),
      render: (lastActive) => (
        <span style={{ fontSize: "13px", color: "#6B7280" }}>
          <ClockCircleOutlined style={{ marginRight: "6px" }} />
          {lastActive}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Remove staff member"
            description="Are you sure you want to remove this staff member?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems: TabsProps["items"] = [
    {
      key: "all",
      label: (
        <span>
          <TeamOutlined /> All Staff ({staff.length})
        </span>
      ),
    },
    {
      key: "active",
      label: (
        <span>
          <UserOutlined /> Active ({staff.filter((s) => s.status === "active").length})
        </span>
      ),
    },
    {
      key: "cashier",
      label: `Cashiers (${staff.filter((s) => s.position === "cashier").length})`,
    },
    {
      key: "on-leave",
      label: `On Leave (${staff.filter((s) => s.status === "on-leave").length})`,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          Staff Management
        </h1>
        <p style={{ color: "#6B7280", marginTop: "8px" }}>
          Manage Downtown Store team members
        </p>
      </div>

      {/* Search and Add Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Input
          placeholder="Search staff by name, email, or phone..."
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
          Add Staff Member
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredStaff}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} staff members`,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        scroll={{ x: 1400 }}
        style={{ marginTop: "16px" }}
      />

      {/* Add Staff Modal - Placeholder */}
      <Modal
        title="Add New Staff Member"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <div style={{ padding: "24px 0" }}>
          <p style={{ textAlign: "center", color: "#6B7280" }}>
            Staff form will be implemented here
          </p>
        </div>
      </Modal>

      {/* Edit Staff Modal - Placeholder */}
      <Modal
        title="Edit Staff Member"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedStaff(null);
        }}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <div style={{ padding: "24px 0" }}>
          <p style={{ textAlign: "center", color: "#6B7280" }}>
            Staff edit form will be implemented here
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default function ManagerStaffPage() {
  return (
    <ManagerLayout>
      <StaffContent />
    </ManagerLayout>
  );
}
