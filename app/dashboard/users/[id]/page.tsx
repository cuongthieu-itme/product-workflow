'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  Building,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [department, setDepartment] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Đang lấy thông tin người dùng từ Firestore với ID:', userId)

      // Lấy thông tin người dùng từ Firestore
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        console.error('Không tìm thấy người dùng với ID:', userId)
        setError(`Không tìm thấy người dùng với ID: ${userId}`)
        setIsLoading(false)
        return
      }

      const userData = userSnap.data()
      console.log('Đã lấy được thông tin người dùng:', userData)
      setUser({ id: userId, ...userData })

      // Lấy thông tin phòng ban nếu có
      if (userData.department) {
        const departmentRef = doc(db, 'departments', userData.department)
        const departmentSnap = await getDoc(departmentRef)

        if (departmentSnap.exists()) {
          const departmentData = departmentSnap.data()
          setDepartment({ id: userData.department, ...departmentData })
        }
      }

      // Lấy danh sách yêu cầu mà người dùng được giao
      const requestsCollection = collection(db, 'requests')
      const requestsQuery = query(
        requestsCollection,
        where('assignee.id', '==', userId)
      )
      const requestsSnapshot = await getDocs(requestsQuery)

      const requestsData = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log('Đã lấy được', requestsData.length, 'yêu cầu của người dùng')
      setRequests(requestsData)
    } catch (err) {
      console.error('Lỗi khi lấy thông tin người dùng:', err)
      setError(
        `Lỗi khi lấy thông tin người dùng: ${err instanceof Error ? err.message : String(err)}`
      )

      // Thử lấy từ localStorage nếu Firestore thất bại
      if (typeof window !== 'undefined') {
        try {
          console.log('Thử lấy dữ liệu từ localStorage...')
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          const foundUser = users.find((u: any) => u.id === userId)

          if (foundUser) {
            console.log('Đã tìm thấy người dùng trong localStorage:', foundUser)
            setUser(foundUser)

            if (foundUser.department) {
              const departments = JSON.parse(
                localStorage.getItem('departments') || '[]'
              )
              const foundDepartment = departments.find(
                (d: any) => d.id === foundUser.department
              )
              if (foundDepartment) {
                setDepartment(foundDepartment)
              }
            }

            // Lấy yêu cầu từ localStorage
            const allRequests = JSON.parse(
              localStorage.getItem('requests') || '[]'
            )
            const userRequests = allRequests.filter(
              (req: any) => req.assignee && req.assignee.id === userId
            )
            setRequests(userRequests)
          } else {
            console.error('Không tìm thấy người dùng trong localStorage')
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
    fetchUserData()
  }, [userId])

  const refreshData = () => {
    fetchUserData()
    toast({
      title: 'Làm mới dữ liệu',
      description: 'Đang tải lại thông tin người dùng...'
    })
  }

  const formatDate = (date: any) => {
    if (!date) return 'Không xác định'

    try {
      if (typeof date === 'object' && date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString('vi-VN')
      }
      return new Date(date).toLocaleDateString('vi-VN')
    } catch (error) {
      return 'Không xác định'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Chờ xử lý</Badge>
      case 'in_progress':
        return <Badge variant="default">Đang xử lý</Badge>
      case 'completed':
        return <Badge variant="success">Hoàn thành</Badge>
      case 'denied':
        return <Badge variant="destructive">Từ chối</Badge>
      case 'hold':
        return <Badge variant="warning">Tạm giữ</Badge>
      default:
        return <Badge>{status}</Badge>
    }
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
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Không tìm thấy người dùng</h1>
        <p className="text-muted-foreground">
          Người dùng bạn đang tìm kiếm không tồn tại.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
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
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Thông tin người dùng</h1>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {user.photoURL ? (
                <AvatarImage
                  src={user.photoURL || '/placeholder.svg'}
                  alt={user.fullName}
                />
              ) : (
                <AvatarFallback className="text-lg">
                  {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.fullName}</CardTitle>
              <CardDescription className="text-base mt-1">
                @{user.username}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
                <Badge
                  variant={user.status === 'active' ? 'success' : 'destructive'}
                >
                  {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                </Badge>
                {department && department.manager === user.id && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    Trưởng phòng
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p>{user.email || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Số điện thoại</p>
                  <p>{user.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phòng ban</p>
                  <p>{department ? department.name : 'Không xác định'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ngày tạo tài khoản</p>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Công việc đang thực hiện</TabsTrigger>
          <TabsTrigger value="completed">Công việc đã hoàn thành</TabsTrigger>
          <TabsTrigger value="all">Tất cả công việc</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Công việc đang thực hiện</CardTitle>
              <CardDescription>
                Danh sách các yêu cầu đang được xử lý bởi {user.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderRequestsTable(
                requests.filter(
                  (req) =>
                    req.status === 'pending' ||
                    req.status === 'in_progress' ||
                    req.status === 'hold'
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Công việc đã hoàn thành</CardTitle>
              <CardDescription>
                Danh sách các yêu cầu đã được hoàn thành bởi {user.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderRequestsTable(
                requests.filter((req) => req.status === 'completed')
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả công việc</CardTitle>
              <CardDescription>
                Danh sách tất cả các yêu cầu được giao cho {user.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderRequestsTable(requests)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderRequestsTable(requestsList: any[]) {
    if (requestsList.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Không có yêu cầu nào.</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã yêu cầu</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hạn xử lý</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requestsList.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.id.substring(0, 8)}
                </TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell>
                  {request.dueDate ? formatDate(request.dueDate) : 'Không có'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/requests/${request.id}`}>
                      Xem chi tiết
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}
