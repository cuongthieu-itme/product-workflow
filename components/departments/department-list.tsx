'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Department {
  id: string
  name: string
  description: string
  manager: string
  members: string[]
  accessRights?: string[]
  createdAt: any
}

export function DepartmentList() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('Đang lấy danh sách phòng ban từ Firestore...')
        const departmentsCollection = collection(db, 'departments')
        const departmentsSnapshot = await getDocs(departmentsCollection)

        if (departmentsSnapshot.empty) {
          console.log(
            'Không có phòng ban nào trong Firestore, tạo dữ liệu mẫu...'
          )
          // Tạo các phòng ban mẫu nếu không có dữ liệu
          const defaultDepartments = [
            {
              id: 'mkt',
              name: 'Marketing',
              description: 'Quản lý chiến dịch marketing và truyền thông',
              manager: '',
              members: [],
              accessRights: ['view_all', 'edit_all'],
              createdAt: serverTimestamp()
            },
            {
              id: 'rd',
              name: 'R&D',
              description: 'Nghiên cứu và phát triển sản phẩm mới',
              manager: '',
              members: [],
              accessRights: ['view_all', 'edit_all', 'approve'],
              createdAt: serverTimestamp()
            },
            {
              id: 'sales',
              name: 'Sales',
              description: 'Quản lý bán hàng và khách hàng',
              manager: '',
              members: [],
              accessRights: ['view_all', 'export'],
              createdAt: serverTimestamp()
            },
            {
              id: 'bod',
              name: 'Ban Giám Đốc',
              description: 'Quản lý và điều hành công ty',
              manager: '',
              members: [],
              accessRights: [
                'view_all',
                'edit_all',
                'delete',
                'approve',
                'export'
              ],
              createdAt: serverTimestamp()
            }
          ]

          // Lưu các phòng ban mẫu vào Firestore
          for (const dept of defaultDepartments) {
            await setDoc(doc(db, 'departments', dept.id), dept)
          }

          setDepartments(defaultDepartments)
        } else {
          // Lấy dữ liệu từ Firestore
          const departmentsData = departmentsSnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() } as Department
          })
          console.log(
            'Đã lấy được',
            departmentsData.length,
            'phòng ban từ Firestore'
          )
          setDepartments(departmentsData)
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng ban:', error)
        setError(
          `Lỗi khi lấy danh sách phòng ban: ${error instanceof Error ? error.message : String(error)}`
        )

        // Sử dụng dữ liệu từ localStorage nếu có lỗi
        try {
          if (typeof window !== 'undefined') {
            const storedDepartments = JSON.parse(
              localStorage.getItem('departments') || '[]'
            )
            setDepartments(storedDepartments)
            console.log('Đã sử dụng dữ liệu từ localStorage do lỗi Firestore')
          }
        } catch (localError) {
          console.error('Lỗi khi lấy dữ liệu từ localStorage:', localError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  const navigateToDepartment = (departmentId: string) => {
    router.push(`/dashboard/departments/${departmentId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {departments.map((department) => (
          <Button
            key={department.id}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigateToDepartment(department.id)}
          >
            {department.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
