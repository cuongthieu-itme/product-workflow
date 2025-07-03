'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Search, SlidersHorizontal } from 'lucide-react'

export function ProductFilters() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex flex-1 items-end gap-4">
        <div className="grid flex-1 gap-2">
          <label htmlFor="search" className="text-sm font-medium">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Tìm theo tên sản phẩm, mô tả hoặc SKU..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor="status" className="text-sm font-medium">
            Trạng thái
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="status" className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Bản Nháp</SelectItem>
              <SelectItem value="review">Đang Xem Xét</SelectItem>
              <SelectItem value="design">Thiết Kế</SelectItem>
              <SelectItem value="approved">Đã Phê Duyệt</SelectItem>
              <SelectItem value="production">Sản Xuất</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="launch">Ra Mắt</SelectItem>
              <SelectItem value="completed">Hoàn Thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="department" className="text-sm font-medium">
            Phòng ban
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="department" className="w-[180px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="product">Phòng Sản Phẩm</SelectItem>
              <SelectItem value="design">Phòng Thiết Kế</SelectItem>
              <SelectItem value="marketing">Phòng Marketing</SelectItem>
              <SelectItem value="sales">Phòng Kinh Doanh</SelectItem>
              <SelectItem value="operations">Phòng Vận Hành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button variant="outline" className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Lọc nâng cao
      </Button>
    </div>
  )
}
