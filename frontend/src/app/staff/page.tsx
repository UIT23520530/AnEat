import Link from "next/link"
import { StaffLayout } from "@/components/layouts/staff-layout"

export default function StaffPage() {
  return (
    <StaffLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Staff</h1>
        <p className="text-muted-foreground mb-6">Welcome to the staff area. Use the top navigation to access POS and Orders.</p>
        <div className="space-x-3">
          <Link href="/staff/pos" className="text-primary hover:underline">
            Open POS
          </Link>
          <Link href="/staff/orders" className="text-primary hover:underline">
            View Orders
          </Link>
        </div>
      </div>
    </StaffLayout>
  )
}
