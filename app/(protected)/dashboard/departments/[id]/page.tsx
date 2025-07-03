'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Users,
  FileText,
  Calendar,
  UserCog,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function DepartmentDetailPage() {
  const params = useParams()
  const departmentId = params.id as string

  const [department, setDepartment] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDepartmentData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(
        'Đang lấy thông tin phòng ban từ Firestore với ID:',
        departmentId
      )

      // Lấy thông tin phòng ban từ Firestore
      const departmentRef = doc(db, 'departments', departmentId)
      const departmentSnap = await getDoc(departmentRef)

      if (!departmentSnap.exists()) {
        console.error('Không tìm thấy phòng ban với ID:', departmentId)
        setError(`Không tìm thấy phòng ban với ID: ${departmentId}`)
        setIsLoading(false)
        return
      }

      const departmentData = departmentSnap.data()
      console.log('Đã lấy được thông tin phòng ban:', departmentData)
      setDepartment(departmentData)

      // Lấy danh sách người dùng thuộc phòng ban từ Firestore
      const usersCollection = collection(db, 'users')
      const usersQuery = query(
        usersCollection,
        where('department', '==', departmentId)
      )
      const usersSnapshot = await getDocs(usersQuery)

      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log('Đã lấy được', usersData.length, 'người dùng thuộc phòng ban')
      setUsers(usersData)

      // Cập nhật localStorage để đồng bộ
      if (typeof window !== 'undefined') {
        // Cập nhật phòng ban trong localStorage
        const storedDepartments = JSON.parse(
          localStorage.getItem('departments') || '[]'
        )
        const updatedDepartments = storedDepartments.map((dept: any) =>
          dept.id === departmentId ? { ...dept, ...departmentData } : dept
        )
        localStorage.setItem('departments', JSON.stringify(updatedDepartments))

        // Cập nhật người dùng trong localStorage
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
        const updatedUsers = storedUsers.map((user: any) => {
          const matchedUser = usersData.find((u: any) => u.id === user.id)
          return matchedUser ? { ...user, ...matchedUser } : user
        })
        localStorage.setItem('users', JSON.stringify(updatedUsers))
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin phòng ban:', err)
      setError(
        `Lỗi khi lấy thông tin phòng ban: ${err instanceof Error ? err.message : String(err)}`
      )

      // Thử lấy từ localStorage nếu Firestore thất bại
      if (typeof window !== 'undefined') {
        try {
          console.log('Thử lấy dữ liệu từ localStorage...')
          const departments = JSON.parse(
            localStorage.getItem('departments') || '[]'
          )
          const foundDepartment = departments.find(
            (dept: any) => dept.id === departmentId
          )

          if (foundDepartment) {
            console.log(
              'Đã tìm thấy phòng ban trong localStorage:',
              foundDepartment
            )
            setDepartment(foundDepartment)

            const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
            const departmentUsers = allUsers.filter(
              (user: any) => user.department === departmentId
            )
            console.log(
              'Đã tìm thấy',
              departmentUsers.length,
              'người dùng thuộc phòng ban trong localStorage'
            )
            setUsers(departmentUsers)
          } else {
            console.error('Không tìm thấy phòng ban trong localStorage')
          }
        } catch (localErr) {
          console.error('Lỗi khi lấy dữ liệu từ localStorage:', localErr)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartmentData()
  }, [departmentId])

  const handleManagerChange = async (managerId: string) => {
    try {
      // Cập nhật state
      setDepartment({
        ...department,
        manager: managerId === 'none' ? '' : managerId
      })

      // Cập nhật vào Firestore
      const departmentRef = doc(db, 'departments', departmentId)
      await updateDoc(departmentRef, {
        manager: managerId === 'none' ? '' : managerId
      })

      // Cập nhật localStorage
      if (typeof window !== 'undefined') {
        const departments = JSON.parse(
          localStorage.getItem('departments') || '[]'
        )
        const updatedDepartments = departments.map((dept: any) =>
          dept.id === departmentId
            ? { ...dept, manager: managerId === 'none' ? '' : managerId }
            : dept
        )
        localStorage.setItem('departments', JSON.stringify(updatedDepartments))
      }

      toast({
        title: 'Cập nhật thành công',
        description: 'Đã cập nhật trưởng phòng cho phòng ban.'
      })
    } catch (error) {
      console.error('Lỗi khi cập nhật trưởng phòng:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật trưởng phòng. Vui lòng thử lại sau.'
      })
    }
  }

  const refreshData = () => {
    fetchDepartmentData()
    toast({
      title: 'Làm mới dữ liệu',
      description: 'Đang tải lại thông tin phòng ban...'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách phòng ban
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Không tìm thấy phòng ban</h1>
        <p className="text-muted-foreground">
          Phòng ban bạn đang tìm kiếm không tồn tại.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách phòng ban
            </Link>
          </Button>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{department.name}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phòng ban</CardTitle>
          <CardDescription>{department.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Số thành viên</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dự án đang hoạt động</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ngày tạo</p>
                <p className="text-sm">
                  {department.createdAt &&
                  typeof department.createdAt === 'object' &&
                  department.createdAt.seconds
                    ? new Date(
                        department.createdAt.seconds * 1000
                      ).toLocaleDateString('vi-VN')
                    : department.createdAt
                      ? new Date(department.createdAt).toLocaleDateString(
                          'vi-VN'
                        )
                      : 'Không xác định'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          <TabsTrigger value="projects">Dự án</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh sách thành viên</CardTitle>
                <CardDescription>
                  Tất cả thành viên thuộc phòng ban {department.name}
                </CardDescription>
              </div>
              {users.length > 0 && (
                <Select
                  value={department.manager || 'none'}
                  onValueChange={handleManagerChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Chọn trưởng phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có trưởng phòng</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 border rounded-md ${
                        user.id === department.manager
                          ? 'bg-primary/5 border-primary/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground">
                              SĐT: {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.id === department.manager && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            Trưởng phòng
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/users/${user.id}`}>
                            <UserCog className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Chưa có thành viên nào trong phòng ban này.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Dự án</CardTitle>
              <CardDescription>
                Các dự án đang được thực hiện bởi phòng ban {department.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Chưa có dự án nào được gán cho phòng ban này.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo</CardTitle>
              <CardDescription>
                Báo cáo hiệu suất của phòng ban {department.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Chưa có báo cáo nào cho phòng ban này.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
