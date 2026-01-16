import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define route permissions
const routePermissions: Record<string, string[]> = {
  "/admin": ["ADMIN_SYSTEM"],
  "/manager": ["ADMIN_BRAND"],
  "/staff": ["STAFF"],
  "/profile": ["ADMIN_SYSTEM", "ADMIN_BRAND", "STAFF", "CUSTOMER"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get user from cookie (in real app, verify JWT token)
  const userCookie = request.cookies.get("user")

  // Check if route requires authentication
  const protectedRoute = Object.keys(routePermissions).find((route) => pathname.startsWith(route))

  if (protectedRoute) {
    if (!userCookie) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    try {
      const user = JSON.parse(userCookie.value)
      const allowedRoles = routePermissions[protectedRoute]

      if (!allowedRoles.includes(user.role)) {
        // Redirect to unauthorized page
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/staff/:path*", "/profile/:path*"],
}
