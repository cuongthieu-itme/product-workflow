'use client'

import type React from 'react'
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
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
import { useMaterialContext } from '../materials/material-context'
import { convertDateToTimestamp } from '@/lib/utils' // Import convertDateToTimestamp function

// Định nghĩa kiểu dữ liệu (giữ nguyên từ file cũ)
export interface Material {
  id: string
  name: string
  code: string
  quantity: number
  unit: string
  inStock: boolean
}

export interface DataSource {
  id: string
  type: 'customer' | 'department' | 'other'
  name: string
  specificSource?: string
  customerId?: string // ID của khách hàng nếu type là "customer"
}

export interface User {
  id: string
  name: string
  department?: string
  position?: string
  email?: string
}

export interface ProductStatus {
  id: string
  name: string
  color: string
}

export interface WorkflowStepData {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'on_hold'
  assignee?: User
}

export interface Request {
  id: string
  code: string
  title: string
  description: string
  creator: User
  dataSource: DataSource
  referenceLink?: string
  images: string[]
  materials: Material[]
  productStatus?: ProductStatus
  workflowId?: string
  workflowProcessId?: string
  currentStepId?: string
  currentStepOrder: number // Bước hiện tại (bắt đầu từ 1)
  totalSteps: number // Tổng số bước
  workflowSteps: WorkflowStepData[] // Dữ liệu của tất cả các bước
  createdAt: Date
  updatedAt: Date
  priority?: string
  department?: string
}

export interface MaterialImportRequest {
  id: string
  materialId: string
  materialName: string
  quantity: number
  requestCode: string
  createdAt: Date
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  expectedDate?: string
  supplier?: string
  reason?: string
  sourceCountry?: string
  importPrice?: number
}

export interface MaterialWithImport extends Material {
  importQuantity?: number
  createImportRequest?: boolean
  importSupplier?: string
  importReason?: string
  importDate?: string
  sourceCountry?: string
  importPrice?: number
  origin?: string
  description?: string
  images?: string[]
  isActive?: boolean
}

// --- 🧹  Recursively replace *all* undefined with null -----------------------
function sanitizeFirestoreData<T = any>(input: T): T {
  if (input === undefined) return null as T
  if (input === null) return input
  if (Array.isArray(input)) {
    return input.map(sanitizeFirestoreData) as unknown as T
  }
  if (typeof input === 'object') {
    const output: any = {}
    for (const [k, v] of Object.entries(input)) {
      // Firestore rejects keys that are undefined – convert to null
      output[k] = sanitizeFirestoreData(v)
    }
    return output
  }
  return input
}

// Tạo context
interface RequestContextType {
  requests: Request[]
  dataSources: DataSource[]
  productStatuses: ProductStatus[]
  materialImportRequests: MaterialImportRequest[]
  loading: boolean
  addRequest: (
    request: Omit<Request, 'id' | 'code' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
  updateRequest: (
    id: string,
    request: Partial<Omit<Request, 'id' | 'code' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>
  deleteRequest: (id: string) => Promise<void>
  getRequestById: (id: string) => Promise<Request | undefined>
  addDataSource: (dataSource: Omit<DataSource, 'id'>) => Promise<string>
  generateRequestCode: (dataSource: DataSource) => string
  isTitleExists: (title: string, excludeId?: string) => Promise<boolean>
  addMaterialImportRequest: (
    materialImportRequest: Omit<MaterialImportRequest, 'id' | 'createdAt'>
  ) => Promise<string>
  refreshData: () => Promise<void>
  updateCustomerRequests: (
    customerId: string,
    requestId: string
  ) => Promise<void>
  getRequestsByCustomerId: (customerId: string) => Promise<Request[]>
}

const RequestContext = createContext<RequestContextType | undefined>(undefined)

// Dữ liệu mẫu cho product statuses
const initialProductStatuses: ProductStatus[] = [
  { id: 'ps1', name: 'Mẫu thử nghiệm', color: 'blue' },
  { id: 'ps2', name: 'Sản phẩm mới', color: 'green' },
  { id: 'ps3', name: 'Cải tiến', color: 'purple' },
  { id: 'ps4', name: 'Theo yêu cầu', color: 'orange' }
]

// Provider component
export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [productStatuses] = useState<ProductStatus[]>(initialProductStatuses)
  const [materialImportRequests, setMaterialImportRequests] = useState<
    MaterialImportRequest[]
  >([])
  const [loading, setLoading] = useState(true)

  const materialContext = useMaterialContext()
  const { addMaterialRequest: addMaterialRequestToMaterialContext } =
    materialContext || {}

  // Lấy dữ liệu từ Firebase khi component được mount
  useEffect(() => {
    fetchData()
  }, [])

  // Hàm lấy dữ liệu từ Firebase
  const fetchData = async () => {
    setLoading(true)
    try {
      // Lấy danh sách yêu cầu
      const requestsRef = collection(db, 'requests')
      const requestsSnapshot = await getDocs(requestsRef)
      const requestsData = await Promise.all(
        requestsSnapshot.docs.map(async (doc) => {
          const data = doc.data()

          // Chuyển đổi timestamp thành Date với xử lý lỗi an toàn
          const convertToDate = (timestamp: any) => {
            if (!timestamp) return new Date()
            if (timestamp.toDate && typeof timestamp.toDate === 'function') {
              return timestamp.toDate()
            }
            if (timestamp instanceof Date) return timestamp
            if (
              typeof timestamp === 'string' ||
              typeof timestamp === 'number'
            ) {
              return new Date(timestamp)
            }
            return new Date()
          }

          const createdAt = convertToDate(data.createdAt)
          const updatedAt = convertToDate(data.updatedAt)

          // Chuyển đổi history với xử lý an toàn
          const history = (data.history || []).map((h: any) => ({
            ...h,
            timestamp: convertToDate(h.timestamp)
          }))

          return {
            id: doc.id,
            ...data,
            createdAt,
            updatedAt,
            history
          } as Request
        })
      )

      setRequests(requestsData)

      // Lấy danh sách nguồn dữ liệu
      const dataSourcesRef = collection(db, 'dataSources')
      const dataSourcesSnapshot = await getDocs(dataSourcesRef)
      const dataSourcesData = dataSourcesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as DataSource[]

      setDataSources(dataSourcesData)

      // Lấy danh sách yêu cầu nhập nguyên vật liệu
      const materialImportRequestsRef = collection(db, 'materialImportRequests')
      const materialImportRequestsSnapshot = await getDocs(
        materialImportRequestsRef
      )
      const materialImportRequestsData =
        materialImportRequestsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date()
          } as MaterialImportRequest
        })

      setMaterialImportRequests(materialImportRequestsData)

      // Nếu không có nguồn dữ liệu, thêm dữ liệu mẫu
      if (dataSourcesData.length === 0) {
        const initialDataSources = [
          { type: 'customer', name: 'Công ty ABC' },
          { type: 'customer', name: 'Khách hàng XYZ' },
          { type: 'department', name: 'Phòng Marketing' },
          { type: 'department', name: 'Phòng R&D' },
          {
            type: 'other',
            name: 'Hội chợ triển lãm',
            specificSource: 'Triển lãm nội thất Hà Nội 2023'
          }
        ]

        for (const source of initialDataSources) {
          await addDoc(collection(db, 'dataSources'), source)
        }

        // Lấy lại dữ liệu sau khi thêm
        const updatedDataSourcesSnapshot = await getDocs(dataSourcesRef)
        const updatedDataSourcesData = updatedDataSourcesSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data()
          })
        ) as DataSource[]

        setDataSources(updatedDataSourcesData)
      }
    } catch (error) {
      console.error('Error fetching data from Firebase:', error)
    } finally {
      setLoading(false)
    }
  }

  // Tạo mã yêu cầu tự động
  const generateRequestCode = useCallback(
    (dataSource: DataSource) => {
      // Lấy ngày hiện tại
      const today = new Date()
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(
        today.getDate()
      ).padStart(2, '0')}`

      // Tạo tiền tố dựa trên loại nguồn dữ liệu
      let prefix = ''
      let abbreviation = ''

      if (dataSource.type === 'customer') {
        prefix = 'KH - '
        const words = dataSource.name.split(' ')
        if (
          words[0].toLowerCase() === 'khách' &&
          words[1].toLowerCase() === 'hàng'
        ) {
          abbreviation = words
            .slice(2)
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
        } else if (
          words[0].toLowerCase() === 'công' &&
          words[1].toLowerCase() === 'ty'
        ) {
          abbreviation = words
            .slice(2)
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
        } else {
          abbreviation = words
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
        }
      } else if (dataSource.type === 'department') {
        prefix = 'PB - '
        const words = dataSource.name.split(' ')
        if (words[0].toLowerCase() === 'phòng') {
          abbreviation = words
            .slice(1)
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
        } else {
          abbreviation = words
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
        }
      } else {
        prefix = 'K - '
        const words = dataSource.name.split(' ')
        abbreviation = words
          .map((word) => word.charAt(0).toUpperCase())
          .join('')
      }

      // Đếm số lượng yêu cầu trong ngày
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      )

      const requestsToday = requests.filter((req) => {
        const reqDate = new Date(req.createdAt)
        return reqDate >= startOfDay && reqDate <= endOfDay
      })

      const count = requestsToday.length + 1
      const countStr = String(count).padStart(3, '0')

      return `${prefix}${abbreviation}-${dateStr}-${countStr}`
    },
    [requests]
  )

  // Kiểm tra tiêu đề đã tồn tại
  const isTitleExists = useCallback(
    async (title: string, excludeId?: string) => {
      try {
        const requestsRef = collection(db, 'requests')
        const q = query(requestsRef, where('title', '==', title))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) return false

        // Nếu có excludeId, kiểm tra xem có request nào khác có cùng title không
        if (excludeId) {
          return querySnapshot.docs.some((doc) => doc.id !== excludeId)
        }

        return true
      } catch (error) {
        console.error('Error checking title existence:', error)
        return false
      }
    },
    []
  )

  // Thêm yêu cầu mới
  const addRequest = useCallback(
    async (
      request: Omit<Request, 'id' | 'code' | 'createdAt' | 'updatedAt'>
    ) => {
      try {
        const now = new Date()
        const code = request.code || generateRequestCode(request.dataSource)

        // Đảm bảo không có giá trị undefined trong request
        const safeRequest = {
          ...request,
          referenceLink: request.referenceLink || '', // Chuyển undefined thành chuỗi rỗng
          workflowId: request.workflowId || null,
          workflowProcessId: request.workflowProcessId || null,
          currentStepId: request.currentStepId || null,
          currentStepOrder: request.currentStepOrder || 1,
          totalSteps: request.totalSteps || 1,
          workflowSteps: request.workflowSteps || [],
          priority: request.priority || null,
          department: request.department || null
        }

        const newRequest = {
          ...safeRequest,
          code,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        // Final deep-sanitization – ensure *no* undefined remains
        const sanitizedForFirestore = sanitizeFirestoreData(newRequest)

        // Date ➜ Timestamp
        const firestoreData = convertDateToTimestamp(sanitizedForFirestore)

        const docRef = await addDoc(collection(db, 'requests'), firestoreData)

        // Nếu có customerId, cập nhật danh sách yêu cầu cho khách hàng
        if (safeRequest.dataSource.customerId) {
          await updateCustomerRequests(
            safeRequest.dataSource.customerId,
            docRef.id
          )
        }

        // Lấy dữ liệu vừa thêm
        const addedRequest = {
          ...newRequest,
          id: docRef.id,
          createdAt: now,
          updatedAt: now
        } as Request

        setRequests((prev) => [...prev, addedRequest])

        return docRef.id
      } catch (error) {
        console.error('Error adding request:', error)
        throw new Error('Failed to add request')
      }
    },
    [generateRequestCode]
  )

  // Cập nhật yêu cầu
  const updateRequest = useCallback(
    async (
      id: string,
      request: Partial<Omit<Request, 'id' | 'code' | 'createdAt' | 'updatedAt'>>
    ) => {
      try {
        const requestRef = doc(db, 'requests', id)
        const requestSnap = await getDoc(requestRef)

        if (!requestSnap.exists()) {
          throw new Error(`Không tìm thấy yêu cầu với ID: ${id}`)
        }

        const oldRequest = {
          id: requestSnap.id,
          ...requestSnap.data()
        } as Request

        const now = new Date()

        // Xác định các trường đã thay đổi
        const changedFields: string[] = []
        const oldValues: Record<string, any> = {}
        const newValues: Record<string, any> = {}

        Object.keys(request).forEach((key) => {
          const typedKey = key as keyof typeof request
          if (
            request[typedKey] !== undefined &&
            JSON.stringify(oldRequest[typedKey]) !==
              JSON.stringify(request[typedKey])
          ) {
            changedFields.push(key)
            oldValues[key] = oldRequest[typedKey]
            newValues[key] = request[typedKey]
          }
        })

        const historyEntry = {
          id: `h${Date.now()}`,
          action: 'update',
          user: request.creator || oldRequest.creator,
          userName: (request.creator || oldRequest.creator).name,
          timestamp: now,
          changedFields,
          oldValues,
          newValues,
          details: `Đã cập nhật: ${changedFields.join(', ')}`
        }

        // Lấy lịch sử hiện tại
        const currentHistory = oldRequest.history || []

        const sanitizedData = {
          ...request,
          updatedAt: serverTimestamp(),
          history: [...currentHistory, historyEntry]
        }

        const firestoreData = convertDateToTimestamp(
          sanitizeFirestoreData(sanitizedData)
        )

        // Cập nhật yêu cầu trong Firestore
        await updateDoc(requestRef, firestoreData)

        // Cập nhật state
        setRequests((prev) =>
          prev.map((r) => {
            if (r.id === id) {
              return {
                ...r,
                ...request,
                updatedAt: now,
                history: [...r.history, historyEntry]
              }
            }
            return r
          })
        )
      } catch (error) {
        console.error('Error updating request:', error)
        throw new Error('Failed to update request')
      }
    },
    []
  )

  // Xóa yêu cầu
  const deleteRequest = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'requests', id))

      // Cập nhật state
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Error deleting request:', error)
      throw new Error('Failed to delete request')
    }
  }, [])

  // Lấy yêu cầu theo ID
  const getRequestById = useCallback(async (id: string) => {
    try {
      const requestRef = doc(db, 'requests', id)
      const requestSnap = await getDoc(requestRef)

      if (!requestSnap.exists()) {
        return undefined
      }

      const data = requestSnap.data()

      // Chuyển đổi timestamp thành Date với xử lý lỗi an toàn
      const convertToDate = (timestamp: any) => {
        if (!timestamp) return new Date()
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          return timestamp.toDate()
        }
        if (timestamp instanceof Date) return timestamp
        if (typeof timestamp === 'string' || typeof timestamp === 'number') {
          return new Date(timestamp)
        }
        return new Date()
      }

      const createdAt = convertToDate(data.createdAt)
      const updatedAt = convertToDate(data.updatedAt)

      // Chuyển đổi history
      const history = (data.history || []).map((h: any) => ({
        ...h,
        timestamp: convertToDate(h.timestamp)
      }))

      return {
        id: requestSnap.id,
        ...data,
        createdAt,
        updatedAt,
        history
      } as Request
    } catch (error) {
      console.error('Error getting request by ID:', error)
      return undefined
    }
  }, [])

  // Thêm nguồn dữ liệu mới
  const addDataSource = useCallback(
    async (dataSource: Omit<DataSource, 'id'>) => {
      try {
        const docRef = await addDoc(collection(db, 'dataSources'), dataSource)

        // Cập nhật state
        const newDataSource = {
          ...dataSource,
          id: docRef.id
        } as DataSource

        setDataSources((prev) => [...prev, newDataSource])

        return docRef.id
      } catch (error) {
        console.error('Error adding data source:', error)
        throw new Error('Failed to add data source')
      }
    },
    []
  )

  // Thêm yêu cầu nhập nguyên vật liệu
  const addMaterialImportRequest = useCallback(
    async (
      materialImportRequest: Omit<MaterialImportRequest, 'id' | 'createdAt'>
    ) => {
      try {
        const now = new Date()

        const newMaterialImportRequest = {
          ...materialImportRequest,
          createdAt: serverTimestamp()
        }

        const sanitizedData = sanitizeFirestoreData(newMaterialImportRequest)
        const firestoreData = convertDateToTimestamp(sanitizedData)

        const docRef = await addDoc(
          collection(db, 'materialImportRequests'),
          firestoreData
        )

        // Lấy dữ liệu vừa thêm
        const addedRequest = {
          ...newMaterialImportRequest,
          id: docRef.id,
          createdAt: now
        } as MaterialImportRequest

        setMaterialImportRequests((prev) => [...prev, addedRequest])

        // Đồng bộ với MaterialContext nếu có
        if (addMaterialRequestToMaterialContext) {
          addMaterialRequestToMaterialContext({
            materialId: materialImportRequest.materialId,
            quantity: materialImportRequest.quantity,
            expectedDate:
              materialImportRequest.expectedDate ||
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            supplier: materialImportRequest.supplier || '',
            status: 'pending',
            reason:
              materialImportRequest.reason || 'Yêu cầu từ phát triển sản phẩm',
            sourceCountry: materialImportRequest.sourceCountry,
            importPrice: materialImportRequest.importPrice,
            requestCode: materialImportRequest.requestCode
          })
        }

        return docRef.id
      } catch (error) {
        console.error('Error adding material import request:', error)
        throw new Error('Failed to add material import request')
      }
    },
    [addMaterialRequestToMaterialContext]
  )

  // Cập nhật danh sách yêu cầu cho khách hàng
  const updateCustomerRequests = useCallback(
    async (customerId: string, requestId: string) => {
      if (!customerId || !requestId) return

      try {
        // Kiểm tra xem đã có document customerRequests chưa
        const customerRequestsRef = doc(db, 'customerRequests', customerId)
        const customerRequestsDoc = await getDoc(customerRequestsRef)

        if (customerRequestsDoc.exists()) {
          // Nếu đã có, cập nhật mảng requestIds
          const data = customerRequestsDoc.data()
          const requestIds = data.requestIds || []

          if (!requestIds.includes(requestId)) {
            await updateDoc(customerRequestsRef, {
              requestIds: [...requestIds, requestId],
              updatedAt: serverTimestamp()
            })
          }
        } else {
          // Nếu chưa có, tạo mới
          await addDoc(collection(db, 'customerRequests'), {
            customerId,
            requestIds: [requestId],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        }

        console.log('Đã cập nhật yêu cầu cho khách hàng:', customerId)
      } catch (error) {
        console.error('Lỗi khi cập nhật yêu cầu cho khách hàng:', error)
      }
    },
    []
  )

  // Lấy yêu cầu theo khách hàng
  const getRequestsByCustomerId = useCallback(
    async (customerId: string) => {
      if (!customerId) return []

      try {
        // Lấy danh sách requestIds từ customerRequests
        const customerRequestsRef = collection(db, 'customerRequests')
        const q = query(
          customerRequestsRef,
          where('customerId', '==', customerId)
        )
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) return []

        const requestIds: string[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.requestIds) {
            requestIds.push(...data.requestIds)
          }
        })

        if (requestIds.length === 0) return []

        // Lấy thông tin chi tiết của từng request
        const requests: Request[] = []

        for (const requestId of requestIds) {
          const request = await getRequestById(requestId)
          if (request) requests.push(request)
        }

        return requests
      } catch (error) {
        console.error('Lỗi khi lấy yêu cầu theo khách hàng:', error)
        return []
      }
    },
    [getRequestById]
  )

  // Làm mới dữ liệu từ Firebase
  const refreshData = useCallback(async () => {
    await fetchData()
  }, [])

  const value = {
    requests,
    dataSources,
    productStatuses,
    materialImportRequests,
    loading,
    addRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    addDataSource,
    generateRequestCode,
    isTitleExists,
    addMaterialImportRequest,
    refreshData,
    updateCustomerRequests,
    getRequestsByCustomerId
  }

  return (
    <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
  )
}

// Hook để sử dụng context
export function useRequest() {
  const context = useContext(RequestContext)
  if (context === undefined) {
    throw new Error('useRequest must be used within a RequestProvider')
  }
  return context
}
