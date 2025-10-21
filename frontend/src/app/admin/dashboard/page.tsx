"use client"

import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Calendar,
  ChevronDown,
  MoreVertical,
  Download
} from "lucide-react"
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Area,
  AreaChart,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell
} from "recharts"

const totalRevenueData = [
  { month: "Jan", value2020: 15000, value2021: 28000 },
  { month: "Feb", value2020: 22000, value2021: 18000 },
  { month: "Mar", value2020: 18000, value2021: 25000 },
  { month: "Apr", value2020: 28000, value2021: 22000 },
  { month: "May", value2020: 24000, value2021: 36000 },
  { month: "Jun", value2020: 36000, value2021: 32000 },
  { month: "Jul", value2020: 28000, value2021: 26000 },
  { month: "Aug", value2020: 32000, value2021: 30000 },
  { month: "Sept", value2020: 28000, value2021: 32000 },
  { month: "Oct", value2020: 26000, value2021: 28000 },
  { month: "Nov", value2020: 30000, value2021: 35000 },
  { month: "Des", value2020: 28000, value2021: 32000 },
]

const chartOrderData = [
  { day: "Sunday", value: 55 },
  { day: "Monday", value: 85 },
  { day: "Tuesday", value: 40 },
  { day: "Wednesday", value: 65 },
  { day: "Thursday", value: 95 },
  { day: "Friday", value: 75 },
  { day: "Saturday", value: 60 },
]

const customerMapData = [
  { day: "Sun", red: 60, yellow: 90 },
  { day: "Sun", red: 40, yellow: 70 },
  { day: "Sun", red: 50, yellow: 45 },
  { day: "Sun", red: 35, yellow: 85 },
  { day: "Sun", red: 70, yellow: 60 },
  { day: "Sun", red: 30, yellow: 75 },
  { day: "Sun", red: 55, yellow: 65 },
]

const pieChartData = [
  { name: "Total Order", value: 81, color: "#EF4444" },
  { name: "Customer Growth", value: 22, color: "#22D3EE" },
  { name: "Total Revenue", value: 62, color: "#3B82F6" },
]

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="p-8 space-y-6 bg-slate-50">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Hi, Haa Ju. Welcome back to AnEat Admin!</p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
            <Calendar className="h-4 w-4" />
            Filter Periode
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 - Total Orders */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                    <Package className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500 font-medium">Total Orders</p>
                  <div className="flex items-end gap-2 mt-2">
                    <h3 className="text-3xl font-bold text-slate-900">75</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500 font-medium">+3% (30 days)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2 - Total Delivered */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-300 flex items-center justify-center">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500 font-medium">Total Delivered</p>
                  <div className="flex items-end gap-2 mt-2">
                    <h3 className="text-3xl font-bold text-slate-900">357</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500 font-medium">-3% (30 days)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3 - Total Canceled */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                    <Package className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500 font-medium">Total Canceled</p>
                  <div className="flex items-end gap-2 mt-2">
                    <h3 className="text-3xl font-bold text-slate-900">65</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500 font-medium">+3% (30 days)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 4 - Total Revenue */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-300 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
                  <div className="flex items-end gap-2 mt-2">
                    <h3 className="text-3xl font-bold text-slate-900">$128</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500 font-medium">+3% (30 days)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Pie Chart</h3>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" checked readOnly />
                  <span className="text-slate-600">Chart</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" checked readOnly />
                  <span className="text-slate-600">Show Value</span>
                </label>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-3 gap-6 w-full">
                {pieChartData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#E5E7EB"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke={item.color}
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(item.value / 100) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-slate-900">{item.value}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 text-center">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Chart Order */}
          <Card className="p-6 bg-white border-0 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900">Chart Order</h3>
                <p className="text-sm text-slate-500 mt-1">Lorem ipsum dolor sit amet, consectetur</p>
              </div>
              <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                <Download className="h-4 w-4" />
                Save Report
              </Button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartOrderData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-600">456 Order</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Oct 18th, 2022</span>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Revenue */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-6">Total Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={totalRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    formatter={(value) => `$${Number(value).toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value2020" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value2021" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-600">2020</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-600">2021</span>
              </div>
            </div>
          </Card>

          {/* Customer Map */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Customer Map</h3>
              <Button variant="outline" className="gap-2 text-sm">
                Weekly
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerMapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="red" fill="#EF4444" radius={[8, 8, 0, 0]} barSize={20} />
                  <Bar dataKey="yellow" fill="#F59E0B" radius={[8, 8, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
