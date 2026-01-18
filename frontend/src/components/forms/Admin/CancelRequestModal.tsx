import { Modal, Form, Input, Space, Button } from "antd";

const { TextArea } = Input;

interface CancelRequestModalProps {
    open: boolean;
    loading: boolean;
    onCancel: () => void;
    onConfirmCancel: (values: { cancelReason: string }) => void;
}

export const CancelRequestModal = ({
    open,
    loading,
    onCancel,
    onConfirmCancel,
}: CancelRequestModalProps) => {
    const [form] = Form.useForm();

    return (
        <Modal
            title="Hủy yêu cầu"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onConfirmCancel}
            >
                <Form.Item
                    label="Lý do hủy"
                    name="cancelReason"
                    rules={[
                        { required: true, message: "Vui lòng nhập lý do hủy!" },
                        { min: 5, message: "Lý do phải có ít nhất 5 ký tự!" },
                    ]}
                >
                    <TextArea rows={4} placeholder="Nhập lý do hủy..." />
                </Form.Item>
                <Form.Item className="mb-0">
                    <Space className="w-full justify-end">
                        <Button onClick={onCancel}>
                            Đóng
                        </Button>
                        <Button type="primary" danger htmlType="submit" loading={loading}>
                            Xác nhận hủy
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};
