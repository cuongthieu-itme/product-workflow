'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useStandardWorkflow,
  type AvailableVariable
} from './standard-workflow-context'
import { Plus, Trash2, Edit } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export function WorkflowVariablesManager() {
  const {
    availableVariables,
    addAvailableVariable,
    updateAvailableVariable,
    deleteAvailableVariable
  } = useStandardWorkflow()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedVariableId, setSelectedVariableId] = useState<string | null>(
    null
  )
  const [newVariable, setNewVariable] = useState<Omit<AvailableVariable, 'id'>>(
    {
      name: '',
      description: '',
      source: 'custom',
      type: 'text'
    }
  )

  // Lấy biến được chọn
  const getSelectedVariable = () => {
    if (!selectedVariableId) return null
    return availableVariables.find((v) => v.id === selectedVariableId) || null
  }

  // Xử lý thêm biến mới
  const handleAddVariable = () => {
    if (!newVariable.name.trim()) {
      return
    }

    addAvailableVariable(newVariable)

    // Reset form
    setNewVariable({
      name: '',
      description: '',
      source: 'custom',
      type: 'text'
    })
    setShowAddDialog(false)
  }

  // Xử lý cập nhật biến
  const handleUpdateVariable = () => {
    const variable = getSelectedVariable()
    if (!variable) return

    if (!variable.name.trim()) {
      return
    }

    updateAvailableVariable(variable.id, {
      name: variable.name,
      description: variable.description,
      type: variable.type
    })

    setShowEditDialog(false)
  }

  // Xử lý xóa biến
  const handleDeleteVariable = () => {
    if (!selectedVariableId) return

    deleteAvailableVariable(selectedVariableId)
    setSelectedVariableId(null)
    setShowDeleteDialog(false)
  }

  // Lấy tên loại biến
  const getVariableTypeName = (type: string) => {
    switch (type) {
      case 'text':
        return 'Văn bản'
      case 'date':
        return 'Ngày tháng'
      case 'user':
        return 'Người dùng'
      case 'number':
        return 'Số'
      case 'select':
        return 'Lựa chọn'
      default:
        return type
    }
  }

  // Lấy tên nguồn biến
  const getVariableSourceName = (source: string) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý biến có sẵn</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Thêm biến mới
          </Button>
        </CardHeader>
        <CardContent>
          {availableVariables.length === 0 ? (
            <div className="text-center py-10 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">Chưa có biến nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableVariables.map((variable) => (
                <Card
                  key={variable.id}
                  className={
                    variable.source !== 'custom'
                      ? 'border-blue-200 bg-blue-50/30'
                      : ''
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{variable.name}</h4>
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {getVariableSourceName(variable.source)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {variable.description || 'Không có mô tả'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getVariableTypeName(variable.type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedVariableId(variable.id)
                            setShowEditDialog(true)
                          }}
                          disabled={variable.source !== 'custom'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setSelectedVariableId(variable.id)
                            setShowDeleteDialog(true)
                          }}
                          disabled={variable.source !== 'custom'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog thêm biến mới */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm biến mới</DialogTitle>
            <DialogDescription>
              Thêm một biến tùy chỉnh mới để sử dụng trong quy trình.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="variable-name">
                Tên biến <span className="text-red-500">*</span>
              </Label>
              <Input
                id="variable-name"
                value={newVariable.name}
                onChange={(e) =>
                  setNewVariable({ ...newVariable, name: e.target.value })
                }
                placeholder="Nhập tên biến"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variable-description">Mô tả</Label>
              <Input
                id="variable-description"
                value={newVariable.description || ''}
                onChange={(e) =>
                  setNewVariable({
                    ...newVariable,
                    description: e.target.value
                  })
                }
                placeholder="Nhập mô tả biến"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variable-type">
                Loại biến <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newVariable.type}
                onValueChange={(value) =>
                  setNewVariable({ ...newVariable, type: value as any })
                }
              >
                <SelectTrigger id="variable-type">
                  <SelectValue placeholder="Chọn loại biến" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Văn bản</SelectItem>
                  <SelectItem value="date">Ngày tháng</SelectItem>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="number">Số</SelectItem>
                  <SelectItem value="select">Lựa chọn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddVariable}>Thêm biến</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa biến */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa biến</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin của biến tùy chỉnh.
            </DialogDescription>
          </DialogHeader>
          {getSelectedVariable() && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-variable-name">
                  Tên biến <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-variable-name"
                  value={getSelectedVariable()?.name || ''}
                  onChange={(e) => {
                    const variable = getSelectedVariable()
                    if (variable) {
                      updateAvailableVariable(variable.id, {
                        name: e.target.value
                      })
                    }
                  }}
                  placeholder="Nhập tên biến"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-variable-description">Mô tả</Label>
                <Input
                  id="edit-variable-description"
                  value={getSelectedVariable()?.description || ''}
                  onChange={(e) => {
                    const variable = getSelectedVariable()
                    if (variable) {
                      updateAvailableVariable(variable.id, {
                        description: e.target.value
                      })
                    }
                  }}
                  placeholder="Nhập mô tả biến"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-variable-type">
                  Loại biến <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={getSelectedVariable()?.type || 'text'}
                  onValueChange={(value) => {
                    const variable = getSelectedVariable()
                    if (variable) {
                      updateAvailableVariable(variable.id, {
                        type: value as any
                      })
                    }
                  }}
                >
                  <SelectTrigger id="edit-variable-type">
                    <SelectValue placeholder="Chọn loại biến" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Văn bản</SelectItem>
                    <SelectItem value="date">Ngày tháng</SelectItem>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="number">Số</SelectItem>
                    <SelectItem value="select">Lựa chọn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateVariable}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa biến */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa biến</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa biến này? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteVariable}>
              Xóa biến
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
