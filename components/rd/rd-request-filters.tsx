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

export function RDRequestFilters() {
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
              placeholder="Tìm theo mã yêu cầu hoặc tiêu đề..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor="department" className="text-sm font-medium">
            Phòng ban yêu cầu
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="department" className="w-[180px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="mkt">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="bod">Ban Giám Đốc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="assignee" className="text-sm font-medium">
            Người xử lý
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="assignee" className="w-[180px]">
              <SelectValue placeholder="Người xử lý" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="user1">Nguyễn Văn A</SelectItem>
              <SelectItem value="user2">Trần Thị B</SelectItem>
              <SelectItem value="user3">Lê Văn C</SelectItem>
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
