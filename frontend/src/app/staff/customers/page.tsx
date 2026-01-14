"use client"

import { useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomerFormModal } from "@/components/forms/staff/customer-form-modal"
import { Search, Plus, Edit, Trash2 } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  loyaltyPoints: number
  totalOrders: number
  createdAt: string
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "Nguyễn Văn A",
      phone: "0901234567",
      email: "nguyenvana@email.com",
      loyaltyPoints: 150,
      totalOrders: 12,
      createdAt: "15/11/2025",
    },
    {
      id: "2",
      name: "Trần Thị B",
      phone: "0912345678",
      email: "tranthib@email.com",
      loyaltyPoints: 320,
      totalOrders: 28,
      createdAt: "20/10/2025",
    },
    {
      id: "3",
      name: "Lê Văn C",
      phone: "0923456789",
      email: "-",
      loyaltyPoints: 80,
      totalOrders: 5,
      createdAt: "1/12/2025",
    },
  ])

  const handleAddCustomer = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId))
    }
  }

  const handleSubmitCustomer = (customerData: Omit<Customer, "id" | "totalOrders" | "createdAt">) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? { ...c, ...customerData }
            : c
        )
      )
    } else {
      // Add new customer
      const newCustomer: Customer = {
        ...customerData,
        id: (customers.length + 1).toString(),
        totalOrders: 0,
        createdAt: new Date().toLocaleDateString("vi-VN"),
      }
      setCustomers((prev) => [...prev, newCustomer])
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <StaffLayout>
      <div className="flex flex-col h-full bg-gray-50">
        <StaffHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h1>
              <p className="text-sm text-gray-500 mt-1">Danh sách khách hàng thân thiết</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Khách Hàng
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khách hàng (tên, SĐT, email)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tên Khách Hàng</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số Điện Thoại</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Điểm Tích Lũy</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tổng Đơn</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày Tạo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.phone}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {customer.loyaltyPoints} điểm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.totalOrders}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.createdAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Customer Form Modal */}
          <CustomerFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setEditingCustomer(null)
            }}
            onSubmit={handleSubmitCustomer}
            customer={editingCustomer}
          />
        </main>
      </div>
    </StaffLayout>
  )
}