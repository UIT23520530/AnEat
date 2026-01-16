import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "./product-detail-client"

// Mock products data - trong thực tế sẽ fetch từ API
const mockProducts = [
  {
    id: "1",
    name: "Combo Gà Rán",
    slug: "combo-ga-ran",
    description: "2 miếng gà rán, 1 khoai tây chiên, 1 nước ngọt.",
    basePrice: 89000,
    priceAfterTax: 97900,
    taxPercentage: 10,
    category: "combo",
    image: `/assets/fried-chicken-combo.jpg`,
    isAvailable: true,
    isPromotion: true,
    originalPrice: 99000,
  },
  {
    id: "2",
    name: "Cánh Gà Cay",
    slug: "canh-ga-cay",
    description: "5 cánh gà chiên giòn với sốt cay đặc biệt.",
    basePrice: 79000,
    priceAfterTax: 86900,
    taxPercentage: 10,
    category: "ga-chien",
    image: `/assets/spicy-chicken-wings.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "3",
    name: "Burger Bò Cổ Điển",
    slug: "burger-bo-co-dien",
    description: "Burger với thịt bò, xà lách, cà chua và dưa chuột muối.",
    basePrice: 59000,
    priceAfterTax: 64900,
    taxPercentage: 10,
    category: "burger",
    image: `/assets/classic-burger.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "4",
    name: "Burger Phô Mai",
    slug: "burger-pho-mai",
    description: "Burger bò với một lớp phô mai Cheddar tan chảy.",
    basePrice: 69000,
    priceAfterTax: 75900,
    taxPercentage: 10,
    category: "burger",
    image: `/assets/cheese-burger.png`,
    isAvailable: true,
    isPromotion: true,
  },
  {
    id: "5",
    name: "Mỳ Ý Carbonara",
    slug: "my-y-carbonara",
    description: "Mỳ Ý với sốt kem, thịt xông khói và phô mai Parmesan.",
    basePrice: 85000,
    priceAfterTax: 93500,
    taxPercentage: 10,
    category: "my-y",
    image: `/assets/classic-carbonara.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "6",
    name: "Mỳ Ý Bolognese",
    slug: "my-y-bolognese",
    description: "Mỳ Ý với sốt cà chua và thịt bò bằm.",
    basePrice: 85000,
    priceAfterTax: 93500,
    taxPercentage: 10,
    category: "my-y",
    image: `/assets/bolognese-pasta.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "7",
    name: "Khoai Tây Chiên",
    slug: "khoai-tay-chien",
    description: "Khoai tây chiên giòn rụm.",
    basePrice: 35000,
    priceAfterTax: 38500,
    taxPercentage: 10,
    category: "khoai-tay",
    image: `/assets/crispy-french-fries.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "8",
    name: "Nước Ngọt",
    slug: "nuoc-ngot",
    description: "Nước ngọt mát lạnh (Coca, Pepsi, 7Up).",
    basePrice: 20000,
    priceAfterTax: 22000,
    taxPercentage: 10,
    category: "thuc-uong",
    image: `/assets/refreshing-soft-drink.png`,
    isAvailable: true,
    isPromotion: false,
  },
  {
    id: "9",
    name: "Kem Vani",
    slug: "kem-vani",
    description: "Kem vani mát lạnh.",
    basePrice: 25000,
    priceAfterTax: 27500,
    taxPercentage: 10,
    category: "kem",
    image: `/assets/vanilla-ice-cream.png`,
    isAvailable: true,
    isPromotion: false,
  },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  
  // Tìm sản phẩm theo slug
  const product = mockProducts.find((p) => p.slug === slug)

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm | AnEat",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại.",
    }
  }

  const price = product.basePrice.toLocaleString("vi-VN")
  const title = `${product.name} - ${price}đ | AnEat`
  const description = `${product.description} Giá chỉ ${price}đ. Đặt hàng ngay tại AnEat - Giao hàng nhanh chóng, chất lượng đảm bảo.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Tìm sản phẩm theo slug
  const product = mockProducts.find((p) => p.slug === slug)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}
