"use client";

import { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layouts/manager-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  App,
  Image,
  Statistic,
  Card as AntCard,
  Select,
  Form,
  InputNumber,
  Switch,
  Row,
  Col,
  Upload,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { productService, type Product } from "@/services/product.service";
import { categoryService, type Category } from "@/services/category.service";

function ProductsContent() {
  const { message } = App.useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      });

      setProducts(response.data);
      setPagination({
        ...pagination,
        total: response.meta.totalItems,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories({
        limit: 100,
        isActive: true,
      });
      setCategories(response.data);
    } catch (error: any) {
      message.error("Không thể tải danh mục");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [pagination.current, pagination.pageSize, searchQuery, selectedCategory]);

  // Statistics
  const totalProducts = pagination.total;
  const activeProducts = products.filter((p) => p.isAvailable).length;
  const lowStockProducts = products.filter((p) => p.quantity < 10).length;

  const getCategoryColor = (categoryName?: string) => {
    if (!categoryName) return "default";
    if (categoryName.includes("Burger")) return "blue";
    if (categoryName.includes("Gà") || categoryName.includes("Chicken")) return "orange";
    if (categoryName.includes("Kèm") || categoryName.includes("Side")) return "green";
    if (categoryName.includes("Uống") || categoryName.includes("Beverage")) return "cyan";
    if (categoryName.includes("Miệng") || categoryName.includes("Dessert")) return "pink";
    if (categoryName.includes("Combo")) return "purple";
    return "default";
  };

  const handleAdd = () => {
    form.resetFields();
    setIsAddModalOpen(true);
  };

  const handleEdit = (record: Product) => {
    setSelectedProduct(record);
    form.setFieldsValue({
      ...record,
      categoryId: record.category?.id,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      message.success("Đã xóa sản phẩm");
      loadProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const handleToggleStatus = async (record: Product) => {
    try {
      await productService.updateProduct(record.id, {
        isAvailable: !record.isAvailable,
      });
      message.success(
        record.isAvailable ? "Đã ẩn sản phẩm" : "Đã kích hoạt sản phẩm"
      );
      loadProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleSubmitAdd = async (values: any) => {
    try {
      await productService.createProduct({
        code: values.code,
        name: values.name,
        description: values.description,
        price: values.price,
        image: values.image,
        categoryId: values.categoryId,
        quantity: values.quantity || 0,
        costPrice: values.costPrice || 0,
        prepTime: values.prepTime || 15,
        isAvailable: true,
      });
      message.success("Đã thêm sản phẩm mới");
      setIsAddModalOpen(false);
      form.resetFields();
      loadProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể thêm sản phẩm");
    }
  };

  const handleSubmitEdit = async (values: any) => {
    if (!selectedProduct) return;
    
    try {
      await productService.updateProduct(selectedProduct.id, {
        name: values.name,
        description: values.description,
        price: values.price,
        image: values.image,
        categoryId: values.categoryId,
        quantity: values.quantity,
        costPrice: values.costPrice,
        prepTime: values.prepTime,
      });
      message.success("Đã cập nhật sản phẩm");
      setIsEditModalOpen(false);
      loadProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật sản phẩm");
    }
  };

  const columns: TableColumnsType<Product> = [
    {
      title: "Sản phẩm",
      key: "product",
      fixed: "left",
      width: 300,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {record.image ? (
            <Image
              src={record.image}
              alt={record.name}
              width={60}
              height={60}
              style={{ borderRadius: "8px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "8px",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🍔
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                {record.name}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              SKU: {record.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      key: "category",
      width: 150,
      render: (_, record) => (
        <Tag color={getCategoryColor(record.category?.name)}>
          {record.category?.name || "Chưa phân loại"}
        </Tag>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 150,
      align: "right",
      render: (price: number) => (
        <div style={{ fontWeight: 600, fontSize: "14px" }}>
          {price.toLocaleString()}đ
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (quantity: number) => (
        <Tag color={quantity < 10 ? "red" : quantity < 50 ? "orange" : "green"}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "prepTime",
      key: "prepTime",
      width: 120,
      align: "center",
      render: (time: number) => `${time} phút`,
    },
    {
      title: "Trạng thái",
      dataIndex: "isAvailable",
      key: "isAvailable",
      width: 130,
      align: "center",
      render: (isAvailable: boolean) => (
        <Tag
          color={isAvailable ? "success" : "default"}
          icon={
            isAvailable ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {isAvailable ? "Đang bán" : "Tạm ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Sửa"
          />
          <Button
            type="text"
            danger={record.isAvailable}
            icon={
              record.isAvailable ? (
                <CloseCircleOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={() => handleToggleStatus(record)}
            title={record.isAvailable ? "Ẩn" : "Kích hoạt"}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Quản lý Sản phẩm
              </CardTitle>
            </div>

            {/* Stats Cards */}
            <Row gutter={16}>
              <Col span={8}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Tổng sản phẩm"
                    value={totalProducts}
                    prefix={<PlusOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <Statistic
                    title="Đang bán"
                    value={activeProducts}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <Statistic
                    title="Sắp hết hàng"
                    value={lowStockProducts}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </div>
              </Col>
            </Row>

            {/* Filters */}
            <div className="flex justify-between items-center">
              <Space>
                <Input
                  placeholder="Tìm kiếm theo tên hoặc mã sản phẩm"
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: 300 }}
                  size="large"
                  allowClear
                />
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: 180 }}
                  size="large"
                >
                  <Select.Option value="all">Tất cả danh mục</Select.Option>
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                size="large"
              >
                Thêm sản phẩm
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} sản phẩm`,
                onChange: (page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize });
                },
              }}
              scroll={{ x: 1400 }}
              bordered={false}
              className="ant-table-custom"
            />
          </Spin>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Modal
        title="Thêm sản phẩm mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} onFinish={handleSubmitAdd} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã sản phẩm"
                rules={[{ required: true, message: "Vui lòng nhập mã" }]}
              >
                <Input size="large" placeholder="PROD-XXX" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select size="large" placeholder="Chọn danh mục">
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá bán (đ)"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quantity" label="Số lượng tồn kho">
                <InputNumber min={0} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="costPrice" label="Giá vốn (đ)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="prepTime" label="Thời gian chuẩn bị (phút)" initialValue={15}>
                <InputNumber min={0} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="image" label="URL hình ảnh">
                <Input size="large" placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm sản phẩm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} onFinish={handleSubmitEdit} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select size="large" placeholder="Chọn danh mục">
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá bán (đ)"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quantity" label="Số lượng tồn kho">
                <InputNumber min={0} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="costPrice" label="Giá vốn (đ)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="prepTime" label="Thời gian chuẩn bị (phút)">
                <InputNumber min={0} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="image" label="URL hình ảnh">
            <Input size="large" placeholder="https://..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ManagerLayout>
      <App>
        <ProductsContent />
      </App>
    </ManagerLayout>
  );
}
