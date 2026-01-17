"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authService, UserProfile } from "@/services/auth.service"
import { Loader2 } from "lucide-react"

export function StaffHeader() {
  const [currentDateTime, setCurrentDateTime] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cập nhật ngày giờ hiện tại
    const updateDateTime = () => {
      const now = new Date()
      const formattedDate = now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const formattedTime = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setCurrentDateTime(`${formattedDate}, ${formattedTime}`)
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000) // Cập nhật mỗi giây

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Lấy thông tin user từ API
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const profile = await authService.getCurrentUser()
        setUserProfile(profile)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-green-600 font-medium">
            {currentDateTime || "Đang tải..."}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Đang tải...</span>
            </div>
          ) : userProfile ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{userProfile.name}</div>
                <div className="text-xs text-gray-500">
                  {authService.getRoleDisplayName(userProfile.role)}
                </div>
              </div>
              <Avatar className="h-10 w-10">
                {userProfile.avatar && (
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                )}
                <AvatarFallback className="bg-orange-500 text-white">
                  {authService.getUserInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Không thể tải thông tin</div>
          )}
        </div>
      </div>
    </header>
  )
}
