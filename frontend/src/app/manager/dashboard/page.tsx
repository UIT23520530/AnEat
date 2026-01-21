"use client"

import { ManagerLayout } from "@/components/layouts/manager-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { 
  Statistic, 
  Row, 
  Col, 
  Select, 
  Spin, 
  App, 
  Table, 
  Tag, 
  DatePicker, 
  Space,
  Button,
  Alert,
  Badge,
} from "antd"
import type { TableColumnsType } from "antd"
import {
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  UserOutlined,
  TrophyOutlined,
  WarningOutlined,
  DownloadOutlined,
  AlertOutlined,
} from "@ant-design/icons"
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from "recharts"
import { dashboardService, type DashboardStats, type RevenueData, type TopProduct, type InventoryAlert } from "@/services/dashboard.service"
import dayjs from "dayjs"

const { RangePicker } = DatePicker

function DashboardContent() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
  const [period, setPeriod] = useState<"day" | "week" | "month">("day")
  const [dateRange, setDateRange] = useState<any>(null)
  const [exporting, setExporting] = useState(false)

  // Load dashboard data
  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [statsRes, revenueRes, productsRes, alertsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRevenueData({ period }),
        dashboardService.getTopProducts(10),
        dashboardService.getInventoryAlerts(),
      ])

      setStats(statsRes.data)
      setRevenueData(revenueRes.data)
      setTopProducts(productsRes.data)
      setInventoryAlerts(alertsRes.data)
    } catch (error: any) {
      message.error("Không thể tải dữ liệu dashboard")
      console.error("Dashboard load error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load revenue data when period changes
  const loadRevenueData = async () => {
    try {
      const response = await dashboardService.getRevenueData({ period })
      setRevenueData(response.data)
    } catch (error) {
      console.error("Revenue data load error:", error)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    loadRevenueData()
  }, [period])

  // Handle export report
  const handleExport = async () => {
    if (!dateRange || dateRange.length !== 2) {
      message.warning("Vui lòng chọn khoảng thời gian")
      return
    }

    setExporting(true)
    try {
      const dateFrom = dateRange[0].format("YYYY-MM-DD")
      const dateTo = dateRange[1].format("YYYY-MM-DD")

      const blob = await dashboardService.exportReport(dateFrom, dateTo)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `BaoCao_DoanhThu_${dateFrom}_${dateTo}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success("Đã xuất báo cáo thành công")
    } catch (error: any) {
      message.error("Không thể xuất báo cáo")
      console.error("Export error:", error)
    } finally {
      setExporting(false)
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  // Table columns for top products
  const productColumns: TableColumnsType<TopProduct> = [
    {
      title: "#",
      key: "rank",
      width: 60,
      render: (_, __, index) => (
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${
            index === 0
              ? "bg-yellow-500"
              : index === 1
              ? "bg-slate-400"
              : index === 2
              ? "bg-orange-600"
              : "bg-slate-300"
          }`}
        >
          {index + 1}
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng bán",
      dataIndex: "unitsSold",
      key: "unitsSold",
      render: (value) => <span className="font-semibold">{value.toLocaleString()}</span>,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => <span className="text-green-600 font-semibold">{formatCurrency(value)}</span>,
    },
    {
      title: "Lợi nhuận",
      dataIndex: "profit",
      key: "profit",
      render: (value) => <span className="text-blue-600 font-semibold">{formatCurrency(value)}</span>,
    },
  ]

  // Table columns for inventory alerts
  const alertColumns: TableColumnsType<InventoryAlert> = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "out" ? "red" : "orange"} icon={<WarningOutlined />}>
          {status === "out" ? "Hết hàng" : "Sắp hết"}
        </Tag>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tồn kho",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (value, record) => (
        <span className={value === 0 ? "text-red-600 font-bold" : "text-orange-600 font-semibold"}>
          {value} / {record.minStock}
        </span>
      ),
    },
  ]

  // Format revenue chart data
  const chartData = revenueData.map((item) => ({
    date: item.date,
    revenue: item.revenue, // Keep original VND value
    orders: item.orders,
  }))

  return (
    <div className="p-8">
      <Spin spinning={loading}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-4xl font-bold text-slate-900">
                    Dashboard quản lý
                  </CardTitle>
                </div>
                <Space>
                  <RangePicker
                    format="YYYY-MM-DD"
                    onChange={setDateRange}
                    placeholder={["Từ ngày", "Đến ngày"]}
                  />
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    loading={exporting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Xuất báo cáo
                  </Button>
                </Space>
              </div>

              {/* Stats Cards */}
              {stats && (
                <Row gutter={16}>
                  <Col span={6}>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <Statistic
                        title="Doanh thu tháng"
                        value={stats.revenue.month}
                        prefix={<DollarOutlined />}
                        suffix="đ"
                        valueStyle={{ color: "#1890ff" }}
                        formatter={(value) =>
                          new Intl.NumberFormat("vi-VN").format(value as number)
                        }
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <Statistic
                        title="Lợi nhuận tháng"
                        value={stats.profit.month}
                        prefix={<RiseOutlined />}
                        suffix="đ"
                        valueStyle={{ color: "#52c41a" }}
                        formatter={(value) =>
                          new Intl.NumberFormat("vi-VN").format(value as number)
                        }
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <Statistic
                        title="Đơn hàng tháng"
                        value={stats.orders.month}
                        prefix={<ShoppingOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <Statistic
                        title="Khách hàng mới"
                        value={stats.customers.new}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: "#9333ea" }}
                      />
                    </div>
                  </Col>
                </Row>
              )}

              {/* Inventory Alerts */}
              {inventoryAlerts.length > 0 && (
                <Alert
                  message={
                    <div className="flex items-center gap-2">
                      <AlertOutlined />
                      <span className="font-semibold">
                        Cảnh báo tồn kho: {inventoryAlerts.length} sản phẩm cần nhập hàng
                      </span>
                    </div>
                  }
                  type="warning"
                  showIcon={false}
                />
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Revenue Chart */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Biểu đồ doanh thu</h3>
                </div>
                <Select
                  value={period}
                  onChange={setPeriod}
                  style={{ width: 150 }}
                  options={[
                    { label: "Theo ngày", value: "day" },
                    { label: "Theo tuần", value: "week" },
                    { label: "Theo tháng", value: "month" },
                  ]}
                />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      label={{ value: "Doanh thu (VNĐ)", angle: -90, position: "insideLeft" }}
                      tickFormatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
                    />
                    <Tooltip
                      formatter={(value: any, name: string | undefined) => {
                        if (name === "revenue") {
                          return [`${new Intl.NumberFormat('vi-VN').format(value)}đ`, "Doanh thu"]
                        }
                        return [value, "Đơn hàng"]
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products & Inventory Alerts */}
            <Row gutter={16} className="mb-8">
              <Col span={14}>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrophyOutlined className="text-yellow-500 text-lg" />
                    <h3 className="text-lg font-semibold text-slate-900">Sản phẩm bán chạy</h3>
                  </div>
                  <Table
                    columns={productColumns}
                    dataSource={topProducts}
                    rowKey="id"
                    pagination={false}
                    bordered={false}
                    size="small"
                  />
                </div>
              </Col>
              <Col span={10}>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge count={inventoryAlerts.length} offset={[10, 0]}>
                      <WarningOutlined className="text-orange-500 text-lg" />
                    </Badge>
                    <h3 className="text-lg font-semibold text-slate-900">Cảnh báo tồn kho</h3>
                  </div>
                  <Table
                    columns={alertColumns}
                    dataSource={inventoryAlerts}
                    rowKey="id"
                    pagination={false}
                    bordered={false}
                    size="small"
                    locale={{ emptyText: "Không có cảnh báo" }}
                  />
                </div>
              </Col>
            </Row>
          </CardContent>
        </Card>
      </Spin>
    </div>
  )
}

export default function ManagerDashboardPage() {
  return (
    <ManagerLayout>
      <App>
        <DashboardContent />
      </App>
    </ManagerLayout>
  )
}
