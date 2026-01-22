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
  title: 'AnEat - Đặt Đồ Ăn Nhanh Online, Giao Hàng Tận Nơi Tiện Lợi',
  description: 'Đặt đồ ăn nhanh ngon, sạch và chất lượng tại AnEat. Giao hàng tận nơi nhanh chóng với menu đa dạng: burger, gà rán, mì Ý và nhiều combo hấp dẫn. Nguyên liệu tươi ngon, vệ sinh an toàn, món ăn nóng hổi đến tay trong thời gian ngắn nhất.',
  keywords: ['đặt đồ ăn nhanh', 'giao đồ ăn online', 'burger giao tận nơi', 'gà rán online', 'mì Ý giao hàng', 'đồ ăn nhanh giá rẻ', 'fast food delivery', 'AnEat', 'đặt combo đồ ăn'],
  authors: [{ name: 'AnEat' }],
  manifest: "/manifest.json",
  metadataBase: new URL('https://aneat.shop'),
  alternates: {
    canonical: 'https://aneat.shop',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://aneat.shop',
    siteName: 'AnEat',
    title: 'AnEat - Đặt Đồ Ăn Nhanh Online, Giao Hàng Tận Nơi Tiện Lợi',
    description: 'Đặt đồ ăn nhanh ngon, sạch và chất lượng tại AnEat. Giao hàng tận nơi nhanh chóng với menu đa dạng: burger, gà rán, mì Ý và nhiều combo hấp dẫn.',
    images: [
      {
        url: '/icons/AnEat.svg',
        width: 1200,
        height: 630,
        alt: 'AnEat - Đặt Đồ Ăn Nhanh Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnEat - Đặt Đồ Ăn Nhanh Online, Giao Hàng Tận Nơi',
    description: 'Đặt đồ ăn nhanh ngon, sạch, chất lượng. Giao hàng nhanh chóng - Menu đa dạng - Giá cả hợp lý',
    images: ['/icons/AnEat.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
