"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  Popconfirm,
  App,
  Image,
  Badge,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import ProductsForm from "@/components/forms/ProductsForm";

interface ProductData {
  key: string;
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "available" | "unavailable" | "out-of-stock";
  image?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  featured?: boolean;
  tags?: string;
  calories?: number;
  prepTime?: number;
  spiceLevel?: string;
}

const mockProducts: ProductData[] = [
  {
    key: "1",
    id: "1",
    name: "Gà Rán Giòn",
    category: "Main Course",
    price: 50000,
    stock: 100,
    status: "available",
    sku: "PROD-001",
    featured: true,
    description: "Gà rán giòn tan, thơm ngon",
    calories: 350,
    prepTime: 15,
    spiceLevel: "mild",
  },
  {
    key: "2",
    id: "2",
    name: "Burger Bò Phô Mai",
    category: "Main Course",
    price: 45000,
    stock: 80,
    status: "available",
    sku: "PROD-002",
    description: "Burger bò tươi với phô mai cheddar",
    calories: 420,
    prepTime: 10,
  },
  {
    key: "3",
    id: "3",
    name: "Pizza Hải Sản",
    category: "Main Course",
    price: 120000,
    stock: 0,
    status: "out-of-stock",
    sku: "PROD-003",
    featured: true,
    description: "Pizza hải sản tươi ngon",
    calories: 520,
    prepTime: 20,
  },
  {
    key: "4",
    id: "4",
    name: "Khoai Tây Chiên",
    category: "Side Dish",
    price: 25000,
    stock: 150,
    status: "available",
    sku: "PROD-004",
    description: "Khoai tây chiên giòn rụm",
    calories: 180,
    prepTime: 8,
  },
  {
    key: "5",
    id: "5",
    name: "Coca Cola",
    category: "Beverage",
    price: 15000,
    stock: 200,
    status: "available",
    sku: "PROD-005",
    description: "Nước ngọt có ga",
    calories: 140,
  },
  {
    key: "6",
    id: "6",
    name: "Gà Cay Hàn Quốc",
    category: "Main Course",
    price: 65000,
    stock: 45,
    status: "available",
    sku: "PROD-006",
    featured: true,
    description: "Gà chiên sốt cay Hàn Quốc",
    calories: 480,
    prepTime: 18,
    spiceLevel: "hot",
  },
  {
    key: "7",
    id: "7",
    name: "Kem Sundae",
    category: "Dessert",
    price: 20000,
    stock: 60,
    status: "available",
    sku: "PROD-007",
    description: "Kem vani với sốt caramel",
    calories: 220,
  },
  {
    key: "8",
    id: "8",
    name: "Salad Rau Củ",
    category: "Appetizer",
    price: 30000,
    stock: 0,
    status: "unavailable",
    sku: "PROD-008",
    description: "Salad rau củ tươi ngon",
    calories: 85,
    prepTime: 5,
  },
  {
    key: "9",
    id: "9",
    name: "Combo Gia Đình",
    category: "Combo",
    price: 250000,
    stock: 30,
    status: "available",
    sku: "PROD-009",
    featured: true,
    description: "Combo cho 4 người: 8 miếng gà, 4 burger, khoai tây, nước",
    calories: 1800,
    prepTime: 25,
  },
  {
    key: "10",
    id: "10",
    name: "Bánh Táo",
    category: "Dessert",
    price: 18000,
    stock: 75,
    status: "available",
    sku: "PROD-010",
    description: "Bánh táo nướng thơm lừng",
    calories: 240,
    prepTime: 12,
  },
];export default function AdminProductsPage() {
  const { message } = App.useApp();
  const [products, setProducts] = useState<ProductData[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "unavailable":
        return "warning";
      case "out-of-stock":
        return "error";
      default:
        return "default";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Main Course":
        return "blue";
      case "Side Dish":
        return "green";
      case "Appetizer":
        return "cyan";
      case "Dessert":
        return "pink";
      case "Beverage":
        return "orange";
      case "Combo":
        return "purple";
      case "Snack":
        return "gold";
      default:
        return "default";
    }
  };

  const handleAddProduct = (values: any) => {
    const newProduct: ProductData = {
      key: String(products.length + 1),
      id: String(products.length + 1),
      ...values,
    };
    setProducts([...products, newProduct]);
    setIsAddModalOpen(false);
    message.success("Product added successfully!");
  };

  const handleEditProduct = (values: any) => {
    const updatedProducts = products.map((product) =>
      product.id === selectedProduct?.id ? { ...product, ...values } : product
    );
    setProducts(updatedProducts);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    message.success("Product updated successfully!");
  };

  const handleEdit = (record: ProductData) => {
    setSelectedProduct(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    message.success("Product deleted successfully!");
  };

  const columns: TableColumnsType<ProductData> = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 280,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {record.image ? (
            <Image
              src={record.image}
              alt={name}
              width={48}
              height={48}
              style={{ borderRadius: "8px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                backgroundColor: "#F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🍔
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
              {name}
              {record.featured && (
                <StarFilled style={{ color: "#FBBF24", fontSize: "14px" }} />
              )}
            </div>
            {record.sku && (
              <div style={{ fontSize: "12px", color: "#6B7280" }}>
                SKU: {record.sku}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      filters: [
        { text: "Main Course", value: "Main Course" },
        { text: "Side Dish", value: "Side Dish" },
        { text: "Appetizer", value: "Appetizer" },
        { text: "Dessert", value: "Dessert" },
        { text: "Beverage", value: "Beverage" },
        { text: "Combo", value: "Combo" },
        { text: "Snack", value: "Snack" },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 130,
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <span style={{ fontWeight: 600 }}>
          {price.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 100,
      sorter: (a, b) => a.stock - b.stock,
      render: (stock: number) => (
        <Badge
          count={stock}
          showZero
          color={stock === 0 ? "#EF4444" : stock < 50 ? "#F59E0B" : "#10B981"}
          style={{ fontWeight: 600 }}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      filters: [
        { text: "Available", value: "available" },
        { text: "Unavailable", value: "unavailable" },
        { text: "Out of Stock", value: "out-of-stock" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === "out-of-stock" ? "OUT OF STOCK" : status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Info",
      key: "info",
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: "12px", color: "#6B7280" }}>
          {record.calories && <div>🔥 {record.calories} kcal</div>}
          {record.prepTime && <div>⏱️ {record.prepTime} min</div>}
        </div>
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
            title="Delete product"
            description="Are you sure you want to delete this product?"
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
              Product Management
            </h1>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>
              Manage products across all stores
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "24px" }}>
          <Input
            placeholder="Search products by name, category, or SKU..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "500px" }}
            size="large"
          />
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
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Total Products</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}>
              {products.length}
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
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Available</div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#10B981",
              }}
            >
              {products.filter((p) => p.status === "available").length}
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
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Out of Stock</div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#EF4444",
              }}
            >
              {products.filter((p) => p.status === "out-of-stock").length}
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
            <div style={{ color: "#6B7280", fontSize: "14px" }}>Featured</div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "8px",
                color: "#FBBF24",
              }}
            >
              {products.filter((p) => p.featured).length}
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          scroll={{ x: 1400 }}
        />

        {/* Add Product Modal */}
        <Modal
          title="Add New Product"
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <ProductsForm onSubmit={handleAddProduct} isEdit={false} />
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
              Add Product
            </Button>
          </div>
        </Modal>

        {/* Edit Product Modal */}
        <Modal
          title="Edit Product"
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <ProductsForm
            onSubmit={handleEditProduct}
            initialValues={selectedProduct}
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
                setSelectedProduct(null);
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
