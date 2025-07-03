'use client'

import {
  useContext,
  useState,
  useEffect,
  type ReactNode,
  createContext
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
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'
// Import ProductStatusContext - REMOVED
// import { ProductStatusContext } from "./product-status-context"

// Định nghĩa kiểu dữ liệu
export interface ProductStatus {
  id: string
  name: string
  description: string
  color: string
  order: number
  isDefault?: boolean
  workflowId?: string // ID của quy trình được gán cho trạng thái
  createdAt: string
  updatedAt: string
}

interface ProductStatusContextType {
  productStatuses: ProductStatus[]
  loading: boolean
  error: string | null
  addProductStatus: (
    status: Omit<ProductStatus, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
  updateProductStatus: (
    id: string,
    status: Partial<Omit<ProductStatus, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>
  deleteProductStatus: (id: string) => Promise<boolean>
  getProductStatusById: (id: string) => Promise<ProductStatus | null>
  reorderProductStatuses: (statuses: ProductStatus[]) => Promise<void>
  refreshProductStatuses: () => Promise<void>
  isProductStatusNameExists: (name: string, excludeId?: string) => boolean
  assignWorkflowToStatus: (
    statusId: string,
    workflowId: string
  ) => Promise<void>
  getStandardWorkflowId: () => string // Hàm lấy ID của quy trình chuẩn
}

const ProductStatusContext = createContext<
  ProductStatusContextType | undefined
>(undefined)

// Mock data for v0 preview
const mockProductStatuses: ProductStatus[] = [
  {
    id: '1',
    name: 'Mới',
    description: 'Sản phẩm mới được tạo',
    color: '#4f46e5',
    order: 0,
    isDefault: true,
    workflowId: 'standard-workflow', // Mặc định sử dụng quy trình chuẩn
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Đang phát triển',
    description: 'Sản phẩm đang trong quá trình phát triển',
    color: '#f59e0b',
    order: 1,
    isDefault: false,
    workflowId: 'standard-workflow', // Mặc định sử dụng quy trình chuẩn
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Hoàn thành',
    description: 'Sản phẩm đã hoàn thành',
    color: '#10b981',
    order: 2,
    isDefault: false,
    workflowId: 'standard-workflow', // Mặc định sử dụng quy trình chuẩn
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// ID của quy trình chuẩn
const STANDARD_WORKFLOW_ID = 'standard-workflow'

export function ProductStatusProvider({ children }: { children: ReactNode }) {
  const [productStatuses, setProductStatuses] = useState<ProductStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(true)

  // Kiểm tra xem Firebase có sẵn không
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Thử truy cập Firestore để kiểm tra kết nối
        const testQuery = query(collection(db, 'test'))
        await getDocs(testQuery)
        setIsFirebaseAvailable(true)
      } catch (err) {
        console.log('Firebase not available, using mock data:', err)
        setIsFirebaseAvailable(false)
        // Sử dụng dữ liệu mẫu nếu không thể kết nối Firebase
        setProductStatuses(mockProductStatuses)
        setLoading(false)
      }
    }

    checkFirebase()
  }, [])

  // Lấy danh sách trạng thái sản phẩm từ Firebase khi component được mount
  useEffect(() => {
    if (isFirebaseAvailable) {
      fetchProductStatuses()
    }
  }, [isFirebaseAvailable])

  // Hàm lấy danh sách trạng thái sản phẩm từ Firebase
  const fetchProductStatuses = async () => {
    if (!isFirebaseAvailable) {
      setProductStatuses(mockProductStatuses)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const statusesRef = collection(db, 'productStatuses')

      // Sử dụng onSnapshot để lắng nghe thay đổi
      const unsubscribe = onSnapshot(
        statusesRef,
        (snapshot) => {
          const statusesData = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              workflowId: data.workflowId || STANDARD_WORKFLOW_ID, // Mặc định sử dụng quy trình chuẩn
              createdAt:
                data.createdAt?.toDate?.()?.toISOString() ||
                new Date().toISOString(),
              updatedAt:
                data.updatedAt?.toDate?.()?.toISOString() ||
                new Date().toISOString()
            } as ProductStatus
          })

          // Sắp xếp theo thứ tự
          statusesData.sort((a, b) => a.order - b.order)

          setProductStatuses(statusesData)
          setError(null)
          setLoading(false)
        },
        (err) => {
          console.error('Error fetching product statuses:', err)
          setError('Failed to fetch product statuses')
          setLoading(false)
          // Fallback to mock data
          setProductStatuses(mockProductStatuses)
        }
      )

      // Cleanup function
      return () => unsubscribe()
    } catch (err) {
      console.error('Error setting up product statuses listener:', err)
      setError('Failed to set up product statuses listener')
      setLoading(false)
      // Fallback to mock data
      setProductStatuses(mockProductStatuses)
    }
  }

  // Thêm trạng thái sản phẩm mới
  const addProductStatus = async (
    status: Omit<ProductStatus, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!isFirebaseAvailable) {
      // Mock implementation for v0 preview
      const newId = `mock-${Date.now()}`
      const newStatus = {
        id: newId,
        ...status,
        workflowId: status.workflowId || STANDARD_WORKFLOW_ID, // Mặc định sử dụng quy trình chuẩn
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setProductStatuses((prev) =>
        [...prev, newStatus].sort((a, b) => a.order - b.order)
      )
      return newId
    }

    try {
      // Tạo trạng thái mới trong Firestore
      const statusData = {
        name: status.name,
        description: status.description,
        color: status.color || '#4f46e5', // Default color
        order: status.order || productStatuses.length, // Default to end of list
        isDefault: status.isDefault || false,
        workflowId: status.workflowId || STANDARD_WORKFLOW_ID, // Mặc định sử dụng quy trình chuẩn
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const statusRef = await addDoc(
        collection(db, 'productStatuses'),
        statusData
      )

      // Lấy dữ liệu vừa thêm
      const newStatus = {
        id: statusRef.id,
        ...statusData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ProductStatus

      return statusRef.id
    } catch (err) {
      console.error('Error adding product status:', err)
      toast({
        title: 'Lỗi',
        description:
          'Không thể thêm trạng thái sản phẩm. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
      throw new Error('Failed to add product status')
    }
  }

  // Cập nhật trạng thái sản phẩm
  const updateProductStatus = async (
    id: string,
    status: Partial<Omit<ProductStatus, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    if (!isFirebaseAvailable) {
      // Mock implementation for v0 preview
      setProductStatuses((prev) =>
        prev
          .map((item) =>
            item.id === id
              ? { ...item, ...status, updatedAt: new Date().toISOString() }
              : item
          )
          .sort((a, b) => a.order - b.order)
      )
      return
    }

    try {
      const statusRef = doc(db, 'productStatuses', id)

      // Cập nhật trạng thái trong Firestore
      await updateDoc(statusRef, {
        ...status,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating product status:', err)
      toast({
        title: 'Lỗi',
        description:
          'Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
      throw new Error('Failed to update product status')
    }
  }

  // Xóa trạng thái sản phẩm
  const deleteProductStatus = async (id: string): Promise<boolean> => {
    if (!isFirebaseAvailable) {
      // Mock implementation for v0 preview
      const statusToDelete = productStatuses.find((s) => s.id === id)
      if (statusToDelete?.isDefault) {
        toast({
          title: 'Không thể xóa',
          description: 'Không thể xóa trạng thái mặc định.',
          variant: 'destructive'
        })
        return false
      }
      setProductStatuses((prev) => prev.filter((item) => item.id !== id))
      return true
    }

    try {
      // Kiểm tra xem trạng thái có phải là mặc định không
      const statusRef = doc(db, 'productStatuses', id)
      const statusSnap = await getDoc(statusRef)

      if (!statusSnap.exists()) {
        toast({
          title: 'Lỗi',
          description: 'Không tìm thấy trạng thái sản phẩm.',
          variant: 'destructive'
        })
        return false
      }

      const statusData = statusSnap.data()

      if (statusData.isDefault) {
        toast({
          title: 'Không thể xóa',
          description: 'Không thể xóa trạng thái mặc định.',
          variant: 'destructive'
        })
        return false
      }

      // Xóa trạng thái
      await deleteDoc(statusRef)

      return true
    } catch (err) {
      console.error('Error deleting product status:', err)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa trạng thái sản phẩm. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
      return false
    }
  }

  // Lấy trạng thái sản phẩm theo ID
  const getProductStatusById = async (
    id: string
  ): Promise<ProductStatus | null> => {
    if (!isFirebaseAvailable) {
      // Mock implementation for v0 preview
      const status = mockProductStatuses.find((s) => s.id === id)
      return status || null
    }

    try {
      const statusRef = doc(db, 'productStatuses', id)
      const statusSnap = await getDoc(statusRef)

      if (!statusSnap.exists()) {
        return null
      }

      const data = statusSnap.data()

      return {
        id: statusSnap.id,
        ...data,
        workflowId: data.workflowId || STANDARD_WORKFLOW_ID, // Mặc định sử dụng quy trình chuẩn
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as ProductStatus
    } catch (err) {
      console.error('Error getting product status:', err)
      return null
    }
  }

  // Sắp xếp lại thứ tự các trạng thái
  const reorderProductStatuses = async (
    statuses: ProductStatus[]
  ): Promise<void> => {
    if (!isFirebaseAvailable) {
      // Mock implementation for v0 preview
      setProductStatuses(
        statuses.map((status, index) => ({
          ...status,
          order: index,
          updatedAt: new Date().toISOString()
        }))
      )
      return
    }

    try {
      // Cập nhật thứ tự trong Firestore
      for (const [index, status] of statuses.entries()) {
        const statusRef = doc(db, 'productStatuses', status.id)
        await updateDoc(statusRef, {
          order: index,
          updatedAt: serverTimestamp()
        })
      }
    } catch (err) {
      console.error('Error reordering product statuses:', err)
      toast({
        title: 'Lỗi',
        description:
          'Không thể sắp xếp lại trạng thái sản phẩm. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
      throw new Error('Failed to reorder product statuses')
    }
  }

  // Làm mới danh sách trạng thái sản phẩm
  const refreshProductStatuses = async (): Promise<void> => {
    await fetchProductStatuses()
  }

  // Kiểm tra xem tên trạng thái đã tồn tại chưa
  const isProductStatusNameExists = (
    name: string,
    excludeId?: string
  ): boolean => {
    return productStatuses.some(
      (status) =>
        status.name.toLowerCase() === name.toLowerCase() &&
        status.id !== excludeId
    )
  }

  // Cập nhật hàm assignWorkflowToStatus để cập nhật quy trình con
  const assignWorkflowToStatus = async (
    statusId: string,
    workflowId: string
  ): Promise<void> => {
    if (!isFirebaseAvailable) {
      // Mock implementation for v0 preview
      setProductStatuses((prev) =>
        prev.map((status) =>
          status.id === statusId
            ? { ...status, workflowId, updatedAt: new Date().toISOString() }
            : status
        )
      )
      return
    }

    try {
      const statusRef = doc(db, 'productStatuses', statusId)

      // Cập nhật workflowId trong Firestore
      await updateDoc(statusRef, {
        workflowId,
        updatedAt: serverTimestamp()
      })

      // Cập nhật statusId trong quy trình con nếu workflowId không phải là quy trình chuẩn
      if (workflowId !== STANDARD_WORKFLOW_ID) {
        const workflowRef = doc(db, 'subWorkflows', workflowId)

        try {
          // Kiểm tra xem quy trình có tồn tại không
          const workflowSnap = await getDoc(workflowRef)

          if (workflowSnap.exists()) {
            // Cập nhật statusId trong quy trình con
            await updateDoc(workflowRef, {
              statusId: statusId,
              statusName:
                productStatuses.find((s) => s.id === statusId)?.name || '',
              updatedAt: serverTimestamp()
            })
            console.log(
              `Updated sub-workflow ${workflowId} with status ${statusId}`
            )
          }
        } catch (err) {
          console.error('Error updating sub-workflow with status ID:', err)
          // Không throw lỗi ở đây để không ảnh hưởng đến việc cập nhật trạng thái
        }
      }

      toast({
        title: 'Thành công',
        description: 'Đã gán quy trình cho trạng thái.'
      })
    } catch (err) {
      console.error('Error assigning workflow to status:', err)
      toast({
        title: 'Lỗi',
        description:
          'Không thể gán quy trình cho trạng thái. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
      throw new Error('Failed to assign workflow to status')
    }
  }

  // Lấy ID của quy trình chuẩn
  const getStandardWorkflowId = (): string => {
    return STANDARD_WORKFLOW_ID
  }

  const value = {
    productStatuses,
    loading,
    error,
    addProductStatus,
    updateProductStatus,
    deleteProductStatus,
    getProductStatusById,
    reorderProductStatuses,
    refreshProductStatuses,
    isProductStatusNameExists,
    assignWorkflowToStatus,
    getStandardWorkflowId
  }

  return (
    <ProductStatusContext.Provider value={value}>
      {children}
    </ProductStatusContext.Provider>
  )
}

export function useProductStatus() {
  const context = useContext(ProductStatusContext)
  if (context === undefined) {
    throw new Error(
      'useProductStatus must be used within a ProductStatusProvider'
    )
  }
  return context
}
