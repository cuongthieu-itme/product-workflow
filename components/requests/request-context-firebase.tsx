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
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  limit,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
// Import from the correct context file
import { useMaterialContext } from '../materials/material-context-firebase'
import { isAuthenticated } from '@/lib/auth'

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
  stepId: string
  stepName: string
  stepOrder: number
  assignee?: User
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  startDate?: Date
  completedDate?: Date
  fieldValues?: Record<string, any>
  notes?: string
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
  // Loại bỏ assignee đơn lẻ, thay bằng assignee theo bước
  // assignee?: User
  // Loại bỏ status thủ công, thay bằng currentStep
  // status: "pending" | "in_progress" | "completed" | "rejected" | "on_hold"
  productStatus?: ProductStatus
  workflowId?: string
  workflowProcessId?: string
  currentStepId?: string
  currentStepOrder: number // Bước hiện tại (bắt đầu từ 1)
  totalSteps: number // Tổng số bước
  workflowSteps: WorkflowStepData[] // Dữ liệu của tất cả các bước
  createdAt: Date
  updatedAt: Date
  history: {
    id: string
    action: string
    user: User
    userName: string
    timestamp: Date
    comment?: string
    reason?: string
    details?: string
    changedFields?: string[]
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
  }[]
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

// Tạo context
interface RequestContextType {
  requests: Request[]
  dataSources: DataSource[]
  productStatuses: ProductStatus[]
  materialImportRequests: MaterialImportRequest[]
  addRequest: (
    request: Omit<
      Request,
      'id' | 'code' | 'createdAt' | 'updatedAt' | 'history'
    >
  ) => Promise<string>
  updateRequest: (
    id: string,
    request: Partial<
      Omit<Request, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'history'>
    >
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
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  checkAndCreateRequestsCollection: () => Promise<boolean>
}

const RequestContext = createContext<RequestContextType | undefined>(undefined)

// Hàm loại bỏ các thuộc tính undefined
const removeUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined)
  }

  if (typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      const value = removeUndefined(obj[key])
      if (value !== undefined) {
        result[key] = value
      }
    }
    return result
  }

  return obj
}

// Hàm chuyển đổi undefined thành null
const replaceUndefinedWithNull = (obj: any): any => {
  if (obj === undefined) return null

  if (obj === null) return null

  if (Array.isArray(obj)) {
    return obj.map(replaceUndefinedWithNull)
  }

  if (typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      result[key] = replaceUndefinedWithNull(obj[key])
    }
    return result
  }

  return obj
}

// Chuyển đổi Firestore timestamp sang Date
const convertTimestampToDate = (data: any) => {
  if (!data) return data

  if (data instanceof Timestamp) {
    return data.toDate()
  }

  if (typeof data === 'object') {
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

  if (typeof data === 'object') {
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

// Dữ liệu mẫu cho product statuses
const initialProductStatuses: ProductStatus[] = [
  { id: 'ps1', name: 'Mẫu thử nghiệm', color: 'blue' },
  { id: 'ps2', name: 'Sản phẩm mới', color: 'green' },
  { id: 'ps3', name: 'Cải tiến', color: 'purple' },
  { id: 'ps4', name: 'Theo yêu cầu', color: 'orange' }
]

// Dữ liệu mẫu cho dataSources
const initialDataSources: DataSource[] = [
  { id: 'ds1', type: 'customer', name: 'Công ty ABC' },
  { id: 'ds2', type: 'customer', name: 'Khách hàng XYZ' },
  { id: 'ds3', type: 'department', name: 'Phòng Marketing' },
  { id: 'ds4', type: 'department', name: 'Phòng R&D' },
  {
    id: 'ds5',
    type: 'other',
    name: 'Hội chợ triển lãm',
    specificSource: 'Triển lãm nội thất Hà Nội 2023'
  }
]

// Provider component
export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [dataSources, setDataSources] =
    useState<DataSource[]>(initialDataSources)
  const [productStatuses] = useState<ProductStatus[]>(initialProductStatuses)
  const [materialImportRequests, setMaterialImportRequests] = useState<
    MaterialImportRequest[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false)

  // Sử dụng try-catch để xử lý trường hợp MaterialProvider chưa được khởi tạo
  const materialContext = useMaterialContext()
  const addMaterialRequestToMaterialContext =
    materialContext?.addMaterialRequest

  // Kiểm tra và tạo collection "requests" nếu chưa tồn tại
  const checkAndCreateRequestsCollection = useCallback(async () => {
    // Sử dụng phương thức xác thực hiện tại
    const authenticated = isAuthenticated()
    if (!authenticated) {
      console.warn('Người dùng chưa đăng nhập, không thể kiểm tra collection')
      return false
    }

    try {
      console.log('Đang kiểm tra collection requests...')

      // Kiểm tra xem collection có tồn tại không bằng cách thử lấy một document
      const testDoc = doc(db, 'requests', 'test-document')
      const testDocSnapshot = await getDoc(testDoc)

      // Nếu document tồn tại, collection đã tồn tại
      if (testDocSnapshot.exists()) {
        console.log('Collection requests đã tồn tại')
        return true
      }

      // Thử truy vấn collection để xem có document nào không
      const querySnapshot = await getDocs(collection(db, 'requests'))

      if (!querySnapshot.empty) {
        console.log('Collection requests đã tồn tại và có dữ liệu')
        return true
      }

      console.log(
        'Collection requests chưa tồn tại hoặc không có dữ liệu, đang tạo...'
      )

      // Tạo một document mẫu để khởi tạo collection
      const now = new Date()
      const nowTimestamp = Timestamp.fromDate(now)

      const sampleRequest = {
        code: 'SAMPLE-001',
        title: 'Yêu cầu mẫu',
        description: 'Đây là yêu cầu mẫu để khởi tạo collection requests',
        creator: {
          id: 'system',
          name: 'Hệ thống'
        },
        dataSource: {
          id: 'system',
          type: 'other',
          name: 'Hệ thống'
        },
        referenceLink: '',
        images: [],
        materials: [],
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        history: [
          {
            id: `h${Date.now()}`,
            action: 'Khởi tạo collection',
            user: {
              id: 'system',
              name: 'Hệ thống'
            },
            userName: 'Hệ thống',
            timestamp: nowTimestamp, // Sử dụng Timestamp thay vì serverTimestamp() trong mảng
            details: 'Khởi tạo collection requests'
          }
        ]
      }

      // Thêm document mẫu vào collection
      await setDoc(testDoc, sampleRequest)

      console.log('Đã tạo collection requests thành công')
      return true
    } catch (error: any) {
      console.error('Lỗi khi kiểm tra/tạo collection requests:', error)
      return false
    }
  }, [])

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    // Sử dụng phương thức xác thực hiện tại
    const authenticated = isAuthenticated()
    setIsAuthenticatedState(authenticated)

    if (authenticated) {
      console.log('Người dùng đã đăng nhập')
      // Kiểm tra và tạo collection requests nếu cần
      checkAndCreateRequestsCollection().then(() => {
        // Sau khi kiểm tra/tạo collection, tải dữ liệu
        fetchData()
      })
    } else {
      console.log('Người dùng chưa đăng nhập')
      // Sử dụng dữ liệu mẫu khi chưa đăng nhập
      setDataSources(initialDataSources)
      setRequests([])
      setMaterialImportRequests([])
      setLoading(false)
      setError(null)
    }

    // Không cần unsubscribe vì không sử dụng onAuthStateChanged
  }, [checkAndCreateRequestsCollection])

  // Tải dữ liệu từ Firestore khi component được mount
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Bắt đầu tải dữ liệu từ Firestore...')

      // Kiểm tra kết nối Firestore bằng cách truy vấn đơn giản
      try {
        // Sử dụng limit(1) để kiểm tra kết nối
        const testQuery = query(collection(db, 'dataSources'), limit(1))
        await getDocs(testQuery)
        console.log('Kết nối Firestore thành công')
      } catch (error: any) {
        console.error('Lỗi kết nối Firestore:', error)
        throw new Error(`Lỗi kết nối Firestore: ${error.message}`)
      }

      // Lấy dữ liệu dataSources
      try {
        const dataSourcesSnapshot = await getDocs(collection(db, 'dataSources'))
        const dataSourcesData = dataSourcesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        })) as DataSource[]

        if (dataSourcesData.length > 0) {
          setDataSources(dataSourcesData)
          console.log('Đã tải', dataSourcesData.length, 'nguồn dữ liệu')
        } else {
          console.log('Không có nguồn dữ liệu, sử dụng dữ liệu mẫu')
          // Nếu không có dữ liệu, thêm dữ liệu mẫu
          for (const source of initialDataSources) {
            try {
              await addDoc(collection(db, 'dataSources'), {
                type: source.type,
                name: source.name,
                specificSource: source.specificSource
              })
            } catch (error: any) {
              console.warn('Không thể thêm nguồn dữ liệu mẫu:', error.message)
            }
          }
          setDataSources(initialDataSources)
        }
      } catch (error: any) {
        console.error('Lỗi khi tải nguồn dữ liệu:', error)
        // Sử dụng dữ liệu mẫu nếu có lỗi
        setDataSources(initialDataSources)
      }

      // Lấy dữ liệu requests
      try {
        // Kiểm tra xem collection requests có tồn tại không
        try {
          const requestsSnapshot = await getDocs(collection(db, 'requests'))
          const requestsData = requestsSnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              history: (data.history || []).map((h: any) => ({
                ...h,
                timestamp: h.timestamp?.toDate() || new Date()
              }))
            } as Request
          })
          setRequests(requestsData)
          console.log('Đã tải', requestsData.length, 'yêu cầu')
        } catch (error: any) {
          console.warn(
            'Collection requests có thể chưa tồn tại:',
            error.message
          )
          console.log(
            'Bạn có thể tạo dữ liệu mẫu tại /dashboard/requests/create-sample'
          )
          setRequests([])
        }
      } catch (error: any) {
        console.error('Lỗi khi tải yêu cầu:', error)
        // Không đặt dữ liệu mẫu cho requests vì có thể nhạy cảm
        setRequests([])
      }

      // Lấy dữ liệu materialImportRequests
      try {
        const materialImportRequestsSnapshot = await getDocs(
          collection(db, 'materialImportRequests')
        )
        const materialImportRequestsData =
          materialImportRequestsSnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt?.toDate() || new Date()
            } as MaterialImportRequest
          })
        setMaterialImportRequests(materialImportRequestsData)
        console.log(
          'Đã tải',
          materialImportRequestsData.length,
          'yêu cầu nhập nguyên vật liệu'
        )
      } catch (error: any) {
        console.error('Lỗi khi tải yêu cầu nhập nguyên vật liệu:', error)
        setMaterialImportRequests([])
      }

      console.log('Tải dữ liệu từ Firestore hoàn tất')
    } catch (error: any) {
      console.error('Lỗi khi tải dữ liệu từ Firestore:', error)
      setError(`Lỗi khi tải dữ liệu từ Firestore: ${error.message}`)
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
      // Sử dụng phương thức xác thực hiện tại
      const authenticated = isAuthenticated()
      if (!authenticated) {
        console.warn('Người dùng chưa đăng nhập, không thể kiểm tra tiêu đề')
        return false
      }

      try {
        const q = query(collection(db, 'requests'), where('title', '==', title))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) return false

        // Nếu có excludeId, kiểm tra xem có request nào khác có cùng title không
        if (excludeId) {
          return querySnapshot.docs.some((doc) => doc.id !== excludeId)
        }

        return true
      } catch (error) {
        console.error('Lỗi khi kiểm tra tiêu đề:', error)
        return false
      }
    },
    []
  )

  // Thêm yêu cầu mới
  const addRequest = useCallback(
    async (
      request: Omit<
        Request,
        'id' | 'code' | 'createdAt' | 'updatedAt' | 'history'
      >
    ) => {
      // Sử dụng phương thức xác thực hiện tại
      const authenticated = isAuthenticated()
      if (!authenticated) {
        console.error('Người dùng chưa đăng nhập, không thể thêm yêu cầu')
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này')
      }

      try {
        const now = new Date()
        const nowTimestamp = Timestamp.fromDate(now)
        const code = request.code || generateRequestCode(request.dataSource)

        // Create a deep copy and sanitize the request object
        const sanitizedRequest = JSON.parse(
          JSON.stringify(request, (key, value) => {
            // Replace undefined with null during stringification
            return value === undefined ? null : value
          })
        )

        // Log the sanitized request for debugging
        console.log(
          'Sanitized request:',
          JSON.stringify(sanitizedRequest, null, 2)
        )

        // Final safety check - recursively check for any undefined values
        const findUndefined = (obj: any, path = ''): string[] => {
          const undefinedPaths: string[] = []

          if (obj === undefined) {
            undefinedPaths.push(path)
            return undefinedPaths
          }

          if (obj === null || typeof obj !== 'object') {
            return undefinedPaths
          }

          if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              const childPaths = findUndefined(item, `${path}[${index}]`)
              undefinedPaths.push(...childPaths)
            })
          } else {
            Object.entries(obj).forEach(([key, value]) => {
              const newPath = path ? `${path}.${key}` : key
              if (value === undefined) {
                undefinedPaths.push(newPath)
              } else if (typeof value === 'object' && value !== null) {
                const childPaths = findUndefined(value, newPath)
                undefinedPaths.push(...childPaths)
              }
            })
          }

          return undefinedPaths
        }

        const undefinedPaths = findUndefined(sanitizedRequest)
        if (undefinedPaths.length > 0) {
          console.error('Found undefined values at paths:', undefinedPaths)
          // Replace any remaining undefined values with null
          undefinedPaths.forEach((path) => {
            const parts = path.split('.')
            let current = sanitizedRequest
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i]
              if (part.includes('[') && part.includes(']')) {
                const arrayName = part.substring(0, part.indexOf('['))
                const index = Number.parseInt(
                  part.substring(part.indexOf('[') + 1, part.indexOf(']'))
                )
                current = current[arrayName][index]
              } else {
                current = current[part]
              }
            }
            const lastPart = parts[parts.length - 1]
            if (lastPart.includes('[') && lastPart.includes(']')) {
              const arrayName = lastPart.substring(0, lastPart.indexOf('['))
              const index = Number.parseInt(
                lastPart.substring(
                  lastPart.indexOf('[') + 1,
                  lastPart.indexOf(']')
                )
              )
              current[arrayName][index] = null
            } else {
              current[lastPart] = null
            }
          })
        }

        const newRequest = {
          ...sanitizedRequest,
          code,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          history: [
            {
              id: `h${Date.now()}`,
              action: 'Tạo yêu cầu',
              user: sanitizedRequest.creator,
              userName: sanitizedRequest.creator.name,
              timestamp: nowTimestamp
            }
          ]
        }

        // Convert Date objects to Firestore Timestamps
        const firestoreData = convertDateToTimestamp(newRequest)

        // Final check for any remaining undefined values
        const finalCheck = JSON.stringify(firestoreData, (key, value) => {
          if (value === undefined) {
            console.error(`Final check: Found undefined value for key: ${key}`)
            return null
          }
          return value
        })

        // Parse back to object to ensure all undefined values are replaced with null
        const finalData = JSON.parse(finalCheck)

        console.log('Final data to be sent to Firestore:', finalData)

        const docRef = await addDoc(collection(db, 'requests'), finalData)

        // Cập nhật state
        const addedRequest = {
          ...newRequest,
          id: docRef.id,
          createdAt: now,
          updatedAt: now
        } as Request

        setRequests((prev) => [...prev, addedRequest])

        return docRef.id
      } catch (error: any) {
        console.error('Lỗi khi thêm yêu cầu:', error)
        throw new Error(`Lỗi khi thêm yêu cầu: ${error.message}`)
      }
    },
    [generateRequestCode]
  )

  // Cập nhật yêu cầu
  const updateRequest = useCallback(
    async (
      id: string,
      request: Partial<
        Omit<Request, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'history'>
      >
    ) => {
      // Sử dụng phương thức xác thực hiện tại
      const authenticated = isAuthenticated()
      if (!authenticated) {
        console.error('Người dùng chưa đăng nhập, không thể cập nhật yêu cầu')
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này')
      }

      if (!id) {
        throw new Error('ID yêu cầu không hợp lệ')
      }

      try {
        const requestRef = doc(db, 'requests', id)

        // Sửa lỗi: Thay vì sử dụng where("__name__", "==", id), sử dụng doc() trực tiếp
        const requestDoc = await getDoc(requestRef)

        if (!requestDoc.exists()) {
          throw new Error(`Không tìm thấy yêu cầu với ID: ${id}`)
        }

        const oldRequest = {
          ...requestDoc.data(),
          id: requestDoc.id
        } as Request

        const now = new Date()
        const nowTimestamp = Timestamp.fromDate(now)

        // Đảm bảo referenceLink không bao giờ là undefined
        const safeRequest = {
          ...request,
          referenceLink:
            request.referenceLink === undefined
              ? oldRequest.referenceLink || ''
              : request.referenceLink
        }

        // Xác định các trường đã thay đổi
        const changedFields: string[] = []
        const oldValues: Record<string, any> = {}
        const newValues: Record<string, any> = {}

        Object.keys(safeRequest).forEach((key) => {
          const typedKey = key as keyof typeof safeRequest
          if (
            safeRequest[typedKey] !== undefined &&
            JSON.stringify(oldRequest[typedKey]) !==
              JSON.stringify(safeRequest[typedKey])
          ) {
            changedFields.push(key)
            oldValues[key] = oldRequest[typedKey]
            newValues[key] = safeRequest[typedKey]
          }
        })

        const historyEntry = {
          id: `h${Date.now()}`,
          action: 'update',
          user: safeRequest.creator || oldRequest.creator,
          userName: (safeRequest.creator || oldRequest.creator).name,
          timestamp: nowTimestamp, // Sử dụng Timestamp thay vì serverTimestamp() trong mảng
          changedFields,
          oldValues,
          newValues,
          details: `Đã cập nhật: ${changedFields.join(', ')}`
        }

        // Chuẩn bị dữ liệu cập nhật
        const updatedRequest = {
          ...safeRequest,
          updatedAt: serverTimestamp(),
          history: [...(oldRequest.history || []), historyEntry]
        }

        // Loại bỏ các thuộc tính undefined
        const cleanedRequest = removeUndefined(updatedRequest)

        // Chuyển đổi tất cả các giá trị undefined còn sót lại thành null
        const safeData = replaceUndefinedWithNull(cleanedRequest)

        // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
        const firestoreData = convertDateToTimestamp(safeData)

        // Kiểm tra và loại bỏ các giá trị không hợp lệ
        const sanitizedData = JSON.parse(
          JSON.stringify(firestoreData, (key, value) => {
            // Chuyển đổi undefined thành null
            if (value === undefined) {
              console.warn(
                `Found undefined value for key: ${key}, converting to null`
              )
              return null
            }
            return value
          })
        )

        // Kiểm tra xem có trường nào có giá trị undefined không
        const checkForUndefined = (obj: any, path = ''): string[] => {
          const undefinedPaths: string[] = []

          if (obj === undefined) {
            undefinedPaths.push(path)
            return undefinedPaths
          }

          if (obj === null || typeof obj !== 'object') {
            return undefinedPaths
          }

          if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              const childPaths = checkForUndefined(item, `${path}[${index}]`)
              undefinedPaths.push(...childPaths)
            })
          } else {
            Object.entries(obj).forEach(([key, value]) => {
              const newPath = path ? `${path}.${key}` : key
              if (value === undefined) {
                undefinedPaths.push(newPath)
              } else if (typeof value === 'object' && value !== null) {
                const childPaths = checkForUndefined(value, newPath)
                undefinedPaths.push(...childPaths)
              }
            })
          }

          return undefinedPaths
        }

        const undefinedPaths = checkForUndefined(sanitizedData)
        if (undefinedPaths.length > 0) {
          console.error(
            'Still found undefined values at paths:',
            undefinedPaths
          )
          throw new Error(
            `Dữ liệu cập nhật chứa giá trị undefined tại: ${undefinedPaths.join(', ')}`
          )
        }

        await updateDoc(requestRef, sanitizedData)

        // Cập nhật state
        setRequests((prev) =>
          prev.map((r) => {
            if (r.id === id) {
              return {
                ...r,
                ...safeRequest,
                updatedAt: now,
                history: [
                  ...(r.history || []),
                  {
                    ...historyEntry,
                    timestamp: now // Chuyển đổi Timestamp thành Date cho state
                  }
                ]
              }
            }
            return r
          })
        )
      } catch (error: any) {
        console.error('Lỗi khi cập nhật yêu cầu:', error)
        throw new Error(`Lỗi khi cập nhật yêu cầu: ${error.message}`)
      }
    },
    []
  )

  // Xóa yêu cầu
  const deleteRequest = useCallback(async (id: string) => {
    // Sử dụng phương thức xác thực hiện tại
    const authenticated = isAuthenticated()
    if (!authenticated) {
      console.error('Người dùng chưa đăng nhập, không thể xóa yêu cầu')
      throw new Error('Bạn cần đăng nhập để thực hiện thao tác này')
    }

    if (!id) {
      throw new Error('ID yêu cầu không hợp lệ')
    }

    try {
      await deleteDoc(doc(db, 'requests', id))

      // Cập nhật state
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (error: any) {
      console.error('Lỗi khi xóa yêu cầu:', error)
      throw new Error(`Lỗi khi xóa yêu cầu: ${error.message}`)
    }
  }, [])

  // Lấy yêu cầu theo ID
  const getRequestById = useCallback(async (id: string) => {
    // Sử dụng phương thức xác thực hiện tại thay vì kiểm tra isAuthenticated
    const authenticated = isAuthenticated()
    if (!authenticated) {
      console.warn('Người dùng chưa đăng nhập, không thể lấy yêu cầu theo ID')
      return undefined
    }

    if (!id) {
      console.warn('ID yêu cầu không hợp lệ')
      return undefined
    }

    try {
      // Get the document directly using doc() and getDoc()
      const requestDocRef = doc(db, 'requests', id)
      const requestDocSnap = await getDoc(requestDocRef)

      if (!requestDocSnap.exists()) {
        console.log(`Không tìm thấy yêu cầu với ID: ${id}`)
        return undefined
      }

      const data = requestDocSnap.data()

      // Ensure all required fields exist with default values
      const safeData = {
        ...data,
        creator: data.creator || { id: 'unknown', name: 'Không xác định' },
        dataSource: data.dataSource || {
          id: 'unknown',
          type: 'other',
          name: 'Không xác định'
        },
        images: data.images || [],
        materials: data.materials || [],
        history: data.history || [],
        status: data.status || 'pending'
      }

      // Chuyển đổi Timestamp sang Date
      return {
        ...safeData,
        id: requestDocSnap.id,
        createdAt: safeData.createdAt?.toDate() || new Date(),
        updatedAt: safeData.updatedAt?.toDate() || new Date(),
        history: (safeData.history || []).map((h: any) => ({
          ...h,
          user: h.user || { id: 'unknown', name: 'Không xác định' },
          userName: h.userName || h.user?.name || 'Không xác định',
          timestamp: h.timestamp?.toDate() || new Date()
        }))
      } as Request
    } catch (error: any) {
      console.error('Lỗi khi lấy yêu cầu theo ID:', error)
      return undefined
    }
  }, [])

  // Thêm nguồn dữ liệu mới
  const addDataSource = useCallback(
    async (dataSource: Omit<DataSource, 'id'>) => {
      // Sử dụng phương thức xác thực hiện tại
      const authenticated = isAuthenticated()
      if (!authenticated) {
        console.error('Người dùng chưa đăng nhập, không thể thêm nguồn dữ liệu')
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này')
      }

      try {
        // Đảm bảo specificSource không bao giờ là undefined
        const safeDataSource = {
          ...dataSource,
          specificSource: dataSource.specificSource || ''
        }

        const docRef = await addDoc(
          collection(db, 'dataSources'),
          safeDataSource
        )

        // Cập nhật state
        const newDataSource = {
          ...safeDataSource,
          id: docRef.id
        } as DataSource

        setDataSources((prev) => [...prev, newDataSource])

        return docRef.id
      } catch (error: any) {
        console.error('Lỗi khi thêm nguồn dữ liệu:', error)
        throw new Error(`Lỗi khi thêm nguồn dữ liệu: ${error.message}`)
      }
    },
    []
  )

  // Thêm yêu cầu nhập nguyên vật liệu
  const addMaterialImportRequest = useCallback(
    async (
      materialImportRequest: Omit<MaterialImportRequest, 'id' | 'createdAt'>
    ) => {
      // Sử dụng phương thức xác thực hiện tại
      const authenticated = isAuthenticated()
      if (!authenticated) {
        console.error(
          'Người dùng chưa đăng nhập, không thể thêm yêu cầu nhập nguyên vật liệu'
        )
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này')
      }

      try {
        // Đảm bảo các trường không bao giờ là undefined
        const safeMaterialImportRequest = {
          ...materialImportRequest,
          expectedDate: materialImportRequest.expectedDate || '',
          supplier: materialImportRequest.supplier || '',
          reason: materialImportRequest.reason || '',
          sourceCountry: materialImportRequest.sourceCountry || '',
          importPrice: materialImportRequest.importPrice || 0
        }

        const newMaterialImportRequest = {
          ...safeMaterialImportRequest,
          createdAt: serverTimestamp()
        }

        // Loại bỏ các thuộc tính undefined
        const cleanedRequest = removeUndefined(newMaterialImportRequest)

        // Chuyển đổi tất cả các giá trị undefined còn sót lại thành null
        const safeData = replaceUndefinedWithNull(cleanedRequest)

        // Chuyển đổi Date sang Timestamp trước khi lưu vào Firestore
        const firestoreData = convertDateToTimestamp(safeData)

        const docRef = await addDoc(
          collection(db, 'materialImportRequests'),
          firestoreData
        )

        // Cập nhật state
        const addedRequest = {
          ...newMaterialImportRequest,
          id: docRef.id,
          createdAt: new Date()
        } as MaterialImportRequest

        setMaterialImportRequests((prev) => [...prev, addedRequest])

        // Đồng bộ với MaterialContext nếu có
        if (addMaterialRequestToMaterialContext) {
          addMaterialRequestToMaterialContext({
            materialId: safeMaterialImportRequest.materialId,
            quantity: safeMaterialImportRequest.quantity,
            expectedDate:
              safeMaterialImportRequest.expectedDate ||
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            supplier: safeMaterialImportRequest.supplier || '',
            status: 'pending',
            reason:
              safeMaterialImportRequest.reason ||
              'Yêu cầu từ phát triển sản phẩm',
            sourceCountry: safeMaterialImportRequest.sourceCountry,
            importPrice: safeMaterialImportRequest.importPrice,
            requestCode: safeMaterialImportRequest.requestCode
          })
        }

        return docRef.id
      } catch (error: any) {
        console.error('Lỗi khi thêm yêu cầu nhập nguyên vật liệu:', error)
        throw new Error(
          `Lỗi khi thêm yêu cầu nhập nguyên vật liệu: ${error.message}`
        )
      }
    },
    [addMaterialRequestToMaterialContext]
  )

  // Làm mới dữ liệu từ Firestore
  const refreshData = useCallback(async () => {
    // Sử dụng phương thức xác thực hiện tại
    const authenticated = isAuthenticated()
    if (!authenticated) {
      console.warn('Người dùng chưa đăng nhập, không thể làm mới dữ liệu')
      return
    }

    await fetchData()
  }, [])

  const value = {
    requests,
    dataSources,
    productStatuses,
    materialImportRequests,
    addRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    addDataSource,
    generateRequestCode,
    isTitleExists,
    addMaterialImportRequest,
    refreshData,
    loading,
    error,
    isAuthenticated: isAuthenticatedState,
    checkAndCreateRequestsCollection
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
