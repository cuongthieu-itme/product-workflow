'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { AlertCircle } from 'lucide-react'
import { RefreshCw } from 'lucide-react'
import { Users } from 'lucide-react'
import { Shield } from 'lucide-react'
import { Eye } from 'lucide-react'
import { Edit } from 'lucide-react'
import { Trash2 } from 'lucide-react'

interface Department {
  id: string
  name: string
  description: string
  manager: string
  members: string[]
  accessRights?: string[]
  createdAt: string | Timestamp
}

interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: string
  department: string
  status: string
}

interface AccessRight {
  id: string
  name: string
  description: string
}

export function DepartmentsTable() {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  )
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [accessRights, setAccessRights] = useState<AccessRight[]>([
    {
      id: 'view_all',
      name: 'Xem tất cả',
      description: 'Quyền xem tất cả dữ liệu'
    },
    {
      id: 'edit_all',
      name: 'Chỉnh sửa tất cả',
      description: 'Quyền chỉnh sửa tất cả dữ liệu'
    },
    { id: 'delete', name: 'Xóa dữ liệu', description: 'Quyền xóa dữ liệu' },
    {
      id: 'approve',
      name: 'Phê duyệt',
      description: 'Quyền phê duyệt yêu cầu'
    },
    {
      id: 'export',
      name: 'Xuất dữ liệu',
      description: 'Quyền xuất dữ liệu ra file'
    }
  ])
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(
    null
  )
  const [departmentMembers, setDepartmentMembers] = useState<User[]>([])
  const [editNameExists, setEditNameExists] = useState(false)

  // Lấy danh sách phòng ban từ Firestore
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
          const data = doc.data() as Department
          // Chuyển đổi Timestamp thành string nếu cần
          return {
            ...data,
            id: doc.id, // Đảm bảo id luôn được gán
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            members: Array.isArray(data.members) ? data.members : [] // Đảm bảo members luôn là mảng
          }
        })
        console.log(
          'Đã lấy được',
          departmentsData.length,
          'phòng ban từ Firestore'
        )
        setDepartments(departmentsData)
      }

      // Lấy danh sách người dùng từ Firestore
      const usersCollection = collection(db, 'users')
      const usersSnapshot = await getDocs(usersCollection)
      const usersData = usersSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            department: doc.data().department || '' // Đảm bảo department luôn có giá trị
          }) as User
      )
      setUsers(usersData)
      console.log('Đã lấy được', usersData.length, 'người dùng từ Firestore')
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng ban:', error)
      setError(
        `Lỗi khi lấy danh sách phòng ban: ${error instanceof Error ? error.message : String(error)}`
      )
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách phòng ban từ Firestore'
      })

      // Sử dụng dữ liệu từ localStorage nếu có lỗi
      try {
        if (typeof window !== 'undefined') {
          const storedDepartments = localStorage.getItem('departments')
          if (storedDepartments) {
            const parsedDepartments = JSON.parse(storedDepartments)
            // Đảm bảo dữ liệu hợp lệ
            const validDepartments = Array.isArray(parsedDepartments)
              ? parsedDepartments.map((dept) => ({
                  ...dept,
                  members: Array.isArray(dept.members) ? dept.members : []
                }))
              : []
            setDepartments(validDepartments)
            console.log('Đã sử dụng dữ liệu từ localStorage do lỗi Firestore')
          }

          const storedUsers = localStorage.getItem('users')
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers))
          }
        }
      } catch (localError) {
        console.error('Lỗi khi lấy dữ liệu từ localStorage:', localError)
        // Khởi tạo mảng rỗng để tránh lỗi
        setDepartments([])
        setUsers([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  // Lấy tên người dùng từ ID
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.fullName : 'Không xác định'
  }

  // Đếm số thành viên trong phòng ban
  const countMembers = (departmentId: string) => {
    return users.filter((user) => user.department === departmentId).length
  }

  // Đếm số dự án đang hoạt động (giả lập)
  const countActiveProjects = (departmentId: string) => {
    // Giả lập số dự án
    const projectCounts: { [key: string]: number } = {
      mkt: 3,
      rd: 5,
      sales: 2,
      bod: 1
    }
    return projectCounts[departmentId] || 0
  }

  const handleEditDepartment = (department: Department) => {
    // Đảm bảo members là mảng
    const members = Array.isArray(department.members) ? department.members : []
    setEditingDepartment({ ...department, members })
    setSelectedUsers(members)
  }

  const handleAccessRightChange = (rightId: string, checked: boolean) => {
    if (!editingDepartment) return

    setEditingDepartment((prev) => {
      if (!prev) return prev
      const accessRights = Array.isArray(prev.accessRights)
        ? prev.accessRights
        : []

      if (checked) {
        return { ...prev, accessRights: [...accessRights, rightId] }
      } else {
        return {
          ...prev,
          accessRights: accessRights.filter((id) => id !== rightId)
        }
      }
    })
  }

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const checkEditDepartmentName = async (name: string, currentId: string) => {
    if (!name.trim()) return

    try {
      const departmentsRef = collection(db, 'departments')
      const q = query(departmentsRef, where('name', '==', name.trim()))
      const querySnapshot = await getDocs(q)

      // Kiểm tra xem có phòng ban nào khác có tên trùng không
      const exists = querySnapshot.docs.some((doc) => doc.id !== currentId)
      setEditNameExists(exists)
    } catch (error) {
      console.error('Lỗi khi kiểm tra tên phòng ban:', error)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingDepartment) return

    setIsLoading(true)
    setError(null)

    try {
      // Kiểm tra tên phòng ban trùng (trừ chính nó)
      const departmentsRef = collection(db, 'departments')
      const nameQuery = query(
        departmentsRef,
        where('name', '==', editingDepartment.name.trim())
      )
      const nameQuerySnapshot = await getDocs(nameQuery)

      // Kiểm tra xem có phòng ban nào khác có tên trùng không
      const duplicateName = nameQuerySnapshot.docs.some(
        (doc) => doc.id !== editingDepartment.id
      )

      if (duplicateName) {
        setError(
          'Tên phòng ban đã tồn tại trong hệ thống. Vui lòng chọn tên khác.'
        )
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Tên phòng ban đã tồn tại trong hệ thống.'
        })
        setIsLoading(false)
        return
      }

      const updatedDepartment = {
        ...editingDepartment,
        name: editingDepartment.name.trim(), // Trim tên phòng ban
        members: selectedUsers,
        // Giữ nguyên createdAt nếu đã có, nếu không thì tạo mới
        createdAt: editingDepartment.createdAt || serverTimestamp()
      }

      // Cập nhật vào Firestore
      const departmentRef = doc(db, 'departments', updatedDepartment.id)
      await updateDoc(departmentRef, updatedDepartment)
      console.log('Đã cập nhật phòng ban vào Firestore:', updatedDepartment.id)

      // Cập nhật thông tin người dùng nếu phòng ban thay đổi
      if (editingDepartment.id) {
        // Lấy danh sách người dùng hiện tại thuộc phòng ban
        const currentDeptUsers = users.filter(
          (user) => user.department === editingDepartment.id
        )
        const currentDeptUserIds = currentDeptUsers.map((user) => user.id)

        // Người dùng cần thêm vào phòng ban
        const usersToAdd = selectedUsers.filter(
          (id) => !currentDeptUserIds.includes(id)
        )

        // Người dùng cần xóa khỏi phòng ban
        const usersToRemove = currentDeptUserIds.filter(
          (id) => !selectedUsers.includes(id)
        )

        // Cập nhật người dùng trong Firestore
        for (const userId of usersToAdd) {
          const userRef = doc(db, 'users', userId)
          await updateDoc(userRef, { department: editingDepartment.id })
          console.log(
            'Đã thêm người dùng',
            userId,
            'vào phòng ban',
            editingDepartment.id
          )
        }

        for (const userId of usersToRemove) {
          const userRef = doc(db, 'users', userId)
          await updateDoc(userRef, { department: '' })
          console.log(
            'Đã xóa người dùng',
            userId,
            'khỏi phòng ban',
            editingDepartment.id
          )
        }

        // Cập nhật danh sách người dùng trong state
        const updatedUsers = users.map((user) => {
          if (selectedUsers.includes(user.id)) {
            return { ...user, department: updatedDepartment.id }
          }
          if (
            user.department === editingDepartment.id &&
            !selectedUsers.includes(user.id)
          ) {
            return { ...user, department: '' }
          }
          return user
        })
        setUsers(updatedUsers)
      }

      // Cập nhật state
      const updatedDepartments = departments.map((department) =>
        department.id === updatedDepartment.id ? updatedDepartment : department
      )
      setDepartments(updatedDepartments)

      // Đồng bộ với localStorage để đảm bảo tương thích
      if (typeof window !== 'undefined') {
        localStorage.setItem('departments', JSON.stringify(updatedDepartments))
        localStorage.setItem('users', JSON.stringify(users))
      }

      setEditingDepartment(null)
      setSelectedUsers([])

      toast({
        title: 'Cập nhật thành công',
        description: `Thông tin phòng ban ${updatedDepartment.name} đã được cập nhật.`
      })
    } catch (error) {
      console.error('Lỗi khi cập nhật phòng ban:', error)
      setError(
        `Lỗi khi cập nhật phòng ban: ${error instanceof Error ? error.message : String(error)}`
      )
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin phòng ban trong Firestore'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openDeleteDialog = (department: Department) => {
    setDeletingDepartment(department)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingDepartment) return

    setIsLoading(true)
    setError(null)
    console.log('Đang xóa phòng ban:', deletingDepartment.id)

    try {
      // Kiểm tra xem có người dùng nào thuộc phòng ban này không
      const usersInDepartment = users.filter(
        (user) => user.department === deletingDepartment.id
      )
      console.log('Số người dùng trong phòng ban:', usersInDepartment.length)

      // Xóa phòng ban khỏi Firestore
      await deleteDoc(doc(db, 'departments', deletingDepartment.id))
      console.log('Đã xóa phòng ban khỏi Firestore:', deletingDepartment.id)

      // Cập nhật người dùng - xóa phòng ban khỏi người dùng
      if (usersInDepartment.length > 0) {
        for (const user of usersInDepartment) {
          const userRef = doc(db, 'users', user.id)
          await updateDoc(userRef, { department: '' })
          console.log('Đã xóa phòng ban khỏi người dùng:', user.id)
        }

        // Cập nhật state người dùng
        const updatedUsers = users.map((user) => {
          if (user.department === deletingDepartment.id) {
            return { ...user, department: '' }
          }
          return user
        })
        setUsers(updatedUsers)

        // Cập nhật localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('users', JSON.stringify(updatedUsers))
        }
      }

      // Cập nhật state phòng ban - KHÔNG sử dụng indexOf
      const updatedDepartments = departments.filter(
        (department) => department.id !== deletingDepartment.id
      )

      setDepartments(updatedDepartments)

      // Cập nhật localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('departments', JSON.stringify(updatedDepartments))
      }

      // Đóng dialog và reset state
      setIsDeleteDialogOpen(false)
      setDeletingDepartment(null)

      toast({
        title: 'Xóa thành công',
        description: `Phòng ban ${deletingDepartment.name} đã được xóa khỏi hệ thống.`
      })
    } catch (error) {
      console.error('Lỗi khi xóa phòng ban:', error)
      setError(
        `Lỗi khi xóa phòng ban: ${error instanceof Error ? error.message : String(error)}`
      )
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description:
          'Không thể xóa phòng ban. Chi tiết: ' +
          (error instanceof Error ? error.message : String(error))
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshDepartmentList = () => {
    fetchDepartments()
    toast({
      title: 'Làm mới thành công',
      description: 'Danh sách phòng ban đã được cập nhật.'
    })
  }

  // Lấy tên quyền truy cập từ ID
  const getAccessRightName = (rightId: string) => {
    const right = accessRights.find((r) => r.id === rightId)
    return right ? right.name : rightId
  }

  // Xem chi tiết phòng ban
  const handleViewDepartment = (department: Department) => {
    setViewingDepartment(department)
    // Lấy danh sách thành viên của phòng ban
    const members = users.filter((user) => user.department === department.id)
    setDepartmentMembers(members)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <Button
          variant="outline"
          onClick={refreshDepartmentList}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tên Phòng Ban</TableHead>
              <TableHead>Trưởng Phòng</TableHead>
              <TableHead>Số Thành Viên</TableHead>
              <TableHead>Quyền Truy Cập</TableHead>
              <TableHead>Dự Án Đang Hoạt Động</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : departments.length > 0 ? (
              departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{department.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {department.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {department.manager
                      ? getUserName(department.manager)
                      : 'Chưa có quản lý'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {department.members?.length ||
                          countMembers(department.id)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {department.accessRights &&
                      department.accessRights.length > 0 ? (
                        department.accessRights.map((rightId) => (
                          <TooltipProvider key={rightId}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  {getAccessRightName(rightId)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {
                                    accessRights.find((r) => r.id === rightId)
                                      ?.description
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Không có quyền đặc biệt
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {countActiveProjects(department.id)} dự án
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/departments/${department.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Chi tiết
                        </Link>
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDepartment(department)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh Sửa
                          </Button>
                        </DialogTrigger>
                        {editingDepartment && (
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
                              <DialogDescription>
                                Chỉnh sửa thông tin phòng ban
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh]">
                              <div className="grid gap-4 py-4 pr-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-id"
                                    className="text-right"
                                  >
                                    ID
                                  </Label>
                                  <Input
                                    id="edit-id"
                                    value={editingDepartment.id}
                                    className="col-span-3"
                                    disabled
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-name"
                                    className="text-right"
                                  >
                                    Tên
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={editingDepartment.name}
                                    onChange={(e) => {
                                      const newName = e.target.value
                                      setEditingDepartment({
                                        ...editingDepartment,
                                        name: newName
                                      })
                                      checkEditDepartmentName(
                                        newName,
                                        editingDepartment.id
                                      )
                                    }}
                                    className={`col-span-3 ${editNameExists ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                  />
                                  {editNameExists && (
                                    <div className="col-span-4 text-sm text-red-500">
                                      Tên phòng ban đã tồn tại trong hệ thống
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-description"
                                    className="text-right"
                                  >
                                    Mô tả
                                  </Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editingDepartment.description}
                                    onChange={(e) =>
                                      setEditingDepartment({
                                        ...editingDepartment,
                                        description: e.target.value
                                      })
                                    }
                                    className="col-span-3 resize-none"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-manager"
                                    className="text-right"
                                  >
                                    Quản lý
                                  </Label>
                                  <Select
                                    value={editingDepartment.manager}
                                    onValueChange={(value) =>
                                      setEditingDepartment({
                                        ...editingDepartment,
                                        manager: value
                                      })
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Chọn quản lý" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">
                                        Không có
                                      </SelectItem>
                                      {users.map((user) => (
                                        <SelectItem
                                          key={user.id}
                                          value={user.id}
                                        >
                                          {user.fullName} ({user.username})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="grid grid-cols-4 items-start gap-4">
                                  <Label className="text-right pt-2">
                                    Quyền Truy Cập
                                  </Label>
                                  <div className="col-span-3 border rounded-md p-3 space-y-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {accessRights.map((right) => (
                                        <div
                                          key={right.id}
                                          className="flex items-start space-x-2"
                                        >
                                          <Checkbox
                                            id={`edit-right-${right.id}`}
                                            checked={(
                                              editingDepartment.accessRights ||
                                              []
                                            ).includes(right.id)}
                                            onCheckedChange={(checked) =>
                                              handleAccessRightChange(
                                                right.id,
                                                checked as boolean
                                              )
                                            }
                                          />
                                          <div className="grid gap-1.5 leading-none">
                                            <label
                                              htmlFor={`edit-right-${right.id}`}
                                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                              {right.name}
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                              {right.description}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 items-start gap-4">
                                  <Label className="text-right pt-2">
                                    Thành Viên
                                  </Label>
                                  <div className="col-span-3 border rounded-md p-3">
                                    <ScrollArea className="h-[150px]">
                                      <div className="space-y-2 pr-4">
                                        {users.map((user) => (
                                          <div
                                            key={user.id}
                                            className="flex items-center space-x-2"
                                          >
                                            <Checkbox
                                              id={`edit-user-${user.id}`}
                                              checked={selectedUsers.includes(
                                                user.id
                                              )}
                                              onCheckedChange={(checked) =>
                                                handleUserSelect(
                                                  user.id,
                                                  checked as boolean
                                                )
                                              }
                                            />
                                            <label
                                              htmlFor={`edit-user-${user.id}`}
                                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                              {user.fullName} ({user.username})
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                            <DialogFooter>
                              <Button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={isLoading || editNameExists}
                              >
                                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(department)}
                      >
                        <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không có phòng ban nào. Hãy thêm phòng ban mới.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              {deletingDepartment && (
                <>
                  Bạn có chắc chắn muốn xóa phòng ban "{deletingDepartment.name}
                  "? Hành động này không thể hoàn tác.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Thông báo về số lượng thành viên - đã tách ra khỏi DialogDescription */}
          {deletingDepartment && countMembers(deletingDepartment.id) > 0 && (
            <div className="mt-2 text-red-500 text-sm">
              Lưu ý: Phòng ban này có {countMembers(deletingDepartment.id)}{' '}
              thành viên. Khi xóa phòng ban, các thành viên sẽ không còn thuộc
              phòng ban nào.
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? 'Đang xử lý...' : 'Xóa phòng ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết phòng ban */}
      <Dialog
        open={!!viewingDepartment}
        onOpenChange={(open) => !open && setViewingDepartment(null)}
      >
        <DialogContent className="sm:max-w-[700px]">
          {viewingDepartment && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Chi tiết phòng ban: {viewingDepartment.name}
                </DialogTitle>
                <DialogDescription>
                  {viewingDepartment.description}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Trưởng phòng</span>
                  <span>
                    {viewingDepartment.manager
                      ? getUserName(viewingDepartment.manager)
                      : 'Chưa có trưởng phòng'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Số thành viên</span>
                  <span>{departmentMembers.length}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Ngày tạo</span>
                  <span>
                    {typeof viewingDepartment.createdAt === 'string'
                      ? new Date(
                          viewingDepartment.createdAt
                        ).toLocaleDateString('vi-VN')
                      : 'Không xác định'}
                  </span>
                </div>
              </div>

              <div className="py-2">
                <h3 className="text-lg font-medium mb-2">Quyền truy cập</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingDepartment.accessRights &&
                  viewingDepartment.accessRights.length > 0 ? (
                    viewingDepartment.accessRights.map((rightId) => (
                      <Badge key={rightId} variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        {getAccessRightName(rightId)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">
                      Không có quyền đặc biệt
                    </span>
                  )}
                </div>
              </div>

              <div className="py-2">
                <h3 className="text-lg font-medium mb-2">
                  Danh sách thành viên
                </h3>
                {departmentMembers.length > 0 ? (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {departmentMembers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-2 border rounded-md ${
                            user.id === viewingDepartment.manager
                              ? 'bg-primary/5 border-primary/20'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold">
                                {user.fullName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {user.id === viewingDepartment.manager && (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/20"
                            >
                              Trưởng phòng
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Chưa có thành viên nào trong phòng ban này.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button asChild>
                  <Link href={`/dashboard/departments/${viewingDepartment.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Xem trang chi tiết
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
