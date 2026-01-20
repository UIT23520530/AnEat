import type { UserRole } from "@/types"

export const ROLES: Record<string, UserRole> = {
  ADMIN_SYSTEM: "ADMIN_SYSTEM",
  ADMIN_BRAND: "ADMIN_BRAND",
  STAFF: "STAFF",
  LOGISTICS_STAFF: "LOGISTICS_STAFF",
  CUSTOMER: "CUSTOMER",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN_SYSTEM: "System Administrator",
  ADMIN_BRAND: "Branch Manager",
  STAFF: "Staff",
  LOGISTICS_STAFF: "Logistics Staff",
  CUSTOMER: "Customer",
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  ADMIN_SYSTEM: "/admin/dashboard",
  ADMIN_BRAND: "/manager/dashboard",
  STAFF: "/staff/orders",
  LOGISTICS_STAFF: "/logistics-staff",
  CUSTOMER: "/",
}
