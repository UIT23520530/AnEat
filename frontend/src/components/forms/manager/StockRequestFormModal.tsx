"use client"

import { Modal, Form, Select, Input, InputNumber, DatePicker, Button, Space, App } from "antd"
import { useEffect, useState } from "react"
import { stockRequestService, CreateStockRequestDto, StockRequest } from "@/services/stock-request.service"
import { InventoryItemDTO } from "@/services/staff-warehouse.service"
import dayjs from "dayjs"

interface StockRequestFormModalProps {
    open: boolean
    onCancel: () => void
    onSuccess: () => void
    products: InventoryItemDTO[]
    selectedProduct?: InventoryItemDTO | null
    editingRequest?: StockRequest | null
}

export default function StockRequestFormModal({
    open,
    onCancel,
    onSuccess,
    products,
    selectedProduct,
    editingRequest,
}: StockRequestFormModalProps) {
    const [form] = Form.useForm()
    const { message } = App.useApp()
    const [loading, setLoading] = useState(false)

    const isEdit = !!editingRequest

    useEffect(() => {
        if (open) {
            if (editingRequest) {
                form.setFieldsValue({
                    productId: editingRequest.productId,
                    type: editingRequest.type,
                    requestedQuantity: editingRequest.requestedQuantity,
                    expectedDate: editingRequest.expectedDate ? dayjs(editingRequest.expectedDate) : null,
                    notes: editingRequest.notes,
                })
            } else if (selectedProduct) {
                form.setFieldsValue({
                    productId: selectedProduct.id,
                    type: "RESTOCK",
                    requestedQuantity: 1,
                })
            } else {
                form.resetFields()
                form.setFieldsValue({
                    type: "RESTOCK",
                    requestedQuantity: 1,
                })
            }
        }
    }, [open, editingRequest, selectedProduct, form])

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            const data: CreateStockRequestDto = {
                ...values,
                expectedDate: values.expectedDate ? values.expectedDate.toISOString() : undefined,
            }

            if (isEdit && editingRequest) {
                await stockRequestService.updateStockRequest(editingRequest.id, data)
                message.success("Cập nhật yêu cầu thành công")
            } else {
                await stockRequestService.createStockRequest(data)
                message.success("Tạo yêu cầu thành công")
            }
            onSuccess()
            onCancel()
        } catch (error: any) {
            console.error(error)
            message.error(error.response?.data?.message || "Đã có lỗi xảy ra")
        } finally {
            setLoading(false)
        }
    }

    // Find info of product being requested
    const currentProductId = Form.useWatch("productId", form)
    const productInfo = selectedProduct || products.find(p => p.id === currentProductId)

    return (
        <Modal
            title={isEdit ? "Chỉnh sửa yêu cầu nhập kho" : "Tạo yêu cầu nhập kho"}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnHidden
        >
            {productInfo && (
                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-100">
                    <div className="flex items-center gap-3">
                        {productInfo.image && (
                            <img
                                src={productInfo.image}
                                alt={productInfo.name}
                                className="w-16 h-16 rounded object-cover border border-gray-200"
                            />
                        )}
                        <div>
                            <div className="font-medium text-blue-600">{productInfo.name}</div>
                            <div className="text-sm text-gray-500">
                                Mã sản phẩm: <span className="font-mono">{productInfo.code}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                Tồn kho hiện tại: <strong className={productInfo.quantity < 10 ? "text-red-500" : "text-gray-700"}>{productInfo.quantity}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="mt-4"
                initialValues={{ type: "RESTOCK", requestedQuantity: 1 }}
            >
                {!selectedProduct && !isEdit && (
                    <Form.Item
                        label="Chọn sản phẩm"
                        name="productId"
                        rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
                    >
                        <Select
                            placeholder="Chọn sản phẩm cần nhập kho"
                            showSearch
                            filterOption={(input, option) =>
                                ((option?.label as unknown) as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                            options={products.map(p => ({
                                value: p.id,
                                label: `${p.name} - ${p.code} (Tồn: ${p.quantity})`
                            }))}
                        />
                    </Form.Item>
                )}

                {/* Hidden field for productId when in edit or pre-selected mode */}
                {(selectedProduct || isEdit) && (
                    <Form.Item name="productId" hidden>
                        <Input />
                    </Form.Item>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label="Loại yêu cầu"
                        name="type"
                        rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu!" }]}
                    >
                        <Select>
                            <Select.Option value="RESTOCK">Nhập hàng</Select.Option>
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
                        <InputNumber className="w-full" min={1} />
                    </Form.Item>
                </div>

                <Form.Item label="Ngày dự kiến nhận hàng" name="expectedDate">
                    <DatePicker
                        className="w-full"
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>

                <Form.Item label="Ghi chú" name="notes">
                    <Input.TextArea rows={3} placeholder="Ghi chú thêm về yêu cầu này..." />
                </Form.Item>

                <Form.Item className="mb-0 text-right mt-6">
                    <Space>
                        <Button onClick={onCancel} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEdit ? "Cập nhật yêu cầu" : "Tạo yêu cầu"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}
