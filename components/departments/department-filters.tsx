"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"

export function DepartmentFilters() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex flex-1 items-end gap-4">
        <div className="grid flex-1 gap-2">
          <label htmlFor="search" className="text-sm font-medium">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="search" type="search" placeholder="Tìm theo tên phòng ban hoặc mô tả..." className="pl-8" />
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor="sort" className="text-sm font-medium">
            Sắp xếp theo
          </label>
          <Select defaultValue="name">
            <SelectTrigger id="sort" className="w-[180px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Tên phòng ban</SelectItem>
              <SelectItem value="members">Số thành viên</SelectItem>
              <SelectItem value="projects">Số dự án</SelectItem>
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
