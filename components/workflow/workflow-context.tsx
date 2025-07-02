"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useStandardWorkflow } from "./standard-workflow-context-firebase"
import { useSubWorkflow } from "./sub-workflow-context-firebase"

export interface WorkflowStep {
  id: string
  name: string
  description?: string
  estimatedTime?: number // Thời gian dự kiến (giờ)
}

export interface Workflow {
  id: string
  name: string
  description: string
  statusId: string // ID của trạng thái sản phẩm
  steps: WorkflowStep[]
}

interface WorkflowContextType {
  workflows: Workflow[]
  addWorkflow: (workflow: Omit<Workflow, "id">) => Promise<Workflow>
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
  getWorkflowById: (id: string) => Promise<Workflow | undefined>
  getWorkflowByStatusId: (statusId: string) => Promise<Workflow | undefined>
  isStatusHasWorkflow: (statusId: string, excludeWorkflowId?: string) => Promise<boolean>
  updateWorkflowSteps: (workflowId: string, steps: WorkflowStep[]) => Promise<void>
  loading: boolean
  error: string | null
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sử dụng các context khác để thay thế chức năng của workflows
  const { standardWorkflow, loading: standardLoading } = useStandardWorkflow()
  const { subWorkflows, loading: subLoading } = useSubWorkflow()

  useEffect(() => {
    // Khởi tạo dữ liệu từ standardWorkflow và subWorkflows
    if (!standardLoading && !subLoading) {
      initializeFromOtherContexts()
    }
  }, [standardWorkflow, subWorkflows, standardLoading, subLoading])

  // Hàm khởi tạo dữ liệu từ các context khác
  const initializeFromOtherContexts = () => {
    try {
      // Chuyển đổi từ standardWorkflow và subWorkflows sang định dạng Workflow
      const convertedWorkflows: Workflow[] = []

      // Thêm quy trình chuẩn
      if (standardWorkflow) {
        convertedWorkflows.push({
          id: "standard-workflow",
          name: "Quy trình chuẩn",
          description: "Quy trình chuẩn cho phát triển sản phẩm",
          statusId: "default",
          steps: standardWorkflow.steps.map((step) => ({
            id: step.id,
            name: step.name,
            description: step.description,
            estimatedTime: step.estimatedDays * 24, // Chuyển đổi từ ngày sang giờ
          })),
        })
      }

      // Thêm các quy trình con
      subWorkflows.forEach((subWorkflow) => {
        if (standardWorkflow) {
          // Lấy các bước từ quy trình chuẩn dựa trên visibleSteps
          const steps = subWorkflow.visibleSteps
            .map((stepId) => {
              const step = standardWorkflow.steps.find((s) => s.id === stepId)
              if (step) {
                return {
                  id: step.id,
                  name: step.name,
                  description: step.description,
                  estimatedTime: step.estimatedDays * 24, // Chuyển đổi từ ngày sang giờ
                }
              }
              return null
            })
            .filter(Boolean) as WorkflowStep[]

          convertedWorkflows.push({
            id: subWorkflow.id,
            name: subWorkflow.name,
            description: subWorkflow.description || "",
            statusId: subWorkflow.statusId || "",
            steps,
          })
        }
      })

      setWorkflows(convertedWorkflows)
      setLoading(false)
      setError(null)
    } catch (err: any) {
      console.error("Error initializing workflows from other contexts:", err)
      setError(`Error initializing workflows: ${err.message}`)
      setLoading(false)
    }
  }

  // Các hàm CRUD được chuyển hướng sang sử dụng standardWorkflow và subWorkflow
  const addWorkflow = async (workflow: Omit<Workflow, "id">): Promise<Workflow> => {
    // Thông báo về việc chuyển đổi sang API mới
    toast({
      title: "API đã thay đổi",
      description: "Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.",
      variant: "destructive",
    })

    throw new Error("API đã thay đổi. Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.")
  }

  const updateWorkflow = async (id: string, workflow: Partial<Workflow>): Promise<void> => {
    toast({
      title: "API đã thay đổi",
      description: "Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.",
      variant: "destructive",
    })

    throw new Error("API đã thay đổi. Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.")
  }

  const deleteWorkflow = async (id: string): Promise<void> => {
    toast({
      title: "API đã thay đổi",
      description: "Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.",
      variant: "destructive",
    })

    throw new Error("API đã thay đổi. Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.")
  }

  const getWorkflowById = async (id: string): Promise<Workflow | undefined> => {
    return workflows.find((w) => w.id === id)
  }

  const getWorkflowByStatusId = async (statusId: string): Promise<Workflow | undefined> => {
    return workflows.find((w) => w.statusId === statusId)
  }

  const isStatusHasWorkflow = async (statusId: string, excludeWorkflowId?: string): Promise<boolean> => {
    return workflows.some((w) => w.statusId === statusId && w.id !== excludeWorkflowId)
  }

  const updateWorkflowSteps = async (workflowId: string, steps: WorkflowStep[]): Promise<void> => {
    toast({
      title: "API đã thay đổi",
      description: "Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.",
      variant: "destructive",
    })

    throw new Error("API đã thay đổi. Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.")
  }

  const value = {
    workflows,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    getWorkflowById,
    getWorkflowByStatusId,
    isStatusHasWorkflow,
    updateWorkflowSteps,
    loading: loading || standardLoading || subLoading,
    error,
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }

  // Hiển thị cảnh báo trong console khi sử dụng API cũ
  console.warn("useWorkflow() đã được thay thế. Vui lòng sử dụng useStandardWorkflow() hoặc useSubWorkflow() thay thế.")

  return context
}
