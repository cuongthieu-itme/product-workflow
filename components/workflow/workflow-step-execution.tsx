"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useStandardWorkflow, type StandardWorkflowStep } from "./standard-workflow-context"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

interface WorkflowStepExecutionProps {
  stepId: string
  workflowId: string
  isCurrentStep: boolean
  isCompleted: boolean
  startDate?: Date
  fieldValues: Record<string, any>
  onFieldChange: (fieldId: string, value: any) => void
  onComplete: () => void
  requestData?: Record<string, any>
}

export function WorkflowStepExecution({
  stepId,
  workflowId,
  isCurrentStep,
  isCompleted,
  startDate,
  fieldValues,
  onFieldChange,
  onComplete,
  requestData = {},
}: WorkflowStepExecutionProps) {
  const { standardWorkflow, calculateDeadline, availableVariables } = useStandardWorkflow()
  const [step, setStep] = useState<StandardWorkflowStep | null>(null)
  const [deadline, setDeadline] = useState<Date | null>(null)

  // Tìm bước từ quy trình chuẩn
  useEffect(() => {
    if (standardWorkflow) {
      const foundStep = standardWorkflow.steps.find((s) => s.id === stepId)
      if (foundStep) {
        setStep(foundStep)

        // Tính deadline dựa trên ngày bắt đầu và số ngày ước tính
        if (startDate) {
          setDeadline(calculateDeadline(startDate, foundStep.estimatedDays))
        }
      }
    }
  }, [standardWorkflow, stepId, startDate, calculateDeadline])

  // Lấy giá trị biến từ dữ liệu yêu cầu
  const getVariableValue = (variableId?: string) => {
    if (!variableId) return ""

    const variable = availableVariables.find((v) => v.id === variableId)
    if (!variable) return ""

    // Lấy giá trị từ dữ liệu yêu cầu dựa trên nguồn biến
    if (variable.source === "request") {
      switch (variable.id) {
        case "requestor":
          return requestData.creator?.name || ""
        case "requestDate":
          return requestData.createdAt ? new Date(requestData.createdAt).toLocaleDateString() : ""
        case "requestTitle":
          return requestData.title || ""
        case "requestDescription":
          return requestData.description || ""
        case "requestCode":
          return requestData.code || ""
        default:
          return requestData[variable.id] || ""
      }
    } else if (variable.source === "system") {
      switch (variable.id) {
        case "currentUser":
          return "Người dùng hiện tại" // Thay thế bằng thông tin người dùng thực tế
        case "currentDate":
          return new Date().toLocaleDateString()
        default:
          return ""
      }
    }

    return ""
  }

  // Kiểm tra xem một giá trị có phải là ngày hợp lệ không
  const isValidDate = (value: any): boolean => {
    if (!value) return false

    try {
      const date = new Date(value)
      return !isNaN(date.getTime())
    } catch (error) {
      return false
    }
  }

  // Render trường dữ liệu dựa trên loại
  const renderField = (field: any) => {
    // Nếu là trường biến, hiển thị giá trị biến
    if (field.type === "variable") {
      const variableValue = getVariableValue(field.variableSource)
      return <div className="p-2 border rounded-md bg-muted/30">{variableValue || "Không có dữ liệu"}</div>
    }

    // Nếu bước đã hoàn thành hoặc không phải bước hiện tại, chỉ hiển thị giá trị
    if (isCompleted || !isCurrentStep) {
      return <div className="p-2 border rounded-md bg-muted/30">{renderFieldValue(field, fieldValues[field.id])}</div>
    }

    // Render trường dữ liệu có thể chỉnh sửa
    switch (field.type) {
      case "text":
        return (
          <Input
            value={fieldValues[field.id] || ""}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
          />
        )
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fieldValues[field.id] && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fieldValues[field.id]
                  ? format(new Date(fieldValues[field.id]), "PPP", { locale: vi })
                  : `Chọn ${field.name.toLowerCase()}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fieldValues[field.id] ? new Date(fieldValues[field.id]) : undefined}
                onSelect={(date) => onFieldChange(field.id, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )
      case "select":
        return (
          <Select value={fieldValues[field.id] || ""} onValueChange={(value) => onFieldChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Chọn ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`field-${field.id}`}
              checked={!!fieldValues[field.id]}
              onCheckedChange={(checked) => onFieldChange(field.id, !!checked)}
            />
            <label
              htmlFor={`field-${field.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.name}
            </label>
          </div>
        )
      case "number":
        return (
          <Input
            type="number"
            value={fieldValues[field.id] || ""}
            onChange={(e) => onFieldChange(field.id, e.target.valueAsNumber)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
          />
        )
      case "currency":
        return (
          <div className="relative">
            <Input
              type="number"
              value={fieldValues[field.id] || ""}
              onChange={(e) => onFieldChange(field.id, e.target.valueAsNumber)}
              placeholder={`Nhập ${field.name.toLowerCase()}`}
              className="pl-12"
            />
            <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none border-r">
              {field.currencySymbol || "VND"}
            </div>
          </div>
        )
      case "user":
        return (
          <Select value={fieldValues[field.id] || ""} onValueChange={(value) => onFieldChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Chọn ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user1">Nguyễn Văn A</SelectItem>
              <SelectItem value="user2">Trần Thị B</SelectItem>
              <SelectItem value="user3">Lê Văn C</SelectItem>
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            value={fieldValues[field.id] || ""}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={`Nhập ${field.name.toLowerCase()}`}
          />
        )
    }
  }

  // Hiển thị giá trị trường dữ liệu
  const renderFieldValue = (field: any, value: any) => {
    if (value === undefined || value === null || value === "") {
      return "Chưa có dữ liệu"
    }

    switch (field.type) {
      case "date":
        return isValidDate(value) ? format(new Date(value), "PPP", { locale: vi }) : value
      case "checkbox":
        return value ? "Có" : "Không"
      case "currency":
        return `${value.toLocaleString()} ${field.currencySymbol || "VND"}`
      case "user":
        // Giả lập hiển thị tên người dùng
        const userMap: Record<string, string> = {
          user1: "Nguyễn Văn A",
          user2: "Trần Thị B",
          user3: "Lê Văn C",
        }
        return userMap[value] || value
      default:
        return value
    }
  }

  if (!step) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải thông tin bước...</p>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        isCompleted ? "border-green-200 bg-green-50/30" : isCurrentStep ? "border-blue-200 bg-blue-50/30" : "",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {isCompleted ? (
              <span className="flex items-center text-green-500">
                <CheckCircle className="h-5 w-5 mr-2" />
                {step.name} (Đã hoàn thành)
              </span>
            ) : isCurrentStep ? (
              <span className="flex items-center text-blue-500">
                <Clock className="h-5 w-5 mr-2" />
                {step.name} (Đang thực hiện)
              </span>
            ) : (
              <span>{step.name}</span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        </div>
        {isCurrentStep && !isCompleted && (
          <Button onClick={onComplete} variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" /> Hoàn thành bước
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thông tin thời gian */}
          <div className="space-y-2">
            <Label>Thời gian bắt đầu</Label>
            <div className="p-2 border rounded-md bg-muted/30">
              {startDate ? format(startDate, "PPP", { locale: vi }) : "Chưa bắt đầu"}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Thời gian deadline</Label>
            <div className="p-2 border rounded-md bg-muted/30">
              {deadline ? format(deadline, "PPP", { locale: vi }) : "Chưa xác định"}
            </div>
          </div>

          {/* Người đảm nhiệm */}
          <div className="space-y-2 col-span-2">
            <Label>Vai trò người đảm nhiệm</Label>
            <div className="p-2 border rounded-md bg-muted/30">{step.assigneeRole || "Chưa xác định"}</div>
          </div>

          {/* Các trường dữ liệu */}
          {step.fields.map((field) => (
            <div key={field.id} className={cn("space-y-2", field.type === "checkbox" ? "col-span-1" : "col-span-2")}>
              <Label htmlFor={`field-${field.id}`} className="flex items-center gap-2">
                {field.name}
                {field.required && <span className="text-red-500 text-xs">*</span>}
              </Label>
              {renderField(field)}
              {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
