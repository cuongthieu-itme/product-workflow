'use client'

import type React from 'react'

import { useWorkflow, type ProductStatus } from '@/components/workflow-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Eye,
  CheckCircle2,
  FileEdit,
  Palette,
  ShoppingCart,
  Megaphone,
  Rocket
} from 'lucide-react'
import { useState } from 'react'
import WorkflowSteps from '@/components/workflow-steps'

const statusConfig: Record<
  ProductStatus,
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

export default function ProductList({
  filterStatus
}: {
  filterStatus?: 'active' | 'completed'
}) {
  const { products } = useWorkflow()
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  const filteredProducts = products.filter((product) => {
    if (!filterStatus) return true
    if (filterStatus === 'completed') return product.status === 'completed'
    if (filterStatus === 'active') return product.status !== 'completed'
    return true
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tên Sản Phẩm</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead>Cập Nhật</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không có sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const status = statusConfig[product.status]
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
                    <TableCell>{formatDate(product.createdAt)}</TableCell>
                    <TableCell>{formatDate(product.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product.id)}
                      >
                        Xem Chi Tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedProduct && (
        <WorkflowSteps
          productId={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onComplete={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}
