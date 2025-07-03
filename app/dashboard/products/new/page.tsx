import type { Metadata } from 'next'
import { ProductForm } from '@/components/products/product-form'

export const metadata: Metadata = {
  title: 'Tạo Sản Phẩm Mới - ProductFlow',
  description: 'Tạo yêu cầu phát triển sản phẩm mới'
}

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tạo Sản Phẩm Mới</h1>
        <p className="text-muted-foreground">
          Nhập thông tin yêu cầu phát triển sản phẩm mới
        </p>
      </div>

      <ProductForm />
    </div>
  )
}
