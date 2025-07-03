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
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Định nghĩa kiểu dữ liệu
export interface ProductStatus {
  id: string
  name: string
  description: string
  color: string
  order: number
  isDefault?: boolean
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
}

const ProductStatusContext = createContext<
  ProductStatusContextType | undefined
>(undefined)

export function ProductStatusProvider({ children }: { children: ReactNode }) {
  const [productStatuses, setProductStatuses] = useState<ProductStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lấy danh sách trạng thái sản phẩm từ Firebase khi component được mount
  useEffect(() => {
    fetchProductStatuses()
  }, [])

  // Hàm lấy danh sách trạng thái sản phẩm từ Firebase
  const fetchProductStatuses = async () => {
    setLoading(true)
    try {
      const statusesRef = collection(db, 'productStatuses')
      const snapshot = await getDocs(statusesRef)

      const statusesData = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
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
    } catch (err) {
      console.error('Error fetching product statuses:', err)
      setError('Failed to fetch product statuses')
    } finally {
      setLoading(false)
    }
  }

  // Thêm trạng thái sản phẩm mới
  const addProductStatus = async (
    status: Omit<ProductStatus, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    try {
      // Tạo trạng thái mới trong Firestore
      const statusData = {
        name: status.name,
        description: status.description,
        color: status.color,
        order: status.order,
        isDefault: status.isDefault || false,
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

      // Cập nhật state
      setProductStatuses((prev) =>
        [...prev, newStatus].sort((a, b) => a.order - b.order)
      )

      return statusRef.id
    } catch (err) {
      console.error('Error adding product status:', err)
      throw new Error('Failed to add product status')
    }
  }

  // Cập nhật trạng thái sản phẩm
  const updateProductStatus = async (
    id: string,
    status: Partial<Omit<ProductStatus, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    try {
      const statusRef = doc(db, 'productStatuses', id)

      // Cập nhật trạng thái trong Firestore
      await updateDoc(statusRef, {
        ...status,
        updatedAt: serverTimestamp()
      })

      // Cập nhật state
      setProductStatuses((prev) => {
        const updated = prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              ...status,
              updatedAt: new Date().toISOString()
            }
          }
          return item
        })
        return updated.sort((a, b) => a.order - b.order)
      })
    } catch (err) {
      console.error('Error updating product status:', err)
      throw new Error('Failed to update product status')
    }
  }

  // Xóa trạng thái sản phẩm
  const deleteProductStatus = async (id: string): Promise<boolean> => {
    try {
      // Kiểm tra xem trạng thái có phải là mặc định không
      const statusRef = doc(db, 'productStatuses', id)
      const statusSnap = await getDoc(statusRef)

      if (!statusSnap.exists()) {
        return false
      }

      const statusData = statusSnap.data()

      if (statusData.isDefault) {
        return false // Không thể xóa trạng thái mặc định
      }

      // Xóa trạng thái
      await deleteDoc(statusRef)

      // Cập nhật state
      setProductStatuses((prev) => prev.filter((item) => item.id !== id))

      return true
    } catch (err) {
      console.error('Error deleting product status:', err)
      return false
    }
  }

  // Lấy trạng thái sản phẩm theo ID
  const getProductStatusById = async (
    id: string
  ): Promise<ProductStatus | null> => {
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
    try {
      // Cập nhật thứ tự trong Firestore
      for (const [index, status] of statuses.entries()) {
        const statusRef = doc(db, 'productStatuses', status.id)
        await updateDoc(statusRef, {
          order: index,
          updatedAt: serverTimestamp()
        })
      }

      // Cập nhật state
      setProductStatuses(
        statuses.map((status, index) => ({
          ...status,
          order: index,
          updatedAt: new Date().toISOString()
        }))
      )
    } catch (err) {
      console.error('Error reordering product statuses:', err)
      throw new Error('Failed to reorder product statuses')
    }
  }

  // Làm mới danh sách trạng thái sản phẩm
  const refreshProductStatuses = async (): Promise<void> => {
    await fetchProductStatuses()
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
    refreshProductStatuses
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
