'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode
} from 'react'
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'
import { useStandardWorkflow } from './standard-workflow-context-firebase'

// Định nghĩa kiểu dữ liệu cho quy trình con
export interface SubWorkflow {
  id: string
  name: string
  description?: string
  statusId: string
  statusName?: string
  visibleSteps: string[] // Chỉ lưu IDs của các bước hiển thị từ quy trình chuẩn
  createdAt?: number
  updatedAt?: number
  createdBy?: string
  parentWorkflowId?: string
}

// Định nghĩa context type
interface SubWorkflowContextType {
  subWorkflows: SubWorkflow[]
  addSubWorkflow: (
    subWorkflow: Omit<SubWorkflow, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<SubWorkflow>
  updateSubWorkflow: (
    id: string,
    subWorkflow: Partial<SubWorkflow>
  ) => Promise<void>
  deleteSubWorkflow: (id: string) => Promise<void>
  getSubWorkflowById: (id: string) => Promise<SubWorkflow | undefined>
  getSubWorkflowByStatusId: (
    statusId: string
  ) => Promise<SubWorkflow | undefined>
  getStepsByIds: (stepIds: string[]) => any
  refreshSubWorkflows: () => Promise<void>
  loading: boolean
  error: string | null
}

const SubWorkflowContext = createContext<SubWorkflowContextType | undefined>(
  undefined
)

// Utility function để chuyển undefined thành chuỗi rỗng hoặc giá trị mặc định
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return ''
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore)
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        // Xử lý các trường đặc biệt
        if (key === 'createdAt' || key === 'updatedAt') {
          sanitized[key] = Date.now()
        } else {
          // Mặc định chuyển thành chuỗi rỗng
          sanitized[key] = ''
        }
      } else {
        sanitized[key] = sanitizeForFirestore(value)
      }
    }
    return sanitized
  }

  return obj
}

// Mock data for development
const mockSubWorkflows: SubWorkflow[] = [
  {
    id: 'sub1',
    name: 'Quy trình con mẫu 1',
    description: 'Mô tả quy trình con mẫu 1',
    statusId: 'status1',
    statusName: 'Trạng thái 1',
    visibleSteps: ['step1', 'step2', 'step3'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 43200000,
    parentWorkflowId: 'standard-workflow'
  }
]

export function SubWorkflowProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [subWorkflows, setSubWorkflows] = useState<SubWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const standardWorkflowContext = useStandardWorkflow()
  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  const initialFetchDoneRef = useRef(false)

  // Sử dụng useEffect để thiết lập listener khi component mount
  useEffect(() => {
    // Chỉ thiết lập listener nếu chưa được thiết lập trước đó
    if (!unsubscribeRef.current && !initialFetchDoneRef.current) {
      try {
        setLoading(true)
        const subWorkflowsCollection = collection(db, 'subWorkflows')

        // Sử dụng onSnapshot để lắng nghe thay đổi
        const unsubscribe = onSnapshot(
          subWorkflowsCollection,
          (snapshot) => {
            try {
              const subWorkflowsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
              })) as SubWorkflow[]

              setSubWorkflows(subWorkflowsData)
              setLoading(false)
              setError(null)
              initialFetchDoneRef.current = true
            } catch (err: any) {
              console.error('Error processing sub-workflows data:', err)
              setError(`Error processing sub-workflows data: ${err.message}`)
              setLoading(false)

              // Fallback to mock data in development
              if (process.env.NODE_ENV === 'development') {
                setSubWorkflows(mockSubWorkflows)
              }
            }
          },
          (err) => {
            console.error('Error fetching sub-workflows:', err)
            setError(`Error fetching sub-workflows: ${err.message}`)
            setLoading(false)

            // Fallback to mock data in development
            if (process.env.NODE_ENV === 'development') {
              setSubWorkflows(mockSubWorkflows)
              initialFetchDoneRef.current = true
            }
          }
        )

        unsubscribeRef.current = unsubscribe
      } catch (err: any) {
        console.error('Error setting up sub-workflows listener:', err)
        setError(`Error setting up sub-workflows listener: ${err.message}`)
        setLoading(false)

        // Fallback to mock data in development
        if (process.env.NODE_ENV === 'development') {
          setSubWorkflows(mockSubWorkflows)
          initialFetchDoneRef.current = true
        }
      }
    }

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [])

  const addSubWorkflow = useCallback(
    async (
      subWorkflow: Omit<SubWorkflow, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<SubWorkflow> => {
      try {
        const now = Date.now()
        const newSubWorkflowData: Omit<SubWorkflow, 'id'> = {
          name: subWorkflow.name,
          description: subWorkflow.description || '',
          statusId: subWorkflow.statusId || '',
          statusName: subWorkflow.statusName || '',
          visibleSteps: subWorkflow.visibleSteps || [],
          createdAt: now,
          updatedAt: now,
          createdBy: 'current-user',
          parentWorkflowId: 'standard-workflow'
        }

        // Sanitize dữ liệu để tránh lỗi undefined
        const sanitizedData = sanitizeForFirestore(newSubWorkflowData)

        // Trong môi trường development, giả lập thêm quy trình con
        if (process.env.NODE_ENV === 'development') {
          const mockId = `mock-${Date.now()}`
          const createdSubWorkflow: SubWorkflow = {
            id: mockId,
            ...sanitizedData
          }

          setSubWorkflows((prev) => [...prev, createdSubWorkflow])

          toast({
            title: 'Thành công (Dev Mode)',
            description: 'Đã tạo quy trình con mới (giả lập)'
          })

          return createdSubWorkflow
        }

        // Trong môi trường production, thêm vào Firestore
        const docRef = await addDoc(
          collection(db, 'subWorkflows'),
          sanitizedData
        )

        const createdSubWorkflow: SubWorkflow = {
          id: docRef.id,
          ...sanitizedData
        }

        // Cập nhật workflowId trong productStatuses nếu có statusId
        if (subWorkflow.statusId && subWorkflow.statusId !== '') {
          try {
            await updateDoc(doc(db, 'productStatuses', subWorkflow.statusId), {
              workflowId: docRef.id,
              updatedAt: now
            })
          } catch (err) {
            console.error(
              'Error updating product status with workflow ID:',
              err
            )
          }
        }

        toast({
          title: 'Thành công',
          description: 'Đã tạo quy trình con mới'
        })

        return createdSubWorkflow
      } catch (err: any) {
        console.error('Error adding sub-workflow:', err)
        toast({
          title: 'Lỗi',
          description: `Không thể tạo quy trình con: ${err.message}`,
          variant: 'destructive'
        })
        throw err
      }
    },
    [toast]
  )

  const updateSubWorkflow = useCallback(
    async (id: string, subWorkflow: Partial<SubWorkflow>): Promise<void> => {
      try {
        const now = Date.now()
        const updatedData = {
          ...subWorkflow,
          updatedAt: now
        }

        // Sanitize dữ liệu trước khi update
        const sanitizedData = sanitizeForFirestore(updatedData)

        // Trong môi trường development, giả lập cập nhật quy trình con
        if (process.env.NODE_ENV === 'development') {
          setSubWorkflows((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, ...sanitizedData } : item
            )
          )

          toast({
            title: 'Thành công (Dev Mode)',
            description: 'Đã cập nhật quy trình con (giả lập)'
          })

          return
        }

        // Trong môi trường production, cập nhật Firestore
        await updateDoc(doc(db, 'subWorkflows', id), sanitizedData)

        toast({
          title: 'Thành công',
          description: 'Đã cập nhật quy trình con'
        })
      } catch (err: any) {
        console.error('Error updating sub-workflow:', err)
        toast({
          title: 'Lỗi',
          description: `Không thể cập nhật quy trình con: ${err.message}`,
          variant: 'destructive'
        })
        throw err
      }
    },
    [toast]
  )

  const deleteSubWorkflow = useCallback(
    async (id: string): Promise<void> => {
      try {
        // Tìm quy trình con để lấy thông tin statusId
        const subWorkflowToDelete = subWorkflows.find((sw) => sw.id === id)

        // Trong môi trường development, giả lập xóa quy trình con
        if (process.env.NODE_ENV === 'development') {
          setSubWorkflows((prev) => prev.filter((item) => item.id !== id))

          toast({
            title: 'Thành công (Dev Mode)',
            description:
              'Đã xóa quy trình con và chuyển trạng thái về quy trình chuẩn (giả lập)'
          })

          return
        }

        // Bước 1: Tìm tất cả productStatuses đang sử dụng quy trình con này
        const productStatusesQuery = query(
          collection(db, 'productStatuses'),
          where('workflowId', '==', id)
        )
        const productStatusesSnapshot = await getDocs(productStatusesQuery)

        // Bước 2: Cập nhật tất cả productStatuses về standard-workflow
        const updatePromises = productStatusesSnapshot.docs.map(
          async (statusDoc) => {
            return updateDoc(doc(db, 'productStatuses', statusDoc.id), {
              workflowId: 'standard-workflow',
              updatedAt: Date.now()
            })
          }
        )

        // Chờ tất cả cập nhật hoàn thành
        await Promise.all(updatePromises)

        // Bước 3: Xóa quy trình con
        await deleteDoc(doc(db, 'subWorkflows', id))

        // Hiển thị thông báo chi tiết
        const affectedStatusesCount = productStatusesSnapshot.docs.length
        let message = 'Đã xóa quy trình con'
        if (affectedStatusesCount > 0) {
          message += ` và chuyển ${affectedStatusesCount} trạng thái sản phẩm về quy trình chuẩn`
        }

        toast({
          title: 'Thành công',
          description: message
        })
      } catch (err: any) {
        console.error('Error deleting sub-workflow:', err)
        toast({
          title: 'Lỗi',
          description: `Không thể xóa quy trình con: ${err.message}`,
          variant: 'destructive'
        })
        throw err
      }
    },
    [subWorkflows, toast]
  )

  const getSubWorkflowById = useCallback(
    (id: string): Promise<SubWorkflow | undefined> => {
      return Promise.resolve(subWorkflows.find((sw) => sw.id === id))
    },
    [subWorkflows]
  )

  const getSubWorkflowByStatusId = useCallback(
    (statusId: string): Promise<SubWorkflow | undefined> => {
      return Promise.resolve(
        subWorkflows.find((sw) => sw.statusId === statusId)
      )
    },
    [subWorkflows]
  )

  const getStepsByIds = useCallback(
    (stepIds: string[]) => {
      console.log('🔍 getStepsByIds called with:', stepIds)
      console.log(
        '📊 standardWorkflow available:',
        !!standardWorkflowContext?.standardWorkflow
      )

      if (!standardWorkflowContext?.standardWorkflow?.steps) {
        console.log('❌ No standard workflow steps available')
        return []
      }

      console.log(
        '📝 Available steps in standard workflow:',
        standardWorkflowContext.standardWorkflow.steps.map((s) => ({
          id: s.id,
          name: s.name
        }))
      )

      const foundSteps = stepIds
        .map((stepId) => {
          const step = standardWorkflowContext.standardWorkflow.steps.find(
            (step) => step.id === stepId
          )
          if (!step) {
            console.log(`❌ Step not found for ID: ${stepId}`)
          } else {
            console.log(`✅ Found step: ${step.id} - ${step.name}`)
          }
          return step
        })
        .filter(Boolean) // Remove undefined values
        .sort((a, b) => stepIds.indexOf(a.id) - stepIds.indexOf(b.id)) // Maintain order from stepIds

      console.log(
        '🎯 Final steps returned:',
        foundSteps.map((s) => ({ id: s.id, name: s.name }))
      )
      return foundSteps
    },
    [standardWorkflowContext]
  )

  // Sửa hàm refreshSubWorkflows để tránh vòng lặp vô hạn
  const refreshSubWorkflows = useCallback(async (): Promise<void> => {
    // Nếu đã có listener, không cần refresh lại
    if (initialFetchDoneRef.current) {
      console.log('Data already loaded, skipping manual refresh')
      return
    }

    try {
      setLoading(true)

      // Trong môi trường development, sử dụng mock data
      if (process.env.NODE_ENV === 'development') {
        setSubWorkflows(mockSubWorkflows)
        setLoading(false)
        setError(null)
        initialFetchDoneRef.current = true
        return
      }

      // Trong môi trường production, fetch từ Firestore
      const querySnapshot = await getDocs(collection(db, 'subWorkflows'))
      const subWorkflowsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as SubWorkflow[]

      setSubWorkflows(subWorkflowsData)
      setLoading(false)
      setError(null)
      initialFetchDoneRef.current = true
    } catch (err: any) {
      console.error('Error refreshing sub-workflows:', err)
      setError(`Error refreshing sub-workflows: ${err.message}`)
      setLoading(false)

      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        setSubWorkflows(mockSubWorkflows)
        initialFetchDoneRef.current = true
      }
    }
  }, [])

  const value = {
    subWorkflows,
    addSubWorkflow,
    updateSubWorkflow,
    deleteSubWorkflow,
    getSubWorkflowById,
    getSubWorkflowByStatusId,
    getStepsByIds,
    refreshSubWorkflows,
    loading,
    error
  }

  return (
    <SubWorkflowContext.Provider value={value}>
      {children}
    </SubWorkflowContext.Provider>
  )
}

export function useSubWorkflow() {
  const context = useContext(SubWorkflowContext)
  if (context === undefined) {
    throw new Error('useSubWorkflow must be used within a SubWorkflowProvider')
  }
  return context
}
