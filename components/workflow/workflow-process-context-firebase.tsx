"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useProductStatus } from "../product-status/product-status-context-firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

// Định nghĩa kiểu dữ liệu cho trường tùy chỉnh trong bước quy trình
export interface StepField {
  id: string
  name: string
  type: "text" | "date" | "select" | "user" | "checkbox" | "number" | "currency"
  required: boolean
  description?: string
  options?: string[]
  defaultValue?: string | boolean | number | Date
  isSystem?: boolean
  currencySymbol?: string
}

// Định nghĩa kiểu dữ liệu cho một bước trong quy trình
export interface WorkflowStep {
  id: string
  name: string
  description: string
  estimatedDays: number
  order: number
  isRequired?: boolean
  fields: StepField[]
  notifyBeforeDeadline?: number
}

// Định nghĩa kiểu dữ liệu cho một luồng quy trình
export interface WorkflowProcess {
  id: string
  name: string
  description: string
  statusId: string
  steps: WorkflowStep[]
  createdAt: Date
  updatedAt: Date
}

interface WorkflowProcessContextType {
  workflowProcesses: WorkflowProcess[]
  addWorkflowProcess: (process: Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateWorkflowProcess: (
    id: string,
    updates: Partial<Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>
  deleteWorkflowProcess: (id: string) => Promise<void>
  isWorkflowProcessNameExists: (name: string, excludeId?: string) => Promise<boolean>
  getWorkflowProcessByStatusId: (statusId: string) => WorkflowProcess | undefined
  addWorkflowStep: (processId: string, step: Omit<WorkflowStep, "id" | "order" | "fields">) => Promise<WorkflowStep>
  updateWorkflowStep: (processId: string, stepId: string, updates: Partial<Omit<WorkflowStep, "id">>) => Promise<void>
  deleteWorkflowStep: (processId: string, stepId: string) => Promise<boolean>
  reorderWorkflowSteps: (processId: string, steps: WorkflowStep[]) => Promise<void>
  addStepField: (processId: string, stepId: string, field: Omit<StepField, "id">) => Promise<void>
  updateStepField: (
    processId: string,
    stepId: string,
    fieldId: string,
    updates: Partial<Omit<StepField, "id">>,
  ) => Promise<void>
  deleteStepField: (processId: string, stepId: string, fieldId: string) => Promise<boolean>
  isSystemField: (fieldId: string) => boolean
  loading: boolean
}

const WorkflowProcessContext = createContext<WorkflowProcessContextType | undefined>(undefined)

// Danh sách ID của các trường hệ thống không được xóa
const SYSTEM_FIELD_IDS = [
  "assignee", // Người đảm nhận
  "receiveDate", // Thời gian tiếp nhận
  "deadline", // Thời gian deadline
  "status", // Trạng thái
]

// Chuyển đổi Firestore timestamp sang Date
const convertTimestampToDate = (data: any) => {
  if (!data) return data

  if (data instanceof Timestamp) {
    return data.toDate()
  }

  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => convertTimestampToDate(item))
    }

    const result: any = {}
    for (const key in data) {
      result[key] = convertTimestampToDate(data[key])
    }
    return result
  }

  return data
}

// Chuyển đổi Date sang Firestore timestamp
const convertDateToTimestamp = (data: any) => {
  if (!data) return data

  if (data instanceof Date) {
    return Timestamp.fromDate(data)
  }

  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => convertDateToTimestamp(item))
    }

    const result: any = {}
    for (const key in data) {
      result[key] = convertDateToTimestamp(data[key])
    }
    return result
  }

  return data
}

export function WorkflowProcessProvider({ children }: { children: ReactNode }) {
  const { productStatuses } = useProductStatus()
  const [workflowProcesses, setWorkflowProcesses] = useState<WorkflowProcess[]>([])
  const [loading, setLoading] = useState(true)

  // Tải dữ liệu từ Firestore khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Lấy dữ liệu workflowProcesses
        const workflowProcessesSnapshot = await getDocs(collection(db, "workflowProcesses"))
        const workflowProcessesData = workflowProcessesSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as WorkflowProcess
        })
        setWorkflowProcesses(workflowProcessesData)

        // Nếu không có workflowProcesses, thêm dữ liệu mẫu
        if (workflowProcessesData.length === 0 && productStatuses.length > 0) {
          const defaultProcess: Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt"> = {
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
                notifyBeforeDeadline: 1,
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
                notifyBeforeDeadline: 2,
              },
            ],
          }

          // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
          const firestoreData = {
            ...defaultProcess,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          const docRef = await addDoc(collection(db, "workflowProcesses"), firestoreData)

          // Lấy lại dữ liệu sau khi thêm
          const updatedWorkflowProcessesSnapshot = await getDocs(collection(db, "workflowProcesses"))
          const updatedWorkflowProcessesData = updatedWorkflowProcessesSnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as WorkflowProcess
          })
          setWorkflowProcesses(updatedWorkflowProcessesData)
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ Firestore:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productStatuses])

  const addWorkflowProcess = async (process: Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt">) => {
    try {
      const now = new Date()

      const newProcess = {
        ...process,
        createdAt: now,
        updatedAt: now,
      }

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = convertDateToTimestamp(newProcess)

      const docRef = await addDoc(collection(db, "workflowProcesses"), firestoreData)

      // Cập nhật state
      const addedProcess = {
        ...newProcess,
        id: docRef.id,
      } as WorkflowProcess

      setWorkflowProcesses((prev) => [...prev, addedProcess])

      return addedProcess
    } catch (error) {
      console.error("Lỗi khi thêm quy trình:", error)
      throw error
    }
  }

  const updateWorkflowProcess = async (
    id: string,
    updates: Partial<Omit<WorkflowProcess, "id" | "createdAt" | "updatedAt">>,
  ) => {
    try {
      const processRef = doc(db, "workflowProcesses", id)

      const now = new Date()

      const updatedProcess = {
        ...updates,
        updatedAt: now,
      }

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = convertDateToTimestamp(updatedProcess)

      await updateDoc(processRef, firestoreData)

      // Cập nhật state
      setWorkflowProcesses((prev) =>
        prev.map((process) => (process.id === id ? { ...process, ...updates, updatedAt: now } : process)),
      )
    } catch (error) {
      console.error("Lỗi khi cập nhật quy trình:", error)
      throw error
    }
  }

  const deleteWorkflowProcess = async (id: string) => {
    try {
      await deleteDoc(doc(db, "workflowProcesses", id))

      // Cập nhật state
      setWorkflowProcesses((prev) => prev.filter((process) => process.id !== id))
    } catch (error) {
      console.error("Lỗi khi xóa quy trình:", error)
      throw error
    }
  }

  const isWorkflowProcessNameExists = async (name: string, excludeId?: string) => {
    try {
      const q = query(collection(db, "workflowProcesses"), where("name", "==", name))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return false

      // Nếu có excludeId, kiểm tra xem có quy trình nào khác có cùng tên không
      if (excludeId) {
        return querySnapshot.docs.some((doc) => doc.id !== excludeId)
      }

      return true
    } catch (error) {
      console.error("Lỗi khi kiểm tra tên quy trình:", error)
      return false
    }
  }

  const getWorkflowProcessByStatusId = (statusId: string) => {
    return workflowProcesses.find((process) => process.statusId === statusId)
  }

  const addWorkflowStep = async (processId: string, step: Omit<WorkflowStep, "id" | "order" | "fields">) => {
    try {
      const processRef = doc(db, "workflowProcesses", processId)
      const process = workflowProcesses.find((p) => p.id === processId)

      if (!process) {
        throw new Error(`Không tìm thấy quy trình với ID: ${processId}`)
      }

      const stepId = Math.random().toString(36).substring(2, 9)
      const newStep: WorkflowStep = {
        ...step,
        id: stepId,
        order: process.steps.length,
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
        notifyBeforeDeadline: 1,
      }

      const updatedSteps = [...process.steps, newStep]
      const now = new Date()

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(processRef, firestoreData)

      // Cập nhật state
      setWorkflowProcesses((prev) =>
        prev.map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              steps: updatedSteps,
              updatedAt: now,
            }
          }
          return p
        }),
      )

      return newStep
    } catch (error) {
      console.error("Lỗi khi thêm bước quy trình:", error)
      throw error
    }
  }

  const updateWorkflowStep = async (processId: string, stepId: string, updates: Partial<Omit<WorkflowStep, "id">>) => {
    try {
      const processRef = doc(db, "workflowProcesses", processId)
      const process = workflowProcesses.find((p) => p.id === processId)

      if (!process) {
        throw new Error(`Không tìm thấy quy trình với ID: ${processId}`)
      }

      const updatedSteps = process.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step))

      const now = new Date()

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(processRef, firestoreData)

      // Cập nhật state
      setWorkflowProcesses((prev) =>
        prev.map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              steps: updatedSteps,
              updatedAt: now,
            }
          }
          return p
        }),
      )
    } catch (error) {
      console.error("Lỗi khi cập nhật bước quy trình:", error)
      throw error
    }
  }

  const deleteWorkflowStep = async (processId: string, stepId: string) => {
    try {
      const processRef = doc(db, "workflowProcesses", processId)
      const process = workflowProcesses.find((p) => p.id === processId)

      if (!process) {
        throw new Error(`Không tìm thấy quy trình với ID: ${processId}`)
      }

      const step = process.steps.find((s) => s.id === stepId)

      if (!step) {
        throw new Error(`Không tìm thấy bước với ID: ${stepId}`)
      }

      // Kiểm tra xem bước có phải là bước quan trọng không
      if (step.isRequired) {
        return false // Không thể xóa bước quan trọng
      }

      const filteredSteps = process.steps.filter((s) => s.id !== stepId)
      const reorderedSteps = filteredSteps.map((step, index) => ({
        ...step,
        order: index,
      }))

      const now = new Date()

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = {
        steps: reorderedSteps,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(processRef, firestoreData)

      // Cập nhật state
      setWorkflowProcesses((prev) =>
        prev.map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              steps: reorderedSteps,
              updatedAt: now,
            }
          }
          return p
        }),
      )

      return true // Xóa thành công
    } catch (error) {
      console.error("Lỗi khi xóa bước quy trình:", error)
      return false
    }
  }

  const reorderWorkflowSteps = async (processId: string, steps: WorkflowStep[]) => {
    try {
      const processRef = doc(db, "workflowProcesses", processId)

      const reorderedSteps = steps.map((step, index) => ({
        ...step,
        order: index,
      }))

      const now = new Date()

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = {
        steps: reorderedSteps,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(processRef, firestoreData)

      // Cập nhật state
      setWorkflowProcesses((prev) =>
        prev.map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              steps: reorderedSteps,
              updatedAt: now,
            }
          }
          return p
        }),
      )
    } catch (error) {
      console.error("Lỗi khi sắp xếp lại các bước quy trình:", error)
      throw error
    }
  }

  // Kiểm tra xem trường có phải là trường hệ thống không
  const isSystemField = (fieldId: string) => {
    return SYSTEM_FIELD_IDS.includes(fieldId)
  }

  const addStepField = async (processId: string, stepId: string, field: Omit<StepField, "id">) => {
    try {
      const processRef = doc(db, "workflowProcesses", processId)
      const process = workflowProcesses.find((p) => p.id === processId)

      if (!process) {
        throw new Error(`Không tìm thấy quy trình với ID: ${processId}`)
      }

      const updatedSteps = process.steps.map((step) => {
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
      })

      const now = new Date()

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(processRef, firestoreData)

      // Cập nhật state
      setWorkflowProcesses((prev) =>
        prev.map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              steps: updatedSteps,
              updatedAt: now,
            }
          }
          return p
        }),
      )
    } catch (error) {
      console.error("Lỗi khi thêm trường vào bước quy trình:", error)
      throw error
    }
  }

  const updateStepField = async (
    processId: string,
    stepId: string,
    fieldId: string,
    updates: Partial<Omit<StepField, "id">>,
  ) => {
    try {
      const processRef = doc(db, "workflowProcesses", processId)
      const process = workflowProcesses.find((p) => p.id === processId)

      if (!process) {
        throw new Error(`Không tìm thấy quy trình với ID: ${processId}`)
      }

      const updatedSteps = process.steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            fields: step.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
          }
        }
        return step
      })

      const now = new Date()

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(processRef, firestoreData)

      // Cập nhật state
      setWorkflowProcesses((prev) =>
        prev.map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              steps: updatedSteps,
              updatedAt: now,
            }
          }
          return p
        }),
      )
    } catch (error) {
      console.error("Lỗi khi cập nhật trường trong bước quy trình:", error)
      throw error
    }
  }

  const deleteStepField = async (processId: string, stepId: string, fieldId: string) => {
    try {
      // Kiểm tra xem trường có phải là trường hệ thống không
      if (isSystemField(fieldId)) {
        return false // Không thể xóa trường hệ thống
      }

      const processRef = doc(db, "workflowProcesses", processId)
      const process = workflowProcesses.find((p) => p.id === processId)

      if (!process) {
        throw new Error(`Không tìm thấy quy trình với ID: ${processId}`)
      }

      const updatedSteps = process.steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            fields: step.fields.filter((field) => field.id !== fieldId),
          }
        }
        return step
      })

      const now = new Date()

      // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
      const firestoreData = {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(processRef, firestoreData)

      // Cập nhật state
      setWorkflowProcesses((prev) =>
        prev.map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              steps: updatedSteps,
              updatedAt: now,
            }
          }
          return p
        }),
      )

      return true // Xóa thành công
    } catch (error) {
      console.error("Lỗi khi xóa trường khỏi bước quy trình:", error)
      return false
    }
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
        loading,
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
