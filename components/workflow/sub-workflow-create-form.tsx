"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSubWorkflow } from "./sub-workflow-context-firebase"
import { useStandardWorkflow } from "./standard-workflow-context-firebase"
import { useProductStatus } from "@/components/product-status/product-status-context-firebase"
import { AlertCircle, Info } from "lucide-react"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface SubWorkflowCreateFormProps {
  onSuccess: () => void
  onCancel: () => void
}

function SortableStepItem({
  step,
  isSelected,
  onToggle,
}: {
  step: any
  isSelected: boolean
  onToggle: (stepId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start space-x-3 pb-4 border-b ${isSelected ? "bg-blue-50 border-blue-200" : ""}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <Checkbox id={`step-${step.id}`} checked={isSelected} onCheckedChange={() => onToggle(step.id)} />
      <div className="space-y-1 flex-1">
        <Label
          htmlFor={`step-${step.id}`}
          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {step.name}
        </Label>
        {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">{step.estimatedDays} ngày</Badge>
          {step.isRequired && <Badge variant="secondary">Bắt buộc</Badge>}
          {step.fields && step.fields.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-help">
                    {step.fields.length} trường dữ liệu
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <div className="space-y-2">
                    <p className="font-medium">Danh sách trường dữ liệu:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {step.fields.map((field) => (
                        <li key={field.id} className="text-sm">
                          {field.name} ({field.type}){field.required && <span className="text-red-500 ml-1">*</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}

export function SubWorkflowCreateForm({ onSuccess, onCancel }: SubWorkflowCreateFormProps) {
  const { addSubWorkflow } = useSubWorkflow()
  const { standardWorkflow, loading: loadingStandardWorkflow } = useStandardWorkflow()
  const { productStatuses, loading: loadingProductStatuses } = useProductStatus()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    statusId: "none",
    visibleSteps: [] as string[],
    stepOrder: [] as string[], // Add this new field
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Lọc trạng thái sản phẩm chỉ hiển thị những trạng thái có workflowId là "standard-workflow" hoặc không có workflowId
  const filteredProductStatuses =
    productStatuses?.filter((status) => !status.workflowId || status.workflowId === "standard-workflow") || []

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setFormData((prev) => {
        const oldIndex = prev.stepOrder.indexOf(active.id as string)
        const newIndex = prev.stepOrder.indexOf(over?.id as string)

        return {
          ...prev,
          stepOrder: arrayMove(prev.stepOrder, oldIndex, newIndex),
        }
      })
    }
  }

  const handleStepToggle = (stepId: string) => {
    setFormData((prev) => {
      const visibleSteps = [...prev.visibleSteps]
      const stepOrder = [...prev.stepOrder]
      const index = visibleSteps.indexOf(stepId)

      if (index === -1) {
        visibleSteps.push(stepId)
        stepOrder.push(stepId)
      } else {
        visibleSteps.splice(index, 1)
        const orderIndex = stepOrder.indexOf(stepId)
        if (orderIndex !== -1) {
          stepOrder.splice(orderIndex, 1)
        }
      }

      return { ...prev, visibleSteps, stepOrder }
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Tên quy trình con không được để trống"
    }

    if (formData.visibleSteps.length === 0) {
      newErrors.visibleSteps = "Vui lòng chọn ít nhất một bước quy trình"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      // Lấy tên trạng thái nếu có chọn
      let statusName = ""
      if (formData.statusId !== "none") {
        const selectedStatus = filteredProductStatuses.find((status) => status.id === formData.statusId)
        statusName = selectedStatus?.name || ""
      }

      // Chuẩn bị dữ liệu và loại bỏ các trường undefined
      const subWorkflowData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        statusId: formData.statusId === "none" ? "" : formData.statusId,
        statusName: statusName,
        visibleSteps: formData.stepOrder, // Use stepOrder instead of visibleSteps
        parentWorkflowId: "standard-workflow",
      }

      await addSubWorkflow(subWorkflowData)
      onSuccess()
    } catch (error: any) {
      console.error("Error creating sub-workflow:", error)
      setErrors({
        submit: `Lỗi: ${error.message || "Không thể tạo quy trình con"}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingStandardWorkflow) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Đang tải quy trình chuẩn...</span>
      </div>
    )
  }

  if (!standardWorkflow) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Không tìm thấy quy trình chuẩn</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Tên quy trình con <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nhập tên quy trình con"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Nhập mô tả quy trình con"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="statusId">Trạng thái sản phẩm</Label>
          <Select value={formData.statusId} onValueChange={(value) => handleInputChange("statusId", value)}>
            <SelectTrigger id="statusId">
              <SelectValue placeholder="Chọn trạng thái sản phẩm (không bắt buộc)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không có trạng thái cụ thể</SelectItem>
              {loadingProductStatuses ? (
                <SelectItem value="loading" disabled>
                  Đang tải...
                </SelectItem>
              ) : filteredProductStatuses.length === 0 ? (
                <SelectItem value="empty" disabled>
                  Không có trạng thái sản phẩm phù hợp
                </SelectItem>
              ) : (
                filteredProductStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Chỉ hiển thị các trạng thái chưa được gán cho quy trình con khác
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Chọn các bước từ quy trình chuẩn <span className="text-red-500">*</span>
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Các bước được chọn sẽ được sao chép đầy đủ từ quy trình chuẩn, bao gồm cả các trường dữ liệu.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {errors.visibleSteps && <p className="text-sm text-red-500">{errors.visibleSteps}</p>}

          <ScrollArea className="h-[300px] border rounded-md p-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="space-y-4">
                {/* Selected steps (draggable) */}
                {formData.stepOrder.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-blue-600">Các bước đã chọn (có thể kéo thả để sắp xếp):</h4>
                    <SortableContext items={formData.stepOrder} strategy={verticalListSortingStrategy}>
                      {formData.stepOrder.map((stepId) => {
                        const step = standardWorkflow.steps?.find((s) => s.id === stepId)
                        if (!step) return null
                        return (
                          <SortableStepItem key={step.id} step={step} isSelected={true} onToggle={handleStepToggle} />
                        )
                      })}
                    </SortableContext>
                  </div>
                )}

                {/* Available steps (not selected) */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Các bước có sẵn:</h4>
                  {standardWorkflow.steps
                    ?.filter((step) => !formData.visibleSteps.includes(step.id))
                    .map((step) => (
                      <SortableStepItem key={step.id} step={step} isSelected={false} onToggle={handleStepToggle} />
                    ))}
                </div>
              </div>
            </DndContext>
          </ScrollArea>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md">{errors.submit}</div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Đang tạo..." : "Tạo quy trình con"}
        </Button>
      </div>
    </div>
  )
}
