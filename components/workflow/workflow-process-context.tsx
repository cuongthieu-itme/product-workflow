"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useProductStatus } from "../product-status/product-status-context"

// Định nghĩa kiểu dữ liệu cho trường tùy chỉnh trong bước quy trình
export interface StepField {
  id: string
  name: string
  type: "text" | "date" | "select" | "user" | "checkbox" | "number" | "currency" // Thêm loại dữ liệu tiền tệ
  required: boolean
  description?: string
  options?: string[] // Cho trường select
  defaultValue?: string | boolean | number | Date
  isSystem?: boolean // Đánh dấu trường hệ thống không được xóa
  currencySymbol?: string // Biểu tượng tiền tệ (VND, USD, etc.)
}

// Định nghĩa kiểu dữ liệu cho một bước trong quy trình
export interface WorkflowStep {
  id: string
  name: string
  description: string
  estimatedDays: number
  order: number
  isRequired?: boolean // Thêm trường để đánh dấu bước quan trọng không thể xóa
  fields: StepField[] // Thêm các trường tùy chỉnh cho bước
  notifyBeforeDeadline?: number // Số ngày thông báo trước deadline
}

// Định nghĩa kiểu dữ liệu cho một luồng quy trình
export interface WorkflowProcess {
  id: string
  name: string
  description: string
  statusId: string // ID của trạng thái sản phẩm mà quy trình này áp dụng
  steps: WorkflowStep[]
  createdAt: Date
  updatedAt: Date
}

interface WorkflowProcessContextType {
  workflowProcesses: WorkflowProcess[]
  addWorkflowProcess: (process: Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt">) => void
  updateWorkflowProcess: (id: string, updates: Partial<Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt">>) => void
  deleteWorkflowProcess: (id: string) => void
  isWorkflowProcessNameExists: (name: string, excludeId?: string) => boolean
  getWorkflowProcessByStatusId: (statusId: string) => WorkflowProcess | undefined
  addWorkflowStep: (processId: string, step: Omit<WorkflowStep, "id" | "order" | "fields">) => WorkflowStep
  updateWorkflowStep: (processId: string, stepId: string, updates: Partial<Omit<WorkflowStep, "id">>) => void
  deleteWorkflowStep: (processId: string, stepId: string) => boolean // Trả về false nếu không thể xóa
  reorderWorkflowSteps: (processId: string, steps: WorkflowStep[]) => void

  // Thêm các phương thức mới để quản lý trường tùy chỉnh
  addStepField: (processId: string, stepId: string, field: Omit<StepField, "id">) => void
  updateStepField: (processId: string, stepId: string, fieldId: string, updates: Partial<Omit<StepField, "id">>) => void
  deleteStepField: (processId: string, stepId: string, fieldId: string) => boolean // Trả về false nếu không thể xóa

  // Thêm phương thức để kiểm tra trường hệ thống
  isSystemField: (fieldId: string) => boolean
}

const WorkflowProcessContext = createContext<WorkflowProcessContextType | undefined>(undefined)

// Danh sách ID của các trường hệ thống không được xóa
const SYSTEM_FIELD_IDS = [
  "assignee", // Người đảm nhận
  "receiveDate", // Thời gian tiếp nhận
  "deadline", // Thời gian deadline
  "status", // Trạng thái
]

export function WorkflowProcessProvider({ children }: { children: ReactNode }) {
  const { productStatuses } = useProductStatus()
  const [workflowProcesses, setWorkflowProcesses] = useState<WorkflowProcess[]>([])
  const isFirstMount = useRef(true)

  // Khởi tạo dữ liệu từ localStorage khi component được mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedProcesses = localStorage.getItem("workflowProcesses")
        if (storedProcesses) {
          const parsedProcesses = JSON.parse(storedProcesses)
          // Chuyển đổi chuỗi ngày thành đối tượng Date
          const formattedProcesses = parsedProcesses.map((process: any) => ({
            ...process,
            createdAt: new Date(process.createdAt),
            updatedAt: new Date(process.updatedAt),
            // Đảm bảo mỗi bước có mảng fields, nếu không có thì khởi tạo mảng rỗng
            steps: process.steps.map((step: any) => ({
              ...step,
              fields: step.fields || [],
            })),
          }))
          setWorkflowProcesses(formattedProcesses)
        } else if (productStatuses.length > 0) {
          // Khởi tạo dữ liệu mặc định nếu không có dữ liệu trong localStorage
          const defaultProcesses: WorkflowProcess[] = [
            {
              id: "1",
              name: "Quy trình phát triển sản phẩm mới",
              description: "Quy trình xử lý yêu cầu phát triển sản phẩm mới",
              statusId: productStatuses[0]?.id || "1",
              steps: [
                {
                  id: "step1",
                  name: "Tiếp nhận yêu cầu",
                  description: "Tiếp nhận và phân tích yêu cầu từ khách hàng",
                  estimatedDays: 3,
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
                      name: "Thời gian tiếp nhận",
                      type: "date",
                      required: true,
                      description: "Ngày tiếp nhận yêu cầu",
                      isSystem: true,
                    },
                    {
                      id: "deadline",
                      name: "Thời gian deadline",
                      type: "date",
                      required: true,
                      description: "Ngày dự kiến hoàn thành công việc",
                      isSystem: true,
                    },
                    {
                      id: "status",
                      name: "Trạng thái",
                      type: "select",
                      required: true,
                      description: "Trạng thái hiện tại của bước",
                      options: ["Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Quá hạn"],
                      isSystem: true,
                    },
                  ],
                  notifyBeforeDeadline: 1, // Thông báo trước 1 ngày
                },
                {
                  id: "step2",
                  name: "Thiết kế sản phẩm",
                  description: "Thiết kế và phát triển mẫu sản phẩm",
                  estimatedDays: 7,
                  order: 1,
                  fields: [
                    {
                      id: "assignee",
                      name: "Người đảm nhận",
                      type: "user",
                      required: true,
                      description: "Người chịu trách nhiệm thiết kế sản phẩm",
                      isSystem: true,
                    },
                    {
                      id: "receiveDate",
                      name: "Thời gian tiếp nhận",
                      type: "date",
                      required: true,
                      description: "Ngày tiếp nhận yêu cầu",
                      isSystem: true,
                    },
                    {
                      id: "deadline",
                      name: "Thời gian deadline",
                      type: "date",
                      required: true,
                      description: "Ngày dự kiến hoàn thành công việc",
                      isSystem: true,
                    },
                    {
                      id: "status",
                      name: "Trạng thái",
                      type: "select",
                      required: true,
                      description: "Trạng thái hiện tại của bước",
                      options: ["Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Quá hạn"],
                      isSystem: true,
                    },
                  ],
                  notifyBeforeDeadline: 2, // Thông báo trước 2 ngày
                },
                {
                  id: "step3",
                  name: "Phê duyệt",
                  description: "Trình mẫu sản phẩm để phê duyệt",
                  estimatedDays: 2,
                  order: 2,
                  fields: [
                    {
                      id: "assignee",
                      name: "Người đảm nhận",
                      type: "user",
                      required: true,
                      description: "Người chịu trách nhiệm phê duyệt sản phẩm",
                      isSystem: true,
                    },
                    {
                      id: "receiveDate",
                      name: "Thời gian tiếp nhận",
                      type: "date",
                      required: true,
                      description: "Ngày tiếp nhận yêu cầu",
                      isSystem: true,
                    },
                    {
                      id: "deadline",
                      name: "Thời gian deadline",
                      type: "date",
                      required: true,
                      description: "Ngày dự kiến hoàn thành công việc",
                      isSystem: true,
                    },
                    {
                      id: "status",
                      name: "Trạng thái",
                      type: "select",
                      required: true,
                      description: "Trạng thái hiện tại của bước",
                      options: ["Chưa phê duyệt", "Đã phê duyệt", "Cần chỉnh sửa", "Từ chối", "Quá hạn"],
                      isSystem: true,
                    },
                  ],
                  notifyBeforeDeadline: 1, // Thông báo trước 1 ngày
                },
                {
                  id: "step4",
                  name: "Sản xuất",
                  description: "Sản xuất sản phẩm theo mẫu đã được phê duyệt",
                  estimatedDays: 14,
                  order: 3,
                  isRequired: true,
                  fields: [
                    {
                      id: "assignee",
                      name: "Người đảm nhận",
                      type: "user",
                      required: true,
                      description: "Người chịu trách nhiệm sản xuất",
                      isSystem: true,
                    },
                    {
                      id: "receiveDate",
                      name: "Thời gian tiếp nhận",
                      type: "date",
                      required: true,
                      description: "Ngày tiếp nhận yêu cầu",
                      isSystem: true,
                    },
                    {
                      id: "deadline",
                      name: "Thời gian deadline",
                      type: "date",
                      required: true,
                      description: "Ngày dự kiến hoàn thành công việc",
                      isSystem: true,
                    },
                    {
                      id: "status",
                      name: "Trạng thái",
                      type: "select",
                      required: true,
                      description: "Trạng thái hiện tại của bước",
                      options: ["Chưa bắt đầu", "Đang sản xuất", "Hoàn thành", "Tạm dừng", "Quá hạn"],
                      isSystem: true,
                    },
                    {
                      id: "productionCost",
                      name: "Chi phí sản xuất",
                      type: "currency",
                      required: true,
                      description: "Chi phí sản xuất sản phẩm",
                      currencySymbol: "VND",
                    },
                  ],
                  notifyBeforeDeadline: 3, // Thông báo trước 3 ngày
                },
              ],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]
          setWorkflowProcesses(defaultProcesses)
          localStorage.setItem("workflowProcesses", JSON.stringify(defaultProcesses))
        }
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu từ localStorage:", error)
      }
    }
  }, [productStatuses])

  // Lưu dữ liệu vào localStorage khi workflowProcesses thay đổi
  useEffect(() => {
    if (typeof window !== "undefined" && !isFirstMount.current) {
      try {
        localStorage.setItem("workflowProcesses", JSON.stringify(workflowProcesses))
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu vào localStorage:", error)
      }
    }
    isFirstMount.current = false
  }, [workflowProcesses])

  const addWorkflowProcess = (process: Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt">) => {
    const newProcess: WorkflowProcess = {
      ...process,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setWorkflowProcesses((prev) => [...prev, newProcess])
    return newProcess
  }

  const updateWorkflowProcess = (
    id: string,
    updates: Partial<Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt">>,
  ) => {
    setWorkflowProcesses((prev) =>
      prev.map((process) =>
        process.id === id
          ? {
              ...process,
              ...updates,
              updatedAt: new Date(),
            }
          : process,
      ),
    )
  }

  const deleteWorkflowProcess = (id: string) => {
    setWorkflowProcesses((prev) => prev.filter((process) => process.id !== id))
  }

  const isWorkflowProcessNameExists = (name: string, excludeId?: string) => {
    return workflowProcesses.some(
      (process) => process.name.toLowerCase() === name.toLowerCase() && process.id !== excludeId,
    )
  }

  const getWorkflowProcessByStatusId = (statusId: string) => {
    return workflowProcesses.find((process) => process.statusId === statusId)
  }

  const addWorkflowStep = (processId: string, step: Omit<WorkflowStep, "id" | "order" | "fields">) => {
    const stepId = Math.random().toString(36).substring(2, 9)
    const newStep: WorkflowStep = {
      ...step,
      id: stepId,
      order: workflowProcesses.find((p) => p.id === processId)?.steps.length || 0,
      fields: [
        // Thêm các trường mặc định cho bước mới
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
          name: "Thời gian tiếp nhận",
          type: "date",
          required: true,
          description: "Ngày tiếp nhận yêu cầu",
          isSystem: true,
        },
        {
          id: "deadline",
          name: "Thời gian deadline",
          type: "date",
          required: true,
          description: "Ngày dự kiến hoàn thành công việc",
          isSystem: true,
        },
        {
          id: "status",
          name: "Trạng thái",
          type: "select",
          required: true,
          description: "Trạng thái hiện tại của bước",
          options: ["Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Quá hạn"],
          isSystem: true,
        },
      ],
      notifyBeforeDeadline: 1, // Mặc định thông báo trước 1 ngày
    }

    setWorkflowProcesses((prev) => {
      const updatedProcesses = prev.map((process) => {
        if (process.id === processId) {
          return {
            ...process,
            steps: [...process.steps, newStep],
            updatedAt: new Date(),
          }
        }
        return process
      })

      // Lưu vào localStorage ngay lập tức
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("workflowProcesses", JSON.stringify(updatedProcesses))
        } catch (error) {
          console.error("Lỗi khi lưu dữ liệu vào localStorage:", error)
        }
      }

      return updatedProcesses
    })

    return newStep
  }

  const updateWorkflowStep = (processId: string, stepId: string, updates: Partial<Omit<WorkflowStep, "id">>) => {
    setWorkflowProcesses((prev) =>
      prev.map((process) => {
        if (process.id === processId) {
          return {
            ...process,
            steps: process.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
            updatedAt: new Date(),
          }
        }
        return process
      }),
    )
  }

  const deleteWorkflowStep = (processId: string, stepId: string) => {
    // Kiểm tra xem bước có phải là bước quan trọng không
    const process = workflowProcesses.find((p) => p.id === processId)
    const step = process?.steps.find((s) => s.id === stepId)

    if (step?.isRequired) {
      return false // Không thể xóa bước quan trọng
    }

    setWorkflowProcesses((prev) =>
      prev.map((process) => {
        if (process.id === processId) {
          const filteredSteps = process.steps.filter((step) => step.id !== stepId)
          // Cập nhật lại thứ tự các bước sau khi xóa
          const reorderedSteps = filteredSteps.map((step, index) => ({
            ...step,
            order: index,
          }))
          return {
            ...process,
            steps: reorderedSteps,
            updatedAt: new Date(),
          }
        }
        return process
      }),
    )
    return true // Xóa thành công
  }

  const reorderWorkflowSteps = (processId: string, steps: WorkflowStep[]) => {
    setWorkflowProcesses((prev) =>
      prev.map((process) => {
        if (process.id === processId) {
          return {
            ...process,
            steps: steps.map((step, index) => ({
              ...step,
              order: index,
            })),
            updatedAt: new Date(),
          }
        }
        return process
      }),
    )
  }

  // Kiểm tra xem trường có phải là trường hệ thống không
  const isSystemField = (fieldId: string) => {
    return SYSTEM_FIELD_IDS.includes(fieldId)
  }

  // Thêm phương thức để thêm trường tùy chỉnh vào bước
  const addStepField = (processId: string, stepId: string, field: Omit<StepField, "id">) => {
    const updatedProcesses = (prev) =>
      prev.map((process) => {
        if (process.id === processId) {
          return {
            ...process,
            steps: process.steps.map((step) => {
              if (step.id === stepId) {
                const newField: StepField = {
                  ...field,
                  id: Math.random().toString(36).substring(2, 9),
                }
                return {
                  ...step,
                  fields: [...step.fields, newField],
                }
              }
              return step
            }),
            updatedAt: new Date(),
          }
        }
        return process
      })

    // Đảm bảo cập nhật lại state
    setWorkflowProcesses([...updatedProcesses(workflowProcesses)])
  }

  // Thêm phương thức để cập nhật trường tùy chỉnh trong bước
  const updateStepField = (
    processId: string,
    stepId: string,
    fieldId: string,
    updates: Partial<Omit<StepField, "id">>,
  ) => {
    setWorkflowProcesses((prev) =>
      prev.map((process) => {
        if (process.id === processId) {
          return {
            ...process,
            steps: process.steps.map((step) => {
              if (step.id === stepId) {
                return {
                  ...step,
                  fields: step.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
                }
              }
              return step
            }),
            updatedAt: new Date(),
          }
        }
        return process
      }),
    )
  }

  // Thêm phương thức để xóa trường tùy chỉnh khỏi bước
  const deleteStepField = (processId: string, stepId: string, fieldId: string) => {
    // Kiểm tra xem trường có phải là trường hệ thống không
    if (isSystemField(fieldId)) {
      return false // Không thể xóa trường hệ thống
    }

    setWorkflowProcesses((prev) =>
      prev.map((process) => {
        if (process.id === processId) {
          return {
            ...process,
            steps: process.steps.map((step) => {
              if (step.id === stepId) {
                return {
                  ...step,
                  fields: step.fields.filter((field) => field.id !== fieldId),
                }
              }
              return step
            }),
            updatedAt: new Date(),
          }
        }
        return process
      }),
    )
    return true // Xóa thành công
  }

  return (
    <WorkflowProcessContext.Provider
      value={{
        workflowProcesses,
        addWorkflowProcess,
        updateWorkflowProcess,
        deleteWorkflowProcess,
        isWorkflowProcessNameExists,
        getWorkflowProcessByStatusId,
        addWorkflowStep,
        updateWorkflowStep,
        deleteWorkflowStep,
        reorderWorkflowSteps,
        addStepField,
        updateStepField,
        deleteStepField,
        isSystemField,
      }}
    >
      {children}
    </WorkflowProcessContext.Provider>
  )
}

export function useWorkflowProcess() {
  const context = useContext(WorkflowProcessContext)
  if (context === undefined) {
    throw new Error("useWorkflowProcess must be used within a WorkflowProcessProvider")
  }
  return context
}
