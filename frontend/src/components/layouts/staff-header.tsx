"use client"

import { useState, useEffect } from "react"

export function StaffHeader() {
  const [currentDateTime, setCurrentDateTime] = useState<string>("")

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

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center">
        <div className="text-sm text-green-600 font-medium">
          {currentDateTime || "Đang tải..."}
        </div>
      </div>
    </header>
  )
}
