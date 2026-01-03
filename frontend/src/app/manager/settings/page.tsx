"use client"

import { useState, useEffect } from "react"
import { ManagerLayout } from "@/components/layouts/manager-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, Input, Form, message, Spin, Row, Col } from "antd"
import { 
  SaveOutlined, 
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from "@ant-design/icons"
import { branchService, type Branch } from "@/services/branch.service"

export default function ManagerSettingsPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [branchInfo, setBranchInfo] = useState<Branch | null>(null)

  useEffect(() => {
    loadBranchInfo()
  }, [])

  const loadBranchInfo = async () => {
    setLoadingData(true)
    try {
      const response = await branchService.getManagerBranch()
      setBranchInfo(response.data)
      form.setFieldsValue(response.data)
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải thông tin cửa hàng")
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const response = await branchService.updateManagerBranch(values)
      message.success("Đã cập nhật thông tin cửa hàng thành công")
      setBranchInfo(response.data)
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật thông tin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ManagerLayout>
      <div className="p-8">
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Cài đặt cửa hàng</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin và cấu hình cho cửa hàng của bạn</p>
        </div> */}

        <Spin spinning={loadingData}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShopOutlined className="text-blue-600" />
                Thông tin cửa hàng
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Cập nhật thông tin chi tiết của cửa hàng
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={<span className="text-slate-700 font-medium">Tên cửa hàng</span>}
                      name="name"
                      rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
                    >
                      <Input 
                        size="large"
                        prefix={<ShopOutlined className="text-slate-400" />}
                        placeholder="Nhập tên cửa hàng"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={<span className="text-slate-700 font-medium">Mã cửa hàng</span>}
                      name="code"
                    >
                      <Input 
                        size="large"
                        disabled
                        placeholder="Mã cửa hàng"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label={<span className="text-slate-700 font-medium">Địa chỉ</span>}
                      name="address"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                      <Input 
                        size="large"
                        prefix={<EnvironmentOutlined className="text-slate-400" />}
                        placeholder="Nhập địa chỉ cửa hàng"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={<span className="text-slate-700 font-medium">Số điện thoại</span>}
                      name="phone"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                      ]}
                    >
                      <Input 
                        size="large"
                        prefix={<PhoneOutlined className="text-slate-400" />}
                        placeholder="Nhập số điện thoại"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={<span className="text-slate-700 font-medium">Email</span>}
                      name="email"
                      rules={[
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input 
                        size="large"
                        prefix={<MailOutlined className="text-slate-400" />}
                        placeholder="Nhập email cửa hàng"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item className="mb-0 mt-6">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    loading={loading}
                    icon={<SaveOutlined />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Lưu thay đổi
                  </Button>
                </Form.Item>
              </Form>
            </CardContent>
          </Card>
        </Spin>
      </div>
    </ManagerLayout>
  )
}
