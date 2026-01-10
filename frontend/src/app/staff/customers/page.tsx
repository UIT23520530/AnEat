"use client"

import { useState } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import type { Customer } from "@/types"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 10

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // Mock data - expanded for pagination demo
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "Nguyễn Công Hậu",
      phone: "0912345678",
      email: "hau@example.com",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      totalOrders: 15,
      createdAt: "2025-01-01",
    },
    {
      id: "2",
      name: "Trần Văn An",
      phone: "0987654321",
      email: "an@example.com",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      totalOrders: 8,
      createdAt: "2025-02-15",
    },
    {
      id: "3",
      name: "Lê Thị Mai",
      phone: "0901234567",
      email: "mai@example.com",
      address: "789 Đường DEF, Quận 3, TP.HCM",
      totalOrders: 22,
      createdAt: "2025-01-20",
    },
    {
      id: "4",
      name: "Phạm Minh Tuấn",
      phone: "0923456789",
      email: "tuan@example.com",
      address: "321 Đường GHI, Quận 4, TP.HCM",
      totalOrders: 5,
      createdAt: "2025-03-01",
    },
    {
      id: "5",
      name: "Hoàng Thị Lan",
      phone: "0934567890",
      email: "lan@example.com",
      address: "654 Đường JKL, Quận 5, TP.HCM",
      totalOrders: 12,
      createdAt: "2025-02-10",
    },
  ])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || customer.phone.includes(searchQuery),
  )

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex)

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      setCustomers(customers.filter((c) => c.id !== id))
    }
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))

  return (
    <StaffLayout>
      <div className="p-6 h-screen overflow-y-auto bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Quản lý khách hàng</h1>
          </div>

          {/* Search Bar and Add Button */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
                className="pl-10 h-11 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Thêm khách hàng
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Thêm khách hàng mới</DialogTitle>
                </DialogHeader>
                <CustomerForm onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 hover:from-orange-50 hover:to-red-50">
                  <TableHead className="font-bold text-gray-800">STT</TableHead>
                  <TableHead className="font-bold text-gray-800">Tên khách hàng</TableHead>
                  <TableHead className="font-bold text-gray-800">Số điện thoại</TableHead>
                  <TableHead className="font-bold text-gray-800">Email</TableHead>
                  <TableHead className="font-bold text-gray-800">Địa chỉ</TableHead>
                  <TableHead className="font-bold text-gray-800 text-center">Tổng đơn</TableHead>
                  <TableHead className="font-bold text-gray-800 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Không tìm thấy khách hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  currentCustomers.map((customer, index) => (
                    <TableRow key={customer.id} className="hover:bg-orange-50/50 transition-colors">
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-semibold text-gray-800">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="text-gray-600">{customer.email || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate text-gray-600">{customer.address || "-"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                          {customer.totalOrders}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setEditingCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-gray-800">{startIndex + 1}</span> đến{" "}
                <span className="font-semibold text-gray-800">{Math.min(endIndex, filteredCustomers.length)}</span> của{" "}
                <span className="font-semibold text-gray-800">{filteredCustomers.length}</span> khách hàng
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className={cn(
                    "h-9 w-9",
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                  )}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={cn(
                    "h-9 w-9",
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-700 px-3">
                    Trang <span className="font-bold text-orange-600">{currentPage}</span> /{" "}
                    <span className="font-bold">{totalPages}</span>
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "h-9 w-9",
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "h-9 w-9",
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                  )}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Edit Dialog */}
          {editingCustomer && (
            <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
                </DialogHeader>
                <CustomerForm customer={editingCustomer} onClose={() => setEditingCustomer(null)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </StaffLayout>
  )
}

function CustomerForm({
  customer,
  onClose,
}: {
  customer?: Customer
  onClose: () => void
}) {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên *</Label>
          <Input 
            id="name" 
            defaultValue={customer?.name} 
            placeholder="Nguyễn Văn A"
            className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại *</Label>
          <Input 
            id="phone" 
            defaultValue={customer?.phone} 
            placeholder="0912345678"
            className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          defaultValue={customer?.email} 
          placeholder="email@example.com"
          className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Input 
          id="address" 
          defaultValue={customer?.address} 
          placeholder="123 Đường ABC, Quận 1"
          className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button 
          type="submit" 
          onClick={onClose}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          {customer ? "Cập nhật" : "Thêm"} khách hàng
        </Button>
      </div>
    </form>
  )
}
