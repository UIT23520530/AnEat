import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define route permissions
const routePermissions: Record<string, string[]> = {
  "/admin": ["ADMIN_SYSTEM"],
  "/manager": ["ADMIN_BRAND"],
  "/staff": ["STAFF"],
  "/logistics-staff": ["LOGISTICS_STAFF"],
  "/profile": ["ADMIN_SYSTEM", "ADMIN_BRAND", "STAFF", "CUSTOMER", "LOGISTICS_STAFF"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get user from cookie (in real app, verify JWT token)
  const userCookie = request.cookies.get("user")

  // Check if route requires authentication
  const protectedRoute = Object.keys(routePermissions).find((route) => pathname.startsWith(route))

  if (protectedRoute) {
    console.log('[Middleware] Checking route:', pathname, '| Protected route:', protectedRoute)
    
    if (!userCookie) {
      // Redirect to login if not authenticated
      console.log('[Middleware] ❌ No user cookie found, redirecting to login')
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      // Decode the cookie value (it's URI encoded)
      console.log('[Middleware] Raw cookie value:', userCookie.value.substring(0, 50) + '...')
      const decodedValue = decodeURIComponent(userCookie.value)
      console.log('[Middleware] Decoded cookie:', decodedValue)
      const user = JSON.parse(decodedValue)
      const allowedRoles = routePermissions[protectedRoute]

      console.log('[Middleware] ✓ User:', user.email, '| Role:', user.role, '| Allowed:', allowedRoles)

      if (!allowedRoles.includes(user.role)) {
        // Redirect to unauthorized page
        console.log('[Middleware] ❌ User role not allowed, redirecting to unauthorized')
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
      
      console.log('[Middleware] ✅ Access granted')
    } catch (error) {
      console.error('[Middleware] ❌ Error parsing user cookie:', error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/staff/:path*", "/logistics-staff/:path*", "/profile/:path*"],
}
