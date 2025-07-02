"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Key, Search, RefreshCw, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface User {
  id: string
  username: string
  password: string
  fullName: string
  email: string
  phone: string
  role: string
  department: string
  status: string
  createdAt: string
}

export function UsersList() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Lấy danh sách phòng ban từ Firebase
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsRef = collection(db, "departments")
        const snapshot = await getDocs(departmentsRef)
        const departmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setDepartments(departmentsData)
      } catch (error) {
        console.error("Error fetching departments:", error)
        // Fallback to localStorage if Firebase fails
        if (typeof window !== "undefined") {
          const storedDepartments = JSON.parse(localStorage.getItem("departments") || "[]")
          setDepartments(storedDepartments)
        }
      }
    }

    fetchDepartments()
  }, [])

  // Lấy danh sách người dùng từ Firebase
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const usersRef = collection(db, "users")
      const snapshot = await getDocs(usersRef)
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]

      console.log("Fetched users:", usersData.length)
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng: " + (error instanceof Error ? error.message : String(error)),
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Lọc người dùng dựa trên các bộ lọc
    let result = users

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Lọc theo vai trò
    if (filterRole !== "all") {
      result = result.filter((user) => user.role === filterRole)
    }

    // Lọc theo phòng ban
    if (filterDepartment !== "all") {
      result = result.filter((user) => user.department === filterDepartment)
    }

    setFilteredUsers(result)
  }, [users, searchTerm, filterRole, filterDepartment])

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    setIsLoading(true)

    try {
      // Kiểm tra email đã tồn tại chưa (nếu đã thay đổi)
      const originalUser = users.find((u) => u.id === editingUser.id)
      if (originalUser && originalUser.email !== editingUser.email) {
        const emailExists = users.some((u) => u.email === editingUser.email && u.id !== editingUser.id)
        if (emailExists) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Email đã được sử dụng bởi tài khoản khác.",
          })
          setIsLoading(false)
          return
        }
      }

      // Cập nhật thông tin người dùng trong Firebase
      const userRef = doc(db, "users", editingUser.id)

      // Kiểm tra xem document có tồn tại không
      const docSnap = await getDoc(userRef)
      if (!docSnap.exists()) {
        throw new Error(`Không tìm thấy người dùng với ID: ${editingUser.id}`)
      }

      // Prepare update data, filtering out undefined values
      const updateData: any = {
        fullName: editingUser.fullName,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department,
        status: editingUser.status,
      }

      // Only include phone if it has a value
      if (editingUser.phone && editingUser.phone.trim() !== "") {
        updateData.phone = editingUser.phone
      }

      await updateDoc(userRef, updateData)

      // Cập nhật state
      const updatedUsers = users.map((user) => (user.id === editingUser.id ? editingUser : user))
      setUsers(updatedUsers)
      setEditingUser(null)

      // Hiển thị thông báo thành công
      setSuccessMessage(`Thông tin người dùng ${editingUser.username} đã được cập nhật.`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      toast({
        title: "Cập nhật thành công",
        description: `Thông tin người dùng ${editingUser.username} đã được cập nhật.`,
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          "Không thể cập nhật thông tin người dùng: " + (error instanceof Error ? error.message : String(error)),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setIsLoading(true)
    setDeleteError(null)

    try {
      console.log("Deleting user with ID:", userToDelete.id)

      // Kiểm tra xem document có tồn tại không
      const userRef = doc(db, "users", userToDelete.id)
      const docSnap = await getDoc(userRef)

      if (!docSnap.exists()) {
        throw new Error(`Không tìm thấy người dùng với ID: ${userToDelete.id}`)
      }

      // Xóa người dùng khỏi Firebase
      await deleteDoc(userRef)
      console.log("User deleted successfully")

      // Cập nhật state
      const updatedUsers = users.filter((user) => user.id !== userToDelete.id)
      setUsers(updatedUsers)
      setDeleteDialogOpen(false)

      // Hiển thị thông báo thành công
      setSuccessMessage(`Tài khoản người dùng ${userToDelete.username} đã được xóa.`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      toast({
        title: "Xóa thành công",
        description: "Tài khoản người dùng đã được xóa khỏi hệ thống.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      setDeleteError(error instanceof Error ? error.message : String(error))
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa tài khoản người dùng: " + (error instanceof Error ? error.message : String(error)),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = (user: User) => {
    setResetPasswordUser(user)
    setNewPassword("")
  }

  const handleSaveNewPassword = async () => {
    if (!resetPasswordUser || !newPassword) return

    setIsLoading(true)

    try {
      // Kiểm tra xem document có tồn tại không
      const userRef = doc(db, "users", resetPasswordUser.id)
      const docSnap = await getDoc(userRef)

      if (!docSnap.exists()) {
        throw new Error(`Không tìm thấy người dùng với ID: ${resetPasswordUser.id}`)
      }

      // Cập nhật mật khẩu trong Firebase
      await updateDoc(userRef, {
        password: newPassword,
      })

      // Lưu lịch sử đặt lại mật khẩu
      const passwordHistoryRef = collection(db, "passwordHistory")
      await addDoc(passwordHistoryRef, {
        username: resetPasswordUser.username,
        changedBy: localStorage.getItem("username") || "admin",
        changedAt: new Date().toISOString(),
      })

      // Cập nhật state
      const updatedUsers = users.map((user) =>
        user.id === resetPasswordUser.id ? { ...user, password: newPassword } : user,
      )
      setUsers(updatedUsers)
      setResetPasswordUser(null)
      setNewPassword("")

      // Hiển thị thông báo thành công
      setSuccessMessage(`Mật khẩu của người dùng ${resetPasswordUser.username} đã được đặt lại.`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      toast({
        title: "Đặt lại mật khẩu thành công",
        description: `Mật khẩu của người dùng ${resetPasswordUser.username} đã được đặt lại.`,
      })
    } catch (error) {
      console.error("Error resetting password:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể đặt lại mật khẩu: " + (error instanceof Error ? error.message : String(error)),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserList = () => {
    fetchUsers()
    toast({
      title: "Làm mới thành công",
      description: "Danh sách người dùng đã được cập nhật.",
    })
  }

  const getDepartmentName = (departmentId: string) => {
    if (!departmentId) return "Không xác định"

    const department = departments.find((dept) => dept.id === departmentId)
    if (department) {
      return department.name
    }

    // Fallback cho các giá trị cũ
    switch (departmentId) {
      case "mkt":
        return "Marketing"
      case "rd":
        return "R&D"
      case "sales":
        return "Sales"
      case "bod":
        return "Ban Giám Đốc"
      default:
        return "Không xác định"
    }
  }

  return (
    <div className="space-y-4">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Thành công!</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Lọc theo phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phòng ban</SelectItem>
            <SelectItem value="mkt">Marketing</SelectItem>
            <SelectItem value="rd">R&D</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="bod">Ban Giám Đốc</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={refreshUserList} className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "Chưa cập nhật"}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDepartmentName(user.department)}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "success" : "destructive"}>
                      {user.status === "active" ? "Hoạt động" : "Vô hiệu hóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {editingUser && (
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
                              <DialogDescription>Chỉnh sửa thông tin tài khoản người dùng</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                  Tên đăng nhập
                                </Label>
                                <Input id="username" value={editingUser.username} className="col-span-3" disabled />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fullName" className="text-right">
                                  Họ tên
                                </Label>
                                <Input
                                  id="fullName"
                                  value={editingUser.fullName}
                                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                  Email
                                </Label>
                                <Input
                                  id="email"
                                  value={editingUser.email}
                                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">
                                  Số điện thoại
                                </Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  value={editingUser.phone || ""}
                                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                  Vai trò
                                </Label>
                                <Select
                                  value={editingUser.role}
                                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Chọn vai trò" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="department" className="text-right">
                                  Phòng ban
                                </Label>
                                <Select
                                  value={editingUser.department}
                                  onValueChange={(value) => setEditingUser({ ...editingUser, department: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Chọn phòng ban" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departments.length > 0 ? (
                                      departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                          {dept.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <>
                                        <SelectItem value="mkt">Marketing</SelectItem>
                                        <SelectItem value="rd">R&D</SelectItem>
                                        <SelectItem value="sales">Sales</SelectItem>
                                        <SelectItem value="bod">Ban Giám Đốc</SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                  Trạng thái
                                </Label>
                                <Select
                                  value={editingUser.status}
                                  onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                    <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleUpdateUser} disabled={isLoading}>
                                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleResetPassword(user)}>
                            <Key className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {resetPasswordUser && (
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Đặt lại mật khẩu</DialogTitle>
                              <DialogDescription>
                                Đặt lại mật khẩu cho người dùng {resetPasswordUser.username}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-password" className="text-right">
                                  Mật khẩu mới
                                </Label>
                                <Input
                                  id="new-password"
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                onClick={handleSaveNewPassword}
                                disabled={isLoading || !newPassword}
                              >
                                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>

                      <Button variant="outline" size="icon" onClick={() => openDeleteDialog(user)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog xác nhận xóa người dùng */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản người dùng {userToDelete?.username}? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
