"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Shield, User, Briefcase } from "lucide-react"

const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@fastfood.com",
    role: "admin",
    status: "active",
    lastLogin: "2025-10-04",
  },
  {
    id: "2",
    name: "Nguyễn Văn A",
    email: "manager1@fastfood.com",
    role: "manager",
    store: "Store #1",
    status: "active",
    lastLogin: "2025-10-04",
  },
  {
    id: "3",
    name: "Trần Thị B",
    email: "staff1@fastfood.com",
    role: "staff",
    store: "Store #1",
    status: "active",
    lastLogin: "2025-10-03",
  },
  {
    id: "4",
    name: "Lê Văn C",
    email: "customer1@example.com",
    role: "customer",
    status: "active",
    lastLogin: "2025-10-04",
  },
  {
    id: "5",
    name: "Phạm Thị D",
    email: "customer2@example.com",
    role: "customer",
    status: "inactive",
    lastLogin: "2025-09-15",
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || user.role === activeTab
    return matchesSearch && matchesTab
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "manager":
        return <Briefcase className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "manager":
        return "bg-blue-500"
      case "staff":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all system users</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="manager">Managers</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="customer">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold">Store</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Last Login</th>
                        <th className="p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="p-4">{user.email}</td>
                          <td className="p-4">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              <span className="mr-1">{getRoleIcon(user.role)}</span>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4">{user.store || "-"}</td>
                          <td className="p-4">
                            <Badge variant={user.status === "active" ? "default" : "outline"}>{user.status}</Badge>
                          </td>
                          <td className="p-4">{user.lastLogin}</td>
                          <td className="p-4">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No users found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
