"use client";

import React, { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layouts/manager-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Spin,
  Select,
  DatePicker,
  Tabs,
  App,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  stockRequestService,
  type StockRequest,
  type CreateStockRequestDto,
  type StockStatistics,
} from "@/services/stock-request.service";
import { productService, type Product } from "@/services/product.service";
import { categoryService, type Category } from "@/services/category.service";
import dayjs from "dayjs";

const { Search } = Input;

function WarehouseContent() {
  const { message } = App.useApp();
  
  // States
  const [activeTab, setActiveTab] = useState("inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<StockStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Forms
  const [requestForm] = Form.useForm();

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories({
        page: 1,
        limit: 100,
        isActive: true,
      });
      setCategories(response.data);
    } catch (error: any) {
      console.error("Failed to load categories:", error);
    }
  };

  // Load products (inventory)
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      });

      setProducts(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.totalItems,
      }));
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Load stock requests
  const loadStockRequests = async () => {
    try {
      setLoading(true);
      const response = await stockRequestService.getStockRequests({
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      });

      setStockRequests(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.totalItems,
      }));
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await stockRequestService.getStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      console.error("Failed to load statistics:", error);
    }
  };

  useEffect(() => {
    loadStatistics();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "inventory") {
      loadProducts();
    } else if (activeTab === "requests") {
      loadStockRequests();
    }
  }, [activeTab, pagination.current, pagination.pageSize, searchQuery, statusFilter, categoryFilter]);

  // Handle create stock request
  const handleOpenRequestModal = (product: Product) => {
    setSelectedProduct(product);
    requestForm.setFieldsValue({
      productId: product.id,
      type: "RESTOCK",
      requestedQuantity: 50,
    });
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (values: CreateStockRequestDto) => {
    try {
      await stockRequestService.createStockRequest({
        ...values,
        expectedDate: values.expectedDate ? dayjs(values.expectedDate).toISOString() : undefined,
      });
      message.success("Tạo yêu cầu nhập kho thành công!");
      setIsRequestModalOpen(false);
      requestForm.resetFields();
      setSelectedProduct(null);
      loadStatistics();
      if (activeTab === "requests") {
        loadStockRequests();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tạo yêu cầu");
    }
  };

  // Handle cancel request
  const handleCancelRequest = async (id: string) => {
    try {
      await stockRequestService.cancelStockRequest(id);
      message.success("Đã hủy yêu cầu!");
      loadStockRequests();
      loadStatistics();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể hủy yêu cầu");
    }
  };

  // Get category color
  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      // Main categories
      "Main Course": "blue",
      "Món Chính": "blue",
      "Side Dish": "green",
      "Món Phụ": "green",
      "Beverage": "orange",
      "Đồ Uống": "orange",
      "Nước Giải Khát": "orange",
      "Dessert": "purple",
      "Tráng Miệng": "purple",
      "Combo": "red",
      "Set Meal": "red",
      "Appetizer": "cyan",
      "Khai Vị": "cyan",
      // Additional categories
      "Fast Food": "volcano",
      "Đồ Ăn Nhanh": "volcano",
      "Snack": "lime",
      "Ăn Vặt": "lime",
      "Salad": "green",
      "Coffee": "gold",
      "Cà Phê": "gold",
      "Tea": "magenta",
      "Trà": "magenta",
      "Juice": "geekblue",
      "Nước Ép": "geekblue",
      "Smoothie": "purple",
      "Sinh Tố": "purple",
      "Beer": "orange",
      "Bia": "orange",
      "Wine": "red",
      "Rượu": "red",
    };
    
    // If found in predefined colors, return it
    if (colors[categoryName]) {
      return colors[categoryName];
    }
    
    // Dynamic color generation based on hash
    const dynamicColors = ["blue", "green", "orange", "purple", "cyan", "magenta", "geekblue", "volcano", "lime", "gold"];
    const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return dynamicColors[hash % dynamicColors.length];
  };

  // Get stock status
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: "error", text: "Hết hàng", icon: <CloseCircleOutlined /> };
    if (quantity < 10) return { color: "warning", text: "Sắp hết", icon: <WarningOutlined /> };
    if (quantity < 50) return { color: "processing", text: "Còn ít", icon: <ClockCircleOutlined /> };
    return { color: "success", text: "Đủ hàng", icon: <CheckCircleOutlined /> };
  };

  // Get request status config
  const getRequestStatus = (status: string) => {
    const configs: Record<string, { color: string; text: string }> = {
      PENDING: { color: "default", text: "Chờ duyệt" },
      APPROVED: { color: "processing", text: "Đã duyệt" },
      REJECTED: { color: "error", text: "Từ chối" },
      COMPLETED: { color: "success", text: "Hoàn thành" },
      CANCELLED: { color: "default", text: "Đã hủy" },
    };
    return configs[status] || configs.PENDING;
  };

  // Inventory columns
  const inventoryColumns: ColumnsType<Product> = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.image && (
            <img
              src={record.image}
              alt={record.name}
              className="w-12 h-12 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/products/placeholder.png";
              }}
            />
          )}
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-500">SKU: {record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
      width: 150,
      render: (name: string) => 
        name ? (
          <Tag color={getCategoryColor(name)}>{name}</Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "center",
      render: (quantity: number) => {
        const status = getStockStatus(quantity);
        return (
          <Tag color={status.color} icon={status.icon}>
            {quantity}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => {
        const status = getStockStatus(record.quantity);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Giá vốn",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 120,
      align: "right",
      render: (price: number) => `${price.toLocaleString()} ₫`,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenRequestModal(record)}
          disabled={!record.isAvailable}
        >
          Yêu cầu nhập
        </Button>
      ),
    },
  ];

  // Stock requests columns
  const requestsColumns: ColumnsType<StockRequest> = [
    {
      title: "Mã YC",
      dataIndex: "requestNumber",
      key: "requestNumber",
      width: 130,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product.name}</div>
          <div className="text-xs text-gray-500">SKU: {record.product.code}</div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => {
        const types: Record<string, string> = {
          RESTOCK: "Nhập hàng",
          ADJUSTMENT: "Điều chỉnh",
          RETURN: "Trả hàng",
        };
        return types[type] || type;
      },
    },
    {
      title: "SL yêu cầu",
      dataIndex: "requestedQuantity",
      key: "requestedQuantity",
      width: 100,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const config = getRequestStatus(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestedDate",
      key: "requestedDate",
      width: 120,
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Ngày dự kiến",
      dataIndex: "expectedDate",
      key: "expectedDate",
      width: 120,
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Người yêu cầu",
      key: "requestedBy",
      width: 150,
      render: (_, record) => record.requestedBy.name,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          {record.status === "PENDING" && (
            <Popconfirm
              title="Hủy yêu cầu?"
              description="Bạn có chắc muốn hủy yêu cầu này?"
              onConfirm={() => handleCancelRequest(record.id)}
              okText="Hủy YC"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger size="small">
                Hủy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Statistics */}
      {statistics && (
        <div className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Tổng yêu cầu"
                  value={statistics.totalRequests}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<InboxOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Chờ duyệt"
                  value={statistics.pendingRequests}
                  valueStyle={{ color: "#faad14" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Đã duyệt"
                  value={statistics.approvedRequests}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Hoàn thành"
                  value={statistics.completedRequests}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Từ chối"
                  value={statistics.rejectedRequests}
                  valueStyle={{ color: "#ff4d4f" }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Đã hủy"
                  value={statistics.cancelledRequests}
                  valueStyle={{ color: "#8c8c8c" }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Main Content */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Quản lý kho hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "inventory",
                label: (
                  <span>
                    <InboxOutlined /> Tồn kho sản phẩm
                  </span>
                ),
                children: (
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <Space size="middle">
                        <Search
                          placeholder="Tìm sản phẩm..."
                          allowClear
                          enterButton={<SearchOutlined />}
                          size="large"
                          onSearch={setSearchQuery}
                          onChange={(e) => {
                            if (!e.target.value) setSearchQuery("");
                          }}
                          style={{ width: 400 }}
                        />
                        <Select
                          value={categoryFilter}
                          onChange={setCategoryFilter}
                          style={{ width: 180 }}
                          size="large"
                          placeholder="Chọn danh mục"
                        >
                          <Select.Option value="all">Tất cả danh mục</Select.Option>
                          {categories.map((cat) => (
                            <Select.Option key={cat.id} value={cat.id}>
                              {cat.name}
                            </Select.Option>
                          ))}
                        </Select>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          size="large"
                          onClick={() => setIsRequestModalOpen(true)}
                        >
                          Tạo yêu cầu nhanh
                        </Button>
                      </Space>
                    </div>

                    <Spin spinning={loading}>
                      <Table
                        columns={inventoryColumns}
                        dataSource={products}
                        rowKey="id"
                        pagination={{
                          ...pagination,
                          onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                          },
                          showSizeChanger: true,
                          showTotal: (total) => `Tổng ${total} sản phẩm`,
                        }}
                        scroll={{ x: 1200 }}
                      />
                    </Spin>
                  </>
                ),
              },
              {
                key: "requests",
                label: (
                  <span>
                    <HistoryOutlined /> Yêu cầu nhập kho
                  </span>
                ),
                children: (
                  <>
                    <div className="mb-4 flex justify-between items-center gap-3">
                      <Space>
                        <Search
                          placeholder="Tìm theo mã yêu cầu hoặc sản phẩm..."
                          allowClear
                          enterButton={<SearchOutlined />}
                          size="large"
                          onSearch={setSearchQuery}
                          onChange={(e) => {
                            if (!e.target.value) setSearchQuery("");
                          }}
                          style={{ width: 400 }}
                        />
                        <Select
                          value={statusFilter}
                          onChange={setStatusFilter}
                          style={{ width: 150 }}
                          size="large"
                        >
                          <Select.Option value="all">Tất cả</Select.Option>
                          <Select.Option value="PENDING">Chờ duyệt</Select.Option>
                          <Select.Option value="APPROVED">Đã duyệt</Select.Option>
                          <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                          <Select.Option value="REJECTED">Từ chối</Select.Option>
                          <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                        </Select>
                      </Space>
                    </div>

                    <Spin spinning={loading}>
                      <Table
                        columns={requestsColumns}
                        dataSource={stockRequests}
                        rowKey="id"
                        pagination={{
                          ...pagination,
                          onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                          },
                          showSizeChanger: true,
                          showTotal: (total) => `Tổng ${total} yêu cầu`,
                        }}
                        scroll={{ x: 1400 }}
                      />
                    </Spin>
                  </>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Create Stock Request Modal */}
      <Modal
        title="Tạo yêu cầu nhập kho"
        open={isRequestModalOpen}
        onCancel={() => {
          setIsRequestModalOpen(false);
          requestForm.resetFields();
          setSelectedProduct(null);
        }}
        footer={null}
        width={600}
      >
          {selectedProduct && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                {selectedProduct.image && (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">{selectedProduct.name}</div>
                  <div className="text-sm text-gray-500">
                    Tồn kho hiện tại: <strong>{selectedProduct.quantity}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Form
            form={requestForm}
            layout="vertical"
            onFinish={handleSubmitRequest}
            className="mt-4"
          >
            {!selectedProduct && (
              <Form.Item
                label="Chọn sản phẩm"
                name="productId"
                rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn sản phẩm cần nhập kho"
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.children as unknown) as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {products.map((product) => (
                    <Select.Option key={product.id} value={product.id}>
                      {product.name} - SKU: {product.code} (Tồn: {product.quantity})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {selectedProduct && (
              <Form.Item name="productId" hidden>
                <Input />
              </Form.Item>
            )}

            <Form.Item
              label="Loại yêu cầu"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu!" }]}
            >
              <Select size="large">
                <Select.Option value="RESTOCK">Nhập hàng</Select.Option>
                <Select.Option value="ADJUSTMENT">Điều chỉnh</Select.Option>
                <Select.Option value="RETURN">Trả hàng</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Số lượng yêu cầu"
              name="requestedQuantity"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0!" },
              ]}
            >
              <Input type="number" size="large" min={1} />
            </Form.Item>

            <Form.Item label="Ngày dự kiến nhận hàng" name="expectedDate">
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                disabledDate={(current) => {
                  return current && current < dayjs().startOf('day');
                }}
              />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} placeholder="Ghi chú thêm về yêu cầu này..." />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    requestForm.resetFields();
                    setSelectedProduct(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Tạo yêu cầu
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

export default function WarehousePage() {
  return (
    <ManagerLayout>
        <App>
            <WarehouseContent />
        </App>
    </ManagerLayout>
  );
}
