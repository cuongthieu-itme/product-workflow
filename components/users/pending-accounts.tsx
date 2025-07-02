"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Edit, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface PendingUser {
  id: string
  username: string
  password: string
  fullName: string
  email: string
  role: string
  department: string
  status: string
  createdAt: string
}

export function PendingAccounts() {
  const { toast } = useToast()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [editingUser, setEditingUser] = useState<PendingUser | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [userToReject, setUserToReject] = useState<PendingUser | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])

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

  // Lấy danh sách tài khoản chờ duyệt từ Firebase
  const fetchPendingUsers = async () => {
    setIsLoading(true)
    try {
      const pendingUsersRef = collection(db, "pendingUsers")
      const snapshot = await getDocs(pendingUsersRef)
      const pendingUsersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PendingUser[]
      setPendingUsers(pendingUsersData)
    } catch (error) {
      console.error("Error fetching pending users:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách tài khoản chờ duyệt",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const handleEditUser = (user: PendingUser) => {
    setEditingUser({ ...user })
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setIsLoading(true)

    try {
      // Cập nhật thông tin người dùng trong Firebase
      const userRef = doc(db, "pendingUsers", editingUser.id)
      await updateDoc(userRef, {
        username: editingUser.username,
        fullName: editingUser.fullName,
        email: editingUser.email,
        password: editingUser.password,
        role: editingUser.role,
        department: editingUser.department,
      })

      // Cập nhật state
      const updatedPendingUsers = pendingUsers.map((user) => (user.id === editingUser.id ? editingUser : user))
      setPendingUsers(updatedPendingUsers)
      setEditingUser(null)

      // Hiển thị thông báo thành công
      setSuccessMessage(`Thông tin tài khoản ${editingUser.username} đã được cập nhật.`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      toast({
        title: "Cập nhật thành công",
        description: `Thông tin tài khoản ${editingUser.username} đã được cập nhật.`,
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật thông tin tài khoản",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async (user: PendingUser) => {
    setIsLoading(true)

    try {
      // Chuyển tài khoản từ pendingUsers sang users trong Firebase
      const approvedUser = { ...user, status: "active" }
      delete approvedUser.id // Remove the id field before adding to users collection

      // Add to users collection
      const usersRef = collection(db, "users")
      await addDoc(usersRef, approvedUser)

      // Delete from pendingUsers collection
      const pendingUserRef = doc(db, "pendingUsers", user.id)
      await deleteDoc(pendingUserRef)

      // Lưu lịch sử phê duyệt
      const approvalHistoryRef = collection(db, "approvalHistory")
      await addDoc(approvalHistoryRef, {
        userId: user.id,
        username: user.username,
        action: "approve",
        approvedBy: localStorage.getItem("username") || "admin",
        approvedAt: new Date().toISOString(),
      })

      // Cập nhật state
      const updatedPendingUsers = pendingUsers.filter((u) => u.id !== user.id)
      setPendingUsers(updatedPendingUsers)

      // Hiển thị thông báo thành công
      setSuccessMessage(`Tài khoản ${user.username} đã được phê duyệt thành công.`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      toast({
        title: "Phê duyệt thành công",
        description: `Tài khoản ${user.username} đã được phê duyệt và kích hoạt.`,
      })
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể phê duyệt tài khoản",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openRejectDialog = (user: PendingUser) => {
    setUserToReject(user)
    setRejectReason("")
    setShowRejectDialog(true)
  }

  const handleRejectUser = async () => {
    if (!userToReject) return
    setIsLoading(true)

    try {
      // Delete from pendingUsers collection
      const pendingUserRef = doc(db, "pendingUsers", userToReject.id)
      await deleteDoc(pendingUserRef)

      // Lưu lịch sử từ chối
      const rejectionHistoryRef = collection(db, "rejectionHistory")
      await addDoc(rejectionHistoryRef, {
        userId: userToReject.id,
        username: userToReject.username,
        reason: rejectReason,
        rejectedBy: localStorage.getItem("username") || "admin",
        rejectedAt: new Date().toISOString(),
      })

      // Cập nhật state
      const updatedPendingUsers = pendingUsers.filter((u) => u.id !== userToReject.id)
      setPendingUsers(updatedPendingUsers)

      // Đóng dialog
      setShowRejectDialog(false)
      setUserToReject(null)

      // Hiển thị thông báo thành công
      setSuccessMessage(`Tài khoản ${userToReject.username} đã bị từ chối.`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      toast({
        title: "Từ chối thành công",
        description: `Tài khoản ${userToReject.username} đã bị từ chối.`,
      })
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể từ chối tài khoản",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPendingUsersList = () => {
    fetchPendingUsers()
    toast({
      title: "Làm mới thành công",
      description: "Danh sách tài khoản chờ duyệt đã được cập nhật.",
    })
  }

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept.id === departmentId)
    if (department) {
      return department.name
    }

    // Fallback cho các giá trị cũ
    switch (departmentId) {
      case "product":
        return "Phòng Sản Phẩm"
      case "design":
        return "Phòng Thiết Kế"
      case "marketing":
        return "Phòng Marketing"
      case "sales":
        return "Phòng Kinh Doanh"
      case "rd":
        return "Phòng R&D"
      case "operations":
        return "Phòng Vận Hành"
      default:
        return departmentId
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

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Danh sách tài khoản chờ duyệt</h3>
        <Button variant="outline" onClick={refreshPendingUsersList} disabled={isLoading}>
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
              <TableHead>Phòng ban</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
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
            ) : pendingUsers.length > 0 ? (
              pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getDepartmentName(user.department)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-green-600"
                        onClick={() => handleApproveUser(user)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600"
                        onClick={() => openRejectDialog(user)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không có tài khoản nào đang chờ duyệt.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog chỉnh sửa thông tin tài khoản */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin tài khoản</DialogTitle>
              <DialogDescription>Chỉnh sửa thông tin tài khoản trước khi phê duyệt</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="col-span-3"
                />
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
                <Label htmlFor="password" className="text-right">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
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
                    <SelectItem value="product">Phòng Sản Phẩm</SelectItem>
                    <SelectItem value="design">Phòng Thiết Kế</SelectItem>
                    <SelectItem value="marketing">Phòng Marketing</SelectItem>
                    <SelectItem value="sales">Phòng Kinh Doanh</SelectItem>
                    <SelectItem value="rd">Phòng R&D</SelectItem>
                    <SelectItem value="operations">Phòng Vận Hành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveEdit} disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog từ chối tài khoản */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Từ chối tài khoản</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do từ chối tài khoản {userToReject?.username}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reject-reason" className="text-right">
                Lý do từ chối
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Nhập lý do từ chối tài khoản"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleRejectUser} disabled={isLoading || !rejectReason}>
              {isLoading ? "Đang xử lý..." : "Từ chối tài khoản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
