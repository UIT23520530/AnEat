"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Lock, Bell } from "lucide-react"

export function StaffHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Ca sáng: <span className="font-medium">08:00 - 16:00</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Nguyễn Văn A</div>
              <div className="text-xs text-gray-500">Thu ngân</div>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-orange-500 text-white">NA</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
