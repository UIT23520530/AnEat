import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicLayout } from "@/components/layouts/public-layout"

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="flex items-center justify-center py-12 px-4 min-h-screen">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left side - Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-8">
              <div className="text-center">
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <svg className="w-32 h-32 text-orange-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 6.5C13 5.67 13.67 5 14.5 5S16 5.67 16 6.5 15.33 8 14.5 8 13 7.33 13 6.5M19 13c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2M6.5 13C7.33 13 8 13.67 8 14.5S7.33 16 6.5 16 5 15.33 5 14.5 5.67 13 6.5 13M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    </svg>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">♥</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Whoops!</h2>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Trang này không tồn tại</h3>
                <p className="text-slate-600">Có vẻ như chúng tôi không thể tìm thấy những gì bạn đang tìm kiếm.</p>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-md text-center">
                <div className="mb-6">
                  <h1 className="text-7xl font-bold text-orange-500 mb-4">404</h1>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">Không tìm thấy trang</h2>
                  <p className="text-slate-600">Trang bạn đang tìm kiếm có vẻ đã biến mất vào không khí mỏng manh.</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/" className="flex-1">
                    <Button className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-base">
                      QUAY VỀ TRANG CHỦ
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full py-6 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold rounded-lg text-base">
                      DUYỆT THỰC ĐƠN
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
