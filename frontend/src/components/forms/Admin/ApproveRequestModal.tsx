import { Modal, Form, InputNumber, Input, Space, Button, Select } from "antd";
import { useEffect } from "react";
import type { LogisticsStaff } from "@/services/admin-warehouse.service";

const { TextArea } = Input;
const { Option } = Select;

interface ApproveRequestModalProps {
    open: boolean;
    loading: boolean;
    onCancel: () => void;
    onApprove: (values: { approvedQuantity: number; notes?: string; logisticsStaffId?: string }) => void;
    initialQuantity?: number;
    logisticsStaff: LogisticsStaff[];
}

export const ApproveRequestModal = ({
    open,
    loading,
    onCancel,
    onApprove,
    initialQuantity,
    logisticsStaff,
}: ApproveRequestModalProps) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ approvedQuantity: initialQuantity });
        }
    }, [open, initialQuantity, form]);

    return (
        <Modal
            title="Duyệt yêu cầu"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onApprove}
            >
                <Form.Item
                    label="Số lượng duyệt"
                    name="approvedQuantity"
                    rules={[
                        { required: true, message: "Vui lòng nhập số lượng duyệt!" },
                        { type: "number", min: 1, message: "Số lượng phải lớn hơn 0!" },
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Nhập số lượng duyệt"
                    />
                </Form.Item>

                <Form.Item
                    label="Gán nhân viên giao hàng (Tùy chọn)"
                    name="logisticsStaffId"
                >
                    <Select
                        placeholder="Chọn nhân viên giao hàng"
                        showSearch
                        allowClear
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)
                                ?.toLowerCase()
                                .includes(input.toLowerCase())
                        }
                    >
                        {logisticsStaff.map((staff) => (
                            <Option key={staff.id} value={staff.id}>
                                {staff.name} - {staff.email}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Ghi chú" name="notes">
                    <TextArea rows={3} placeholder="Ghi chú thêm (không bắt buộc)" />
                </Form.Item>
                <Form.Item className="mb-0">
                    <Space className="w-full justify-end">
                        <Button onClick={onCancel}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Duyệt & Giao việc
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};
