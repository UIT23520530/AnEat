import Link from "next/link"
import { AdminLayout } from "@/components/layouts/admin-layout"

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Admin</h1>
        <p className="text-muted-foreground mb-6">Welcome to the admin area. Use the sidebar to navigate.</p>
        <div className="space-x-3">
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </Link>
          <Link href="/admin/users" className="text-primary hover:underline">
            Manage Users
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}
