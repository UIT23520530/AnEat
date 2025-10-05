import Link from "next/link"
import { ManagerLayout } from "@/components/layouts/manager-layout"

export default function ManagerPage() {
  return (
    <ManagerLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Manager</h1>
        <p className="text-muted-foreground mb-6">Welcome to the manager area. Use the sidebar to navigate.</p>
        <div className="space-x-3">
          <Link href="/manager/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </Link>
          <Link href="/manager/products" className="text-primary hover:underline">
            Manage Products
          </Link>
        </div>
      </div>
    </ManagerLayout>
  )
}
