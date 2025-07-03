'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useStandardWorkflow } from './standard-workflow-context-firebase'
import { useSubWorkflow } from './sub-workflow-context-firebase'

// Định nghĩa kiểu dữ liệu cho bước quy trình
export interface WorkflowStep {
  id: string
  name: string
  description?: string
  estimatedTime?: number // Thời gian dự kiến (giờ)
}

// Định nghĩa kiểu dữ liệu cho quy trình
export interface Workflow {
  id: string
  name: string
  description: string
  statusId: string // ID của trạng thái sản phẩm
  steps: WorkflowStep[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  status: 'active' | 'completed' | 'archived'
}

// Định nghĩa kiểu dữ liệu cho trạng thái sản phẩm
export interface ProductStatus {
  id: string
  name: string
  color: string
  description?: string
  order?: number
}

// Định nghĩa context type
interface WorkflowContextType {
  workflows: Workflow[]
  addWorkflow: (
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Workflow>
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
  getWorkflowById: (id: string) => Promise<Workflow | undefined>
  getWorkflowByStatusId: (statusId: string) => Promise<Workflow | undefined>
  isStatusHasWorkflow: (statusId: string, excludeWorkflowId?: string) => boolean
  updateWorkflowSteps: (
    workflowId: string,
    steps: WorkflowStep[]
  ) => Promise<void>
  refreshWorkflows: () => Promise<void>
  initializeCollection: () => Promise<void>
  loading: boolean
  error: string | null
  productStatuses: ProductStatus[]
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
)

// Mock data cho trạng thái sản phẩm
const mockProductStatuses: ProductStatus[] = [
  {
    id: '1',
    name: 'Mới',
    color: '#4f46e5',
    description: 'Sản phẩm mới được tạo',
    order: 0
  },
  {
    id: '2',
    name: 'Đang phát triển',
    color: '#f59e0b',
    description: 'Sản phẩm đang trong quá trình phát triển',
    order: 1
  },
  {
    id: '3',
    name: 'Hoàn thành',
    color: '#10b981',
    description: 'Sản phẩm đã hoàn thành',
    order: 2
  }
]

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productStatuses, setProductStatuses] =
    useState<ProductStatus[]>(mockProductStatuses)
  const standardWorkflowContext = useStandardWorkflow()
  const subWorkflowContext = useSubWorkflow()

  const standardWorkflow = standardWorkflowContext?.standardWorkflow || null
  const standardLoading = standardWorkflowContext?.loading || false
  const subWorkflows = subWorkflowContext?.subWorkflows || []
  const subLoading = subWorkflowContext?.loading || false

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
      if (
        standardWorkflow &&
        standardWorkflow.steps &&
        Array.isArray(standardWorkflow.steps)
      ) {
        convertedWorkflows.push({
          id: 'standard-workflow',
          name: 'Quy trình chuẩn',
          description: 'Quy trình chuẩn cho phát triển sản phẩm',
          statusId: 'default',
          steps: standardWorkflow.steps.map((step) => ({
            id: step.id || `step-${Math.random().toString(36).substr(2, 9)}`,
            name: step.name || 'Bước không tên',
            description: step.description || '',
            estimatedTime: (step.estimatedDays || 0) * 24 // Chuyển đổi từ ngày sang giờ
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          status: 'active'
        })
      } else {
        // Thêm quy trình chuẩn mặc định nếu không có
        convertedWorkflows.push({
          id: 'standard-workflow',
          name: 'Quy trình chuẩn',
          description: 'Quy trình chuẩn cho phát triển sản phẩm',
          statusId: 'default',
          steps: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          status: 'active'
        })
        console.warn(
          'StandardWorkflow không có hoặc không có steps, sử dụng quy trình mặc định'
        )
      }

      // Thêm các quy trình con
      if (
        subWorkflows &&
        Array.isArray(subWorkflows) &&
        subWorkflows.length > 0
      ) {
        subWorkflows.forEach((subWorkflow) => {
          if (!subWorkflow) return

          // Lấy các bước từ quy trình chuẩn dựa trên visibleSteps
          const steps: WorkflowStep[] = []

          if (
            subWorkflow.visibleSteps &&
            Array.isArray(subWorkflow.visibleSteps)
          ) {
            subWorkflow.visibleSteps.forEach((stepId) => {
              if (!standardWorkflow || !standardWorkflow.steps) return

              const step = standardWorkflow.steps.find((s) => s.id === stepId)
              if (step) {
                steps.push({
                  id:
                    step.id ||
                    `step-${Math.random().toString(36).substr(2, 9)}`,
                  name: step.name || 'Bước không tên',
                  description: step.description || '',
                  estimatedTime: (step.estimatedDays || 0) * 24 // Chuyển đổi từ ngày sang giờ
                })
              }
            })
          }

          convertedWorkflows.push({
            id:
              subWorkflow.id ||
              `sub-${Math.random().toString(36).substr(2, 9)}`,
            name: subWorkflow.name || 'Quy trình con không tên',
            description: subWorkflow.description || '',
            statusId: subWorkflow.statusId || '',
            steps,
            createdAt: new Date(subWorkflow.createdAt || Date.now()),
            updatedAt: new Date(subWorkflow.updatedAt || Date.now()),
            createdBy: subWorkflow.createdBy || 'system',
            status: 'active'
          })
        })
      }

      setWorkflows(convertedWorkflows)
      setLoading(false)
      setError(null)
    } catch (err: any) {
      console.error('Error initializing workflows from other contexts:', err)
      setError(`Error initializing workflows: ${err.message}`)
      setLoading(false)
    }
  }

  // Các hàm CRUD được chuyển hướng sang sử dụng standardWorkflow và subWorkflow
  const addWorkflow = async (
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Workflow> => {
    // Thông báo về việc chuyển đổi sang API mới
    toast({
      title: 'API đã thay đổi',
      description:
        'Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.',
      variant: 'destructive'
    })

    throw new Error(
      'API đã thay đổi. Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.'
    )
  }

  const updateWorkflow = async (
    id: string,
    workflow: Partial<Workflow>
  ): Promise<void> => {
    toast({
      title: 'API đã thay đổi',
      description:
        'Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.',
      variant: 'destructive'
    })

    throw new Error(
      'API đã thay đổi. Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.'
    )
  }

  const deleteWorkflow = async (id: string): Promise<void> => {
    toast({
      title: 'API đã thay đổi',
      description:
        'Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.',
      variant: 'destructive'
    })

    throw new Error(
      'API đã thay đổi. Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.'
    )
  }

  const getWorkflowById = async (id: string): Promise<Workflow | undefined> => {
    return workflows.find((w) => w.id === id)
  }

  const getWorkflowByStatusId = async (
    statusId: string
  ): Promise<Workflow | undefined> => {
    return workflows.find((w) => w.statusId === statusId)
  }

  const isStatusHasWorkflow = (
    statusId: string,
    excludeWorkflowId?: string
  ): boolean => {
    return workflows.some(
      (w) => w.statusId === statusId && w.id !== excludeWorkflowId
    )
  }

  const updateWorkflowSteps = async (
    workflowId: string,
    steps: WorkflowStep[]
  ): Promise<void> => {
    toast({
      title: 'API đã thay đổi',
      description:
        'Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.',
      variant: 'destructive'
    })

    throw new Error(
      'API đã thay đổi. Vui lòng sử dụng useStandardWorkflow hoặc useSubWorkflow thay thế.'
    )
  }

  const refreshWorkflows = async (): Promise<void> => {
    initializeFromOtherContexts()
  }

  const initializeCollection = async (): Promise<void> => {
    // Không cần thiết nữa vì chúng ta đang sử dụng các collection khác
    return Promise.resolve()
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
    refreshWorkflows,
    initializeCollection,
    loading: loading || standardLoading || subLoading,
    error,
    productStatuses
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }

  // Hiển thị cảnh báo trong console khi sử dụng API cũ
  console.warn(
    'useWorkflow() đã được thay thế. Vui lòng sử dụng useStandardWorkflow() hoặc useSubWorkflow() thay thế.'
  )

  return context
}
