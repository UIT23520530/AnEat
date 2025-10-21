"use client"

import { ManagerLayout } from "@/components/layouts/manager-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingBag, TrendingUp, UserCheck, Package, Ticket, FileText, Download } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts"

const revenueData = [
  { day: "Mon", revenue: 2400000 },
  { day: "Tue", revenue: 1800000 },
  { day: "Wed", revenue: 3200000 },
  { day: "Thu", revenue: 2800000 },
  { day: "Fri", revenue: 3900000 },
  { day: "Sat", revenue: 4500000 },
  { day: "Sun", revenue: 4200000 },
]

const orderData = [
  { day: "Mon", orders: 45 },
  { day: "Tue", orders: 38 },
  { day: "Wed", orders: 62 },
  { day: "Thu", orders: 54 },
  { day: "Fri", orders: 78 },
  { day: "Sat", orders: 92 },
  { day: "Sun", orders: 85 },
]

const chartOrderData = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 52 },
  { day: "Wed", value: 38 },
  { day: "Thu", value: 65 },
  { day: "Fri", value: 78 },
  { day: "Sat", value: 92 },
  { day: "Sun", value: 85 },
]

const topProducts = [
  { name: "Fried Chicken Combo", sales: 156, revenue: 7800000 },
  { name: "Cheese Burger", sales: 134, revenue: 5360000 },
  { name: "Carbonara Pasta", sales: 98, revenue: 5390000 },
  { name: "Spicy Wings", sales: 87, revenue: 3915000 },
  { name: "French Fries", sales: 203, revenue: 4060000 },
]

export default function ManagerDashboardPage() {
  return (
    <ManagerLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Downtown Store - Branch Overview & Management</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Branch Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">22,800,000 VND</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600 font-medium">+12.5%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">454</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600 font-medium">+8.2%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Staff</CardTitle>
              <UserCheck className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">12</div>
              <p className="text-xs text-slate-500 mt-2">
                8 working today
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Order Value</CardTitle>
              <DollarSign className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">50,220 VND</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600 font-medium">+3.8%</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Staff Management</p>
                  <p className="text-2xl font-bold text-slate-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Products</p>
                  <p className="text-2xl font-bold text-slate-900">48</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Active Promos</p>
                  <p className="text-2xl font-bold text-slate-900">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Invoices</p>
                  <p className="text-2xl font-bold text-slate-900">158</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
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

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Weekly Orders</CardTitle>
              <p className="text-sm text-slate-500">Last 7 days order count</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Top Selling Products</CardTitle>
            <p className="text-sm text-slate-500">Best performers this week</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-slate-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-slate-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{product.revenue.toLocaleString()} VND</p>
                    <p className="text-xs text-slate-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  )
}
