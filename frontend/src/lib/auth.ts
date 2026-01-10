"use client"

import type { User } from "@/types"

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
    // Also set cookie for middleware
    document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=86400`
  } else {
    localStorage.removeItem("currentUser")
    document.cookie = "user=; path=/; max-age=0"
  }
}

export const logout = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("currentUser")
  document.cookie = "user=; path=/; max-age=0"
  window.location.href = "/login"
}

export const hasRole = (user: User | null, allowedRoles: string[]): boolean => {
  if (!user) return false
  return allowedRoles.includes(user.role)
}
