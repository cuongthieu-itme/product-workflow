'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  CheckCircle2,
  FileEdit,
  Palette,
  ShoppingCart,
  Megaphone,
  Rocket,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  status: string
  updatedAt: string
  createdAt: string
  sku?: string
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Bản Nháp',
    color: 'bg-slate-500',
    icon: <FileEdit className="h-4 w-4" />
  },
  review: {
    label: 'Đang Xem Xét',
    color: 'bg-yellow-500',
    icon: <Eye className="h-4 w-4" />
  },
  design: {
    label: 'Thiết Kế',
    color: 'bg-purple-500',
    icon: <Palette className="h-4 w-4" />
  },
  approved: {
    label: 'Đã Phê Duyệt',
    color: 'bg-green-500',
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  production: {
    label: 'Sản Xuất',
    color: 'bg-blue-500',
    icon: <ShoppingCart className="h-4 w-4" />
  },
  marketing: {
    label: 'Marketing',
    color: 'bg-pink-500',
    icon: <Megaphone className="h-4 w-4" />
  },
  launch: {
    label: 'Ra Mắt',
    color: 'bg-orange-500',
    icon: <Rocket className="h-4 w-4" />
  },
  completed: {
    label: 'Hoàn Thành',
    color: 'bg-green-700',
    icon: <CheckCircle2 className="h-4 w-4" />
  }
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const result = await response.json()

      // API trả về { success: true, data: [...] }
      if (result.success && result.data) {
        setProducts(result.data)
      } else {
        setProducts([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải sản phẩm...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center p-8 text-red-500">
          <span>Lỗi: {error}</span>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <span>Chưa có sản phẩm nào</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      {/* Mobile view */}
      <div className="lg:hidden">
        <div className="divide-y">
          {products.map((product) => {
            const status = statusConfig[product.status] || statusConfig.draft
            return (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <Badge
                    className={`${status.color} text-white flex gap-1 items-center ml-2 flex-shrink-0`}
                  >
                    {status.icon}
                    <span className="hidden sm:inline">{status.label}</span>
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>SKU: {product.sku || 'Chưa có'}</span>
                  <span>{formatDate(product.updatedAt)}</span>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/products/${product.id}`}>
                      Xem Chi Tiết
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tên Sản Phẩm</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Cập Nhật</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const status = statusConfig[product.status] || statusConfig.draft
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${status.color} text-white flex gap-1 items-center w-fit`}
                    >
                      {status.icon}
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.sku || 'Chưa có'}</TableCell>
                  <TableCell>{formatDate(product.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/products/${product.id}`}>
                        Xem Chi Tiết
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
