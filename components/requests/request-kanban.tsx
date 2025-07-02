"use client"

import { useState, useEffect, useRef } from "react"
import { useRequest } from "./request-context"
import { useSubWorkflow } from "../workflow/sub-workflow-context-firebase"
import { useStandardWorkflow } from "../workflow/standard-workflow-context-firebase"
import { ChevronLeft, ChevronRight, Loader2, Plus, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Thay đổi cấu trúc KanbanColumn để thêm stepId
interface KanbanColumn {
  id: string
  stepId: string // Thêm stepId để so sánh với currentStepId
  title: string
  color: string
  order: number
}

export function RequestKanban() {
  const { requests, loading, updateRequest } = useRequest()
  const { subWorkflows } = useSubWorkflow()
  const { standardWorkflow, loading: workflowLoading } = useStandardWorkflow()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [columnedRequests, setColumnedRequests] = useState<Record<string, any[]>>({})
  const { toast } = useToast()

  // Hàm lấy màu cho từng loại bước
  const getStepColor = (stepName: string) => {
    const name = stepName.toLowerCase()
    if (name.includes("hoàn thành") || name.includes("completed")) return "bg-green-100"
    if (name.includes("từ chối") || name.includes("rejected")) return "bg-red-100"
    if (name.includes("tạm dừng") || name.includes("on hold")) return "bg-gray-200"
    if (name.includes("kiểm tra") || name.includes("check")) return "bg-blue-100"
    if (name.includes("phê duyệt") || name.includes("approve")) return "bg-yellow-100"
    if (name.includes("thực hiện") || name.includes("execute")) return "bg-purple-100"
    if (name.includes("tiếp nhận")) return "bg-orange-100"
    if (name.includes("chuẩn bị")) return "bg-indigo-100"
    if (name.includes("file") || name.includes("thiết kế")) return "bg-pink-100"
    if (name.includes("sản xuất")) return "bg-amber-100"
    if (name.includes("phản hồi")) return "bg-cyan-100"
    if (name.includes("template") || name.includes("mockup")) return "bg-violet-100"
    if (name.includes("tính giá")) return "bg-emerald-100"
    if (name.includes("web") || name.includes("marketing")) return "bg-rose-100"
    if (name.includes("demo")) return "bg-yellow-100"
    return "bg-gray-100"
  }

  // Hàm lấy tên bước hiện tại từ subWorkflow snapshot - GIỐNG REQUESTSLIST
  const getCurrentStepName = (request: any) => {
    if (!request.currentStepId || !request.workflowProcessId) {
      return "Chưa bắt đầu"
    }

    // Tìm subWorkflow dựa trên workflowProcessId
    const subWorkflow = subWorkflows?.find((sw) => sw.id === request.workflowProcessId)

    if (!subWorkflow) {
      return "Không xác định"
    }

    // Tìm bước hiện tại trong snapshot của subWorkflow
    const currentStep = subWorkflow.workflowSteps?.find((step) => step.id === request.currentStepId && step.isVisible)

    if (!currentStep) {
      return "Bước không hợp lệ"
    }

    return currentStep.name
  }

  // Hàm lấy người đang thực hiện bước hiện tại - GIỐNG REQUESTSLIST
  const getCurrentStepAssignee = (request: any) => {
    // Ưu tiên kiểm tra trường assignee trực tiếp từ request
    if (request.assignee) {
      if (typeof request.assignee === "object" && request.assignee.name) {
        return request.assignee.name
      } else if (typeof request.assignee === "string") {
        return request.assignee
      }
    }

    if (!request.currentStepId) {
      return "Chưa phân công"
    }

    try {
      // Kiểm tra trong workflowStepData.fieldValues
      if (request.workflowStepData && request.workflowStepData.fieldValues) {
        const fieldValues = request.workflowStepData.fieldValues

        // Tìm trường step_{stepId}_assignee trong fieldValues
        const stepAssigneeKey = `step_${request.currentStepId}_assignee`

        if (fieldValues[stepAssigneeKey]) {
          const assignee = fieldValues[stepAssigneeKey]
          if (assignee && assignee.name) {
            return assignee.name
          }
        }

        // Nếu không tìm thấy với pattern trên, tìm bất kỳ field nào có chứa "assignee"
        for (const [key, value] of Object.entries(fieldValues)) {
          if (key.includes("assignee") && value && typeof value === "object" && (value as any).name) {
            return (value as any).name
          }
        }
      }

      // Fallback: Kiểm tra các nguồn khác
      if (request.currentStepAssignee) {
        if (typeof request.currentStepAssignee === "object" && request.currentStepAssignee.name) {
          return request.currentStepAssignee.name
        } else if (typeof request.currentStepAssignee === "string") {
          return request.currentStepAssignee
        }
      }

      // Kiểm tra trong stepHistory
      if (request.stepHistory && request.stepHistory.length > 0) {
        const currentStepHistory = request.stepHistory.find((history: any) => history.stepId === request.currentStepId)
        if (currentStepHistory && currentStepHistory.assignedTo) {
          if (typeof currentStepHistory.assignedTo === "object" && currentStepHistory.assignedTo.name) {
            return currentStepHistory.assignedTo.name
          } else if (typeof currentStepHistory.assignedTo === "string") {
            return currentStepHistory.assignedTo
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người được phân công:", error)
    }

    return "Chưa phân công"
  }

  // Hàm tạo request mới với stepId cụ thể
  const handleCreateRequest = (targetStepId: string) => {
    const params = new URLSearchParams()
    if (targetStepId && targetStepId !== "no-workflow") {
      params.set("stepId", targetStepId)
    }
    router.push(`/dashboard/requests/new?${params.toString()}`)
  }

  // Hàm chuyển request sang bước khác
  const handleMoveRequest = async (request: any, targetStepId: string) => {
    try {
      // Kiểm tra xem bước đích có hợp lệ không
      if (!request.workflowProcessId) {
        toast({
          title: "Lỗi",
          description: "Request chưa có quy trình workflow",
          variant: "destructive",
        })
        return
      }

      const subWorkflow = subWorkflows?.find((sw) => sw.id === request.workflowProcessId)
      if (!subWorkflow) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy quy trình workflow",
          variant: "destructive",
        })
        return
      }

      // Kiểm tra bước đích có trong quy trình không
      const targetStep = subWorkflow.workflowSteps?.find((step) => step.id === targetStepId && step.isVisible)

      if (!targetStep && targetStepId !== "completed" && targetStepId !== "rejected") {
        toast({
          title: "Không thể chuyển",
          description: "Bước này không nằm trong quy trình hiện tại",
          variant: "destructive",
        })
        return
      }

      // Cập nhật request
      const updatedRequest = {
        ...request,
        currentStepId: targetStepId,
        status: targetStepId === "completed" ? "completed" : targetStepId === "rejected" ? "rejected" : request.status,
      }

      await updateRequest(request.id, updatedRequest)

      toast({
        title: "Thành công",
        description: `Đã chuyển request sang ${targetStep?.name || (targetStepId === "completed" ? "Hoàn thành" : "Từ chối")}`,
      })
    } catch (error) {
      console.error("Error moving request:", error)
      toast({
        title: "Lỗi",
        description: "Không thể chuyển request",
        variant: "destructive",
      })
    }
  }

  // Tạo các cột từ tất cả các bước có trong requests
  useEffect(() => {
    if (loading || !requests || !Array.isArray(requests)) return

    console.log("Creating columns from requests:", requests)

    // Tạo Set để lưu tất cả các stepId và stepName từ requests
    const stepMap = new Map<string, string>()

    // Thêm cột "Chưa bắt đầu"
    stepMap.set("no-workflow", "Chưa bắt đầu")

    // Lấy tất cả các currentStepId từ requests (chỉ cho requests chưa hoàn thành/từ chối)
    requests.forEach((request) => {
      if (!request) return

      // Bỏ qua requests đã hoàn thành hoặc bị từ chối
      if (request.status === "completed" || request.status === "rejected") return

      const stepId = request.currentStepId
      if (stepId) {
        const stepName = getCurrentStepName(request)
        stepMap.set(stepId, stepName)
        console.log(`Found step: ${stepId} -> ${stepName}`)
      } else {
        console.log("Request without currentStepId:", request.id)
      }
    })

    // Thêm các bước từ standardWorkflow nếu có
    if (standardWorkflow?.steps) {
      standardWorkflow.steps.forEach((step, index) => {
        stepMap.set(step.id, step.name)
        console.log(`Standard workflow step: ${step.id} -> ${step.name}`)
      })
    }

    // Thêm cột "Hoàn thành" và "Từ chối"
    stepMap.set("completed", "Hoàn thành")
    stepMap.set("rejected", "Từ chối")
    stepMap.set("on_hold", "Tạm dừng")

    // Tạo columns từ stepMap
    const allColumns: KanbanColumn[] = Array.from(stepMap.entries()).map(([stepId, stepName], index) => ({
      id: stepId,
      stepId: stepId,
      title: stepName,
      color: getStepColor(stepName),
      order: stepId === "no-workflow" ? -1 : stepId === "completed" ? 998 : stepId === "rejected" ? 999 : index,
    }))

    // Sắp xếp columns
    allColumns.sort((a, b) => a.order - b.order)

    console.log("Final columns:", allColumns)
    setColumns(allColumns)
  }, [requests, standardWorkflow, subWorkflows, loading])

  // Lấy tiến độ workflow - GIỐNG REQUESTSLIST
  const getWorkflowProgress = (request: any) => {
    const completedSteps = request.workflowStepData?.completedSteps || []

    if (!request.currentStepId || !request.workflowProcessId) {
      return { current: 0, total: 0, percentage: 0, completedCount: completedSteps.length }
    }

    const subWorkflow = subWorkflows?.find((sw) => sw.id === request.workflowProcessId)

    if (!subWorkflow) {
      return { current: 0, total: 0, percentage: 0, completedCount: completedSteps.length }
    }

    // Lấy các bước hiển thị từ snapshot
    const visibleSteps = subWorkflow.workflowSteps?.filter((step) => step.isVisible) || []
    const totalSteps = visibleSteps.length

    if (totalSteps === 0) {
      return { current: 0, total: 0, percentage: 0, completedCount: completedSteps.length }
    }

    // Tìm vị trí bước hiện tại
    const currentStepIndex = visibleSteps.findIndex((step) => step.id === request.currentStepId)
    const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 0

    const completedCount = completedSteps.length
    const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

    return { current: currentStep, total: totalSteps, percentage, completedCount }
  }

  // Phân loại request vào cột
  useEffect(() => {
    if (loading || !requests || !Array.isArray(requests) || !columns.length) return

    console.log("Categorizing requests into columns...")
    console.log("Requests:", requests)
    console.log("Columns:", columns)

    const requestsByColumn: Record<string, any[]> = {}

    // Khởi tạo mảng rỗng cho mỗi cột
    columns.forEach((column) => {
      requestsByColumn[column.id] = []
    })

    // Phân loại requests vào các cột
    requests.forEach((request) => {
      if (!request) return

      let targetColumnId: string

      // Ưu tiên phân loại theo status trước
      if (request.status === "completed") {
        targetColumnId = "completed"
      } else if (request.status === "rejected") {
        targetColumnId = "rejected"
      } else if (request.status === "on_hold") {
        targetColumnId = "on_hold"
      } else {
        // Nếu không phải completed/rejected/on_hold, phân loại theo currentStepId
        targetColumnId = request.currentStepId || "no-workflow"
      }

      console.log(`Request ${request.id} (status: ${request.status}) -> column: ${targetColumnId}`)

      // Tìm cột phù hợp
      const targetColumn = columns.find((col) => col.stepId === targetColumnId)

      if (targetColumn) {
        requestsByColumn[targetColumn.id].push(request)
        console.log(`Added request ${request.id} to column ${targetColumn.title}`)
      } else {
        console.warn(`Không tìm thấy cột cho stepId: ${targetColumnId}`)
        // Fallback to no-workflow column
        if (requestsByColumn["no-workflow"]) {
          requestsByColumn["no-workflow"].push(request)
          console.log(`Added request ${request.id} to no-workflow column as fallback`)
        }
      }
    })

    console.log("Final requests by column:", requestsByColumn)
    setColumnedRequests(requestsByColumn)
  }, [requests, columns, loading])

  // Hàm scroll ngang
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" })
    }
  }

  // Thêm useEffect để scroll về đầu khi component mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
    }
  }, [])

  if (loading || workflowLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  // Nếu không có requests, vẫn hiển thị columns trống
  const hasRequests = requests && Array.isArray(requests) && requests.length > 0

  return (
    <div className="h-[calc(100vh-200px)] relative">
      {/* Nút scroll */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={scrollLeft}
          className="h-8 w-8 p-0 border rounded hover:bg-gray-50 flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={scrollRight}
          className="h-8 w-8 p-0 border rounded hover:bg-gray-50 flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="h-full overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-6 p-4 min-w-max h-full">
          {columns.map((column) => {
            const columnRequests = columnedRequests[column.id] || []
            return (
              <div key={column.id} className="flex-shrink-0 w-80 h-full">
                <div className={cn("h-full border rounded-lg bg-white shadow-sm", column.color)}>
                  <div className="pb-3">
                    <div className="flex items-center justify-between text-sm font-medium p-4">
                      <span className="truncate">{column.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex-shrink-0">
                          {columnRequests.length}
                        </span>
                        {/* Nút thêm request mới */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCreateRequest(column.stepId)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-0 h-[calc(100%-80px)]">
                    <div className="overflow-auto h-full px-4">
                      <div className="space-y-3">
                        {columnRequests.length > 0 ? (
                          columnRequests.map((request) => {
                            if (!request) return null
                            const progress = getWorkflowProgress(request)
                            const stepName = getCurrentStepName(request)
                            const currentAssignee = getCurrentStepAssignee(request)
                            return (
                              <div
                                key={request.id}
                                className="p-3 rounded-md border bg-background hover:bg-accent/50 transition-colors relative group"
                              >
                                {/* Nút menu 6 chấm */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Chuyển sang bước</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      {columns.map((targetColumn) => (
                                        <DropdownMenuItem
                                          key={targetColumn.id}
                                          onClick={() => handleMoveRequest(request, targetColumn.stepId)}
                                          disabled={targetColumn.stepId === request.currentStepId}
                                        >
                                          {targetColumn.title}
                                          {targetColumn.stepId === request.currentStepId && " (hiện tại)"}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <Link href={`/dashboard/requests/${request.id}`} className="block">
                                  <div className="font-medium text-sm pr-8">
                                    {request.title || "Yêu cầu không có tiêu đề"}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {request.code || request.id?.substring(0, 8)}
                                  </div>
                                  <div className="text-xs text-blue-600 mt-1">{currentAssignee}</div>
                                  {progress.total > 0 && (
                                    <div className="mt-2">
                                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>Tiến độ</span>
                                        <span>
                                          {progress.completedCount}/{progress.total}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                          style={{ width: `${progress.percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </Link>
                              </div>
                            )
                          })
                        ) : (
                          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                            Chưa có yêu cầu
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
