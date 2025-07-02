"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"

export function ReportFilters() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex flex-1 items-end gap-4">
        <div className="grid flex-1 gap-2">
          <label htmlFor="search" className="text-sm font-medium">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="search" type="search" placeholder="Tìm theo tiêu đề báo cáo..." className="pl-8" />
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor="type" className="text-sm font-medium">
            Loại báo cáo
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="type" className="w-[180px]">
              <SelectValue placeholder="Loại báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="product">Sản Phẩm</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Doanh Số</SelectItem>
              <SelectItem value="custom">Tùy Chỉnh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="date" className="text-sm font-medium">
            Thời gian
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="date" className="w-[180px]">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm này</SelectItem>
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
