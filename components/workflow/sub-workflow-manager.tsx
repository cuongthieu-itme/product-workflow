'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStandardWorkflow } from './standard-workflow-context-firebase'
import { useSubWorkflow } from './sub-workflow-context-firebase'
import { useProductStatus } from '@/components/product-status/product-status-context-firebase'
import { toast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function SubWorkflowManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [statusId, setStatusId] = useState('')
  const [selectedSteps, setSelectedSteps] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { standardWorkflow, loading: workflowLoading } = useStandardWorkflow()
  const { addSubWorkflow, getAllSubWorkflows } = useSubWorkflow()
  const { productStatuses, loading: statusesLoading } = useProductStatus()
  const [availableStatuses, setAvailableStatuses] = useState<any[]>([])

  // Lấy danh sách trạng thái có thể chọn
  useEffect(() => {
    const loadAvailableStatuses = async () => {
      if (statusesLoading || workflowLoading || !productStatuses.length) return

      try {
        // Lấy tất cả quy trình con
        const allSubWorkflows = await getAllSubWorkflows()

        // Lấy danh sách statusId đã có quy trình con
        const statusIdsWithSubWorkflow = allSubWorkflows.map(
          (workflow) => workflow.statusId
        )

        // Lọc danh sách trạng thái có thể chọn
        // Chỉ hiển thị trạng thái có workflowId là standard-workflow hoặc không có workflowId
        const filtered = productStatuses.filter((status) => {
          // Kiểm tra xem trạng thái có sử dụng quy trình chuẩn không
          const isStandardWorkflow =
            !status.workflowId || status.workflowId === 'standard-workflow'

          if (!isStandardWorkflow) {
            return false
          }

          // Kiểm tra xem trạng thái đã có quy trình con chưa
          if (statusIdsWithSubWorkflow.includes(status.id)) {
            return false
          }

          return true
        })

        setAvailableStatuses(filtered)
      } catch (error) {
        console.error('Lỗi khi tải danh sách trạng thái:', error)
      }
    }

    loadAvailableStatuses()
  }, [productStatuses, statusesLoading, workflowLoading, getAllSubWorkflows])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (!name.trim()) {
        setErrorMessage('Vui lòng nhập tên quy trình')
        setIsSubmitting(false)
        return
      }

      if (selectedSteps.length === 0) {
        setErrorMessage('Vui lòng chọn ít nhất một bước')
        setIsSubmitting(false)
        return
      }

      // Tìm thông tin trạng thái nếu có
      let statusName = ''
      if (statusId) {
        const selectedStatus = productStatuses.find(
          (status) => status.id === statusId
        )
        if (selectedStatus) {
          statusName = selectedStatus.name
        }
      }

      // Tạo quy trình con mới
      await addSubWorkflow({
        name,
        description,
        statusId: statusId || '', // Cho phép statusId rỗng
        statusName,
        visibleSteps: selectedSteps,
        parentWorkflowId: 'standard-workflow'
      })

      toast({
        title: 'Thành công',
        description: 'Đã tạo quy trình con mới'
      })

      // Đóng dialog và reset form
      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error('Lỗi khi tạo quy trình con:', error)
      setErrorMessage(error.message || 'Đã xảy ra lỗi khi tạo quy trình con')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setStatusId('')
    setSelectedSteps([])
    setErrorMessage(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const toggleStep = (stepId: string) => {
    if (selectedSteps.includes(stepId)) {
      setSelectedSteps(selectedSteps.filter((id) => id !== stepId))
    } else {
      setSelectedSteps([...selectedSteps, stepId])
    }
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>Thêm quy trình con</Button>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm quy trình con mới</DialogTitle>
            <DialogDescription>
              Tạo quy trình con cho một trạng thái sản phẩm cụ thể dựa trên quy
              trình chuẩn.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên quy trình con *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Nhập tên quy trình con"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Nhập mô tả quy trình con"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Trạng thái sản phẩm
                <span className="text-muted-foreground ml-1 text-xs">
                  (tùy chọn)
                </span>
              </Label>
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái sản phẩm (không bắt buộc)" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">
                Chọn các bước từ quy trình chuẩn
              </Label>
              <div className="col-span-3">
                <ScrollArea className="h-[200px] border rounded-md p-4">
                  {workflowLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : standardWorkflow ? (
                    <div className="space-y-2">
                      {standardWorkflow.steps
                        .sort((a, b) => a.order - b.order)
                        .map((step) => (
                          <div
                            key={step.id}
                            className="flex items-start space-x-2 pb-2 border-b"
                          >
                            <Checkbox
                              id={`step-${step.id}`}
                              checked={selectedSteps.includes(step.id)}
                              onCheckedChange={() => toggleStep(step.id)}
                            />
                            <div>
                              <Label
                                htmlFor={`step-${step.id}`}
                                className="font-medium"
                              >
                                {step.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Không tìm thấy quy trình chuẩn. Vui lòng tạo quy trình
                      chuẩn trước.
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Đang tạo...
                </>
              ) : (
                'Thêm quy trình con'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
