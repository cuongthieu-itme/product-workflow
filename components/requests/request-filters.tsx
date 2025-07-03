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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, X, Filter } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/ui/date-picker'

export function RequestFilters({
  onFilterChange
}: {
  onFilterChange: (filters: any) => void
}) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userDepartment, setUserDepartment] = useState<string | null>(null)

  // Các state cho bộ lọc
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(
    undefined
  )
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(undefined)
  const [creatorFilter, setCreatorFilter] = useState<string>('all')
  const [materialFilter, setMaterialFilter] = useState<string>('all')

  // State cho các bộ lọc đang áp dụng
  const [activeFilters, setActiveFilters] = useState<
    {
      key: string
      label: string
      value: string
    }[]
  >([])

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
    setUserDepartment(localStorage.getItem('userDepartment'))
  }, [])

  // Tạo một hàm memoized để cập nhật activeFilters
  const updateActiveFilters = useCallback(() => {
    const newActiveFilters = []

    if (statusFilter !== 'all') {
      newActiveFilters.push({
        key: 'status',
        label: 'Trạng thái',
        value: getStatusLabel(statusFilter)
      })
    }

    if (departmentFilter !== 'all') {
      newActiveFilters.push({
        key: 'department',
        label: 'Phòng ban',
        value: getDepartmentLabel(departmentFilter)
      })
    }

    if (priorityFilter !== 'all') {
      newActiveFilters.push({
        key: 'priority',
        label: 'Độ ưu tiên',
        value: getPriorityLabel(priorityFilter)
      })
    }

    if (dateFromFilter) {
      newActiveFilters.push({
        key: 'dateFrom',
        label: 'Từ ngày',
        value: dateFromFilter.toLocaleDateString()
      })
    }

    if (dateToFilter) {
      newActiveFilters.push({
        key: 'dateTo',
        label: 'Đến ngày',
        value: dateToFilter.toLocaleDateString()
      })
    }

    if (creatorFilter !== 'all') {
      newActiveFilters.push({
        key: 'creator',
        label: 'Người tạo',
        value: creatorFilter
      })
    }

    if (materialFilter !== 'all') {
      newActiveFilters.push({
        key: 'material',
        label: 'Nguyên vật liệu',
        value: materialFilter
      })
    }

    setActiveFilters(newActiveFilters)
  }, [
    statusFilter,
    departmentFilter,
    priorityFilter,
    dateFromFilter,
    dateToFilter,
    creatorFilter,
    materialFilter
  ])

  // Cập nhật activeFilters khi các bộ lọc thay đổi
  useEffect(() => {
    updateActiveFilters()
  }, [updateActiveFilters])

  // Cập nhật bộ lọc khi có thay đổi - sử dụng useCallback để tránh tạo hàm mới mỗi lần render
  const notifyFilterChange = useCallback(() => {
    const filters = {
      search: searchTerm,
      status: statusFilter,
      department: departmentFilter,
      priority: priorityFilter,
      dateFrom: dateFromFilter,
      dateTo: dateToFilter,
      creator: creatorFilter,
      material: materialFilter
    }
    onFilterChange(filters)
  }, [
    searchTerm,
    statusFilter,
    departmentFilter,
    priorityFilter,
    dateFromFilter,
    dateToFilter,
    creatorFilter,
    materialFilter,
    onFilterChange
  ])

  // Chỉ gọi onFilterChange khi các bộ lọc thay đổi
  useEffect(() => {
    notifyFilterChange()
  }, [notifyFilterChange])

  // Xóa một bộ lọc
  const removeFilter = (key: string) => {
    switch (key) {
      case 'status':
        setStatusFilter('all')
        break
      case 'department':
        setDepartmentFilter('all')
        break
      case 'priority':
        setPriorityFilter('all')
        break
      case 'dateFrom':
        setDateFromFilter(undefined)
        break
      case 'dateTo':
        setDateToFilter(undefined)
        break
      case 'creator':
        setCreatorFilter('all')
        break
      case 'material':
        setMaterialFilter('all')
        break
      default:
        break
    }
  }

  // Xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setStatusFilter('all')
    setDepartmentFilter('all')
    setPriorityFilter('all')
    setDateFromFilter(undefined)
    setDateToFilter(undefined)
    setCreatorFilter('all')
    setMaterialFilter('all')
  }

  // Hàm helper để lấy nhãn trạng thái
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý'
      case 'in_progress':
        return 'Đang xử lý'
      case 'completed':
        return 'Hoàn thành'
      case 'rejected':
        return 'Từ chối'
      case 'on_hold':
        return 'Tạm giữ'
      default:
        return status
    }
  }

  // Hàm helper để lấy nhãn phòng ban
  const getDepartmentLabel = (department: string) => {
    switch (department) {
      case 'mkt':
        return 'Marketing'
      case 'rd':
        return 'R&D'
      case 'sales':
        return 'Sales'
      case 'bod':
        return 'Ban Giám Đốc'
      default:
        return department
    }
  }

  // Hàm helper để lấy nhãn độ ưu tiên
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Thấp'
      case 'medium':
        return 'Trung bình'
      case 'high':
        return 'Cao'
      case 'urgent':
        return 'Khẩn cấp'
      default:
        return priority
    }
  }

  return (
    <div className="space-y-4">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">
              Trạng thái
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status" className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="in_progress">Đang xử lý</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="on_hold">Tạm giữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {userRole === 'admin' && (
            <div className="grid gap-2">
              <label htmlFor="department" className="text-sm font-medium">
                Phòng ban
              </label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger id="department" className="w-[180px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="mkt">Marketing</SelectItem>
                  <SelectItem value="rd">R&D</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="bod">Ban Giám Đốc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Lọc nâng cao
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Bộ lọc nâng cao</h4>
                <p className="text-sm text-muted-foreground">
                  Thiết lập các điều kiện lọc cho yêu cầu
                </p>
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Thời gian tạo</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dateFrom" className="text-xs">
                      Từ ngày
                    </Label>
                    <DatePicker
                      date={dateFromFilter}
                      setDate={setDateFromFilter}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo" className="text-xs">
                      Đến ngày
                    </Label>
                    <DatePicker
                      date={dateToFilter}
                      setDate={setDateToFilter}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creator">Người tạo</Label>
                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                  <SelectTrigger id="creator">
                    <SelectValue placeholder="Chọn người tạo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="user1">Nguyễn Văn A</SelectItem>
                    <SelectItem value="user2">Trần Thị B</SelectItem>
                    <SelectItem value="user3">Lê Văn C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="material">Nguyên vật liệu</Label>
                <Select
                  value={materialFilter}
                  onValueChange={setMaterialFilter}
                >
                  <SelectTrigger id="material">
                    <SelectValue placeholder="Chọn nguyên vật liệu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="mat1">Nhôm</SelectItem>
                    <SelectItem value="mat2">Gỗ sồi</SelectItem>
                    <SelectItem value="mat3">Kính cường lực</SelectItem>
                    <SelectItem value="mat4">Thép không gỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Hiển thị các bộ lọc đang áp dụng */}
      {activeFilters.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Bộ lọc đang áp dụng</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-xs"
              >
                Xóa tất cả
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <span className="text-xs font-medium">
                    {filter.label}: {filter.value}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeFilter(filter.key)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Xóa bộ lọc {filter.label}</span>
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
