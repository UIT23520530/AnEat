"use client"

import { AdminLayout } from "@/components/layouts/admin-layout"
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
  Progress,
  Tooltip as AntTooltip,
  Modal,
  InputNumber,
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
  BankOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SettingOutlined,
  InfoCircleOutlined,
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
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  adminDashboardService,
  type SystemStats,
  type BranchPerformance,
  type SystemRevenueData,
  type SystemTopProduct,
  type SystemAlert,
  type GrowthMetrics,
} from "@/services/admin-dashboard.service"
import dayjs from "dayjs"

const { RangePicker } = DatePicker

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

// Default thresholds
const DEFAULT_THRESHOLDS = {
  revenuePercent: 50,
  minStaff: 3,
  minStock: 10,
  silverPoints: 2000,
  goldPoints: 5000,
  vipPoints: 10000,
  // Branch scoring weights
  revenueWeight: 40,
  aovWeight: 20,
  efficiencyWeight: 20,
  retentionWeight: 20,
}

function DashboardContent() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([])
  const [revenueData, setRevenueData] = useState<SystemRevenueData[]>([])
  const [topProducts, setTopProducts] = useState<SystemTopProduct[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null)
  const [period, setPeriod] = useState<"day" | "week" | "month">("day")
  const [dateRange, setDateRange] = useState<any>(null)
  const [exporting, setExporting] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS)
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)
  const [tempThresholds, setTempThresholds] = useState(DEFAULT_THRESHOLDS)

  // Load dismissed alerts from sessionStorage (resets on page refresh)
  useEffect(() => {
    const dismissed = sessionStorage.getItem("dismissedAlerts")
    if (dismissed) {
      try {
        setDismissedAlerts(new Set(JSON.parse(dismissed)))
      } catch (e) {
        // Clear invalid data
        sessionStorage.removeItem("dismissedAlerts")
      }
    }
    const savedThresholds = localStorage.getItem("dashboardThresholds")
    if (savedThresholds) {
      const parsed = JSON.parse(savedThresholds)
      setThresholds(parsed)
      setTempThresholds(parsed)
    }
  }, [])

  // Save dismissed alerts to sessionStorage (will reset on page refresh)
  const handleAlertClose = (alertId: string) => {
    const newDismissed = new Set(dismissedAlerts)
    newDismissed.add(alertId)
    setDismissedAlerts(newDismissed)
    sessionStorage.setItem("dismissedAlerts", JSON.stringify(Array.from(newDismissed)))
  }

  // Filter visible alerts
  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.id))

  // Debug: Log filtering
  console.log("👁️ Total alerts:", alerts.length, "Visible alerts:", visibleAlerts.length)

  // Calculate branch score
  const calculateBranchScore = (branch: BranchPerformance, avgRevenue: number, avgAOV: number): number => {
    // Revenue score (configurable %) - handle division by zero
    const revenueScore = avgRevenue > 0 
      ? (branch.revenue / avgRevenue) * thresholds.revenueWeight 
      : 0

    // AOV score (configurable %) - handle division by zero
    const aovScore = avgAOV > 0 
      ? (branch.averageOrderValue / avgAOV) * thresholds.aovWeight 
      : 0

    // Efficiency score (configurable %) - orders per staff
    const ordersPerStaff = branch.staff > 0 ? branch.orders / branch.staff : 0
    const avgOrdersPerStaff = branchPerformance.length > 0
      ? branchPerformance.reduce((sum, b) => sum + (b.staff > 0 ? b.orders / b.staff : 0), 0) / branchPerformance.length
      : 0
    const efficiencyScore = avgOrdersPerStaff > 0 
      ? (ordersPerStaff / avgOrdersPerStaff) * thresholds.efficiencyWeight 
      : 0

    // Retention score (configurable %) - customers per order ratio
    const retentionRatio = branch.orders > 0 ? branch.customers / branch.orders : 0
    const avgRetentionRatio = branchPerformance.length > 0
      ? branchPerformance.reduce((sum, b) => sum + (b.orders > 0 ? b.customers / b.orders : 0), 0) / branchPerformance.length
      : 0
    const retentionScore = avgRetentionRatio > 0 
      ? (retentionRatio / avgRetentionRatio) * thresholds.retentionWeight 
      : 0

    const totalScore = revenueScore + aovScore + efficiencyScore + retentionScore
    
    // Return 0 if all metrics are zero (no meaningful data), otherwise clamp between 0-100
    if (totalScore === 0 && avgRevenue === 0 && avgAOV === 0) {
      return 0
    }
    
    return Math.min(Math.max(totalScore, 0), 100) // Clamp between 0-100
  }

  // Load dashboard data
  const loadDashboard = async () => {
    setLoading(true)
    try {
      // Load alerts separately to not block main stats
      let alertsData: SystemAlert[] = []
      try {
        const alertsRes = await adminDashboardService.getSystemAlerts({
          revenuePercent: thresholds.revenuePercent,
          minStaff: thresholds.minStaff,
          minStock: thresholds.minStock,
        })
        alertsData = alertsRes.data
        console.log("🔔 Alerts received:", alertsData)
      } catch (error) {
        console.error("Failed to load alerts:", error)
      }

      const [statsRes, branchRes, revenueRes, productsRes, growthRes] = await Promise.all([
        adminDashboardService.getSystemStats(),
        adminDashboardService.getBranchPerformance(),
        adminDashboardService.getSystemRevenueData({ period }),
        adminDashboardService.getTopProductsSystemWide(10),
        adminDashboardService.getGrowthMetrics(),
      ])

      setStats(statsRes.data)
      setBranchPerformance(branchRes.data)
      setRevenueData(revenueRes.data)
      setTopProducts(productsRes.data)
      setAlerts(alertsData)
      setGrowthMetrics(growthRes.data)

      // Debug: Log alerts data

      console.log("📝 Dismissed alerts from sessionStorage:", Array.from(dismissedAlerts))
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
      const response = await adminDashboardService.getSystemRevenueData({ period })
      setRevenueData(response.data)
    } catch (error) {
      console.error("Revenue data load error:", error)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Reload alerts when thresholds change (after applying settings)
  useEffect(() => {
    if (alerts.length > 0 || branchPerformance.length > 0) {
      // Re-fetch alerts to reflect new thresholds
      adminDashboardService.getSystemAlerts({
        revenuePercent: thresholds.revenuePercent,
        minStaff: thresholds.minStaff,
        minStock: thresholds.minStock,
      }).then((res) => {
        setAlerts(res.data)
      }).catch((error) => {
        console.error("Failed to reload alerts:", error)
      })
    }
  }, [thresholds])

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

      const blob = await adminDashboardService.exportSystemReport(dateFrom, dateTo)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `BaoCaoHeThong_${dateFrom}_${dateTo}.xlsx`
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

  // Calculate average metrics for scoring
  // Don't use fallback of 1, use 0 to properly handle edge cases in calculateBranchScore
  const avgRevenue = branchPerformance.length > 0 
    ? branchPerformance.reduce((sum, b) => sum + b.revenue, 0) / branchPerformance.length 
    : 0
  const avgAOV = branchPerformance.length > 0 
    ? branchPerformance.reduce((sum, b) => sum + b.averageOrderValue, 0) / branchPerformance.length 
    : 0

  // Handle settings modal
  const handleSettingsApply = () => {
    // Validate that scoring weights sum to 100%
    const totalWeight = tempThresholds.revenueWeight + tempThresholds.aovWeight + tempThresholds.efficiencyWeight + tempThresholds.retentionWeight
    if (totalWeight !== 100) {
      message.error(`Tổng trọng số phải bằng 100% (hiện tại: ${totalWeight}%)`)
      return
    }

    setThresholds(tempThresholds)
    localStorage.setItem("dashboardThresholds", JSON.stringify(tempThresholds))
    setSettingsModalVisible(false)
    message.success("Đã cập nhật cài đặt ngưỡng", 2)
    // Clear dismissed alerts and reload dashboard
    setDismissedAlerts(new Set())
    sessionStorage.removeItem("dismissedAlerts")
    setTimeout(() => {
      loadDashboard()
    }, 500)
  }

  const handleSettingsCancel = () => {
    setTempThresholds(thresholds)
    setSettingsModalVisible(false)
  }

  // Table columns for branch performance
  const branchColumns: TableColumnsType<BranchPerformance> = [
    {
      title: "Chi nhánh",
      key: "branch",
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.name}</div>
          <div className="text-xs text-gray-500">{record.code}</div>
        </div>
      ),
    },
    {
      title: "Quản lý",
      dataIndex: "managerName",
      key: "manager",
      render: (name) => name || <span className="text-gray-400 italic">Chưa có</span>,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      sorter: (a, b) => a.revenue - b.revenue,
      render: (value) => <span className="text-green-600 font-semibold">{formatCurrency(value)}</span>,
    },
    {
      title: "Lợi nhuận",
      dataIndex: "profit",
      key: "profit",
      sorter: (a, b) => a.profit - b.profit,
      render: (value) => <span className="text-blue-600 font-semibold">{formatCurrency(value)}</span>,
    },
    {
      title: "Đơn hàng",
      dataIndex: "orders",
      key: "orders",
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: "Nhân viên",
      dataIndex: "staff",
      key: "staff",
      sorter: (a, b) => a.staff - b.staff,
    },
    {
      title: "Khách hàng",
      dataIndex: "customers",
      key: "customers",
      sorter: (a, b) => a.customers - b.customers,
    },
    {
      title: "Giá trị TB",
      dataIndex: "averageOrderValue",
      key: "averageOrderValue",
      render: (value) => formatCurrency(value),
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>Điểm số</span>
          <AntTooltip title={`Điểm đánh giá tổng thể: Doanh thu (${thresholds.revenueWeight}%) + Giá trị TB (${thresholds.aovWeight}%) + Hiệu suất (${thresholds.efficiencyWeight}%) + Khách hàng (${thresholds.retentionWeight}%)`}>
            <InfoCircleOutlined className="text-gray-400 cursor-help" />
          </AntTooltip>
        </div>
      ),
      key: "score",
      align: "center",
      sorter: (a, b) => calculateBranchScore(a, avgRevenue, avgAOV) - calculateBranchScore(b, avgRevenue, avgAOV),
      render: (_, record) => {
        const score = calculateBranchScore(record, avgRevenue, avgAOV)
        const color = score >= 80 ? "green" : score >= 60 ? "blue" : score >= 40 ? "gold" : "red"
        return (
          <Tag color={color} className="text-base font-semibold px-3 py-1">
            {score.toFixed(1)}
          </Tag>
        )
      },
    },
  ]

  // Table columns for top products
  const productColumns: TableColumnsType<SystemTopProduct> = [
    {
      title: "#",
      key: "rank",
      width: 60,
      render: (_, __, index) => (
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-orange-600" : "bg-slate-300"
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
      title: "Chi nhánh",
      dataIndex: "branchName",
      key: "branch",
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

  // Format revenue chart data
  const chartData = revenueData.map((item) => ({
    date: item.date,
    revenue: item.revenue,
    orders: item.orders,
  }))

  // Customer tier data for pie chart
  const customerTierData = stats
    ? [
      { name: "Bronze", value: stats.totalCustomers.byTier.BRONZE, color: "#CD7F32" },
      { name: "Silver", value: stats.totalCustomers.byTier.SILVER, color: "#C0C0C0" },
      { name: "Gold", value: stats.totalCustomers.byTier.GOLD, color: "#FFD700" },
      { name: "VIP", value: stats.totalCustomers.byTier.VIP, color: "#8B5CF6" },
    ]
    : []

  return (
    <div className="p-8">
      <Spin spinning={loading}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Space>
                  <RangePicker format="YYYY-MM-DD" onChange={setDateRange} placeholder={["Từ ngày", "Đến ngày"]} />
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
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsModalVisible(true)}
                  className="flex items-center gap-1"
                  size="large"
                >
                  Cài đặt ngưỡng
                </Button>
              </div>

              {/* System Alerts */}
              {visibleAlerts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Cảnh báo hệ thống ({visibleAlerts.length})</span>
                    {dismissedAlerts.size > 0 && (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => {
                          setDismissedAlerts(new Set())
                          sessionStorage.removeItem("dismissedAlerts")
                          message.info("Đã hiển thị lại tất cả cảnh báo")
                        }}
                      >
                        Hiển thị lại tất cả ({dismissedAlerts.size} đã ẩn)
                      </Button>
                    )}
                  </div>
                  {visibleAlerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      message={
                        <div className="flex items-center gap-3">
                          <AlertOutlined />
                          <span className="font-semibold">{alert.title}</span>
                        </div>
                      }
                      description={alert.message}
                      type={alert.severity === "critical" ? "error" : "warning"}
                      showIcon
                      closable
                      onClose={() => handleAlertClose(alert.id)}
                      className="shadow-sm"
                    />
                  ))}
                </div>
              )}

              {/* Main Stats Cards */}
              {stats && (
                <Row gutter={16}>
                  <Col span={6}>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                      <Statistic
                        title={<span className="text-white opacity-90">Doanh thu tháng</span>}
                        value={stats.totalRevenue.month}
                        prefix={<DollarOutlined />}
                        suffix="đ"
                        valueStyle={{ color: "white" }}
                        formatter={(value) => new Intl.NumberFormat("vi-VN").format(value as number)}
                      />
                      {growthMetrics && (
                        <AntTooltip title="Month over Month: Tỷ lệ tăng trưởng so với tháng trước = ((tháng này - tháng trước) / tháng trước) × 100%">
                          <div className="mt-2 flex items-center gap-1 cursor-help">
                            {growthMetrics.revenueGrowth.mom >= 0 ? (
                              <ArrowUpOutlined className="text-green-300" />
                            ) : (
                              <ArrowDownOutlined className="text-red-300" />
                            )}
                            <span className="text-sm">{growthMetrics.revenueGrowth.mom.toFixed(1)}% MoM</span>
                          </div>
                        </AntTooltip>
                      )}
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
                      <Statistic
                        title={<span className="text-white opacity-90">Đơn hàng tháng</span>}
                        value={stats.totalOrders.month}
                        prefix={<ShoppingOutlined />}
                        valueStyle={{ color: "white" }}
                      />
                      {growthMetrics && (
                        <AntTooltip title="Month over Month: Tỷ lệ tăng trưởng so với tháng trước = ((tháng này - tháng trước) / tháng trước) × 100%">
                          <div className="mt-2 flex items-center gap-1 cursor-help">
                            {growthMetrics.orderGrowth.mom >= 0 ? (
                              <ArrowUpOutlined className="text-green-300" />
                            ) : (
                              <ArrowDownOutlined className="text-red-300" />
                            )}
                            <span className="text-sm">{growthMetrics.orderGrowth.mom.toFixed(1)}% MoM</span>
                          </div>
                        </AntTooltip>
                      )}
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                      <Statistic
                        title={<span className="text-white opacity-90">Tổng chi nhánh</span>}
                        value={stats.totalBranches.active}
                        prefix={<BankOutlined />}
                        suffix={`/${stats.totalBranches.total}`}
                        valueStyle={{ color: "white" }}
                      />
                      <div className="mt-2">
                        <Progress percent={(stats.totalBranches.active / stats.totalBranches.total) * 100} showInfo={false} strokeColor="white" />
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                      <Statistic
                        title={<span className="text-white opacity-90">Khách hàng mới</span>}
                        value={stats.totalCustomers.new}
                        prefix={<UserOutlined />}
                        suffix={`/${stats.totalCustomers.total}`}
                        valueStyle={{ color: "white" }}
                      />
                      {growthMetrics && (
                        <AntTooltip title="Month over Month: Tỷ lệ tăng trưởng so với tháng trước = ((tháng này - tháng trước) / tháng trước) × 100%">
                          <div className="mt-2 flex items-center gap-1 cursor-help">
                            {growthMetrics.customerGrowth.mom >= 0 ? (
                              <ArrowUpOutlined className="text-green-300" />
                            ) : (
                              <ArrowDownOutlined className="text-red-300" />
                            )}
                            <span className="text-sm">{growthMetrics.customerGrowth.mom.toFixed(1)}% MoM</span>
                          </div>
                        </AntTooltip>
                      )}
                    </div>
                  </Col>
                </Row>
              )}

              {/* Secondary Stats */}
              {stats && (
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Tổng người dùng</p>
                          <p className="text-2xl font-bold text-slate-900">{stats.totalUsers.total}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {stats.totalUsers.active} đang hoạt động
                          </p>
                        </div>
                        <TeamOutlined className="text-4xl text-slate-400" />
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Tổng sản phẩm</p>
                          <p className="text-2xl font-bold text-slate-900">{stats.totalProducts.total}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {stats.totalProducts.available} đang bán
                          </p>
                        </div>
                        <AppstoreOutlined className="text-4xl text-slate-400" />
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Doanh thu toàn thời gian</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {(stats.totalRevenue.allTime).toLocaleString("vi-VN")}đ
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {stats.totalOrders.total} đơn hàng
                          </p>
                        </div>
                        <RiseOutlined className="text-4xl text-slate-400" />
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Revenue Chart */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Biểu đồ doanh thu toàn hệ thống</h3>
                  <p className="text-sm text-slate-500">Theo dõi xu hướng doanh thu</p>
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
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      label={{ value: "Doanh thu (VNĐ)", angle: -90, position: "insideLeft" }}
                      tickFormatter={(value) => new Intl.NumberFormat("vi-VN").format(value)}
                    />
                    <Tooltip
                      formatter={(value: any, name: string | undefined) => {
                        if (name === "revenue") {
                          return [`${new Intl.NumberFormat("vi-VN").format(value)}đ`, "Doanh thu"]
                        }
                        return [value, "Đơn hàng"]
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Branch Performance & Customer Distribution */}
            <Row gutter={16} className="mb-8">
              <Col span={16}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BankOutlined className="text-blue-500 text-lg" />
                      <h3 className="text-lg font-semibold text-slate-900">Hiệu suất các chi nhánh</h3>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 italic mb-2">
                    <InfoCircleOutlined className="mr-1" />
                    Điểm số tính theo: Doanh thu ({thresholds.revenueWeight}%), Giá trị đơn TB ({thresholds.aovWeight}%), Hiệu suất nhân viên ({thresholds.efficiencyWeight}%), Tỷ lệ giữ chân khách ({thresholds.retentionWeight}%)
                  </div>
                  <Table
                    columns={branchColumns}
                    dataSource={branchPerformance}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    size="small"
                    scroll={{ x: 800 }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserOutlined className="text-purple-500 text-lg" />
                    <h3 className="text-lg font-semibold text-slate-900">Phân bố khách hàng</h3>
                  </div>
                  <div className="text-xs text-gray-500 italic mb-2">
                    <InfoCircleOutlined className="mr-1" />
                    Phân hạng: Bronze (mặc định), Silver (≥{thresholds.silverPoints} điểm), Gold (≥{thresholds.goldPoints} điểm), VIP (≥{thresholds.vipPoints} điểm)
                  </div>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerTierData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {customerTierData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Top Products */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrophyOutlined className="text-yellow-500 text-lg" />
                <h3 className="text-lg font-semibold text-slate-900">Top sản phẩm bán chạy toàn hệ thống</h3>
              </div>
              <div className="text-xs text-gray-500 italic mb-2">
                <InfoCircleOutlined className="mr-1" />
                Thống kê dựa trên dữ liệu trong 30 ngày gần nhất
              </div>
              <Table columns={productColumns} dataSource={topProducts} rowKey="id" pagination={false} size="small" />
            </div>
          </CardContent>
        </Card>

        {/* Settings Modal */}
        <Modal
          title="Cài đặt ngưỡng cảnh báo"
          open={settingsModalVisible}
          onCancel={handleSettingsCancel}
          footer={[
            <Button key="cancel" onClick={handleSettingsCancel}>
              Hủy
            </Button>,
            <Button key="apply" type="primary" onClick={handleSettingsApply}>
              Áp dụng
            </Button>,
          ]}
          width={600}
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ngưỡng doanh thu thấp (%)</label>
              <Space.Compact className="w-full">
                <InputNumber
                  min={0}
                  max={100}
                  value={tempThresholds.revenuePercent}
                  onChange={(value) => setTempThresholds({ ...tempThresholds, revenuePercent: value || 50 })}
                  className="w-full"
                />
                <Button disabled>%</Button>
              </Space.Compact>
              <p className="text-xs text-gray-500 mt-1">Cảnh báo khi doanh thu chi nhánh {'<'} % mức trung bình</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Số nhân viên tối thiểu</label>
              <InputNumber
                min={1}
                max={50}
                value={tempThresholds.minStaff}
                onChange={(value) => setTempThresholds({ ...tempThresholds, minStaff: value || 3 })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Cảnh báo khi chi nhánh có {'<'} số nhân viên này</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ngưỡng tồn kho tối thiểu</label>
              <InputNumber
                min={0}
                max={1000}
                value={tempThresholds.minStock}
                onChange={(value) => setTempThresholds({ ...tempThresholds, minStock: value || 10 })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Cảnh báo khi số lượng sản phẩm {'<='} ngưỡng này</p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Tiêu chí đánh giá hiệu suất chi nhánh (%)</h4>
              <p className="text-xs text-gray-500 mb-3">Tổng các trọng số phải bằng 100%</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Trọng số Doanh thu (%)</label>
                  <Space.Compact className="w-full">
                    <InputNumber
                      min={0}
                      max={100}
                      value={tempThresholds.revenueWeight}
                      onChange={(value) => setTempThresholds({ ...tempThresholds, revenueWeight: value || 40 })}
                      className="w-full"
                    />
                    <Button disabled>%</Button>
                  </Space.Compact>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trọng số Giá trị đơn TB (%)</label>
                  <Space.Compact className="w-full">
                    <InputNumber
                      min={0}
                      max={100}
                      value={tempThresholds.aovWeight}
                      onChange={(value) => setTempThresholds({ ...tempThresholds, aovWeight: value || 20 })}
                      className="w-full"
                    />
                    <Button disabled>%</Button>
                  </Space.Compact>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trọng số Hiệu suất nhân viên (%)</label>
                  <Space.Compact className="w-full">
                    <InputNumber
                      min={0}
                      max={100}
                      value={tempThresholds.efficiencyWeight}
                      onChange={(value) => setTempThresholds({ ...tempThresholds, efficiencyWeight: value || 20 })}
                      className="w-full"
                    />
                    <Button disabled>%</Button>
                  </Space.Compact>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trọng số Tỷ lệ giữ chân khách (%)</label>
                  <Space.Compact className="w-full">
                    <InputNumber
                      min={0}
                      max={100}
                      value={tempThresholds.retentionWeight}
                      onChange={(value) => setTempThresholds({ ...tempThresholds, retentionWeight: value || 20 })}
                      className="w-full"
                    />
                    <Button disabled>%</Button>
                  </Space.Compact>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-xs font-medium">Tổng: </span>
                  <span className={`text-xs font-bold ${tempThresholds.revenueWeight + tempThresholds.aovWeight + tempThresholds.efficiencyWeight + tempThresholds.retentionWeight === 100
                    ? "text-green-600"
                    : "text-red-600"
                    }`}>
                    {tempThresholds.revenueWeight + tempThresholds.aovWeight + tempThresholds.efficiencyWeight + tempThresholds.retentionWeight}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Ngưỡng phân hạng khách hàng</h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Silver (điểm)</label>
                  <InputNumber
                    min={0}
                    max={100000}
                    value={tempThresholds.silverPoints}
                    onChange={(value) => setTempThresholds({ ...tempThresholds, silverPoints: value || 2000 })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gold (điểm)</label>
                  <InputNumber
                    min={0}
                    max={100000}
                    value={tempThresholds.goldPoints}
                    onChange={(value) => setTempThresholds({ ...tempThresholds, goldPoints: value || 5000 })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">VIP (điểm)</label>
                  <InputNumber
                    min={0}
                    max={100000}
                    value={tempThresholds.vipPoints}
                    onChange={(value) => setTempThresholds({ ...tempThresholds, vipPoints: value || 10000 })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </Spin>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard Quản trị Hệ thống">
      <App>
        <DashboardContent />
      </App>
    </AdminLayout>
  )
}
