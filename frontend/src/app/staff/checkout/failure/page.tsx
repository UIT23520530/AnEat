"use client"

import { Suspense } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { StaffHeader } from "@/components/layouts/staff-header"
import StaffCheckoutFailureContent from "../../../../components/forms/staff/failure-content"

export default function StaffCheckoutFailurePage() {
  return (
    <StaffLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        <StaffHeader />
        <Suspense
          fallback={
            <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          }
        >
          <StaffCheckoutFailureContent />
        </Suspense>
      </div>
    </StaffLayout>
  )
}
