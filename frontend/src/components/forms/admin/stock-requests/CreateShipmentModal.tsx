import { Modal, Form, Select, InputNumber, Button, DatePicker, Space, Input, Row, Col, App } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { adminBranchService, Branch } from '@/services/admin-branch.service';
import { adminProductService, Product } from '@/services/admin-product.service';
import { adminWarehouseService, LogisticsStaff } from '@/services/admin-warehouse.service';
import dayjs from 'dayjs';

interface CreateShipmentModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const { Option } = Select;
const { TextArea } = Input;

export const CreateShipmentModal = ({ open, onCancel, onSuccess }: CreateShipmentModalProps) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [logisticsStaff, setLogisticsStaff] = useState<LogisticsStaff[]>([]);
    const [loading, setLoading] = useState(false);
    const [staffLoading, setStaffLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadInitialData();
            form.resetFields();
            // Do not clear logisticsStaff here, loadInitialData will fetch it
        }
    }, [open]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Load branches, products AND logistics staff initially
            const [branchesRes, productsRes] = await Promise.all([
                adminBranchService.getBranches({ limit: 100 }),
                adminProductService.getProducts({ limit: 1000 }),
            ]);
            setBranches(branchesRes.data || []);
            setProducts(productsRes.data || []);

            // Fetch initial staff list (no date filter yet)
            loadLogisticsStaff(undefined);

        } catch (error) {
            console.error("Error loading initial data", error);
            message.error("Không thể tải dữ liệu ban đầu");
        } finally {
            setLoading(false);
        }
    };

    const loadLogisticsStaff = async (date?: string) => {
        setStaffLoading(true);
        try {
            // Pass undefined for branchId to get global staff
            const res = await adminWarehouseService.getLogisticsStaff(undefined, date);
            setLogisticsStaff(res.data || []);
        } catch (error) {
            console.error("Error loading logistics staff", error);
        } finally {
            setStaffLoading(false);
        }
    };

    const handleBranchChange = (value: string) => {
        form.setFieldValue('branchId', value);
        // Do not reset logistics staff list, as they are global
    };

    const handleDateChange = (date: any) => {
        // Reload staff based on selected date availability
        loadLogisticsStaff(date ? date.toISOString() : undefined);
    };

    const handleFinish = async (values: any) => {
        if (!values.items || values.items.length === 0) {
            message.error("Vui lòng chọn ít nhất một sản phẩm");
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = {
                branchId: values.branchId,
                items: values.items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
                logisticsStaffId: values.logisticsStaffId,
                notes: values.notes,
                deliveryDate: values.deliveryDate ? values.deliveryDate.format('YYYY-MM-DD HH:mm') : undefined,
            };

            await adminWarehouseService.createQuickShipment(payload);
            message.success("Tạo đơn vận chuyển thành công");
            onSuccess();
        } catch (error: any) {
            console.error("Error creating shipment", error);
            message.error(error.response?.data?.message || "Không thể tạo đơn vận chuyển");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo nhanh đơn vận chuyển"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ items: [{}] }} // Start with one empty item row
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="branchId"
                            label="Cửa hàng nhận"
                            rules={[{ required: true, message: 'Vui lòng chọn cửa hàng' }]}
                        >
                            <Select
                                placeholder="Chọn cửa hàng"
                                showSearch
                                optionFilterProp="children"
                                loading={loading}
                                onChange={handleBranchChange}
                            >
                                {branches.map((branch) => (
                                    <Option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="logisticsStaffId"
                            label="Tài xế giao hàng (Tùy chọn)"
                        >
                            <Select
                                placeholder="Chọn tài xế"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children as unknown as string)
                                        ?.toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                allowClear
                                loading={staffLoading}
                                notFoundContent={staffLoading ? "Đang tải..." : (logisticsStaff.length === 0 ? "Không có nhân viên nào" : null)}
                            >
                                {logisticsStaff.map((staff) => (
                                    <Option key={staff.id} value={staff.id}>
                                        {staff.name} - {staff.email}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="deliveryDate" label="Thời gian giao (Dự kiến)">
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{ width: '100%' }}
                                onChange={handleDateChange}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Danh sách sản phẩm">
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                                        <Col span={14}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'productId']}
                                                rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select placeholder="Sản phẩm" showSearch optionFilterProp="children" loading={loading}>
                                                    {products.map((p) => (
                                                        <Option key={p.id} value={p.id}>
                                                            {p.code} - {p.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'quantity']}
                                                rules={[{ required: true, message: 'Nhập số lượng' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumber placeholder="Số lượng" min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm sản phẩm
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>

                <Form.Item name="notes" label="Ghi chú">
                    <TextArea rows={2} placeholder="Ghi chú thêm cho đơn vận chuyển" />
                </Form.Item>

                <div className="flex justify-end gap-2">
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={submitLoading}>
                        Tạo đơn hàng
                    </Button>
                </div>
            </Form >
        </Modal >
    );
};
