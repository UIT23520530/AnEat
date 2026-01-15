import Link from "next/link"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { redirect } from "next/navigation"

export default function StaffPage() {
  redirect('staff/dashboard')
}
