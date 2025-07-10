import { ProductDetail } from "@/features/products/components/product-detail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi Tiết Sản Phẩm - ProductFlow",
  description: "Xem chi tiết và quản lý quy trình phát triển sản phẩm",
};

export default function Page() {
  return <ProductDetail />;
}
