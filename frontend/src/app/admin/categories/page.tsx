"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Table, Button, Input, Tag, Space, Modal, Popconfirm, App, Image, Badge } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import CategoriesForm from "@/components/forms/admin/CategoriesForm";

interface CategoryData {
  key: string;
  id: string;
  name: string;
  description: string;
  image?: string;
  productCount?: number;
  status?: "active" | "inactive";
  createdAt?: string;
}

const mockCategories: CategoryData[] = [
  {
    key: "1",
    id: "1",
    name: "Main Course",
    description: "Các món ăn chính như gà rán, burger, pizza",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
    productCount: 45,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    key: "2",
    id: "2",
    name: "Side Dish",
    description: "Các món ăn kèm như khoai tây chiên, salad",
    image: "https://images.unsplash.com/photo-1573979174552-5dc3c2c1f938?w=200",
    productCount: 28,
    status: "active",
    createdAt: "2024-01-16",
  },
  {
    key: "3",
    id: "3",
    name: "Beverage",
    description: "Các loại đồ uống như nước ngọt, trà, cà phê",
    image: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=200",
    productCount: 32,
    status: "active",
    createdAt: "2024-01-17",
  },
  {
    key: "4",
    id: "4",
    name: "Dessert",
    description: "Các món tráng miệng như kem, bánh ngọt",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200",
    productCount: 18,
    status: "active",
    createdAt: "2024-01-18",
  },
  {
    key: "5",
    id: "5",
    name: "Appetizer",
    description: "Các món khai vị như salad, súp",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
    productCount: 15,
    status: "active",
    createdAt: "2024-01-19",
  },
  {
    key: "6",
    id: "6",
    name: "Combo",
    description: "Các combo tiết kiệm cho gia đình",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
    productCount: 12,
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    key: "7",
    id: "7",
    name: "Snack",
    description: "Các món ăn vặt nhẹ",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200",
    productCount: 8,
    status: "inactive",
    createdAt: "2024-01-21",
  },
];

export default function AdminCategoriesPage() {
  const { message } = App.useApp();
  const [categories, setCategories] = useState<CategoryData[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      default:
        return "default";
    }
  };

  const handleAddCategory = (values: any) => {
    const newCategory: CategoryData = {
      key: String(categories.length + 1),
      id: String(categories.length + 1),
      name: values.name,
      description: values.description,
      image: values.image?.[0]?.thumbUrl || undefined,
      productCount: 0,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCategories([...categories, newCategory]);
    setIsAddModalOpen(false);
    message.success("Category added successfully!");
  };

  const handleEditCategory = (values: any) => {
    const updatedCategories = categories.map((category) =>
      category.id === selectedCategory?.id
        ? {
            ...category,
            name: values.name,
            description: values.description,
            image: values.image?.[0]?.thumbUrl || category.image,
          }
        : category
    );
    setCategories(updatedCategories);
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    message.success("Category updated successfully!");
  };

  const handleEdit = (record: CategoryData) => {
    setSelectedCategory(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));
    message.success("Category deleted successfully!");
  };

  const columns: TableColumnsType<CategoryData> = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 320,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {record.image ? (
            <Image
              src={record.image}
              alt={name}
              width={56}
              height={56}
              style={{ borderRadius: "8px", objectFit: "cover" }}
              preview={false}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "8px",
                backgroundColor: "#F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              <AppstoreOutlined style={{ color: "#9CA3AF" }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>{name}</div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              ID: {record.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 350,
      ellipsis: true,
      render: (description: string) => (
        <span style={{ color: "#6B7280" }}>{description}</span>
      ),
    },
    {
      title: "Products",
      dataIndex: "productCount",
      key: "productCount",
      width: 120,
      align: "center",
      sorter: (a, b) => (a.productCount || 0) - (b.productCount || 0),
      render: (count: number) => (
        <Badge
          count={count || 0}
          showZero
          color="#3B82F6"
          style={{ fontWeight: 600 }}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase() || "ACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      sorter: (a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""),
      render: (date: string) => (
        <span style={{ color: "#6B7280", fontSize: "13px" }}>
          {date || "-"}
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
            title="Delete category"
            description="Are you sure you want to delete this category?"
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
              Quản lý danh mục menu
            </h1>
            {/* <p style={{ color: "#6B7280", marginTop: "8px" }}>
              Manage product categories and classifications
            </p> */}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Input
              placeholder="Tìm kiếm danh mục theo tên hoặc mô tả..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "300px" }}
              size="large"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsAddModalOpen(true)}
            >
              Thêm danh mục
            </Button>
          </div>
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
            <div style={{ color: "#6B7280", fontSize: "14px" }}>
              Total Categories
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}
            >
              {categories.length}
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
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Active</div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#10B981",
              }}
            >
              {categories.filter((c) => c.status === "active").length}
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
              Total Products
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#3B82F6",
              }}
            >
              {categories.reduce((sum, c) => sum + (c.productCount || 0), 0)}
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
              Avg Products/Category
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#8B5CF6",
              }}
            >
              {Math.round(
                categories.reduce((sum, c) => sum + (c.productCount || 0), 0) /
                  categories.length
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredCategories}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          scroll={{ x: 1300 }}
        />

        {/* Add Category Modal */}
        <Modal
          title="Add New Category"
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          width={800}
          destroyOnHidden
        >
          <CategoriesForm onSubmit={handleAddCategory} isEdit={false} />
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
              Add Category
            </Button>
          </div>
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          title="Edit Category"
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          footer={null}
          width={800}
          destroyOnHidden
        >
          <CategoriesForm
            onSubmit={handleEditCategory}
            initialValues={selectedCategory}
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
                setSelectedCategory(null);
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
