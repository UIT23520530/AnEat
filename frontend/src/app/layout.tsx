import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './globals.css'
import { CartProvider } from '@/contexts/cart-context'

export const metadata: Metadata = {
  title: 'AnEat',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans bg-slate-50 ${GeistSans.variable} ${GeistMono.variable}`}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#3B82F6',
              colorSuccess: '#10B981',
              colorWarning: '#F59E0B',
              colorError: '#EF4444',
              colorInfo: '#06B6D4',
              borderRadius: 8,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            },
          }}
        >
          <CartProvider>{children}</CartProvider>
        </ConfigProvider>
        <Analytics />
      </body>
    </html>
  )
}
