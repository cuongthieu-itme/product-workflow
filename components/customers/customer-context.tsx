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
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  source?: string
  gender?: string
  birthDate?: string
  requests?: string[] // Thêm field để lưu danh sách ID yêu cầu
  createdAt?: string
  updatedAt?: string
}

interface CustomerContextType {
  customers: Customer[]
  loading: boolean
  error: string | null
  customerSources: string[]
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  getCustomerById: (id: string) => Customer | undefined
  refreshData: () => Promise<void>
  addCustomerSource: (source: string) => void
  checkPhoneExists: (phone: string, excludeId?: string) => Promise<boolean>
  addRequestToCustomer: (customerId: string, requestId: string) => Promise<void> // Thêm method mới
  checkEmailExists: (email: string, excludeId?: string) => Promise<boolean>
}

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerSources] = useState<string[]>([
    'Website',
    'Facebook',
    'Instagram',
    'Google Ads',
    'Giới thiệu',
    'Khác'
  ])
  const { toast } = useToast()

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Fetching customers from Firebase...')

      const customersRef = collection(db, 'customers')
      const snapshot = await getDocs(customersRef)

      const customersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[]

      console.log('✅ Customers fetched:', customersList.length)
      setCustomers(customersList)
    } catch (err) {
      console.error('❌ Error fetching customers:', err)
      setError(
        err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu khách hàng'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    refreshData()
  }, [refreshData])

  const checkPhoneExists = useCallback(
    async (phone: string, excludeId?: string): Promise<boolean> => {
      try {
        console.log(
          `🔍 Checking if phone ${phone} exists (excluding ${excludeId})`
        )
        const customersRef = collection(db, 'customers')
        const q = query(customersRef, where('phone', '==', phone))
        const snapshot = await getDocs(q)

        const existingCustomers = snapshot.docs.filter(
          (doc) => doc.id !== excludeId
        )
        const exists = existingCustomers.length > 0

        console.log(`📞 Phone ${phone} exists: ${exists}`)
        return exists
      } catch (error) {
        console.error('❌ Error checking phone:', error)
        return false
      }
    },
    []
  )

  const checkEmailExists = useCallback(
    async (email: string, excludeId?: string): Promise<boolean> => {
      if (!email.trim()) return false

      try {
        console.log(
          `🔍 Checking if email ${email} exists (excluding ${excludeId})`
        )
        const customersRef = collection(db, 'customers')
        const q = query(customersRef, where('email', '==', email.trim()))
        const snapshot = await getDocs(q)

        const existingCustomers = snapshot.docs.filter(
          (doc) => doc.id !== excludeId
        )
        const exists = existingCustomers.length > 0

        console.log(`📧 Email ${email} exists: ${exists}`)
        return exists
      } catch (error) {
        console.error('❌ Error checking email:', error)
        return false
      }
    },
    []
  )

  const addCustomer = useCallback(
    async (customerData: Omit<Customer, 'id'>) => {
      try {
        console.log('🚀 Adding customer:', customerData)

        // Kiểm tra trùng số điện thoại
        const phoneExists = await checkPhoneExists(customerData.phone)
        if (phoneExists) {
          throw new Error(
            `Số điện thoại ${customerData.phone} đã tồn tại trong hệ thống`
          )
        }

        // Kiểm tra trùng email
        if (customerData.email) {
          const emailExists = await checkEmailExists(customerData.email)
          if (emailExists) {
            throw new Error(
              `Email ${customerData.email} đã tồn tại trong hệ thống`
            )
          }
        }

        const now = new Date().toISOString()
        const newCustomer = {
          ...customerData,
          requests: [], // Khởi tạo mảng requests rỗng
          createdAt: now,
          updatedAt: now
        }

        const docRef = await addDoc(collection(db, 'customers'), newCustomer)
        console.log('✅ Customer added with ID:', docRef.id)

        // Cập nhật state local
        setCustomers((prev) => [{ id: docRef.id, ...newCustomer }, ...prev])

        toast({
          title: 'Thêm thành công',
          description: `Đã thêm khách hàng ${customerData.name}`
        })
      } catch (error) {
        console.error('❌ Error adding customer:', error)
        toast({
          title: 'Lỗi',
          description:
            error instanceof Error
              ? error.message
              : 'Không thể thêm khách hàng',
          variant: 'destructive'
        })
        throw error
      }
    },
    [checkPhoneExists, checkEmailExists, toast]
  )

  const updateCustomer = useCallback(
    async (id: string, customerData: Partial<Customer>) => {
      try {
        console.log('📝 Updating customer:', id, customerData)

        // Kiểm tra trùng số điện thoại nếu có thay đổi
        if (customerData.phone) {
          const phoneExists = await checkPhoneExists(customerData.phone, id)
          if (phoneExists) {
            throw new Error(
              `Số điện thoại ${customerData.phone} đã tồn tại trong hệ thống`
            )
          }
        }

        // Kiểm tra trùng email nếu có thay đổi
        if (customerData.email) {
          const emailExists = await checkEmailExists(customerData.email, id)
          if (emailExists) {
            throw new Error(
              `Email ${customerData.email} đã tồn tại trong hệ thống`
            )
          }
        }

        const updatedData = {
          ...customerData,
          updatedAt: new Date().toISOString()
        }

        const customerRef = doc(db, 'customers', id)
        await updateDoc(customerRef, updatedData)
        console.log('✅ Customer updated successfully')

        // Cập nhật state local
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === id ? { ...customer, ...updatedData } : customer
          )
        )

        toast({
          title: 'Cập nhật thành công',
          description: `Đã cập nhật thông tin khách hàng ${customerData.name || ''}`
        })
      } catch (error) {
        console.error('❌ Error updating customer:', error)
        toast({
          title: 'Lỗi',
          description:
            error instanceof Error
              ? error.message
              : 'Không thể cập nhật khách hàng',
          variant: 'destructive'
        })
        throw error
      }
    },
    [checkPhoneExists, checkEmailExists, toast]
  )

  const deleteCustomer = useCallback(
    async (id: string) => {
      try {
        console.log('🗑️ Starting deleteCustomer function with ID:', id)

        if (!id || typeof id !== 'string') {
          throw new Error('ID khách hàng không hợp lệ')
        }

        // Tìm thông tin khách hàng trước khi xóa
        const customerToDelete = customers.find((c) => c.id === id)
        console.log('👤 Customer to delete:', customerToDelete)

        if (!customerToDelete) {
          throw new Error('Không tìm thấy khách hàng')
        }

        console.log('🔥 Attempting to delete from Firestore...')

        // Xóa từ Firestore
        const customerRef = doc(db, 'customers', id)
        await deleteDoc(customerRef)

        console.log('✅ Successfully deleted from Firestore')

        // Cập nhật state local
        setCustomers((prev) => {
          const newCustomers = prev.filter((customer) => customer.id !== id)
          console.log(
            '📊 Updated customers list, new length:',
            newCustomers.length
          )
          return newCustomers
        })

        console.log('🎉 Delete operation completed successfully')

        toast({
          title: 'Xóa thành công',
          description: `Đã xóa khách hàng ${customerToDelete.name || ''}`
        })
      } catch (error) {
        console.error('❌ Error in deleteCustomer:', error)
        toast({
          title: 'Lỗi',
          description:
            error instanceof Error ? error.message : 'Không thể xóa khách hàng',
          variant: 'destructive'
        })
        throw error
      }
    },
    [customers, toast]
  )

  const getCustomerById = useCallback(
    (id: string) => {
      return customers.find((customer) => customer.id === id)
    },
    [customers]
  )

  const addCustomerSource = useCallback((source: string) => {
    // Trong thực tế, bạn có thể lưu vào database
    console.log('➕ Adding customer source:', source)
  }, [])

  // Thêm method để thêm request ID vào customer
  const addRequestToCustomer = useCallback(
    async (customerId: string, requestId: string) => {
      try {
        console.log('🔗 Adding request to customer:', customerId, requestId)

        // Tìm customer trong state
        const customer = customers.find((c) => c.id === customerId)
        if (!customer) {
          console.error('❌ Customer not found:', customerId)
          return
        }

        // Lấy danh sách requests hiện tại hoặc tạo mảng mới
        const currentRequests = customer.requests || []

        // Kiểm tra xem request đã tồn tại chưa
        if (currentRequests.includes(requestId)) {
          console.log('ℹ️ Request already exists in customer requests')
          return
        }

        // Thêm request ID vào mảng
        const updatedRequests = [...currentRequests, requestId]

        // Cập nhật trong Firestore
        const customerRef = doc(db, 'customers', customerId)
        await updateDoc(customerRef, {
          requests: updatedRequests,
          updatedAt: new Date().toISOString()
        })

        // Cập nhật state local
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  requests: updatedRequests,
                  updatedAt: new Date().toISOString()
                }
              : c
          )
        )

        console.log('✅ Successfully added request to customer')

        toast({
          title: 'Thành công',
          description: `Đã liên kết yêu cầu với khách hàng ${customer.name}`
        })
      } catch (error) {
        console.error('❌ Error adding request to customer:', error)
        toast({
          title: 'Lỗi',
          description: 'Không thể liên kết yêu cầu với khách hàng',
          variant: 'destructive'
        })
      }
    },
    [customers, toast]
  )

  const value: CustomerContextType = {
    customers,
    loading,
    error,
    customerSources,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    refreshData,
    addCustomerSource,
    checkPhoneExists,
    addRequestToCustomer, // Thêm method mới vào value
    checkEmailExists
  }

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const context = useContext(CustomerContext)
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider')
  }
  return context
}
