import { Metadata } from "next";
import { ProductDetailWrapper } from "./product-detail-wrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Metadata sẽ được generate từ product data khi fetch
  return {
    title: "Sản phẩm | AnEat",
    description: "Chi tiết sản phẩm",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductDetailWrapper slug={slug} />;
}
