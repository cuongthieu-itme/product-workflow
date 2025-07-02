"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useWorkflow, type Workflow } from "./workflow-context"
import { useProductStatus } from "../product-status/product-status-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

interface AddWorkflowFormProps {
  isOpen: boolean
  onClose: () => void
  onWorkflowAdded?: () => void
  editingWorkflow?: Workflow | null
}

export function AddWorkflowForm({ isOpen, onClose, onWorkflowAdded, editingWorkflow = null }: AddWorkflowFormProps) {
  const { toast } = useToast()
  const { addWorkflow, updateWorkflow, isStatusHasWorkflow } = useWorkflow()
  const { productStatuses } = useProductStatus()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    statusId: "",
  })
  const [nameError, setNameError] = useState("")
  const [statusError, setStatusError] = useState("")

  // Memoize các trạng thái có thể chọn để tránh tính toán lại không cần thiết
  const selectableStatuses = useCallback(() => {
    // Lọc ra các trạng thái chưa có quy trình (trừ trạng thái của quy trình đang chỉnh sửa)
    const availableStatuses = productStatuses.filter((status) => !isStatusHasWorkflow(status.id, editingWorkflow?.id))

    // Thêm trạng thái hiện tại của quy trình đang chỉnh sửa (nếu có)
    const currentStatus = editingWorkflow
      ? productStatuses.find((status) => status.id === editingWorkflow.statusId)
      : null

    // Danh sách trạng thái có thể chọn
    return currentStatus
      ? [...availableStatuses, currentStatus].sort((a, b) => a.name.localeCompare(b.name))
      : availableStatuses
  }, [productStatuses, isStatusHasWorkflow, editingWorkflow])

  // Reset form khi mở dialog hoặc khi chuyển giữa thêm mới và chỉnh sửa
  useEffect(() => {
    if (isOpen) {
      if (editingWorkflow) {
        setFormData({
          name: editingWorkflow.name,
          description: editingWorkflow.description,
          statusId: editingWorkflow.statusId,
        })
      } else {
        const statuses = selectableStatuses()
        setFormData({
          name: "",
          description: "",
          statusId: statuses.length > 0 ? statuses[0].id : "",
        })
      }
      setNameError("")
      setStatusError("")
    }
  }, [isOpen, editingWorkflow, selectableStatuses])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Xóa thông báo lỗi khi người dùng thay đổi giá trị
    if (field === "name") {
      setNameError("")
    } else if (field === "statusId") {
      setStatusError("")
    }
  }, [])

  // Thay đổi phần validateForm để không bắt buộc phải có bước ngay từ đầu
  // Chỉ cần kiểm tra tên quy trình và trạng thái

  const validateForm = useCallback(() => {
    let isValid = true

    if (!formData.name.trim()) {
      setNameError("Vui lòng nhập tên quy trình")
      isValid = false
    }

    if (!formData.statusId) {
      setStatusError("Vui lòng chọn trạng thái sản phẩm")
      isValid = false
    } else if (isStatusHasWorkflow(formData.statusId, editingWorkflow?.id)) {
      setStatusError("Trạng thái này đã có quy trình khác. Mỗi trạng thái chỉ có thể gắn một quy trình.")
      isValid = false
    }

    return isValid
  }, [formData, isStatusHasWorkflow, editingWorkflow])

  // Thay đổi phần handleSubmit để thêm thông báo rõ ràng hơn về việc thêm các bước sau

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsLoading(true)

      try {
        if (editingWorkflow) {
          // Cập nhật quy trình
          updateWorkflow(editingWorkflow.id, {
            name: formData.name,
            description: formData.description,
            statusId: formData.statusId,
          })

          toast({
            title: "Cập nhật thành công",
            description: `Quy trình "${formData.name}" đã được cập nhật.`,
            variant: "success",
          })
        } else {
          // Thêm quy trình mới
          addWorkflow({
            name: formData.name,
            description: formData.description,
            statusId: formData.statusId,
            steps: [],
          })

          toast({
            title: "Tạo quy trình thành công",
            description: `Quy trình "${formData.name}" đã được tạo. Bạn có thể thêm các bước vào quy trình này sau.`,
            variant: "success",
          })
        }

        // Đóng dialog sau 1 giây
        setTimeout(() => {
          setIsLoading(false)
          if (onWorkflowAdded) onWorkflowAdded()
          onClose()
        }, 1000)
      } catch (error) {
        setIsLoading(false)
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể lưu quy trình làm việc. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      }
    },
    [validateForm, formData, editingWorkflow, updateWorkflow, addWorkflow, toast, onWorkflowAdded, onClose],
  )

  const statuses = selectableStatuses()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingWorkflow ? "Chỉnh sửa quy trình" : "Thêm quy trình làm việc mới"}</DialogTitle>
          <DialogDescription>
            {editingWorkflow
              ? "Chỉnh sửa thông tin quy trình làm việc"
              : "Nhập thông tin chi tiết về quy trình làm việc mới"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">
                Tên quy trình <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên quy trình"
                className={nameError ? "border-red-500" : ""}
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusId" className="text-right">
                Trạng thái sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.statusId} onValueChange={(value) => handleInputChange("statusId", value)}>
                <SelectTrigger className={statusError ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn trạng thái sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.length === 0 ? (
                    <SelectItem value="no-status" disabled>
                      Không có trạng thái sản phẩm nào khả dụng
                    </SelectItem>
                  ) : (
                    statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {statusError && <p className="text-sm text-red-500">{statusError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Nhập mô tả chi tiết về quy trình làm việc"
                rows={4}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingWorkflow ? "Cập nhật" : "Tạo quy trình"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
