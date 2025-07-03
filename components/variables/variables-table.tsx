'use client'

import { useState } from 'react'
import {
  useAvailableVariables,
  type AvailableVariable
} from './available-variables-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { VariableForm } from './variable-form'
import { VariableDetail } from './variable-detail'

export function VariablesTable() {
  const { variables, loading, deleteVariable } = useAvailableVariables()
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedVariable, setSelectedVariable] =
    useState<AvailableVariable | null>(null)

  // Lọc dữ liệu
  const filteredVariables = variables.filter((variable) => {
    const matchesSearch =
      variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSource =
      sourceFilter === 'all' || variable.source === sourceFilter
    const matchesType = typeFilter === 'all' || variable.type === typeFilter

    return matchesSearch && matchesSource && matchesType
  })

  // Lấy tên hiển thị cho nguồn
  const getSourceName = (source: string) => {
    switch (source) {
      case 'request':
        return 'Yêu cầu'
      case 'system':
        return 'Hệ thống'
      case 'custom':
        return 'Tùy chỉnh'
      default:
        return source
    }
  }

  // Lấy tên hiển thị cho loại
  const getTypeName = (type: string) => {
    switch (type) {
      case 'text':
        return 'Văn bản'
      case 'date':
        return 'Ngày tháng'
      case 'datetime':
        return 'Ngày giờ'
      case 'user':
        return 'Người dùng'
      case 'number':
        return 'Số'
      case 'select':
        return 'Lựa chọn đơn'
      case 'multiselect':
        return 'Lựa chọn nhiều'
      case 'currency':
        return 'Tiền tệ'
      case 'checkbox':
        return 'Hộp kiểm'
      default:
        return type
    }
  }

  // Lấy màu badge cho nguồn
  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'system':
        return 'default'
      case 'request':
        return 'secondary'
      case 'custom':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Xử lý xóa biến
  const handleDelete = async () => {
    if (!selectedVariable) return

    try {
      await deleteVariable(selectedVariable.id)
      setShowDeleteDialog(false)
      setSelectedVariable(null)
    } catch (error) {
      // Lỗi đã được xử lý trong context
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải danh sách biến...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý trường dữ liệu</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm trường mới
          </Button>
        </CardHeader>
        <CardContent>
          {/* Bộ lọc */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="system">Hệ thống</option>
              <option value="request">Yêu cầu</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">Tất cả loại</option>
              <option value="text">Văn bản</option>
              <option value="date">Ngày tháng</option>
              <option value="datetime">Ngày giờ</option>
              <option value="user">Người dùng</option>
              <option value="number">Số</option>
              <option value="select">Lựa chọn đơn</option>
              <option value="multiselect">Lựa chọn nhiều</option>
              <option value="currency">Tiền tệ</option>
              <option value="checkbox">Hộp kiểm</option>
            </select>
          </div>

          {/* Bảng dữ liệu */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên trường</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Bắt buộc</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVariables.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm ||
                      sourceFilter !== 'all' ||
                      typeFilter !== 'all'
                        ? 'Không tìm thấy trường dữ liệu nào phù hợp'
                        : 'Chưa có trường dữ liệu nào'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVariables.map((variable) => (
                    <TableRow key={variable.id}>
                      <TableCell className="font-medium">
                        {variable.name}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {variable.description || 'Không có mô tả'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSourceBadgeVariant(variable.source)}>
                          {getSourceName(variable.source)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getTypeName(variable.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {variable.isRequired ? (
                          <Badge variant="destructive">Bắt buộc</Badge>
                        ) : (
                          <Badge variant="outline">Tùy chọn</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {variable.createdAt.toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedVariable(variable)
                                setShowDetailDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedVariable(variable)
                                setShowEditDialog(true)
                              }}
                              disabled={
                                variable.source === 'system' ||
                                variable.source === 'request'
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedVariable(variable)
                                setShowDeleteDialog(true)
                              }}
                              disabled={
                                variable.source === 'system' ||
                                variable.source === 'request'
                              }
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Thống kê */}
          <div className="mt-4 text-sm text-muted-foreground">
            Hiển thị {filteredVariables.length} / {variables.length} trường dữ
            liệu
          </div>
        </CardContent>
      </Card>

      {/* Dialog thêm biến mới */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Thêm trường dữ liệu mới</DialogTitle>
            <DialogDescription>
              Tạo một trường dữ liệu mới để sử dụng trong các quy trình.
            </DialogDescription>
          </DialogHeader>
          <VariableForm
            onSuccess={() => setShowAddDialog(false)}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa biến */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa trường dữ liệu</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin của trường dữ liệu.
            </DialogDescription>
          </DialogHeader>
          {selectedVariable && (
            <VariableForm
              variable={selectedVariable}
              onSuccess={() => setShowEditDialog(false)}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết trường dữ liệu</DialogTitle>
          </DialogHeader>
          {selectedVariable && <VariableDetail variable={selectedVariable} />}
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa trường dữ liệu "{selectedVariable?.name}
              "? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
