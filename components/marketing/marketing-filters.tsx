"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"

export function MarketingFilters() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex flex-1 items-end gap-4">
        <div className="grid flex-1 gap-2">
          <label htmlFor="search" className="text-sm font-medium">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="search" type="search" placeholder="Tìm theo tên chiến dịch..." className="pl-8" />
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
              <SelectItem value="active">Đang Hoạt Động</SelectItem>
              <SelectItem value="planned">Lên Kế Hoạch</SelectItem>
              <SelectItem value="completed">Đã Hoàn Thành</SelectItem>
              <SelectItem value="paused">Tạm Dừng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="channel" className="text-sm font-medium">
            Kênh
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="channel" className="w-[180px]">
              <SelectValue placeholder="Kênh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="social">Mạng xã hội</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="offline">Ngoại tuyến</SelectItem>
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
