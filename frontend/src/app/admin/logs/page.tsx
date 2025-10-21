"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  DatePicker,
  Select,
  Tooltip,
  App,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface LogData {
  key: string;
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  user: string;
  action: string;
  ipAddress?: string;
  module?: string;
  details?: string;
}

const mockLogs: LogData[] = [
  {
    key: "1",
    id: "1",
    timestamp: "2025-10-21 10:30:15",
    level: "info",
    user: "admin@aneat.com",
    action: "User logged in successfully",
    ipAddress: "192.168.1.100",
    module: "Authentication",
    details: "Login from Chrome browser",
  },
  {
    key: "2",
    id: "2",
    timestamp: "2025-10-21 10:32:01",
    level: "warning",
    user: "staff@aneat.com",
    action: "Failed to update product (ID: P001)",
    ipAddress: "192.168.1.101",
    module: "Product Management",
    details: "Product not found in database",
  },
  {
    key: "3",
    id: "3",
    timestamp: "2025-10-21 10:35:22",
    level: "success",
    user: "admin@aneat.com",
    action: "Created new promotion (CODE: FALL25)",
    ipAddress: "192.168.1.100",
    module: "Promotions",
    details: "Promotion valid from 2025-10-21 to 2025-11-21",
  },
  {
    key: "4",
    id: "4",
    timestamp: "2025-10-21 10:40:00",
    level: "error",
    user: "system",
    action: "Database connection failed",
    ipAddress: "::1",
    module: "System",
    details: "Connection timeout after 30 seconds",
  },
  {
    key: "5",
    id: "5",
    timestamp: "2025-10-21 10:45:30",
    level: "info",
    user: "manager@aneat.com",
    action: "Generated sales report",
    ipAddress: "192.168.1.102",
    module: "Analytics",
    details: "Report for October 2025",
  },
  {
    key: "6",
    id: "6",
    timestamp: "2025-10-21 11:00:00",
    level: "warning",
    user: "staff@aneat.com",
    action: "Low stock alert for product Gà Rán Giòn",
    ipAddress: "192.168.1.101",
    module: "Inventory",
    details: "Current stock: 15 units (threshold: 20)",
  },
  {
    key: "7",
    id: "7",
    timestamp: "2025-10-21 11:15:45",
    level: "success",
    user: "admin@aneat.com",
    action: "Created new user account",
    ipAddress: "192.168.1.100",
    module: "User Management",
    details: "New staff member added to Store #2",
  },
  {
    key: "8",
    id: "8",
    timestamp: "2025-10-21 11:30:20",
    level: "error",
    user: "system",
    action: "Payment gateway timeout",
    ipAddress: "::1",
    module: "Payment",
    details: "MoMo payment failed for invoice INV-0045",
  },
  {
    key: "9",
    id: "9",
    timestamp: "2025-10-21 11:45:00",
    level: "info",
    user: "manager@aneat.com",
    action: "Updated store settings",
    ipAddress: "192.168.1.102",
    module: "Store Management",
    details: "Changed operating hours for Store #1",
  },
  {
    key: "10",
    id: "10",
    timestamp: "2025-10-21 12:00:00",
    level: "success",
    user: "admin@aneat.com",
    action: "System backup completed",
    ipAddress: "::1",
    module: "System",
    details: "Database backup saved to cloud storage",
  },
  {
    key: "11",
    id: "11",
    timestamp: "2025-10-21 12:15:30",
    level: "warning",
    user: "staff@aneat.com",
    action: "Failed login attempt",
    ipAddress: "192.168.1.150",
    module: "Authentication",
    details: "Invalid password - 3rd attempt",
  },
  {
    key: "12",
    id: "12",
    timestamp: "2025-10-21 12:30:00",
    level: "info",
    user: "customer@example.com",
    action: "Order placed successfully",
    ipAddress: "203.113.45.12",
    module: "Orders",
    details: "Order #ORD-12345 - Total: 250,000 ₫",
  },
];

export default function LogsPage() {
  const { message } = App.useApp();
  const [logs, setLogs] = useState<LogData[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !levelFilter || log.level === levelFilter;
    const matchesModule = !moduleFilter || log.module === moduleFilter;
    return matchesSearch && matchesLevel && matchesModule;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success":
        return "success";
      case "info":
        return "blue";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircleOutlined />;
      case "info":
        return <InfoCircleOutlined />;
      case "warning":
        return <WarningOutlined />;
      case "error":
        return <CloseCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const handleRefresh = () => {
    message.success("Logs refreshed successfully!");
    // In real app, this would fetch new logs from API
  };

  const handleExport = () => {
    message.success("Exporting logs to CSV...");
    // In real app, this would export logs
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setLevelFilter(null);
    setModuleFilter(null);
    message.info("Filters cleared");
  };

  const columns: TableColumnsType<LogData> = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      sorter: (a, b) => a.timestamp.localeCompare(b.timestamp),
      defaultSortOrder: "descend",
      render: (timestamp: string) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {new Date(timestamp).toLocaleDateString("en-GB")}
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280" }}>
            {new Date(timestamp).toLocaleTimeString("en-GB")}
          </div>
        </div>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 120,
      filters: [
        { text: "Success", value: "success" },
        { text: "Info", value: "info" },
        { text: "Warning", value: "warning" },
        { text: "Error", value: "error" },
      ],
      onFilter: (value, record) => record.level === value,
      render: (level: string) => (
        <Tag icon={getLevelIcon(level)} color={getLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      width: 160,
      filters: [
        { text: "Authentication", value: "Authentication" },
        { text: "Product Management", value: "Product Management" },
        { text: "Promotions", value: "Promotions" },
        { text: "System", value: "System" },
        { text: "Analytics", value: "Analytics" },
        { text: "Inventory", value: "Inventory" },
        { text: "User Management", value: "User Management" },
        { text: "Payment", value: "Payment" },
        { text: "Store Management", value: "Store Management" },
        { text: "Orders", value: "Orders" },
      ],
      onFilter: (value, record) => record.module === value,
      render: (module: string) => <Tag color="purple">{module}</Tag>,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 180,
      sorter: (a, b) => a.user.localeCompare(b.user),
      render: (user: string) => (
        <div>
          <div style={{ fontWeight: 600 }}>{user}</div>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 300,
      render: (action: string, record) => (
        <div>
          <div style={{ marginBottom: "4px" }}>{action}</div>
          {record.details && (
            <div style={{ fontSize: "12px", color: "#6B7280" }}>
              {record.details}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 140,
      render: (ip: string) => (
        <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{ip}</span>
      ),
    },
  ];
  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
              System Logs
            </h1>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>
              Monitor system activities and events
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleExport}
            >
              Export Logs
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <Input
            placeholder="Search logs by action, user, or module..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "400px" }}
            size="large"
          />
          
          <Select
            placeholder="Filter by Level"
            value={levelFilter}
            onChange={setLevelFilter}
            style={{ width: "150px" }}
            size="large"
            allowClear
          >
            <Option value="success">Success</Option>
            <Option value="info">Info</Option>
            <Option value="warning">Warning</Option>
            <Option value="error">Error</Option>
          </Select>

          <Select
            placeholder="Filter by Module"
            value={moduleFilter}
            onChange={setModuleFilter}
            style={{ width: "200px" }}
            size="large"
            allowClear
          >
            <Option value="Authentication">Authentication</Option>
            <Option value="Product Management">Product Management</Option>
            <Option value="Promotions">Promotions</Option>
            <Option value="System">System</Option>
            <Option value="Analytics">Analytics</Option>
            <Option value="Inventory">Inventory</Option>
            <Option value="User Management">User Management</Option>
            <Option value="Payment">Payment</Option>
            <Option value="Store Management">Store Management</Option>
            <Option value="Orders">Orders</Option>
          </Select>

          <Button onClick={handleClearFilters} size="large">
            Clear Filters
          </Button>
        </div>

        {/* Statistics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Total Logs</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}>
              {logs.length}
            </div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ color: "#6B7280", fontSize: "14px" }}>
              <CheckCircleOutlined style={{ marginRight: "4px", color: "#10B981" }} />
              Success
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#10B981",
              }}
            >
              {logs.filter((l) => l.level === "success").length}
            </div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ color: "#6B7280", fontSize: "14px" }}>
              <WarningOutlined style={{ marginRight: "4px", color: "#F59E0B" }} />
              Warnings
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#F59E0B",
              }}
            >
              {logs.filter((l) => l.level === "warning").length}
            </div>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ color: "#6B7280", fontSize: "14px" }}>
              <CloseCircleOutlined style={{ marginRight: "4px", color: "#EF4444" }} />
              Errors
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#EF4444",
              }}
            >
              {logs.filter((l) => l.level === "error").length}
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredLogs}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} logs`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1300 }}
        />
      </div>
    </AdminLayout>
  );
}