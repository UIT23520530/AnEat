"use client";

import { useState, useTransition } from "react";
import { Table, Button, Input, Space, Tag, Modal, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layouts/admin-layout";

import { StoresForm } from "@/components/forms/StoresForm";
import { Store } from "@/types";
import { deleteStore } from "@/lib/actions/store.action";

interface StoresViewProps {
  initialStores: Store[];
}

export function StoresView({ initialStores }: StoresViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDeleteStore = (store: Store) => {
    Modal.confirm({
      title: `Delete Store: ${store.name}`,
      content: "Are you sure you want to delete this store? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        return new Promise((resolve, reject) => {
          startTransition(async () => {
            try {
              await deleteStore(store.id);
              message.success("Store deleted successfully");
              resolve(true);
            } catch (error) {
              message.error("Failed to delete store");
              reject(error);
            }
          });
        });
      },
    });
  };

  const filteredStores = initialStores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnsType<Store> = [
    {
      title: "Store Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Store) => (
        <div>
          <div className="font-semibold text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">{record.email}</div>
          <div className="text-xs text-slate-500">{record.phone}</div>
        </div>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      sorter: (a, b) => a.manager.localeCompare(b.manager),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      sorter: (a, b) => a.revenue - b.revenue,
      render: (revenue: number) => (
        <span className="font-semibold text-green-600">
          {revenue.toLocaleString('vi-VN')} VND
        </span>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      sorter: (a, b) => a.orders - b.orders,
      align: "center",
      render: (orders: number) => (
        <span className="font-semibold text-blue-600">{orders}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Maintenance", value: "maintenance" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : status === "maintenance" ? "orange" : "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 120,
      render: (_, record: Store) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedStore(record);
              setIsEditDialogOpen(true);
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStore(record)}
          />
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">All Stores</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Manage your store locations and details
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                placeholder="Search stores..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Store
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            dataSource={filteredStores}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredStores.length,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} stores`,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            onChange={handleTableChange}
            className="ant-table-custom"
            bordered={false}
          />
        </CardContent>
      </Card>

      {/* Add Store Modal */}
      <Modal
        title={<span className="text-lg font-semibold">Add New Store</span>}
        open={isAddDialogOpen}
        onCancel={() => setIsAddDialogOpen(false)}
        footer={null}
        width={800}
        centered
        destroyOnClose
        maskClosable={false}
        transitionName="ant-fade"
        maskTransitionName="ant-fade"
      >
        <p className="text-slate-500 mb-6">Create a new store location with all necessary details.</p>
        <StoresForm onSuccess={() => setIsAddDialogOpen(false)} />
      </Modal>

      {/* Edit Store Modal */}
      <Modal
        title={<span className="text-lg font-semibold">Edit Store: {selectedStore?.name}</span>}
        open={isEditDialogOpen}
        onCancel={() => setIsEditDialogOpen(false)}
        footer={null}
        width={800}
        centered
        destroyOnClose
        maskClosable={false}
        transitionName="ant-fade"
        maskTransitionName="ant-fade"
      >
        <p className="text-slate-500 mb-6">Update the details for this store location.</p>
        <StoresForm store={selectedStore!} onSuccess={() => setIsEditDialogOpen(false)} />
      </Modal>
    </div>
  );
}

// Mock data for demo - replace with actual data fetching
const mockStores: Store[] = [
  {
    id: "1",
    name: "Downtown Store",
    email: "downtown@aneat.com",
    phone: "+84 123 456 789",
    address: "123 Main St, District 1, Ho Chi Minh City",
    manager: "Nguyen Van A",
    status: "active",
    revenue: 125000000,
    orders: 450,
  },
  {
    id: "2",
    name: "Uptown Store",
    email: "uptown@aneat.com",
    phone: "+84 123 456 790",
    address: "456 High St, District 3, Ho Chi Minh City",
    manager: "Tran Thi B",
    status: "active",
    revenue: 98000000,
    orders: 378,
  },
  {
    id: "3",
    name: "Suburban Store",
    email: "suburban@aneat.com",
    phone: "+84 123 456 791",
    address: "789 Park Ave, District 7, Ho Chi Minh City",
    manager: "Le Van C",
    status: "inactive",
    revenue: 45000000,
    orders: 156,
  },
  {
    id: "4",
    name: "Riverside Store",
    email: "riverside@aneat.com",
    phone: "+84 123 456 792",
    address: "321 River Rd, District 2, Ho Chi Minh City",
    manager: "Pham Thi D",
    status: "active",
    revenue: 110000000,
    orders: 425,
  },
  {
    id: "5",
    name: "Hillside Store",
    email: "hillside@aneat.com",
    phone: "+84 123 456 793",
    address: "654 Hill Ave, District 5, Ho Chi Minh City",
    manager: "Hoang Van E",
    status: "active",
    revenue: 87000000,
    orders: 320,
  },
  {
    id: "6",
    name: "Beachfront Store",
    email: "beachfront@aneat.com",
    phone: "+84 123 456 794",
    address: "987 Beach Blvd, District 7, Ho Chi Minh City",
    manager: "Vu Thi F",
    status: "maintenance",
    revenue: 52000000,
    orders: 180,
  },
  {
    id: "7",
    name: "Airport Store",
    email: "airport@aneat.com",
    phone: "+84 123 456 795",
    address: "147 Airport Way, Tan Binh District, Ho Chi Minh City",
    manager: "Dao Van G",
    status: "active",
    revenue: 145000000,
    orders: 520,
  },
  {
    id: "8",
    name: "Mall Store",
    email: "mall@aneat.com",
    phone: "+84 123 456 796",
    address: "258 Mall St, District 1, Ho Chi Minh City",
    manager: "Bui Thi H",
    status: "active",
    revenue: 135000000,
    orders: 485,
  },
  {
    id: "9",
    name: "University Store",
    email: "university@aneat.com",
    phone: "+84 123 456 797",
    address: "369 University Ave, Thu Duc City, Ho Chi Minh City",
    manager: "Ngo Van I",
    status: "active",
    revenue: 92000000,
    orders: 365,
  },
  {
    id: "10",
    name: "Market Store",
    email: "market@aneat.com",
    phone: "+84 123 456 798",
    address: "741 Market St, District 5, Ho Chi Minh City",
    manager: "Ly Thi J",
    status: "active",
    revenue: 78000000,
    orders: 295,
  },
  {
    id: "11",
    name: "Garden Store",
    email: "garden@aneat.com",
    phone: "+84 123 456 799",
    address: "852 Garden Ln, District 9, Ho Chi Minh City",
    manager: "Truong Van K",
    status: "inactive",
    revenue: 38000000,
    orders: 125,
  },
  {
    id: "12",
    name: "Station Store",
    email: "station@aneat.com",
    phone: "+84 123 456 800",
    address: "963 Station Rd, District 3, Ho Chi Minh City",
    manager: "Mai Thi L",
    status: "active",
    revenue: 102000000,
    orders: 395,
  },
];

export default function StoresPage() {
  return (
    <AdminLayout>
      <StoresView initialStores={mockStores} />
    </AdminLayout>
  );
}