"use client";

import React, { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layouts/manager-layout";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  message,
  Space,
  Tag,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Select,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  categoryService,
  type Category,
  type CreateCategoryDto,
  type UpdateCategoryDto,
} from "@/services/category.service";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const { Search } = Input;

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Forms
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
      });

      setCategories(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.totalItems,
      }));
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [pagination.current, pagination.pageSize, searchQuery]);

  // Statistics
  const totalCategories = pagination.total;
  const activeCategories = categories.filter((c) => c.isActive).length;
  const inactiveCategories = categories.filter((c) => !c.isActive).length;

  // Handle add category
  const handleSubmitAdd = async (values: CreateCategoryDto) => {
    try {
      await categoryService.createCategory(values);
      message.success("Tạo danh mục thành công!");
      setIsAddModalOpen(false);
      addForm.resetFields();
      loadCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tạo danh mục");
    }
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    editForm.setFieldsValue({
      name: category.name,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (values: UpdateCategoryDto) => {
    if (!editingCategory) return;

    try {
      await categoryService.updateCategory(editingCategory.id, values);
      message.success("Cập nhật danh mục thành công!");
      setIsEditModalOpen(false);
      editForm.resetFields();
      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật danh mục");
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (category: Category) => {
    try {
      await categoryService.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      message.success(`Đã ${category.isActive ? "ẩn" : "hiện"} danh mục!`);
      loadCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      message.success("Xóa danh mục thành công!");
      loadCategories();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Không thể xóa danh mục (có thể đang có sản phẩm)"
      );
    }
  };

  // Table columns
  const columns: ColumnsType<Category> = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Danh mục",
      key: "category",
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
            {record.description && (
              <div className="text-xs text-gray-500">{record.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Số sản phẩm",
      key: "productCount",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Tag color={record._count && record._count.products > 0 ? "green" : "default"}>
          {record._count?.products || 0}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Đang hiển thị" : "Đã ẩn"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          >
            Sửa
          </Button>
          <Button
            type="text"
            icon={record.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => handleToggleStatus(record)}
            title={record.isActive ? "Ẩn danh mục" : "Hiện danh mục"}
          >
            {record.isActive ? "Ẩn" : "Hiện"}
          </Button>
          <Popconfirm
            title="Xóa danh mục?"
            description="Không thể xóa nếu đang có sản phẩm trong danh mục này."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Xóa">
              Xóa
            </Button>
          </Popconfirm>
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
                Quản lý Danh mục Sản phẩm
              </CardTitle>
            </div>

            {/* Stats Cards */}
            <Row gutter={16}>
              <Col span={8}>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Statistic
                    title="Tổng danh mục"
                    value={totalCategories}
                    prefix={<FolderOpenOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <Statistic
                    title="Đang hiển thị"
                    value={activeCategories}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <Statistic
                    title="Đã ẩn"
                    value={inactiveCategories}
                    prefix={<EyeInvisibleOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </div>
              </Col>
            </Row>

            {/* Filters */}
            <div className="flex justify-between items-center">
              <Search
                placeholder="Tìm theo tên hoặc mã danh mục..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={setSearchQuery}
                onChange={(e) => {
                  if (!e.target.value) setSearchQuery("");
                }}
                style={{ width: 300 }}
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
        </CardHeader>

        <CardContent>
          <Spin spinning={loading}>
            {/* Categories Table */}
            <Table
              columns={columns}
              dataSource={categories}
              rowKey="id"
              pagination={{
                ...pagination,
                onChange: (page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize });
                },
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} danh mục`,
              }}
              scroll={{ x: 1200 }}
              bordered={false}
              className="ant-table-custom"
            />
          </Spin>
        </CardContent>
      </Card>

        {/* Add Category Modal */}
        <Modal
          title="Thêm danh mục mới"
          open={isAddModalOpen}
          onCancel={() => {
            setIsAddModalOpen(false);
            addForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleSubmitAdd}
            className="mt-4"
          >
            <Form.Item
              label="Mã danh mục"
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã danh mục!" },
                {
                  pattern: /^[A-Z0-9_-]+$/,
                  message: "Mã chỉ chứa chữ IN HOA, số, gạch ngang và gạch dưới!",
                },
              ]}
              tooltip="VD: BURGER, FRIED_CHICKEN, SIDE_DISHES"
            >
              <Input placeholder="BURGER" maxLength={50} />
            </Form.Item>

            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
            >
              <Input placeholder="Burger" maxLength={255} />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                placeholder="Mô tả về danh mục này..."
                rows={3}
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              label="URL hình ảnh"
              name="image"
              rules={[
                {
                  type: "url",
                  message: "Vui lòng nhập URL hợp lệ!",
                },
              ]}
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    addForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Tạo danh mục
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          title="Chỉnh sửa danh mục"
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            editForm.resetFields();
            setEditingCategory(null);
          }}
          footer={null}
          width={600}
        >
          {editingCategory && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Mã danh mục (không thể sửa):</div>
              <Tag color="blue" className="mt-1">
                {editingCategory.code}
              </Tag>
            </div>
          )}
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleSubmitEdit}
            className="mt-4"
          >
            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
            >
              <Input placeholder="Burger" maxLength={255} />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                placeholder="Mô tả về danh mục này..."
                rows={3}
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              label="URL hình ảnh"
              name="image"
              rules={[
                {
                  type: "url",
                  message: "Vui lòng nhập URL hợp lệ!",
                },
              ]}
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="isActive"
              valuePropName="checked"
              tooltip="Danh mục bị ẩn sẽ không hiển thị cho khách hàng"
            >
              <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setEditingCategory(null);
                  }}
                >
                  Hủy
                </Button>
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

export default function CategoriesPage() {
  return (
    <ManagerLayout>
      <CategoriesContent />
    </ManagerLayout>
  );
}
