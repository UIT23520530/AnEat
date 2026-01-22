import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import '@ant-design/v5-patch-for-react-19'
import './globals.css'
import { CartProvider } from '@/contexts/cart-context'
import { Toaster } from '@/components/ui/toaster'
import './fonts.css'
import { BranchProvider } from '@/contexts/branch-context'

import StyledComponentsRegistry from '@/lib/antd-registry';

// Import dev helper in development mode
if (process.env.NODE_ENV === 'development') {
  import('@/lib/dev-auth');
}

export const metadata: Metadata = {
  title: 'AnEat',
  description: 'Chuỗi cửa hàng cung cấp dịch vụ thức ăn nhanh, hỗ trợ khách hàng đặt món trực tuyến và tại cửa hàng.',
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <head>
        <meta name="google-site-verification" content="iekqPbnYI--fjKXItssiTj_EMr5YTxJvLjp5a990YDI" />
        <link rel="icon" href="/icons/AnEat.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap&subset=vietnamese"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans bg-slate-50 ${GeistSans.variable} ${GeistMono.variable}`}>
        <StyledComponentsRegistry>
          <CartProvider>
            <BranchProvider>
              {children}
            </BranchProvider>
          </CartProvider>
        </StyledComponentsRegistry>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
