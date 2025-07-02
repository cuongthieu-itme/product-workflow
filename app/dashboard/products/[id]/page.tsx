import type { Metadata } from "next"
import { ProductDetail } from "@/components/products/product-detail"

export const metadata: Metadata = {
  title: "Chi Tiết Sản Phẩm - ProductFlow",
  description: "Xem chi tiết và quản lý quy trình phát triển sản phẩm",
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chi Tiết Sản Phẩm</h1>
        <p className="text-muted-foreground">Xem chi tiết và quản lý quy trình phát triển sản phẩm</p>
      </div>

      <ProductDetail id={params.id} />
    </div>
  )
}
