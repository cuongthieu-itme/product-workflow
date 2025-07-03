import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ProductFlow - Hệ thống quản lý quy trình phát triển sản phẩm',
  description:
    'Hệ thống quản lý quy trình phát triển và ra mắt sản phẩm toàn diện'
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            ProductFlow
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Hệ thống quản lý quy trình phát triển sản phẩm toàn diện
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <Link href="/login" passHref>
            <Button className="w-full">Đăng nhập</Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="outline" className="w-full">
              Đăng ký
            </Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button variant="ghost" className="w-full">
              Xem Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
