"use client"

import { useState } from "react"
import { CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  name: string
  order: number
  status: string
  completed?: boolean
}

interface WorkflowProgressBarProps {
  steps: Step[]
  currentStepId: string | null
  selectedStepId?: string | null
  onStepClick?: (stepId: string) => void
}

export function WorkflowProgressBar({ steps, currentStepId, selectedStepId, onStepClick }: WorkflowProgressBarProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null)

  // Sắp xếp các bước theo thứ tự
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order)

  // Tìm bước hiện tại
  const currentStepIndex = sortedSteps.findIndex((step) => step.id === currentStepId)

  // Hàm lấy icon cho trạng thái
  const getStatusIcon = (step: Step) => {
    if (step.status === "completed") {
      return <CheckCircle className="h-4 w-4 text-white" />
    } else if (step.status === "in_progress" || step.id === currentStepId) {
      return <Clock className="h-4 w-4 text-white" />
    } else {
      return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Hàm lấy màu cho trạng thái
  const getStepColor = (step: Step) => {
    // Bước đã hoàn thành - màu xanh lá
    if (step.status === "completed") {
      return "bg-green-500 text-white border-green-500"
    }

    // Bước đang thực hiện - màu xanh nước biển
    if (step.status === "in_progress" || step.id === currentStepId) {
      return "bg-blue-500 text-white border-blue-500"
    }

    // Bước chưa thực hiện - màu xám
    return "bg-gray-300 text-gray-600 border-gray-300"
  }

  // Hàm lấy màu cho đường nối
  const getLineColor = (step: Step, nextStep: Step | undefined) => {
    // Nếu bước hiện tại đã hoàn thành thì đường nối có màu xanh lá
    if (step.status === "completed") {
      return "bg-green-500"
    }

    // Nếu không thì màu xám
    return "bg-gray-300"
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {sortedSteps.map((step, index) => {
          const nextStep = index < sortedSteps.length - 1 ? sortedSteps[index + 1] : undefined
          const isSelected = selectedStepId === step.id
          const isCurrent = step.id === currentStepId

          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              {/* Đường nối giữa các bước */}
              {nextStep && (
                <div
                  className={cn(
                    "absolute top-6 h-1 left-1/2 right-0 transform translate-x-8 z-0",
                    getLineColor(step, nextStep),
                  )}
                  style={{ width: "calc(100% - 2rem)" }}
                />
              )}

              {/* Hình chữ nhật biểu thị bước */}
              <div
                className={cn(
                  "w-12 h-12 rounded-lg border-2 flex items-center justify-center z-10 cursor-pointer transition-all relative",
                  getStepColor(step),
                  hoveredStep === step.id && "ring-2 ring-offset-2 ring-blue-300",
                  isSelected && "ring-2 ring-offset-2 ring-purple-300",
                )}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => onStepClick && onStepClick(step.id)}
              >
                {getStatusIcon(step)}
              </div>

              {/* Tên bước */}
              <div
                className={cn(
                  "mt-3 text-sm font-medium text-center max-w-[120px] leading-tight",
                  isCurrent ? "text-blue-700 font-semibold" : "text-gray-600",
                  isSelected && "text-purple-700 font-semibold",
                )}
              >
                {step.name}
              </div>

              {/* Trạng thái bước */}
              <div className="mt-1 text-xs text-center">
                {step.status === "completed" && <span className="text-green-600 font-medium">Hoàn thành</span>}
                {(step.status === "in_progress" || isCurrent) && (
                  <span className="text-blue-600 font-medium">Đang thực hiện</span>
                )}
                {step.status === "not_started" && !isCurrent && <span className="text-gray-500">Chưa bắt đầu</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
