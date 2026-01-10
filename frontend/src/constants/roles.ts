import type { UserRole } from "@/types"

export const ROLES: Record<string, UserRole> = {
  ADMIN_SYSTEM: "ADMIN_SYSTEM",
  ADMIN_BRAND: "ADMIN_BRAND",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN_SYSTEM: "System Administrator",
  ADMIN_BRAND: "Branch Manager",
  STAFF: "Staff",
  CUSTOMER: "Customer",
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  ADMIN_SYSTEM: "/admin/dashboard",
  ADMIN_BRAND: "/manager/dashboard",
  STAFF: "/staff/order/place-order",
  CUSTOMER: "/",
}
