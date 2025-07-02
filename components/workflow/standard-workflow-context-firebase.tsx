"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useProductStatus } from "../product-status/product-status-context-firebase"
import { toast } from "@/components/ui/use-toast"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Định nghĩa kiểu dữ liệu cho trường tùy chỉnh trong bước quy trình
export interface StepField {
  id: string
  name: string
  type: "text" | "date" | "user" | "number" | "select" | "currency" | "variable"
  required: boolean
  description?: string
  options?: string[] // Cho trường select
  defaultValue?: string | boolean | number | Date
  isSystem?: boolean // Đánh dấu trường hệ thống không được xóa
  currencySymbol?: string // Biểu tượng tiền tệ (VND, USD, etc.)
  variableSource?: string // Nguồn biến (nếu type là variable)
}

// Định nghĩa kiểu dữ liệu cho một bước trong quy trình
export interface StandardWorkflowStep {
  id: string
  name: string
  description: string
  estimatedTime: number // Số lượng (ngày hoặc giờ)
  estimatedTimeUnit: "days" | "hours" // Đơn vị thời gian
  order: number
  isRequired?: boolean
  fields: StepField[]
  notifyBeforeDeadline?: number // Số ngày thông báo trước deadline
  assigneeRole?: string // Vai trò người đảm nhiệm
  hasCost?: boolean // Bước có chi phí hay không
  allowedUsers?: string[] // Danh sách ID của những người được phép thao tác bước này
}

// Định nghĩa kiểu dữ liệu cho quy trình chuẩn
export interface StandardWorkflow {
  id: string
  name: string
  description: string
  steps: StandardWorkflowStep[]
  createdAt: Date
  updatedAt: Date
  version: number // Phiên bản quy trình
  lastModifiedBy?: string // Người cập nhật cuối cùng
}

// Cập nhật interface SubWorkflow để thêm stepEstimatedTimes
export interface SubWorkflow {
  id: string
  name: string
  description: string
  parentId: string // ID của quy trình chuẩn
  statusId: string // ID của trạng thái sản phẩm
  visibleSteps: string[] // Danh sách ID của các bước hiển thị
  stepEstimatedTimes: Record<string, number> // Thời gian dự kiến cho từng bước (key: stepId, value: số ngày)
  createdAt: Date
  updatedAt: Date
}

// Định nghĩa kiểu dữ liệu cho lịch sử thay đổi quy trình
export interface WorkflowChangeHistory {
  id: string
  workflowId: string
  changeType: "create" | "update" | "delete"
  entityType: "workflow" | "step" | "field"
  entityId: string
  changes: {
    field: string
    oldValue?: any
    newValue: any
  }[]
  changedBy: string
  changedAt: Date
}

// Định nghĩa kiểu dữ liệu cho biến có sẵn
export interface AvailableVariable {
  id: string
  name: string
  description: string
  source: "request" | "system" | "custom"
  type: "text" | "date" | "user" | "number" | "select"
}

interface StandardWorkflowContextType {
  standardWorkflow: StandardWorkflow | null
  subWorkflows: SubWorkflow[]
  changeHistory: WorkflowChangeHistory[]
  availableVariables: AvailableVariable[]

  // Quản lý quy trình chuẩn
  initializeStandardWorkflow: () => Promise<void>
  getStandardWorkflow: () => StandardWorkflow | null
  updateStandardWorkflow: (
    updates: Partial<Omit<StandardWorkflow, "id" | "createdAt" | "updatedAt" | "version">>,
    userId?: string,
  ) => Promise<void>

  // Quản lý bước trong quy trình chuẩn
  addStandardWorkflowStep: (step: Omit<StandardWorkflowStep, "id" | "order">, userId?: string) => Promise<string>
  updateStandardWorkflowStep: (
    stepId: string,
    updates: Partial<Omit<StandardWorkflowStep, "id">>,
    userId?: string,
  ) => Promise<void>
  deleteStandardWorkflowStep: (stepId: string, userId?: string) => Promise<boolean>
  reorderStandardWorkflowSteps: (steps: StandardWorkflowStep[], userId?: string) => Promise<void>

  // Quản lý trường trong bước
  addStepField: (stepId: string, field: Omit<StepField, "id">, userId?: string) => Promise<string>
  updateStepField: (
    stepId: string,
    fieldId: string,
    updates: Partial<Omit<StepField, "id">>,
    userId?: string,
  ) => Promise<void>
  deleteStepField: (stepId: string, fieldId: string, userId?: string) => Promise<boolean>

  // Quản lý quy trình con
  createSubWorkflow: (
    subWorkflow: Omit<SubWorkflow, "id" | "createdAt" | "updatedAt" | "stepEstimatedTimes">,
    userId?: string,
  ) => Promise<string>
  updateSubWorkflow: (
    id: string,
    updates: Partial<Omit<SubWorkflow, "id" | "createdAt" | "updatedAt">>,
    userId?: string,
  ) => Promise<void>
  deleteSubWorkflow: (id: string, userId?: string) => Promise<void>
  getSubWorkflowByStatusId: (statusId: string) => SubWorkflow | undefined
  isSubWorkflowNameExists: (name: string, excludeId?: string) => boolean

  // Quản lý biến có sẵn
  addAvailableVariable: (variable: Omit<AvailableVariable, "id">, userId?: string) => Promise<string>
  updateAvailableVariable: (
    id: string,
    updates: Partial<Omit<AvailableVariable, "id">>,
    userId?: string,
  ) => Promise<void>
  deleteAvailableVariable: (id: string, userId?: string) => Promise<void>

  // Quản lý lịch sử thay đổi
  getChangeHistoryForEntity: (entityType: "workflow" | "step" | "field", entityId: string) => WorkflowChangeHistory[]

  // Tính toán thời gian
  calculateDeadline: (startDate: Date, estimatedTime: number, estimatedTimeUnit?: "days" | "hours") => Date
  adjustToWorkingHours: (date: Date) => Date

  // Trạng thái
  loading: boolean
  initialized: boolean // Thêm trạng thái initialized
}

const StandardWorkflowContext = createContext<StandardWorkflowContextType | undefined>(undefined)

// Danh sách các biến có sẵn mặc định
const DEFAULT_AVAILABLE_VARIABLES: AvailableVariable[] = [
  {
    id: "requestor",
    name: "Người yêu cầu",
    description: "Người tạo yêu cầu",
    source: "request",
    type: "user",
  },
  {
    id: "requestDate",
    name: "Ngày yêu cầu",
    description: "Ngày tạo yêu cầu",
    source: "request",
    type: "date",
  },
  {
    id: "requestTitle",
    name: "Tiêu đề yêu cầu",
    description: "Tiêu đề của yêu cầu",
    source: "request",
    type: "text",
  },
  {
    id: "requestDescription",
    name: "Mô tả yêu cầu",
    description: "Mô tả chi tiết của yêu cầu",
    source: "request",
    type: "text",
  },
  {
    id: "requestCode",
    name: "Mã yêu cầu",
    description: "Mã tham chiếu của yêu cầu",
    source: "request",
    type: "text",
  },
  {
    id: "currentUser",
    name: "Người đăng nhập hiện tại",
    description: "Người dùng đang đăng nhập vào hệ thống",
    source: "system",
    type: "user",
  },
  {
    id: "currentDate",
    name: "Ngày hiện tại",
    description: "Ngày hiện tại của hệ thống",
    source: "system",
    type: "date",
  },
]

// Danh sách các bước quy trình chuẩn mặc định
const DEFAULT_STANDARD_WORKFLOW_STEPS: Omit<StandardWorkflowStep, "id">[] = [
  {
    name: "Tiếp nhận yêu cầu",
    description: "Tiếp nhận và phân tích yêu cầu từ khách hàng",
    estimatedTime: 1,
    estimatedTimeUnit: "days",
    order: 0,
    isRequired: true,
    fields: [
      {
        id: "assignee",
        name: "Người đảm nhận",
        type: "user",
        required: true,
        description: "Người chịu trách nhiệm tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "receiveDate",
        name: "Ngày tiếp nhận",
        type: "date",
        required: true,
        description: "Ngày tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "deadline",
        name: "Ngày deadline",
        type: "date",
        required: true,
        description: "Ngày dự kiến hoàn thành công việc",
        isSystem: true,
      },
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: "Nhân viên tiếp nhận",
    hasCost: false,
    allowedUsers: [], // Khởi tạo mảng rỗng
  },
  {
    name: "Checking (Kiểm tra yêu cầu)",
    description: "Kiểm tra tính khả thi và đầy đủ của yêu cầu",
    estimatedTime: 4,
    estimatedTimeUnit: "hours",
    order: 1,
    fields: [
      {
        id: "assignee",
        name: "Người đảm nhận",
        type: "user",
        required: true,
        description: "Người chịu trách nhiệm kiểm tra yêu cầu",
        isSystem: true,
      },
      {
        id: "receiveDate",
        name: "Ngày tiếp nhận",
        type: "date",
        required: true,
        description: "Ngày tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "deadline",
        name: "Ngày deadline",
        type: "date",
        required: true,
        description: "Ngày dự kiến hoàn thành công việc",
        isSystem: true,
      },
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: "Nhân viên kiểm tra",
    hasCost: false,
    allowedUsers: [], // Khởi tạo mảng rỗng
  },
  {
    name: "Chuẩn bị nguyên vật liệu",
    description: "Chuẩn bị nguyên vật liệu cần thiết cho sản xuất",
    estimatedTime: 3,
    estimatedTimeUnit: "days",
    order: 2,
    fields: [
      {
        id: "assignee",
        name: "Người đảm nhận",
        type: "user",
        required: true,
        description: "Người chịu trách nhiệm chuẩn bị nguyên vật liệu",
        isSystem: true,
      },
      {
        id: "receiveDate",
        name: "Ngày tiếp nhận",
        type: "date",
        required: true,
        description: "Ngày tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "deadline",
        name: "Ngày deadline",
        type: "date",
        required: true,
        description: "Ngày dự kiến hoàn thành công việc",
        isSystem: true,
      },
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: "Nhân viên kho",
    hasCost: true,
    allowedUsers: [], // Khởi tạo mảng rỗng
  },
  {
    name: "Làm file sản xuất",
    description: "Chuẩn bị file thiết kế và tài liệu kỹ thuật cho sản xuất",
    estimatedTime: 2,
    estimatedTimeUnit: "days",
    order: 3,
    fields: [
      {
        id: "assignee",
        name: "Người đảm nhận",
        type: "user",
        required: true,
        description: "Người chịu trách nhiệm chuẩn bị file sản xuất",
        isSystem: true,
      },
      {
        id: "receiveDate",
        name: "Ngày tiếp nhận",
        type: "date",
        required: true,
        description: "Ngày tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "deadline",
        name: "Ngày deadline",
        type: "date",
        required: true,
        description: "Ngày dự kiến hoàn thành công việc",
        isSystem: true,
      },
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: "Nhân viên thiết kế",
    hasCost: false,
    allowedUsers: [], // Khởi tạo mảng rỗng
  },
  {
    name: "Phản hồi khách hàng",
    description: "Nhận phản hồi từ khách hàng về mẫu sản phẩm",
    estimatedTime: 2,
    estimatedTimeUnit: "days",
    order: 4,
    fields: [
      {
        id: "assignee",
        name: "Người đảm nhận",
        type: "user",
        required: true,
        description: "Người chịu trách nhiệm tiếp nhận phản hồi",
        isSystem: true,
      },
      {
        id: "receiveDate",
        name: "Ngày tiếp nhận",
        type: "date",
        required: true,
        description: "Ngày tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "deadline",
        name: "Ngày deadline",
        type: "date",
        required: true,
        description: "Ngày dự kiến hoàn thành công việc",
        isSystem: true,
      },
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: "Nhân viên kinh doanh",
    hasCost: false,
    allowedUsers: [], // Khởi tạo mảng rỗng
  },
  {
    name: "Tính giá",
    description: "Tính toán giá thành sản phẩm",
    estimatedTime: 1,
    estimatedTimeUnit: "hours",
    order: 5,
    fields: [
      {
        id: "assignee",
        name: "Người đảm nhận",
        type: "user",
        required: true,
        description: "Người chịu trách nhiệm tính giá",
        isSystem: true,
      },
      {
        id: "receiveDate",
        name: "Ngày tiếp nhận",
        type: "date",
        required: true,
        description: "Ngày tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "deadline",
        name: "Ngày deadline",
        type: "date",
        required: true,
        description: "Ngày dự kiến hoàn thành công việc",
        isSystem: true,
      },
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: "Nhân viên kế toán",
    hasCost: true,
    allowedUsers: [], // Khởi tạo mảng rỗng
  },
  {
    name: "Làm template/mock up",
    description: "Tạo template hoặc mockup cho sản phẩm",
    estimatedTime: 3,
    estimatedTimeUnit: "days",
    order: 6,
    fields: [
      {
        id: "assignee",
        name: "Người đảm nhận",
        type: "user",
        required: true,
        description: "Người chịu trách nhiệm tạo template/mockup",
        isSystem: true,
      },
      {
        id: "receiveDate",
        name: "Ngày tiếp nhận",
        type: "date",
        required: true,
        description: "Ngày tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "deadline",
        name: "Ngày deadline",
        type: "date",
        required: true,
        description: "Ngày dự kiến hoàn thành công việc",
        isSystem: true,
      },
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: "Nhân viên thiết kế",
    hasCost: false,
    allowedUsers: [], // Khởi tạo mảng rỗng
  },
  {
    name: "Up web",
    description: "Đăng thông tin sản phẩm lên website",
    estimatedTime: 1,
    estimatedTimeUnit: "hours",
    order: 7,
    fields: [
      {
        id: "assignee",
        name: "Người đảm nhận",
        type: "user",
        required: true,
        description: "Người chịu trách nhiệm đăng web",
        isSystem: true,
      },
      {
        id: "receiveDate",
        name: "Ngày tiếp nhận",
        type: "date",
        required: true,
        description: "Ngày tiếp nhận yêu cầu",
        isSystem: true,
      },
      {
        id: "deadline",
        name: "Ngày deadline",
        type: "date",
        required: true,
        description: "Ngày dự kiến hoàn thành công việc",
        isSystem: true,
      },
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: "Nhân viên marketing",
    hasCost: false,
    allowedUsers: [], // Khởi tạo mảng rỗng
  },
]

export function StandardWorkflowProvider({ children }: { children: ReactNode }) {
  const { productStatuses } = useProductStatus()
  const [standardWorkflow, setStandardWorkflow] = useState<StandardWorkflow | null>(null)
  const [subWorkflows, setSubWorkflows] = useState<SubWorkflow[]>([])
  const [changeHistory, setChangeHistory] = useState<WorkflowChangeHistory[]>([])
  const [availableVariables, setAvailableVariables] = useState<AvailableVariable[]>(DEFAULT_AVAILABLE_VARIABLES)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false) // Thêm state initialized
  const isInitialized = useRef(false)

  // Tạo ID ngẫu nhiên
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
  }

  // Điều chỉnh thời gian về giờ làm việc (7h sáng - 19h tối)
  const adjustToWorkingHours = (date: Date): Date => {
    const adjustedDate = new Date(date)
    const hours = adjustedDate.getHours()

    // Nếu thời gian nằm ngoài khoảng 7h-19h, chuyển về 8h sáng ngày kế tiếp
    if (hours < 7 || hours >= 19) {
      adjustedDate.setDate(adjustedDate.getDate() + 1)
      adjustedDate.setHours(8, 0, 0, 0)
    }

    return adjustedDate
  }

  // Tính toán ngày deadline dựa trên ngày bắt đầu và thời gian ước tính
  const calculateDeadline = (
    startDate: Date,
    estimatedTime: number,
    estimatedTimeUnit: "days" | "hours" = "days",
  ): Date => {
    const deadline = new Date(startDate)

    if (estimatedTimeUnit === "hours") {
      // Sử dụng trực tiếp số giờ
      deadline.setHours(deadline.getHours() + estimatedTime)
    } else {
      // Nếu là days, 1 ngày = 8 giờ làm việc
      const totalHours = estimatedTime * 8
      deadline.setHours(deadline.getHours() + totalHours)
    }

    return adjustToWorkingHours(deadline)
  }

  // Kiểm tra và khởi tạo collection standardWorkflows
  const checkAndInitializeStandardWorkflows = async (): Promise<void> => {
    try {
      console.log("🔍 Checking standardWorkflows collection...")
      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      const standardWorkflowSnap = await getDoc(standardWorkflowRef)

      if (!standardWorkflowSnap.exists()) {
        console.log("❌ Collection standardWorkflows không tồn tại, đang tạo...")

        const steps = DEFAULT_STANDARD_WORKFLOW_STEPS.map((step, index) => ({
          ...step,
          id: `step${index + 1}`,
        }))

        const newStandardWorkflow: StandardWorkflow = {
          id: "standard-workflow",
          name: "Quy trình chuẩn",
          description: "Quy trình chuẩn cho phát triển sản phẩm",
          steps,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        }

        await setDoc(standardWorkflowRef, {
          ...newStandardWorkflow,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        setStandardWorkflow(newStandardWorkflow)
        console.log("✅ Standard workflow created successfully")

        toast({
          title: "Thành công",
          description: "Đã khởi tạo quy trình chuẩn với các bước mặc định.",
        })
      } else {
        // Load existing standard workflow
        const data = standardWorkflowSnap.data()
        console.log("✅ Found existing standard workflow")

        const workflow: StandardWorkflow = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as StandardWorkflow

        // Đảm bảo mỗi bước có trường allowedUsers
        if (workflow.steps) {
          workflow.steps = workflow.steps.map((step) => ({
            ...step,
            allowedUsers: step.allowedUsers || [],
          }))
        }

        setStandardWorkflow(workflow)
        console.log("✅ Standard workflow loaded successfully with", workflow.steps.length, "steps")
      }

      setInitialized(true)
    } catch (error) {
      console.error("❌ Lỗi khi kiểm tra/khởi tạo standardWorkflows:", error)
      toast({
        title: "Lỗi",
        description: "Không thể khởi tạo quy trình chuẩn.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Khởi tạo dữ liệu từ Firebase khi component được mount
  useEffect(() => {
    if (!isInitialized.current) {
      setLoading(true)
      console.log("🔄 Initializing standard workflow...")
      checkAndInitializeStandardWorkflows().finally(() => {
        isInitialized.current = true
        setLoading(false)
      })
    }
  }, [])

  // Thêm lịch sử thay đổi
  const addChangeHistory = async (
    changeType: "create" | "update" | "delete",
    entityType: "workflow" | "step" | "field",
    entityId: string,
    changes: { field: string; oldValue?: any; newValue: any }[],
    userId = "system",
  ) => {
    const newHistory: WorkflowChangeHistory = {
      id: generateId(),
      workflowId: standardWorkflow?.id || "standard-workflow",
      changeType,
      entityType,
      entityId,
      changes,
      changedBy: userId,
      changedAt: new Date(),
    }

    setChangeHistory((prev) => [newHistory, ...prev])
    return newHistory.id
  }

  // Khởi tạo quy trình chuẩn
  const initializeStandardWorkflow = async (): Promise<void> => {
    await checkAndInitializeStandardWorkflows()
  }

  // Lấy quy trình chuẩn
  const getStandardWorkflow = (): StandardWorkflow | null => {
    return standardWorkflow
  }

  // Cập nhật quy trình chuẩn
  const updateStandardWorkflow = async (
    updates: Partial<Omit<StandardWorkflow, "id" | "createdAt" | "updatedAt" | "version">>,
    userId = "system",
  ): Promise<void> => {
    if (!standardWorkflow) return

    try {
      const changes: { field: string; oldValue?: any; newValue: any }[] = []

      if (updates.name && updates.name !== standardWorkflow.name) {
        changes.push({ field: "name", oldValue: standardWorkflow.name, newValue: updates.name })
      }

      if (updates.description && updates.description !== standardWorkflow.description) {
        changes.push({ field: "description", oldValue: standardWorkflow.description, newValue: updates.description })
      }

      const updatedWorkflow: StandardWorkflow = {
        ...standardWorkflow,
        ...updates,
        updatedAt: new Date(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      await updateDoc(standardWorkflowRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      })

      setStandardWorkflow(updatedWorkflow)

      // Thêm lịch sử cập nhật quy trình
      if (changes.length > 0) {
        await addChangeHistory("update", "workflow", updatedWorkflow.id, changes, userId)
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật quy trình chuẩn:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật quy trình chuẩn.",
        variant: "destructive",
      })
    }
  }

  // Thêm bước mới vào quy trình chuẩn
  const addStandardWorkflowStep = async (
    step: Omit<StandardWorkflowStep, "id" | "order">,
    userId = "system",
  ): Promise<string> => {
    if (!standardWorkflow) return ""

    try {
      const stepId = generateId()
      const newStep: StandardWorkflowStep = {
        ...step,
        id: stepId,
        order: standardWorkflow.steps.length,
        fields: [
          {
            id: "assignee",
            name: "Người đảm nhận",
            type: "user",
            required: true,
            description: "Người chịu trách nhiệm cho bước này",
            isSystem: true,
          },
          {
            id: "receiveDate",
            name: "Ngày tiếp nhận",
            type: "date",
            required: true,
            description: "Ngày tiếp nhận yêu cầu",
            isSystem: true,
          },
          {
            id: "deadline",
            name: "Ngày deadline",
            type: "date",
            required: true,
            description: "Ngày dự kiến hoàn thành công việc",
            isSystem: true,
          },
        ],
        allowedUsers: step.allowedUsers || [], // Đảm bảo có trường allowedUsers
      }

      const updatedSteps = [...standardWorkflow.steps, newStep]
      const updatedWorkflow: StandardWorkflow = {
        ...standardWorkflow,
        steps: updatedSteps,
        updatedAt: new Date(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      await updateDoc(standardWorkflowRef, {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      })

      setStandardWorkflow(updatedWorkflow)

      // Thêm lịch sử tạo bước
      await addChangeHistory("create", "step", stepId, [{ field: "step", newValue: newStep.name }], userId)

      toast({
        title: "Thành công",
        description: `Đã thêm bước "${newStep.name}" vào quy trình chuẩn.`,
      })

      return stepId
    } catch (error) {
      console.error("Lỗi khi thêm bước:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm bước mới.",
        variant: "destructive",
      })
      return ""
    }
  }

  // Cập nhật bước trong quy trình chuẩn
  const updateStandardWorkflowStep = async (
    stepId: string,
    updates: Partial<Omit<StandardWorkflowStep, "id">>,
    userId = "system",
  ): Promise<void> => {
    if (!standardWorkflow) return

    try {
      const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
      if (stepIndex === -1) return

      const oldStep = standardWorkflow.steps[stepIndex]
      const changes: { field: string; oldValue?: any; newValue: any }[] = []

      if (updates.name && updates.name !== oldStep.name) {
        changes.push({ field: "name", oldValue: oldStep.name, newValue: updates.name })
      }

      if (updates.allowedUsers) {
        changes.push({
          field: "allowedUsers",
          oldValue: oldStep.allowedUsers || [],
          newValue: updates.allowedUsers,
        })
      }

      const updatedSteps = [...standardWorkflow.steps]
      updatedSteps[stepIndex] = {
        ...oldStep,
        ...updates,
      }

      const updatedWorkflow: StandardWorkflow = {
        ...standardWorkflow,
        steps: updatedSteps,
        updatedAt: new Date(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      // Lọc bỏ các giá trị undefined trước khi cập nhật Firestore
      const cleanUpdates: any = {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      // Chỉ thêm các trường không undefined
      Object.keys(cleanUpdates).forEach((key) => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key]
        }
      })

      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      await updateDoc(standardWorkflowRef, cleanUpdates)

      setStandardWorkflow(updatedWorkflow)

      // Thêm lịch sử cập nhật bước
      if (changes.length > 0) {
        await addChangeHistory("update", "step", stepId, changes, userId)
      }

      toast({
        title: "Thành công",
        description: `Đã cập nhật bước "${updatedSteps[stepIndex].name}".`,
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật bước:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bước.",
        variant: "destructive",
      })
    }
  }

  // Xóa bước khỏi quy trình chuẩn
  const deleteStandardWorkflowStep = async (stepId: string, userId = "system"): Promise<boolean> => {
    if (!standardWorkflow) return false

    try {
      const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
      if (stepIndex === -1) return false

      const step = standardWorkflow.steps[stepIndex]

      // Không cho phép xóa bước bắt buộc
      if (step.isRequired) {
        toast({
          title: "Không thể xóa",
          description: "Không thể xóa bước bắt buộc trong quy trình chuẩn.",
          variant: "destructive",
        })
        return false
      }

      const updatedSteps = standardWorkflow.steps.filter((s) => s.id !== stepId)
      const reorderedSteps = updatedSteps.map((s, index) => ({
        ...s,
        order: index,
      }))

      const updatedWorkflow: StandardWorkflow = {
        ...standardWorkflow,
        steps: reorderedSteps,
        updatedAt: new Date(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      await updateDoc(standardWorkflowRef, {
        steps: reorderedSteps,
        updatedAt: serverTimestamp(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      })

      setStandardWorkflow(updatedWorkflow)

      // Thêm lịch sử xóa bước
      await addChangeHistory("delete", "step", stepId, [{ field: "step", oldValue: step.name, newValue: null }], userId)

      toast({
        title: "Thành công",
        description: `Đã xóa bước "${step.name}" khỏi quy trình chuẩn.`,
      })

      return true
    } catch (error) {
      console.error("Lỗi khi xóa bước:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa bước.",
        variant: "destructive",
      })
      return false
    }
  }

  // Sắp xếp lại thứ tự các bước
  const reorderStandardWorkflowSteps = async (steps: StandardWorkflowStep[], userId = "system"): Promise<void> => {
    if (!standardWorkflow) return

    try {
      const updatedSteps = steps.map((step, index) => ({
        ...step,
        order: index,
      }))

      const updatedWorkflow: StandardWorkflow = {
        ...standardWorkflow,
        steps: updatedSteps,
        updatedAt: new Date(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      await updateDoc(standardWorkflowRef, {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      })

      setStandardWorkflow(updatedWorkflow)

      // Thêm lịch sử sắp xếp lại bước
      await addChangeHistory(
        "update",
        "workflow",
        standardWorkflow.id,
        [{ field: "steps_order", oldValue: "previous_order", newValue: "new_order" }],
        userId,
      )

      toast({
        title: "Thành công",
        description: "Đã sắp xếp lại thứ tự các bước trong quy trình chuẩn.",
      })
    } catch (error) {
      console.error("Lỗi khi sắp xếp lại bước:", error)
      toast({
        title: "Lỗi",
        description: "Không thể sắp xếp lại thứ tự các bước.",
        variant: "destructive",
      })
    }
  }

  // Thêm trường vào bước
  const addStepField = async (stepId: string, field: Omit<StepField, "id">, userId = "system"): Promise<string> => {
    if (!standardWorkflow) return ""

    try {
      const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
      if (stepIndex === -1) return ""

      const fieldId = generateId()

      // Clean the field object to remove undefined values
      const cleanField: StepField = {
        id: fieldId,
        name: field.name,
        type: field.type,
        required: field.required || false,
        description: field.description || "",
        isSystem: field.isSystem || false,
      }

      // Only add optional properties if they have values
      if (field.options && field.options.length > 0) {
        cleanField.options = field.options
      }

      if (field.defaultValue !== undefined) {
        cleanField.defaultValue = field.defaultValue
      }

      if (field.currencySymbol) {
        cleanField.currencySymbol = field.currencySymbol
      }

      if (field.variableSource) {
        cleanField.variableSource = field.variableSource
      }

      const updatedSteps = [...standardWorkflow.steps]
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        fields: [...updatedSteps[stepIndex].fields, cleanField],
      }

      const updatedWorkflow: StandardWorkflow = {
        ...standardWorkflow,
        steps: updatedSteps,
        updatedAt: new Date(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      await updateDoc(standardWorkflowRef, {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      })

      setStandardWorkflow(updatedWorkflow)

      // Thêm lịch sử tạo trường
      await addChangeHistory("create", "field", fieldId, [{ field: "field", newValue: cleanField.name }], userId)

      toast({
        title: "Thành công",
        description: `Đã thêm trường "${cleanField.name}" vào bước "${updatedSteps[stepIndex].name}".`,
      })

      return fieldId
    } catch (error) {
      console.error("Lỗi khi thêm trường:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm trường mới.",
        variant: "destructive",
      })
      return ""
    }
  }

  // Cập nhật trường trong bước
  const updateStepField = async (
    stepId: string,
    fieldId: string,
    updates: Partial<Omit<StepField, "id">>,
    userId = "system",
  ): Promise<void> => {
    if (!standardWorkflow) return

    try {
      const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
      if (stepIndex === -1) return

      const fieldIndex = standardWorkflow.steps[stepIndex].fields.findIndex((f) => f.id === fieldId)
      if (fieldIndex === -1) return

      const oldField = standardWorkflow.steps[stepIndex].fields[fieldIndex]
      const changes: { field: string; oldValue?: any; newValue: any }[] = []

      if (updates.name && updates.name !== oldField.name) {
        changes.push({ field: "name", oldValue: oldField.name, newValue: updates.name })
      }

      const updatedSteps = [...standardWorkflow.steps]
      const updatedFields = [...updatedSteps[stepIndex].fields]
      updatedFields[fieldIndex] = {
        ...oldField,
        ...updates,
      }
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        fields: updatedFields,
      }

      const updatedWorkflow: StandardWorkflow = {
        ...standardWorkflow,
        steps: updatedSteps,
        updatedAt: new Date(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      await updateDoc(standardWorkflowRef, {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      })

      setStandardWorkflow(updatedWorkflow)

      // Thêm lịch sử cập nhật trường
      if (changes.length > 0) {
        await addChangeHistory("update", "field", fieldId, changes, userId)
      }

      toast({
        title: "Thành công",
        description: `Đã cập nhật trường "${updatedFields[fieldIndex].name}".`,
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật trường:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trường.",
        variant: "destructive",
      })
    }
  }

  // Xóa trường khỏi bước
  const deleteStepField = async (stepId: string, fieldId: string, userId = "system"): Promise<boolean> => {
    if (!standardWorkflow) return false

    try {
      const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
      if (stepIndex === -1) return false

      const fieldIndex = standardWorkflow.steps[stepIndex].fields.findIndex((f) => f.id === fieldId)
      if (fieldIndex === -1) return false

      const field = standardWorkflow.steps[stepIndex].fields[fieldIndex]

      // Không cho phép xóa trường hệ thống
      if (field.isSystem) {
        toast({
          title: "Không thể xóa",
          description: "Không thể xóa trường hệ thống.",
          variant: "destructive",
        })
        return false
      }

      const updatedSteps = [...standardWorkflow.steps]
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        fields: updatedSteps[stepIndex].fields.filter((f) => f.id !== fieldId),
      }

      const updatedWorkflow: StandardWorkflow = {
        ...standardWorkflow,
        steps: updatedSteps,
        updatedAt: new Date(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      }

      const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
      await updateDoc(standardWorkflowRef, {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
        version: standardWorkflow.version + 1,
        lastModifiedBy: userId,
      })

      setStandardWorkflow(updatedWorkflow)

      // Thêm lịch sử xóa trường
      await addChangeHistory(
        "delete",
        "field",
        fieldId,
        [{ field: "field", oldValue: field.name, newValue: null }],
        userId,
      )

      toast({
        title: "Thành công",
        description: `Đã xóa trường "${field.name}" khỏi bước "${updatedSteps[stepIndex].name}".`,
      })

      return true
    } catch (error) {
      console.error("Lỗi khi xóa trường:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa trường.",
        variant: "destructive",
      })
      return false
    }
  }

  // Placeholder implementations for other functions
  const createSubWorkflow = async (
    subWorkflow: Omit<SubWorkflow, "id" | "createdAt" | "updatedAt" | "stepEstimatedTimes">,
    userId = "system",
  ): Promise<string> => {
    // Implementation would go here
    return ""
  }

  const updateSubWorkflow = async (
    id: string,
    updates: Partial<Omit<SubWorkflow, "id" | "createdAt" | "updatedAt">>,
    userId = "system",
  ): Promise<void> => {
    // Implementation would go here
  }

  const deleteSubWorkflow = async (id: string, userId = "system"): Promise<void> => {
    // Implementation would go here
  }

  const getSubWorkflowByStatusId = (statusId: string): SubWorkflow | undefined => {
    return subWorkflows.find((workflow) => workflow.statusId === statusId)
  }

  const isSubWorkflowNameExists = (name: string, excludeId?: string): boolean => {
    return subWorkflows.some((workflow) => workflow.name === name && workflow.id !== excludeId)
  }

  const addAvailableVariable = async (variable: Omit<AvailableVariable, "id">, userId = "system"): Promise<string> => {
    // Implementation would go here
    return ""
  }

  const updateAvailableVariable = async (
    id: string,
    updates: Partial<Omit<AvailableVariable, "id">>,
    userId = "system",
  ): Promise<void> => {
    // Implementation would go here
  }

  const deleteAvailableVariable = async (id: string, userId = "system"): Promise<void> => {
    // Implementation would go here
  }

  const getChangeHistoryForEntity = (
    entityType: "workflow" | "step" | "field",
    entityId: string,
  ): WorkflowChangeHistory[] => {
    return changeHistory.filter((history) => history.entityType === entityType && history.entityId === entityId)
  }

  return (
    <StandardWorkflowContext.Provider
      value={{
        standardWorkflow,
        subWorkflows,
        changeHistory,
        availableVariables,
        initializeStandardWorkflow,
        getStandardWorkflow,
        updateStandardWorkflow,
        addStandardWorkflowStep,
        updateStandardWorkflowStep,
        deleteStandardWorkflowStep,
        reorderStandardWorkflowSteps,
        addStepField,
        updateStepField,
        deleteStepField,
        createSubWorkflow,
        updateSubWorkflow,
        deleteSubWorkflow,
        getSubWorkflowByStatusId,
        isSubWorkflowNameExists,
        addAvailableVariable,
        updateAvailableVariable,
        deleteAvailableVariable,
        getChangeHistoryForEntity,
        calculateDeadline,
        adjustToWorkingHours,
        loading,
        initialized, // Thêm initialized vào context
      }}
    >
      {children}
    </StandardWorkflowContext.Provider>
  )
}

export function useStandardWorkflow() {
  const context = useContext(StandardWorkflowContext)
  if (context === undefined) {
    throw new Error("useStandardWorkflow must be used within a StandardWorkflowProvider")
  }
  return context
}
