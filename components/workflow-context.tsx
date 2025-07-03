'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Định nghĩa kiểu dữ liệu
export interface WorkflowStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  order: number
  estimatedTime: number // in days
  assignee?: string
  startDate?: string
  dueDate?: string
  completedDate?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  productId?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  status: 'active' | 'completed' | 'archived'
}

interface WorkflowContextType {
  workflows: Workflow[]
  loading: boolean
  error: string | null
  getWorkflow: (id: string) => Promise<Workflow | null>
  createWorkflow: (
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
  updateWorkflow: (
    id: string,
    workflow: Partial<Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
  addStep: (
    workflowId: string,
    step: Omit<WorkflowStep, 'id'>
  ) => Promise<string>
  updateStep: (
    workflowId: string,
    stepId: string,
    step: Partial<Omit<WorkflowStep, 'id'>>
  ) => Promise<void>
  deleteStep: (workflowId: string, stepId: string) => Promise<void>
  getWorkflowsByProduct: (productId: string) => Promise<Workflow[]>
  refreshWorkflows: () => Promise<void>
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lấy danh sách quy trình từ Firebase khi component được mount
  useEffect(() => {
    fetchWorkflows()
  }, [])

  // Hàm lấy danh sách quy trình từ Firebase
  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const workflowsRef = collection(db, 'workflows')
      const snapshot = await getDocs(workflowsRef)

      const workflowsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const workflowData = doc.data()

          // Lấy các bước của quy trình
          const stepsRef = collection(db, 'workflows', doc.id, 'steps')
          const stepsSnapshot = await getDocs(stepsRef)
          const steps = stepsSnapshot.docs.map((stepDoc) => ({
            id: stepDoc.id,
            ...stepDoc.data()
          })) as WorkflowStep[]

          // Sắp xếp các bước theo thứ tự
          steps.sort((a, b) => a.order - b.order)

          return {
            id: doc.id,
            ...workflowData,
            steps,
            createdAt:
              workflowData.createdAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
            updatedAt:
              workflowData.updatedAt?.toDate?.()?.toISOString() ||
              new Date().toISOString()
          } as Workflow
        })
      )

      setWorkflows(workflowsData)
      setError(null)
    } catch (err) {
      console.error('Error fetching workflows:', err)
      setError('Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }

  // Lấy thông tin một quy trình theo ID
  const getWorkflow = async (id: string): Promise<Workflow | null> => {
    try {
      const workflowRef = doc(db, 'workflows', id)
      const workflowSnap = await getDoc(workflowRef)

      if (!workflowSnap.exists()) {
        return null
      }

      const workflowData = workflowSnap.data()

      // Lấy các bước của quy trình
      const stepsRef = collection(db, 'workflows', id, 'steps')
      const stepsSnapshot = await getDocs(stepsRef)
      const steps = stepsSnapshot.docs.map((stepDoc) => ({
        id: stepDoc.id,
        ...stepDoc.data()
      })) as WorkflowStep[]

      // Sắp xếp các bước theo thứ tự
      steps.sort((a, b) => a.order - b.order)

      return {
        id: workflowSnap.id,
        ...workflowData,
        steps,
        createdAt:
          workflowData.createdAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
        updatedAt:
          workflowData.updatedAt?.toDate?.()?.toISOString() ||
          new Date().toISOString()
      } as Workflow
    } catch (err) {
      console.error('Error getting workflow:', err)
      return null
    }
  }

  // Tạo quy trình mới
  const createWorkflow = async (
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    try {
      // Tạo quy trình mới trong Firestore
      const workflowData = {
        name: workflow.name,
        description: workflow.description,
        productId: workflow.productId,
        createdBy: workflow.createdBy,
        status: workflow.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const workflowRef = await addDoc(
        collection(db, 'workflows'),
        workflowData
      )

      // Thêm các bước của quy trình
      for (const step of workflow.steps) {
        await addDoc(collection(db, 'workflows', workflowRef.id, 'steps'), {
          name: step.name,
          description: step.description,
          status: step.status,
          order: step.order,
          estimatedTime: step.estimatedTime,
          assignee: step.assignee,
          startDate: step.startDate,
          dueDate: step.dueDate,
          completedDate: step.completedDate
        })
      }

      // Cập nhật state
      await fetchWorkflows()

      return workflowRef.id
    } catch (err) {
      console.error('Error creating workflow:', err)
      throw new Error('Failed to create workflow')
    }
  }

  // Cập nhật quy trình
  const updateWorkflow = async (
    id: string,
    workflow: Partial<Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    try {
      const workflowRef = doc(db, 'workflows', id)

      // Cập nhật quy trình trong Firestore
      await updateDoc(workflowRef, {
        ...workflow,
        updatedAt: serverTimestamp()
      })

      // Cập nhật state
      await fetchWorkflows()
    } catch (err) {
      console.error('Error updating workflow:', err)
      throw new Error('Failed to update workflow')
    }
  }

  // Xóa quy trình
  const deleteWorkflow = async (id: string): Promise<void> => {
    try {
      // Xóa các bước của quy trình
      const stepsRef = collection(db, 'workflows', id, 'steps')
      const stepsSnapshot = await getDocs(stepsRef)

      for (const stepDoc of stepsSnapshot.docs) {
        await deleteDoc(doc(db, 'workflows', id, 'steps', stepDoc.id))
      }

      // Xóa quy trình
      await deleteDoc(doc(db, 'workflows', id))

      // Cập nhật state
      setWorkflows(workflows.filter((workflow) => workflow.id !== id))
    } catch (err) {
      console.error('Error deleting workflow:', err)
      throw new Error('Failed to delete workflow')
    }
  }

  // Thêm bước vào quy trình
  const addStep = async (
    workflowId: string,
    step: Omit<WorkflowStep, 'id'>
  ): Promise<string> => {
    try {
      // Thêm bước vào quy trình trong Firestore
      const stepRef = await addDoc(
        collection(db, 'workflows', workflowId, 'steps'),
        {
          name: step.name,
          description: step.description,
          status: step.status,
          order: step.order,
          estimatedTime: step.estimatedTime,
          assignee: step.assignee,
          startDate: step.startDate,
          dueDate: step.dueDate,
          completedDate: step.completedDate
        }
      )

      // Cập nhật thời gian cập nhật của quy trình
      await updateDoc(doc(db, 'workflows', workflowId), {
        updatedAt: serverTimestamp()
      })

      // Cập nhật state
      await fetchWorkflows()

      return stepRef.id
    } catch (err) {
      console.error('Error adding step:', err)
      throw new Error('Failed to add step')
    }
  }

  // Cập nhật bước trong quy trình
  const updateStep = async (
    workflowId: string,
    stepId: string,
    step: Partial<Omit<WorkflowStep, 'id'>>
  ): Promise<void> => {
    try {
      // Cập nhật bước trong Firestore
      await updateDoc(doc(db, 'workflows', workflowId, 'steps', stepId), step)

      // Cập nhật thời gian cập nhật của quy trình
      await updateDoc(doc(db, 'workflows', workflowId), {
        updatedAt: serverTimestamp()
      })

      // Cập nhật state
      await fetchWorkflows()
    } catch (err) {
      console.error('Error updating step:', err)
      throw new Error('Failed to update step')
    }
  }

  // Xóa bước khỏi quy trình
  const deleteStep = async (
    workflowId: string,
    stepId: string
  ): Promise<void> => {
    try {
      // Xóa bước khỏi Firestore
      await deleteDoc(doc(db, 'workflows', workflowId, 'steps', stepId))

      // Cập nhật thời gian cập nhật của quy trình
      await updateDoc(doc(db, 'workflows', workflowId), {
        updatedAt: serverTimestamp()
      })

      // Cập nhật state
      await fetchWorkflows()
    } catch (err) {
      console.error('Error deleting step:', err)
      throw new Error('Failed to delete step')
    }
  }

  // Lấy danh sách quy trình theo sản phẩm
  const getWorkflowsByProduct = async (
    productId: string
  ): Promise<Workflow[]> => {
    try {
      const workflowsRef = collection(db, 'workflows')
      const q = query(workflowsRef, where('productId', '==', productId))
      const snapshot = await getDocs(q)

      const workflowsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const workflowData = doc.data()

          // Lấy các bước của quy trình
          const stepsRef = collection(db, 'workflows', doc.id, 'steps')
          const stepsSnapshot = await getDocs(stepsRef)
          const steps = stepsSnapshot.docs.map((stepDoc) => ({
            id: stepDoc.id,
            ...stepDoc.data()
          })) as WorkflowStep[]

          // Sắp xếp các bước theo thứ tự
          steps.sort((a, b) => a.order - b.order)

          return {
            id: doc.id,
            ...workflowData,
            steps,
            createdAt:
              workflowData.createdAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
            updatedAt:
              workflowData.updatedAt?.toDate?.()?.toISOString() ||
              new Date().toISOString()
          } as Workflow
        })
      )

      return workflowsData
    } catch (err) {
      console.error('Error getting workflows by product:', err)
      return []
    }
  }

  // Làm mới danh sách quy trình
  const refreshWorkflows = async (): Promise<void> => {
    await fetchWorkflows()
  }

  const value = {
    workflows,
    loading,
    error,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    addStep,
    updateStep,
    deleteStep,
    getWorkflowsByProduct,
    refreshWorkflows
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
  return context
}
