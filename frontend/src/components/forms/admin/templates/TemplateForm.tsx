"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Select, Switch, Button, App, Collapse } from "antd";
import type { FormInstance } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { TemplateDTO, TemplateCategory, TemplateStatus, CreateTemplateDto, UpdateTemplateDto, PrintSettings } from "@/services/admin-template.service";

const { Option } = Select;
const { TextArea } = Input;

interface TemplateFormProps {
  form: FormInstance;
  initialTemplate?: TemplateDTO;
  onSubmit: (values: CreateTemplateDto | UpdateTemplateDto) => Promise<void>;
  onCancel?: () => void;
  loading: boolean;
  hideBranchSelect?: boolean;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  form,
  initialTemplate,
  onSubmit,
  onCancel,
  loading,
  hideBranchSelect = false,
}) => {
  const { message } = App.useApp();
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (initialTemplate) {
      form.setFieldsValue({
        name: initialTemplate.name,
        type: initialTemplate.type,
        description: initialTemplate.description,
        category: initialTemplate.category,
        status: initialTemplate.status,
        isDefault: initialTemplate.isDefault,
        content: initialTemplate.content,
        branchId: initialTemplate.branchId || null,
        printSettings: initialTemplate.printSettings || {
          pageSize: 'A4',
          marginTop: '20mm',
          marginRight: '20mm',
          marginBottom: '20mm',
          marginLeft: '20mm',
          contentWidth: '80mm',
        },
      });
    } else {
      form.setFieldsValue({
        printSettings: {
          pageSize: 'A4',
          marginTop: '20mm',
          marginRight: '20mm',
          marginBottom: '20mm',
          marginLeft: '20mm',
          contentWidth: '80mm',
        },
      });
    }
  }, [initialTemplate, form]);

  useEffect(() => {
    if (hideBranchSelect) return;

    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const { adminBranchService } = await import("@/services/admin-branch.service");
        const response = await adminBranchService.getBranches({ limit: 1000 });
        setBranches(response.data);
      } catch (error) {
        console.error("Load branches error:", error);
      } finally {
        setLoadingBranches(false);
      }
    };
    loadBranches();
  }, [hideBranchSelect]);

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra");
    }
  };

  const getCategoryHelp = (category: TemplateCategory) => {
    const helps = {
      INVOICE: "Mẫu hóa đơn: Dùng cho việc xuất hóa đơn thanh toán. Placeholders: {{billNumber}}, {{customerName}}, {{total}}, {{date}}",
      ORDER: "Mẫu đơn hàng: Dùng cho đơn đặt hàng tại quầy/bàn. Placeholders: {{orderNumber}}, {{tableNumber}}, {{items}}",
      RECEIPT: "Mẫu biên lai: Dùng cho biên lai thanh toán nhanh. Placeholders: {{receiptNumber}}, {{amount}}, {{paymentMethod}}",
      REPORT: "Mẫu báo cáo: Dùng cho báo cáo doanh thu, tồn kho. Placeholders: {{reportDate}}, {{totalSales}}, {{revenue}}",
    };
    return helps[category];
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={loading}
    >
      <Form.Item
        label="Tên mẫu"
        name="name"
        rules={[
          { required: true, message: "Vui lòng nhập tên mẫu" },
          { min: 3, message: "Tên mẫu phải có ít nhất 3 ký tự" },
        ]}
      >
        <Input placeholder="VD: Hóa đơn thanh toán chuẩn" />
      </Form.Item>

      <Form.Item
        label="Loại mẫu"
        name="type"
        rules={[
          { required: true, message: "Vui lòng nhập loại mẫu" },
        ]}
      >
        <Input placeholder="VD: Template hóa đơn A4, Template hóa đơn nhiệt" />
      </Form.Item>

      <Form.Item
        label="Danh mục"
        name="category"
        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
      >
        <Select
          placeholder="Chọn danh mục"
          onChange={(value) => {
            message.info(getCategoryHelp(value as TemplateCategory), 5);
          }}
        >
          <Option value="INVOICE">Hóa đơn</Option>
          <Option value="ORDER">Đơn hàng</Option>
          <Option value="RECEIPT">Biên lai</Option>
          <Option value="REPORT">Báo cáo</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="description"
      >
        <TextArea
          rows={2}
          placeholder="Mô tả ngắn gọn về mục đích sử dụng mẫu này"
          showCount
          maxLength={200}
        />
      </Form.Item>

      {!hideBranchSelect && (
        <Form.Item
          label="Gán chi nhánh"
          name="branchId"
          extra="Để trống để áp dụng cho toàn hệ thống."
        >
          <Select
            placeholder="Chọn chi nhánh (để trống = toàn hệ thống)"
            allowClear
            showSearch
            loading={loadingBranches}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={branches.map((b) => ({
              value: b.id,
              label: `${b.code} - ${b.name}`,
            }))}
          />
        </Form.Item>
      )}

      <Form.Item
        label="Nội dung HTML"
        name="content"
        rules={[
          { required: true, message: "Vui lòng nhập nội dung template" },
          { min: 10, message: "Nội dung phải có ít nhất 10 ký tự" },
        ]}
        extra={
          <div className="text-xs text-slate-500 mt-1">
            Sử dụng placeholders như {`{{billNumber}}, {{customerName}}, {{total}}`} để thay thế dữ liệu động
          </div>
        }
      >
        <TextArea
          rows={12}
          placeholder={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{billNumber}}</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="invoice">
    <h1>HÓA ĐƠN</h1>
    <p>Số HĐ: {{billNumber}}</p>
    <p>Khách hàng: {{customerName}}</p>
    <p>Tổng tiền: {{total}}</p>
  </div>
</body>
</html>`}
          className="font-mono text-sm"
        />
      </Form.Item>

      {/* Print Settings */}
      <Collapse
        items={[
          {
            key: 'print-settings',
            label: (
              <span className="font-semibold">
                <SettingOutlined className="mr-2" />
                Cài đặt in ấn
              </span>
            ),
            children: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="Kích thước trang"
                    name={['printSettings', 'pageSize']}
                  >
                    <Select placeholder="Chọn kích thước">
                      <Option value="A4">A4 (210mm x 297mm)</Option>
                      <Option value="A5">A5 (148mm x 210mm)</Option>
                      <Option value="Letter">Letter (8.5" x 11")</Option>
                      <Option value="80mm">Thermal 80mm</Option>
                      <Option value="58mm">Thermal 58mm</Option>
                      <Option value="custom">Tùy chỉnh</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Chiều rộng nội dung"
                    name={['printSettings', 'contentWidth']}
                    extra="VD: 80mm, 100%, 800px"
                  >
                    <Input placeholder="80mm" />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <Form.Item
                    label="Lề trên"
                    name={['printSettings', 'marginTop']}
                  >
                    <Input placeholder="20mm" />
                  </Form.Item>

                  <Form.Item
                    label="Lề phải"
                    name={['printSettings', 'marginRight']}
                  >
                    <Input placeholder="20mm" />
                  </Form.Item>

                  <Form.Item
                    label="Lề dưới"
                    name={['printSettings', 'marginBottom']}
                  >
                    <Input placeholder="20mm" />
                  </Form.Item>

                  <Form.Item
                    label="Lề trái"
                    name={['printSettings', 'marginLeft']}
                  >
                    <Input placeholder="20mm" />
                  </Form.Item>
                </div>

                <Form.Item
                  label="CSS tùy chỉnh cho @media print"
                  name={['printSettings', 'customCss']}
                  extra="CSS bổ sung cho chế độ in. VD: font-size: 12px; line-height: 1.5;"
                >
                  <TextArea
                    rows={4}
                    placeholder={`/* CSS tùy chỉnh */
font-family: 'Courier New', monospace;
font-size: 12px;
line-height: 1.5;`}
                    className="font-mono text-xs"
                  />
                </Form.Item>
              </div>
            ),
          },
        ]}
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label="Trạng thái"
          name="status"
          valuePropName="checked"
          getValueFromEvent={(checked) => checked ? "ACTIVE" : "INACTIVE"}
          getValueProps={(value) => ({ checked: value === "ACTIVE" })}
        >
          <Switch
            checkedChildren="Đang hoạt động"
            unCheckedChildren="Ngừng hoạt động"
            defaultChecked
          />
        </Form.Item>

        <Form.Item
          label="Mẫu mặc định"
          name="isDefault"
          valuePropName="checked"
          extra="Chỉ có 1 mẫu mặc định cho mỗi danh mục"
        >
          <Switch
            checkedChildren="Có"
            unCheckedChildren="Không"
          />
        </Form.Item>
      </div>

      <Form.Item className="mb-0 mt-6 flex justify-end">
        <div className="flex gap-2">
          {onCancel && (
            <Button onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialTemplate ? "Cập nhật" : "Tạo mẫu mới"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};
