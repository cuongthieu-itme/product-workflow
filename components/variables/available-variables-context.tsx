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
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from '@/components/ui/use-toast'

// Định nghĩa kiểu dữ liệu cho biến có sẵn
export interface AvailableVariable {
  id: string
  name: string
  description: string
  source: 'request' | 'system' | 'custom'
  type: 'text' | 'date' | 'user' | 'number' | 'select' | 'currency' | 'checkbox'
  options?: string[] // Cho trường select
  defaultValue?: string | boolean | number
  isRequired?: boolean
  userSource?: 'users' | 'customers' // Thêm trường userSource cho type user
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

interface AvailableVariablesContextType {
  variables: AvailableVariable[]
  loading: boolean

  // CRUD operations
  addVariable: (
    variable: Omit<AvailableVariable, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
  updateVariable: (
    id: string,
    updates: Partial<Omit<AvailableVariable, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>
  deleteVariable: (id: string) => Promise<void>
  getVariableById: (id: string) => AvailableVariable | undefined

  // Validation
  isVariableNameExists: (name: string, excludeId?: string) => boolean

  // Filtering
  getVariablesBySource: (source: string) => AvailableVariable[]
  getVariablesByType: (type: string) => AvailableVariable[]
  getUserVariables: () => AvailableVariable[]
}

const AvailableVariablesContext = createContext<
  AvailableVariablesContextType | undefined
>(undefined)

const COLLECTION_NAME = 'availableVariables'

export function AvailableVariablesProvider({
  children
}: {
  children: ReactNode
}) {
  const [variables, setVariables] = useState<AvailableVariable[]>([])
  const [loading, setLoading] = useState(true)

  // Lắng nghe thay đổi từ Firestore
  useEffect(() => {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const variablesData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as AvailableVariable
        })

        setVariables(variablesData)
        setLoading(false)
      },
      (error) => {
        console.error('Lỗi khi lắng nghe availableVariables:', error)
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách biến có sẵn',
          variant: 'destructive'
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Thêm biến mới
  const addVariable = async (
    variable: Omit<AvailableVariable, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      // Kiểm tra trùng tên
      if (isVariableNameExists(variable.name)) {
        throw new Error('Tên biến đã tồn tại')
      }

      const now = new Date()

      // Loại bỏ các trường undefined trước khi lưu
      const cleanData = Object.fromEntries(
        Object.entries({
          ...variable,
          createdAt: now,
          updatedAt: now
        }).filter(([_, value]) => value !== undefined)
      )

      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData)

      toast({
        title: 'Thành công',
        description: `Đã thêm biến "${variable.name}"`
      })

      return docRef.id
    } catch (error) {
      console.error('Lỗi khi thêm biến:', error)
      toast({
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể thêm biến',
        variant: 'destructive'
      })
      throw error
    }
  }

  // Cập nhật biến
  const updateVariable = async (
    id: string,
    updates: Partial<Omit<AvailableVariable, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      // Kiểm tra trùng tên (nếu có thay đổi tên)
      if (updates.name && isVariableNameExists(updates.name, id)) {
        throw new Error('Tên biến đã tồn tại')
      }

      // Loại bỏ các trường undefined trước khi cập nhật
      const cleanUpdates = Object.fromEntries(
        Object.entries({
          ...updates,
          updatedAt: new Date()
        }).filter(([_, value]) => value !== undefined)
      )

      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, cleanUpdates)

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật biến'
      })
    } catch (error) {
      console.error('Lỗi khi cập nhật biến:', error)
      toast({
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể cập nhật biến',
        variant: 'destructive'
      })
      throw error
    }
  }

  // Xóa biến
  const deleteVariable = async (id: string) => {
    try {
      const variable = getVariableById(id)
      if (!variable) {
        throw new Error('Không tìm thấy biến')
      }

      // Không cho phép xóa biến hệ thống
      if (variable.source === 'system' || variable.source === 'request') {
        throw new Error('Không thể xóa biến hệ thống')
      }

      const docRef = doc(db, COLLECTION_NAME, id)
      await deleteDoc(docRef)

      toast({
        title: 'Thành công',
        description: `Đã xóa biến "${variable.name}"`
      })
    } catch (error) {
      console.error('Lỗi khi xóa biến:', error)
      toast({
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể xóa biến',
        variant: 'destructive'
      })
      throw error
    }
  }

  // Lấy biến theo ID
  const getVariableById = (id: string) => {
    return variables.find((variable) => variable.id === id)
  }

  // Kiểm tra tên biến đã tồn tại
  const isVariableNameExists = (name: string, excludeId?: string) => {
    return variables.some(
      (variable) =>
        variable.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        variable.id !== excludeId
    )
  }

  // Lọc biến theo nguồn
  const getVariablesBySource = (source: string) => {
    return variables.filter((variable) => variable.source === source)
  }

  // Lọc biến theo loại
  const getVariablesByType = (type: string) => {
    return variables.filter((variable) => variable.type === type)
  }

  // Lấy các biến người dùng
  const getUserVariables = () => {
    return variables.filter((variable) => variable.type === 'user')
  }

  return (
    <AvailableVariablesContext.Provider
      value={{
        variables,
        loading,
        addVariable,
        updateVariable,
        deleteVariable,
        getVariableById,
        isVariableNameExists,
        getVariablesBySource,
        getVariablesByType,
        getUserVariables
      }}
    >
      {children}
    </AvailableVariablesContext.Provider>
  )
}

export function useAvailableVariables() {
  const context = useContext(AvailableVariablesContext)
  if (context === undefined) {
    throw new Error(
      'useAvailableVariables must be used within an AvailableVariablesProvider'
    )
  }
  return context
}
