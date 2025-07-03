'use client'

import type React from 'react'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  useWorkflowProcess,
  type WorkflowProcess
} from './workflow-process-context'
import { useProductStatus } from '../product-status/product-status-context'
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

interface AddWorkflowProcessFormProps {
  isOpen: boolean
  onClose: () => void
  onProcessAdded?: () => void
  editingProcess?: WorkflowProcess | null
}

export function AddWorkflowProcessForm({
  isOpen,
  onClose,
  onProcessAdded,
  editingProcess = null
}: AddWorkflowProcessFormProps) {
  const { toast } = useToast()
  const {
    addWorkflowProcess,
    updateWorkflowProcess,
    isWorkflowProcessNameExists,
    getWorkflowProcessByStatusId
  } = useWorkflowProcess()
  const { productStatuses } = useProductStatus()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    statusId: ''
  })
  const [nameError, setNameError] = useState('')
  const [statusError, setStatusError] = useState('')

  // Reset form khi mở dialog hoặc khi chuyển giữa thêm mới và chỉnh sửa
  useEffect(() => {
    if (isOpen) {
      if (editingProcess) {
        setFormData({
          name: editingProcess.name,
          description: editingProcess.description,
          statusId: editingProcess.statusId
        })
      } else {
        setFormData({
          name: '',
          description: '',
          statusId: productStatuses.length > 0 ? productStatuses[0].id : ''
        })
      }
      setNameError('')
      setStatusError('')
    }
  }, [isOpen, editingProcess, productStatuses])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Xóa thông báo lỗi khi người dùng thay đổi giá trị
    if (field === 'name') {
      setNameError('')
    } else if (field === 'statusId') {
      setStatusError('')
    }
  }, [])

  const validateForm = useCallback(() => {
    let isValid = true

    if (!formData.name.trim()) {
      setNameError('Vui lòng nhập tên quy trình')
      isValid = false
    } else if (isWorkflowProcessNameExists(formData.name, editingProcess?.id)) {
      setNameError('Quy trình này đã tồn tại, vui lòng chọn tên khác')
      isValid = false
    }

    if (!formData.statusId) {
      setStatusError('Vui lòng chọn trạng thái sản phẩm')
      isValid = false
    } else {
      // Kiểm tra xem trạng thái đã có quy trình chưa (trừ khi đang chỉnh sửa quy trình hiện tại)
      const existingProcess = getWorkflowProcessByStatusId(formData.statusId)
      if (existingProcess && existingProcess.id !== editingProcess?.id) {
        setStatusError(
          'Trạng thái này đã có quy trình, vui lòng chọn trạng thái khác'
        )
        isValid = false
      }
    }

    return isValid
  }, [
    formData,
    isWorkflowProcessNameExists,
    getWorkflowProcessByStatusId,
    editingProcess
  ])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsLoading(true)

      try {
        if (editingProcess) {
          // Cập nhật quy trình
          updateWorkflowProcess(editingProcess.id, {
            name: formData.name,
            description: formData.description,
            statusId: formData.statusId
          })

          toast({
            title: 'Cập nhật thành công',
            description: `Quy trình "${formData.name}" đã được cập nhật.`,
            variant: 'success'
          })
        } else {
          // Thêm quy trình mới
          addWorkflowProcess({
            name: formData.name,
            description: formData.description,
            statusId: formData.statusId,
            steps: []
          })

          toast({
            title: 'Tạo quy trình thành công',
            description: `Quy trình "${formData.name}" đã được tạo. Bạn có thể thêm các bước vào quy trình này.`,
            variant: 'success'
          })
        }

        // Đóng dialog sau 1 giây
        setTimeout(() => {
          setIsLoading(false)
          if (onProcessAdded) onProcessAdded()
          onClose()
        }, 1000)
      } catch (error) {
        setIsLoading(false)
        toast({
          title: 'Có lỗi xảy ra',
          description:
            'Không thể lưu quy trình làm việc. Vui lòng thử lại sau.',
          variant: 'destructive'
        })
      }
    },
    [
      validateForm,
      formData,
      editingProcess,
      updateWorkflowProcess,
      addWorkflowProcess,
      toast,
      onProcessAdded,
      onClose
    ]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {editingProcess
              ? 'Chỉnh sửa quy trình'
              : 'Thêm quy trình làm việc mới'}
          </DialogTitle>
          <DialogDescription>
            {editingProcess
              ? 'Chỉnh sửa thông tin quy trình làm việc'
              : 'Nhập thông tin chi tiết về quy trình làm việc mới'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">
                Tên quy trình <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên quy trình"
                className={nameError ? 'border-red-500' : ''}
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusId" className="text-right">
                Trạng thái sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.statusId}
                onValueChange={(value) => handleInputChange('statusId', value)}
              >
                <SelectTrigger className={statusError ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn trạng thái sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {productStatuses.length === 0 ? (
                    <SelectItem value="no-status" disabled>
                      Không có trạng thái sản phẩm nào
                    </SelectItem>
                  ) : (
                    productStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {statusError && (
                <p className="text-sm text-red-500">{statusError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Nhập mô tả chi tiết về quy trình làm việc"
                rows={3}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="flex justify-between sm:justify-between flex-shrink-0 mt-4">
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
            {editingProcess ? 'Cập nhật' : 'Tạo quy trình'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
