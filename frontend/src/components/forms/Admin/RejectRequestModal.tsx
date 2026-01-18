import { Modal, Form, Input, Space, Button } from "antd";

const { TextArea } = Input;

interface RejectRequestModalProps {
    open: boolean;
    loading: boolean;
    onCancel: () => void;
    onReject: (values: { rejectedReason: string }) => void;
}

export const RejectRequestModal = ({
    open,
    loading,
    onCancel,
    onReject,
}: RejectRequestModalProps) => {
    const [form] = Form.useForm();

    return (
        <Modal
            title="Từ chối yêu cầu"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onReject}
            >
                <Form.Item
                    label="Lý do từ chối"
                    name="rejectedReason"
                    rules={[{ required: true, message: "Vui lòng nhập lý do từ chối!" }]}
                >
                    <TextArea rows={4} placeholder="Nhập lý do từ chối..." />
                </Form.Item>
                <Form.Item className="mb-0">
                    <Space className="w-full justify-end">
                        <Button onClick={onCancel}>
                            Hủy
                        </Button>
                        <Button type="primary" danger htmlType="submit" loading={loading}>
                            Từ chối yêu cầu
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};
