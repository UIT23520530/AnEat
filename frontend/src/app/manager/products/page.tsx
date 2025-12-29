"use client";

import { useState } from "react";
import { ManagerLayout } from "@/components/layouts/manager-layout";
import ManagerProductsForm from "@/components/forms/manager/ProductsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Statistic,
  Card as AntCard,
  InputNumber,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  PlusCircleOutlined,
  MinusCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";

interface ProductData {
  key: string;
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  maxStock: number;
  status: "available" | "low-stock" | "out-of-stock";
  image?: string;
  description?: string;
  sku?: string;
  featured?: boolean;
  calories?: number;
  prepTime?: number;
  store: string;
  lastRestocked?: string;
  supplier?: string;
}

// Mock data - chỉ sản phẩm của Downtown Store
const mockProducts: ProductData[] = [
  {
    key: "1",
    id: "1",
    name: "Gà Rán Giòn",
    category: "Main Course",
    price: 50000,
    stock: 100,
    minStock: 20,
    maxStock: 150,
    status: "available",
    sku: "PROD-001",
    featured: true,
    description: "Gà rán giòn tan, thơm ngon",
    calories: 350,
    prepTime: 15,
    store: "Downtown Store",
    lastRestocked: "2025-10-20",
    supplier: "Fresh Chicken Co.",
  },
  {
    key: "2",
    id: "2",
    name: "Burger Bò Phô Mai",
    category: "Main Course",
    price: 45000,
    stock: 80,
    minStock: 30,
    maxStock: 120,
    status: "available",
    sku: "PROD-002",
    description: "Burger bò tươi với phô mai cheddar",
    calories: 420,
    prepTime: 10,
    store: "Downtown Store",
    lastRestocked: "2025-10-21",
    supplier: "Beef Masters",
  },
  {
    key: "3",
    id: "3",
    name: "Pizza Hải Sản",
    category: "Main Course",
    price: 120000,
    stock: 0,
    minStock: 10,
    maxStock: 50,
    status: "out-of-stock",
    sku: "PROD-003",
    featured: true,
    description: "Pizza hải sản tươi ngon",
    calories: 520,
    prepTime: 20,
    store: "Downtown Store",
    lastRestocked: "2025-10-15",
    supplier: "Ocean Fresh",
  },
  {
    key: "4",
    id: "4",
    name: "Khoai Tây Chiên",
    category: "Side Dish",
    price: 25000,
    stock: 150,
    minStock: 50,
    maxStock: 200,
    status: "available",
    sku: "PROD-004",
    description: "Khoai tây chiên giòn rụm",
    calories: 180,
    prepTime: 8,
    store: "Downtown Store",
    lastRestocked: "2025-10-21",
    supplier: "Farm Fresh",
  },
  {
    key: "5",
    id: "5",
    name: "Coca Cola",
    category: "Beverage",
    price: 15000,
    stock: 200,
    minStock: 100,
    maxStock: 300,
    status: "available",
    sku: "PROD-005",
    description: "Nước ngọt có ga",
    calories: 140,
    store: "Downtown Store",
    lastRestocked: "2025-10-20",
    supplier: "Coca-Cola Vietnam",
  },
  {
    key: "6",
    id: "6",
    name: "Gà Cay Hàn Quốc",
    category: "Main Course",
    price: 65000,
    stock: 18,
    minStock: 20,
    maxStock: 80,
    status: "low-stock",
    sku: "PROD-006",
    featured: true,
    description: "Gà chiên sốt cay Hàn Quốc",
    calories: 480,
    prepTime: 18,
    store: "Downtown Store",
    lastRestocked: "2025-10-18",
    supplier: "Korean Spice Co.",
  },
  {
    key: "7",
    id: "7",
    name: "Kem Sundae",
    category: "Dessert",
    price: 20000,
    stock: 60,
    minStock: 30,
    maxStock: 100,
    status: "available",
    sku: "PROD-007",
    description: "Kem vani với sốt caramel",
    calories: 220,
    store: "Downtown Store",
    lastRestocked: "2025-10-21",
    supplier: "Ice Cream Factory",
  },
  {
    key: "8",
    id: "8",
    name: "Salad Rau Củ",
    category: "Appetizer",
    price: 30000,
    stock: 15,
    minStock: 20,
    maxStock: 60,
    status: "low-stock",
    sku: "PROD-008",
    description: "Salad rau củ tươi ngon",
    calories: 85,
    prepTime: 5,
    store: "Downtown Store",
    lastRestocked: "2025-10-21",
    supplier: "Fresh Greens",
  },
  {
    key: "9",
    id: "9",
    name: "Combo Gia Đình",
    category: "Combo",
    price: 250000,
    stock: 30,
    minStock: 10,
    maxStock: 40,
    status: "available",
    sku: "PROD-009",
    featured: true,
    description: "Combo cho 4 người: 8 miếng gà, 4 burger, khoai tây, nước",
    calories: 1800,
    prepTime: 25,
    store: "Downtown Store",
    lastRestocked: "2025-10-20",
  },
  {
    key: "10",
    id: "10",
    name: "Bánh Táo",
    category: "Dessert",
    price: 18000,
    stock: 75,
    minStock: 40,
    maxStock: 120,
    status: "available",
    sku: "PROD-010",
    description: "Bánh táo nướng thơm lừng",
    calories: 240,
    prepTime: 12,
    store: "Downtown Store",
    lastRestocked: "2025-10-20",
    supplier: "Bakery House",
  },
];

function ProductsContent() {
  const { message, modal } = App.useApp();
  const [products, setProducts] = useState<ProductData[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "low-stock":
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
      default:
        return "default";
    }
  };

  const handleRestock = (record: ProductData) => {
    setSelectedProduct(record);
    setRestockQuantity(record.maxStock - record.stock);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = () => {
    if (selectedProduct && restockQuantity > 0) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === selectedProduct.id
            ? {
                ...product,
                stock: product.stock + restockQuantity,
                status:
                  product.stock + restockQuantity === 0
                    ? ("out-of-stock" as const)
                    : product.stock + restockQuantity < product.minStock
                    ? ("low-stock" as const)
                    : ("available" as const),
                lastRestocked: new Date().toISOString().split("T")[0],
              }
            : product
        )
      );
      setIsRestockModalOpen(false);
      setSelectedProduct(null);
      message.success(
        `Nhập hàng thành công ${restockQuantity} sản phẩm của ${selectedProduct.name}!`
      );
    }
  };

  const handleAdjustStock = (productId: string, adjustment: number) => {
    setProducts((prevProducts) => 
      prevProducts.map((product) => {
        if (product.id === productId) {
          const newStock = Math.max(0, product.stock + adjustment);
          return {
            ...product,
            stock: newStock,
            status:
              newStock === 0
                ? ("out-of-stock" as const)
                : newStock < product.minStock
                ? ("low-stock" as const)
                : ("available" as const),
          };
        }
        return product;
      })
    );
    message.success(
      `Tồn kho đã được cập nhật ${adjustment > 0 ? "+" : ""}${adjustment}`
    );
  };

  const handleAddProduct = (values: any) => {
    const productToAdd: ProductData = {
      key: String(products.length + 1),
      id: String(products.length + 1),
      name: values.name,
      category: values.category,
      price: values.price,
      stock: values.stock,
      minStock: values.minStock,
      maxStock: values.maxStock,
      status:
        values.stock === 0
          ? ("out-of-stock" as const)
          : values.stock < values.minStock
          ? ("low-stock" as const)
          : ("available" as const),
      sku: values.sku,
      description: values.description,
      supplier: values.supplier,
      calories: values.calories,
      prepTime: values.prepTime,
      featured: values.featured || false,
      store: "Downtown Store",
      lastRestocked: new Date().toISOString().split("T")[0],
    };

    setProducts([...products, productToAdd]);
    setIsAddModalOpen(false);
    message.success("Sản phẩm đã được thêm thành công!");
  };

  const handleEditProduct = (values: any) => {
    if (!selectedProduct) return;

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              name: values.name,
              category: values.category,
              price: values.price,
              stock: values.stock,
              minStock: values.minStock,
              maxStock: values.maxStock,
              status:
                values.stock === 0
                  ? ("out-of-stock" as const)
                  : values.stock < values.minStock
                  ? ("low-stock" as const)
                  : ("available" as const),
              sku: values.sku,
              description: values.description,
              supplier: values.supplier,
              calories: values.calories,
              prepTime: values.prepTime,
              featured: values.featured || false,
            }
          : product
      )
    );
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    message.success("Sản phẩm đã được cập nhật thành công!");
  };

  const handleEdit = (record: ProductData) => {
    setSelectedProduct(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    message.success("Sản phẩm đã được xóa thành công!");
  };

  const columns: TableColumnsType<ProductData> = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 300,
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
              🍔
            </div>
          )}
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {name}
              {record.featured && (
                <StarFilled style={{ color: "#FBBF24", fontSize: "14px" }} />
              )}
            </div>
            {record.sku && (
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                SKU: {record.sku}
              </div>
            )}
            {record.supplier && (
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                📦 {record.supplier}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
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
      ],
      onFilter: (value, record) => record.category === value,
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 130,
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <span style={{ fontWeight: 600, fontSize: "14px" }}>
          {price.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "Tồn kho",
      key: "stockLevel",
      width: 200,
      sorter: (a, b) => a.stock - b.stock,
      render: (_, record) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <Badge
              count={record.stock}
              showZero
              color={
                record.stock === 0
                  ? "#EF4444"
                  : record.stock < record.minStock
                  ? "#F59E0B"
                  : "#10B981"
              }
              style={{ fontWeight: 600, fontSize: "13px" }}
            />
            <span style={{ fontSize: "12px", color: "#6B7280" }}>
              / {record.maxStock}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "#E5E7EB",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min((record.stock / record.maxStock) * 100, 100)}%`,
                height: "100%",
                backgroundColor:
                  record.stock === 0
                    ? "#EF4444"
                    : record.stock < record.minStock
                    ? "#F59E0B"
                    : "#10B981",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      filters: [
        { text: "Có sẵn", value: "available" },
        { text: "Sắp hết hàng", value: "low-stock" },
        { text: "Hết hàng", value: "out-of-stock" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag
          icon={
            status === "available" ? (
              <CheckCircleOutlined />
            ) : (
              <WarningOutlined />
            )
          }
          color={getStatusColor(status)}
        >
          {status === "out-of-stock"
            ? "Hết hàng"
            : status === "low-stock"
            ? "Sắp hết"
            : "Có sẵn"}
        </Tag>
      ),
    },
    {
      title: "Lần nhập hàng cuối",
      dataIndex: "lastRestocked",
      key: "lastRestocked",
      width: 130,
      sorter: (a, b) =>
        (a.lastRestocked || "").localeCompare(b.lastRestocked || ""),
      render: (date) => (
        <span style={{ fontSize: "13px", color: "#6B7280" }}>{date || "-"}</span>
      ),
    },
    {
      title: "Thật nhanh",
      key: "quickAdjust",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => handleAdjustStock(record.id, -1)}
            disabled={record.stock === 0}
          />
          <Button
            size="small"
            icon={<PlusCircleOutlined />}
            onClick={() => handleAdjustStock(record.id, 1)}
          />
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleRestock(record)}
            block
          >
            Nhập hàng
          </Button>
          <Space size="small" style={{ width: "100%" }}>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Chỉnh sửa
            </Button>
            <Popconfirm
              title="Xóa sản phẩm"
              description="Bạn chắc chắn?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      ),
    },
  ];

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.status === "available").length;
  const lowStockProducts = products.filter((p) => p.status === "low-stock").length;
  const outOfStockProducts = products.filter((p) => p.status === "out-of-stock").length;

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Quản lý Hóa đơn
              </CardTitle>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <AntCard className="border border-slate-200 bg-white">
                <Statistic
                  title="Tổng số sản phẩm"
                  value={totalProducts}
                  valueStyle={{ color: "#3B82F6", fontSize: "28px", fontWeight: "bold" }}
                />
              </AntCard>
              <AntCard className="border border-slate-200 bg-white">
                <Statistic
                  title="Có sẵn"
                  value={availableProducts}
                  valueStyle={{ color: "#10B981", fontSize: "28px", fontWeight: "bold" }}
                  prefix={<CheckCircleOutlined />}
                />
              </AntCard>
              <AntCard className="border border-slate-200 bg-white">
                <Statistic
                  title="Sắp hết hàng"
                  value={lowStockProducts}
                  valueStyle={{ color: "#F59E0B", fontSize: "28px", fontWeight: "bold" }}
                  prefix={<WarningOutlined />}
                />
              </AntCard>
              <AntCard className="border border-slate-200 bg-white">
                <Statistic
                  title="Hết hàng"
                  value={outOfStockProducts}
                  valueStyle={{ color: "#EF4444", fontSize: "28px", fontWeight: "bold" }}
                  prefix={<WarningOutlined />}
                />
              </AntCard>
            </div>

            {/* Search and Filters */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-4 flex-1">
                <Input
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                  size="large"
                />
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  className="w-56"
                  size="large"
                  options={[
                    { label: "Tất cả danh mục", value: "all" },
                    { label: "Main Course", value: "Main Course" },
                    { label: "Side Dish", value: "Side Dish" },
                    { label: "Appetizer", value: "Appetizer" },
                    { label: "Dessert", value: "Dessert" },
                    { label: "Beverage", value: "Beverage" },
                    { label: "Combo", value: "Combo" },
                  ]}
                />
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsAddModalOpen(true)}
              >
                Thêm sản phẩm
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredProducts}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            scroll={{ x: 1500 }}
          />
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Modal
        title="Thêm sản phẩm mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <ManagerProductsForm onSubmit={handleAddProduct} isEdit={false} />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <Button onClick={() => setIsAddModalOpen(false)} size="large">
            Hủy
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
            Thêm sản phẩm
          </Button>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <ManagerProductsForm
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
            Hủy
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
            Lưu thay đổi
          </Button>
        </div>
      </Modal>      {/* Restock Modal */}
      <Modal
        title={
          <div>
            <PlusCircleOutlined style={{ marginRight: "8px", color: "#10B981" }} />
            Nhập hàng
          </div>
        }
        open={isRestockModalOpen}
        onCancel={() => {
          setIsRestockModalOpen(false);
          setSelectedProduct(null);
        }}
        onOk={handleConfirmRestock}
        okText="Xác nhận"
        cancelText="Hủy"
        width={600}
        destroyOnHidden
      >
        {selectedProduct && (
          <div style={{ padding: "20px 0" }}>
            <div
              style={{
                backgroundColor: "#F9FAFB",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: "8px" }}>
                {selectedProduct.name}
              </h3>
              <div style={{ fontSize: "13px", color: "#6B7280" }}>
                <div>SKU: {selectedProduct.sku}</div>
                <div>Tồn kho hiện tại: {selectedProduct.stock} sản phẩm</div>
                <div>Tồn kho tối thiểu: {selectedProduct.minStock} sản phẩm</div>
                <div>Tồn kho tối đa: {selectedProduct.maxStock} sản phẩm</div>
                {selectedProduct.supplier && (
                  <div>Nhà cung cấp: {selectedProduct.supplier}</div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                Số lượng nhập hàng
              </label>
              <InputNumber
                value={restockQuantity}
                onChange={(value) => setRestockQuantity(value || 0)}
                min={1}
                max={selectedProduct.maxStock - selectedProduct.stock}
                style={{ width: "100%" }}
                size="large"
                addonAfter="sản phẩm"
              />
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "#6B7280",
                }}
              >
                Tồn kho mới sẽ là:{" "}
                <strong style={{ color: "#10B981" }}>
                  {selectedProduct.stock + restockQuantity} sản phẩm
                </strong>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ManagerProductsPage() {
  return (
    <ManagerLayout>
      <ProductsContent />
    </ManagerLayout>
  );
}
