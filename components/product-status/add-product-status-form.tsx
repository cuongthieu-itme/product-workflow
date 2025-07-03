'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useProductStatus } from '@/components/product-status/product-status-context-firebase'
import { useSubWorkflow } from '@/components/workflow/sub-workflow-context-firebase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface AddProductStatusFormProps {
  isOpen?: boolean
  onClose?: () => void
  onStatusAdded?: () => void
  editingStatus?: {
    id: string
    name: string
    description: string
    color?: string
    workflowId?: string
  } | null
  onSuccess?: () => void
}

const predefinedColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899' // pink
]

export function AddProductStatusForm({
  isOpen,
  onClose,
  onStatusAdded,
  editingStatus = null,
  onSuccess
}: AddProductStatusFormProps) {
  const { toast } = useToast()
  const {
    addProductStatus,
    updateProductStatus,
    isProductStatusNameExists,
    getStandardWorkflowId
  } = useProductStatus()
  const { subWorkflows, loading: subWorkflowLoading } = useSubWorkflow()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#4f46e5', // Màu mặc định
    workflowId: '' // ID của quy trình, mặc định là quy trình chuẩn
  })
  const [nameError, setNameError] = useState('')
  const [isDialogMode] = useState(typeof isOpen !== 'undefined')
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  // Reset form khi mở dialog hoặc khi chuyển giữa thêm mới và chỉnh sửa
  useEffect(() => {
    if ((isDialogMode && isOpen) || !isDialogMode) {
      const standardWorkflowId = getStandardWorkflowId()

      if (editingStatus) {
        setFormData({
          name: editingStatus.name,
          description: editingStatus.description,
          color: editingStatus.color || '#4f46e5',
          workflowId: editingStatus.workflowId || standardWorkflowId
        })
      } else {
        setFormData({
          name: '',
          description: '',
          color: '#4f46e5',
          workflowId: standardWorkflowId
        })
      }
      setNameError('')
    }
  }, [isOpen, editingStatus, isDialogMode, getStandardWorkflowId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Xóa thông báo lỗi khi người dùng thay đổi tên
    if (field === 'name') {
      setNameError('')
    }
  }

  const validateForm = () => {
    let isValid = true

    if (!formData.name.trim()) {
      setNameError('Vui lòng nhập tên trạng thái')
      isValid = false
    } else if (
      isProductStatusNameExists &&
      isProductStatusNameExists(formData.name, editingStatus?.id)
    ) {
      setNameError('Trạng thái này đã tồn tại, vui lòng chọn tên khác')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (editingStatus) {
        // Cập nhật trạng thái
        await updateProductStatus(editingStatus.id, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          workflowId: formData.workflowId || getStandardWorkflowId()
        })

        toast({
          title: 'Cập nhật thành công',
          description: `Trạng thái "${formData.name}" đã được cập nhật.`
        })
      } else {
        // Thêm trạng thái mới
        await addProductStatus({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          workflowId: formData.workflowId || getStandardWorkflowId(),
          order: 999 // Will be sorted later
        })

        toast({
          title: 'Tạo trạng thái thành công',
          description: `Trạng thái "${formData.name}" đã được tạo.`
        })
      }

      // Đóng dialog sau 1 giây
      setTimeout(() => {
        setIsLoading(false)
        if (onStatusAdded) onStatusAdded()
        if (onClose) onClose()
        if (onSuccess) onSuccess()

        // Reset form if not in dialog mode
        if (!isDialogMode) {
          const standardWorkflowId = getStandardWorkflowId()
          setFormData({
            name: '',
            description: '',
            color: '#4f46e5',
            workflowId: standardWorkflowId
          })
        }
      }, 1000)
    } catch (error) {
      setIsLoading(false)
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Không thể lưu trạng thái sản phẩm. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
      console.error('Error saving product status:', error)
    }
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-right">
          Tên trạng thái <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Nhập tên trạng thái"
          className={nameError ? 'border-red-500' : ''}
        />
        {nameError && <p className="text-sm text-red-500">{nameError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-right">
          Mô tả
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Nhập mô tả chi tiết về trạng thái sản phẩm"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-right">Màu sắc</Label>
        <div className="flex items-center gap-2">
          <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[160px] justify-start',
                  !formData.color && 'text-muted-foreground'
                )}
              >
                <div
                  className="h-4 w-4 rounded-full mr-2"
                  style={{ backgroundColor: formData.color || '#4f46e5' }}
                />
                <span>{formData.color || '#4f46e5'}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="grid grid-cols-4 gap-2 mb-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 flex items-center justify-center',
                      formData.color === color
                        ? 'border-black dark:border-white'
                        : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      handleInputChange('color', color)
                      setColorPickerOpen(false)
                    }}
                    type="button"
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Input
                  type="color"
                  value={formData.color}
                  id="color-picker"
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-10 h-10 p-0 border-none"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </PopoverContent>
          </Popover>
          <div
            className="h-8 w-8 rounded-md"
            style={{ backgroundColor: formData.color || '#4f46e5' }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workflow" className="text-right">
          Quy trình
        </Label>
        <Select
          value={formData.workflowId}
          onValueChange={(value) => handleInputChange('workflowId', value)}
          disabled={subWorkflowLoading || isLoading}
        >
          <SelectTrigger id="workflow">
            <SelectValue placeholder="Chọn quy trình" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={getStandardWorkflowId()}>
              Quy trình chuẩn
            </SelectItem>
            {subWorkflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Chọn quy trình sẽ được áp dụng cho trạng thái này. Mặc định là quy
          trình chuẩn.
        </p>
      </div>

      {!isDialogMode && (
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingStatus ? 'Cập nhật trạng thái' : 'Tạo trạng thái mới'}
        </Button>
      )}
    </form>
  )

  // Nếu component được sử dụng trong dialog
  if (isDialogMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStatus
                ? 'Chỉnh sửa trạng thái'
                : 'Thêm trạng thái sản phẩm mới'}
            </DialogTitle>
            <DialogDescription>
              {editingStatus
                ? 'Chỉnh sửa thông tin trạng thái sản phẩm'
                : 'Nhập thông tin chi tiết về trạng thái sản phẩm mới'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="px-1">{renderForm()}</div>
          </ScrollArea>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingStatus ? 'Cập nhật' : 'Tạo trạng thái'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Nếu component được sử dụng trực tiếp (không trong dialog)
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {editingStatus ? 'Chỉnh sửa trạng thái' : 'Thêm trạng thái mới'}
      </h2>
      {renderForm()}
    </div>
  )
}
