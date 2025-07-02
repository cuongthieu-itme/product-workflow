"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Circle, AlertCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Field {
  id: string
  name: string
  type: string
  value: any
  options?: any[]
  required?: boolean
  description?: string
}

interface WorkflowStep {
  id: string
  name: string
  description?: string
  fields: Field[]
  estimatedTime?: number
  estimatedTimeUnit?: string
  order?: number
  status?: string
  assigneeRole?: string
  hasCost?: boolean
  isRequired?: boolean
}

interface WorkflowStepExecutionUIProps {
  title: string
  steps: WorkflowStep[]
  currentStepId: string
  fieldValues: Record<string, any>
  onFieldChange: (fieldId: string, value: any) => void
  onCompleteStep: (stepId: string) => Promise<boolean>
  requestData?: Record<string, any>
  onRevertToPreviousStep?: (stepId: string) => Promise<boolean>
  hideCompleteButton?: boolean
  hideTimeInfo?: boolean
}

// Thêm hàm helper để format ngày giờ theo múi giờ Việt Nam
const formatDateTimeForInput = (dateString: string) => {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)

    // Chuyển sang múi giờ Việt Nam sử dụng toLocaleString
    const vietnamDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))

    // Format thành YYYY-MM-DDTHH:mm cho input datetime-local
    const year = vietnamDate.getFullYear()
    const month = String(vietnamDate.getMonth() + 1).padStart(2, "0")
    const day = String(vietnamDate.getDate()).padStart(2, "0")
    const hours = String(vietnamDate.getHours()).padStart(2, "0")
    const minutes = String(vietnamDate.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

// Cập nhật hàm calculateDeadline để sử dụng múi giờ Việt Nam
const calculateDeadline = (receiveDate: string, estimatedTime: number, estimatedTimeUnit: string) => {
  if (!receiveDate) return ""

  try {
    // Sử dụng trực tiếp thời gian từ input (đã là local time)
    const receive = new Date(receiveDate)
    const deadline = new Date(receive)

    console.log("🔄 Calculating deadline:", {
      receiveDate,
      estimatedTime,
      estimatedTimeUnit,
      receiveParsed: receive.toISOString(),
    })

    // Chuyển đổi thời gian ước tính thành ngày
    let daysToAdd = estimatedTime
    if (estimatedTimeUnit === "hours") {
      daysToAdd = Math.ceil(estimatedTime / 8) // 8 giờ làm việc = 1 ngày, làm tròn lên
    } else if (estimatedTimeUnit === "weeks") {
      daysToAdd = estimatedTime * 7
    } else if (estimatedTimeUnit === "months") {
      daysToAdd = estimatedTime * 30
    }

    deadline.setDate(deadline.getDate() + daysToAdd)

    console.log("📅 Deadline calculated:", {
      daysToAdd,
      finalDeadline: deadline.toISOString(),
    })

    // Format về datetime-local
    return formatDateTimeForInput(deadline.toISOString())
  } catch (error) {
    console.error("Error calculating deadline:", error)
    return ""
  }
}

export function WorkflowStepExecutionUI({
  title,
  steps,
  currentStepId,
  fieldValues,
  onFieldChange,
  onCompleteStep,
  requestData = {},
  onRevertToPreviousStep,
  hideCompleteButton = false,
  hideTimeInfo = false,
}: WorkflowStepExecutionUIProps) {
  const [selectedStepId, setSelectedStepId] = useState(currentStepId)

  const currentStep = steps.find((step) => step.id === selectedStepId) || steps[0]

  // Tính toán ngày deadline dựa trên ngày tiếp nhận và thời gian ước tính

  // Tự động tính deadline khi thay đổi ngày tiếp nhận
  const handleFieldChange = (fieldId: string, value: any) => {
    onFieldChange(fieldId, value)

    // Nếu thay đổi ngày tiếp nhận, tự động tính deadline
    if (fieldId === "receiveDate" && currentStep) {
      const newDeadline = calculateDeadline(
        value,
        currentStep.estimatedTime || 1,
        currentStep.estimatedTimeUnit || "days",
      )

      if (newDeadline) {
        // Tìm field deadline và cập nhật
        const deadlineField = currentStep.fields.find(
          (f) => f.id === "deadline" || f.name.toLowerCase().includes("deadline"),
        )
        if (deadlineField) {
          setTimeout(() => {
            onFieldChange(deadlineField.id, newDeadline)
          }, 100)
        }
      }
    }
  }

  // Lấy trạng thái của bước
  const getStepStatus = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId)
    return step?.status || (stepId === currentStepId ? "in_progress" : "not_started")
  }

  // Lấy style cho button bước
  const getStepButtonStyle = (stepId: string, isSelected: boolean) => {
    const status = getStepStatus(stepId)
    let baseStyle =
      "px-4 py-3 rounded-lg border-2 transition-all duration-200 cursor-pointer min-w-[160px] text-center relative"

    if (isSelected) {
      baseStyle += " ring-2 ring-blue-500 ring-offset-2"
    }

    switch (status) {
      case "completed":
        return cn(baseStyle, "bg-green-100 border-green-300 text-green-800 hover:bg-green-200")
      case "in_progress":
        return cn(baseStyle, "bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200")
      default:
        return cn(baseStyle, "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200")
    }
  }

  // Lấy text trạng thái
  const getStepStatusText = (stepId: string) => {
    const status = getStepStatus(stepId)
    switch (status) {
      case "completed":
        return "Hoàn thành"
      case "in_progress":
        return "Đang xử lý"
      default:
        return "Chưa bắt đầu"
    }
  }

  // Render field input
  const renderFieldInput = (field: Field) => {
    const value = fieldValues[field.id] || ""

    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
            required={field.required}
          />
        )

      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
            required={field.required}
            rows={3}
          />
        )

      case "date":
        return (
          <Input
            id={field.id}
            type="datetime-local"
            value={formatDateTimeForInput(value)}
            onChange={(e) => {
              // Chuyển đổi từ datetime-local về UTC để lưu trữ
              const localDate = new Date(e.target.value)
              const utcDate = new Date(localDate.getTime() - 7 * 60 * 60 * 1000)
              handleFieldChange(field.id, utcDate.toISOString())
            }}
            required={field.required}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Chọn ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
            required={field.required}
          />
        )

      default:
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
            required={field.required}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Các bước quy trình</CardTitle>
          <div className="text-sm text-muted-foreground">
            {steps.length} bước • Tiến độ:{" "}
            {Math.round((steps.filter((s) => getStepStatus(s.id) === "completed").length / steps.length) * 100)}%
          </div>
        </CardHeader>
        <CardContent>
          {/* Horizontal Step Buttons */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {steps.map((step, index) => {
                const isSelected = selectedStepId === step.id
                const status = getStepStatus(step.id)

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={getStepButtonStyle(step.id, isSelected)} onClick={() => setSelectedStepId(step.id)}>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {status === "completed" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : status === "in_progress" ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                        <span className="font-medium">{step.name}</span>
                      </div>
                      <div className="text-xs">{getStepStatusText(step.id)}</div>
                    </div>
                    {index < steps.length - 1 && <ChevronRight className="h-5 w-5 text-gray-400 mx-2 flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Step Details */}
          {currentStep && (
            <Card className="border-2 border-blue-200 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStepStatus(currentStep.id) === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : getStepStatus(currentStep.id) === "in_progress" ? (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-blue-600" />
                  )}
                  {currentStep.name}
                  <Badge variant={getStepStatus(currentStep.id) === "completed" ? "default" : "secondary"}>
                    {getStepStatusText(currentStep.id)}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Bước {(currentStep.order || 0) + 1} • ID: {currentStep.id}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Mô tả</Label>
                    <p className="text-sm mt-1">{currentStep.description}</p>
                  </div>
                )}

                {!hideTimeInfo && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Vai trò thực hiện</Label>
                      <p className="text-sm mt-1">{currentStep.assigneeRole || "Chưa phân công"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Thời gian ước tính</Label>
                      <p className="text-sm mt-1">
                        {currentStep.estimatedTime || 0} {currentStep.estimatedTimeUnit || "ngày"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Có chi phí</Label>
                      <p className="text-sm mt-1">{currentStep.hasCost ? "Có" : "Không"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bắt buộc</Label>
                      <p className="text-sm mt-1">{currentStep.isRequired ? "Có" : "Không"}</p>
                    </div>
                  </div>
                )}

                {/* Fields */}
                {currentStep.fields && currentStep.fields.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Các trường dữ liệu</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentStep.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id} className="text-sm font-medium">
                            {field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                          {renderFieldInput(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!hideCompleteButton && getStepStatus(currentStep.id) === "in_progress" && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => onCompleteStep(currentStep.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Hoàn thành bước
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkflowStepExecutionUI
