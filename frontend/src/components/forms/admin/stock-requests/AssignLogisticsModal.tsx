import { Modal, Form, Input, Space, Button, Select } from "antd";
import type { LogisticsStaff } from "@/services/admin-warehouse.service";

const { TextArea } = Input;
const { Option } = Select;

interface AssignLogisticsModalProps {
    open: boolean;
    loading: boolean;
    logisticsStaff: LogisticsStaff[];
    onCancel: () => void;
    onAssign: (values: { logisticsStaffId: string; notes?: string }) => void;
    title?: string;
    submitText?: string;
}

export const AssignLogisticsModal = ({
    open,
    loading,
    logisticsStaff,
    onCancel,
    onAssign,
    title = "Giao cho nhân viên Logistics",
    submitText = "Giao cho Logistics"
}: AssignLogisticsModalProps) => {
    const [form] = Form.useForm();

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onAssign}
            >
                <Form.Item
                    label="Nhân viên Logistics"
                    name="logisticsStaffId"
                    rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
                >
                    <Select
                        placeholder="Chọn nhân viên logistics"
                        showSearch
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
                    <TextArea rows={3} placeholder="Ghi chú cho logistics (không bắt buộc)" />
                </Form.Item>
                <Form.Item className="mb-0">
                    <Space className="w-full justify-end">
                        <Button onClick={onCancel}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {submitText}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};
