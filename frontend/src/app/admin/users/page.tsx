"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { TabsProps, TableColumnsType } from "antd";
import UsersForm from "@/components/forms/UsersForm";

interface UserData {
  key: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "staff" | "customer";
  store?: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  address?: string;
  notes?: string;
}

const mockUsers: UserData[] = [
  {
    key: "1",
    id: "1",
    name: "Admin User",
    email: "admin@fastfood.com",
    phone: "0901234567",
    role: "admin",
    status: "active",
    lastLogin: "2025-10-04",
    address: "123 Admin Street",
  },
  {
    key: "2",
    id: "2",
    name: "Nguyễn Văn A",
    email: "manager1@fastfood.com",
    phone: "0902345678",
    role: "manager",
    store: "Store #1",
    status: "active",
    lastLogin: "2025-10-04",
    address: "456 Manager Ave",
  },
  {
    key: "3",
    id: "3",
    name: "Trần Thị B",
    email: "staff1@fastfood.com",
    phone: "0903456789",
    role: "staff",
    store: "Store #1",
    status: "active",
    lastLogin: "2025-10-03",
  },
  {
    key: "4",
    id: "4",
    name: "Lê Văn C",
    email: "customer1@example.com",
    phone: "0904567890",
    role: "customer",
    status: "active",
    lastLogin: "2025-10-04",
  },
  {
    key: "5",
    id: "5",
    name: "Phạm Thị D",
    email: "customer2@example.com",
    role: "customer",
    status: "inactive",
    lastLogin: "2025-09-15",
  },
  {
    key: "6",
    id: "6",
    name: "Hoàng Văn E",
    email: "staff2@fastfood.com",
    phone: "0905678901",
    role: "staff",
    store: "Store #2",
    status: "active",
    lastLogin: "2025-10-04",
  },
  {
    key: "7",
    id: "7",
    name: "Nguyễn Thị F",
    email: "manager2@fastfood.com",
    phone: "0906789012",
    role: "manager",
    store: "Store #2",
    status: "active",
    lastLogin: "2025-10-03",
  },
  {
    key: "8",
    id: "8",
    name: "Trần Văn G",
    email: "customer3@example.com",
    phone: "0907890123",
    role: "customer",
    status: "active",
    lastLogin: "2025-10-02",
  },
  {
    key: "9",
    id: "9",
    name: "Lê Thị H",
    email: "customer4@example.com",
    role: "customer",
    status: "suspended",
    lastLogin: "2025-08-20",
  },
  {
    key: "10",
    id: "10",
    name: "Phạm Văn I",
    email: "staff3@fastfood.com",
    phone: "0908901234",
    role: "staff",
    store: "Store #3",
    status: "active",
    lastLogin: "2025-10-04",
  },
];

export default function AdminUsersPage() {
  const { message } = App.useApp();
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "red";
      case "manager":
        return "blue";
      case "staff":
        return "green";
      case "customer":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <CrownOutlined />;
      case "manager":
        return <TeamOutlined />;
      case "staff":
        return <UserOutlined />;
      case "customer":
        return <UserOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || user.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleAddUser = (values: any) => {
    const newUser: UserData = {
      key: String(users.length + 1),
      id: String(users.length + 1),
      ...values,
      lastLogin: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    message.success("User added successfully!");
  };

  const handleEditUser = (values: any) => {
    const updatedUsers = users.map((user) =>
      user.id === selectedUser?.id ? { ...user, ...values } : user
    );
    setUsers(updatedUsers);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    message.success("User updated successfully!");
  };

  const handleEdit = (record: UserData) => {
    setSelectedUser(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
    message.success("User deleted successfully!");
  };

  const columns: TableColumnsType<UserData> = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar style={{ backgroundColor: "#3B82F6" }}>
            {getInitials(name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (phone) => phone || "-",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 130,
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Manager", value: "manager" },
        { text: "Staff", value: "staff" },
        { text: "Customer", value: "customer" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role: string) => (
        <Tag icon={getRoleIcon(role)} color={getRoleColor(role)}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Store",
      dataIndex: "store",
      key: "store",
      width: 150,
      render: (store) => store || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Suspended", value: "suspended" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 130,
      sorter: (a, b) => a.lastLogin.localeCompare(b.lastLogin),
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
            title="Delete user"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
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
          <TeamOutlined /> All Users ({users.length})
        </span>
      ),
    },
    {
      key: "admin",
      label: (
        <span>
          <CrownOutlined /> Admins ({users.filter((u) => u.role === "admin").length})
        </span>
      ),
    },
    {
      key: "manager",
      label: (
        <span>
          <TeamOutlined /> Managers ({users.filter((u) => u.role === "manager").length})
        </span>
      ),
    },
    {
      key: "staff",
      label: (
        <span>
          <UserOutlined /> Staff ({users.filter((u) => u.role === "staff").length})
        </span>
      ),
    },
    {
      key: "customer",
      label: (
        <span>
          <UserOutlined /> Customers ({users.filter((u) => u.role === "customer").length})
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
            User Management
          </h1>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>
            Manage all system users
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
            placeholder="Search users by name or email..."
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
            Add User
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
          dataSource={filteredUsers}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          scroll={{ x: 1200 }}
          style={{ marginTop: "16px" }}
        />

        {/* Add User Modal */}
        <Modal
          title="Add New User"
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <UsersForm onSubmit={handleAddUser} isEdit={false} />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button onClick={() => setIsAddModalOpen(false)} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                const form = document.querySelector("form");
                if (form) {
                  const submitButton = form.querySelector(
                    'button[type="submit"]'
                  ) as HTMLButtonElement;
                  if (submitButton) submitButton.click();
                }
              }}
            >
              Add User
            </Button>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          title="Edit User"
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <UsersForm
            onSubmit={handleEditUser}
            initialValues={selectedUser}
            isEdit={true}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                const form = document.querySelector("form");
                if (form) {
                  const submitButton = form.querySelector(
                    'button[type="submit"]'
                  ) as HTMLButtonElement;
                  if (submitButton) submitButton.click();
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
