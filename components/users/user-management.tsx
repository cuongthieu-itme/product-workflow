"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersList } from "@/components/users/users-list"
import { AddUserForm } from "@/components/users/add-user-form"
import { PendingAccounts } from "@/components/users/pending-accounts"
import { PasswordResetRequests } from "@/components/users/password-reset-requests"
import { UserReports } from "@/components/users/user-reports"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function UserManagement() {
  const { toast } = useToast()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [refreshUsers, setRefreshUsers] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole")
      setUserRole(role)

      if (role !== "admin") {
        toast({
          variant: "destructive",
          title: "Không có quyền truy cập",
          description: "Bạn không có quyền truy cập trang này.",
        })
        router.push("/dashboard")
      }

      // Khởi tạo dữ liệu mẫu nếu chưa có
      if (!localStorage.getItem("users")) {
        const initialUsers = [
          {
            id: "1",
            username: "user_rd",
            password: "password",
            fullName: "Nguyễn Văn A",
            email: "user_rd@example.com",
            role: "user",
            department: "rd",
            status: "active",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            username: "user_mkt",
            password: "password",
            fullName: "Trần Thị B",
            email: "user_mkt@example.com",
            role: "user",
            department: "mkt",
            status: "active",
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            username: "user_sales",
            password: "password",
            fullName: "Lê Văn C",
            email: "user_sales@example.com",
            role: "user",
            department: "sales",
            status: "active",
            createdAt: new Date().toISOString(),
          },
        ]
        localStorage.setItem("users", JSON.stringify(initialUsers))
      }

      // Fetch pending accounts count from Firebase
      fetchPendingAccountsCount()
    }
  }, [router, toast])

  // Add a function to fetch pending accounts count from Firebase
  const fetchPendingAccountsCount = async () => {
    try {
      const pendingUsersRef = collection(db, "pendingUsers")
      const snapshot = await getDocs(pendingUsersRef)
      setPendingCount(snapshot.size)
    } catch (error) {
      console.error("Error fetching pending accounts count:", error)
    }
  }

  // Update the updatePendingCount function to use Firebase
  const updatePendingCount = async () => {
    await fetchPendingAccountsCount()
  }

  const handleUserAdded = () => {
    // Cập nhật state để kích hoạt việc làm mới danh sách người dùng
    setRefreshUsers((prev) => prev + 1)
    // Đóng dialog sau khi thêm thành công
    setIsDialogOpen(false)
  }

  if (userRole !== "admin") {
    return null
  }

  return (
    <Tabs defaultValue="users" className="space-y-4" onValueChange={updatePendingCount}>
      <TabsList>
        <TabsTrigger value="users">Danh sách người dùng</TabsTrigger>
        <TabsTrigger value="pending-accounts" className="relative">
          Tài khoản chờ duyệt
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="password-requests">Yêu cầu đặt lại mật khẩu</TabsTrigger>
        <TabsTrigger value="reports">Báo cáo</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>Quản lý tài khoản người dùng trong hệ thống</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Tạo tài khoản
              </Button>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Thêm người dùng mới</DialogTitle>
                </DialogHeader>
                <AddUserForm onUserAdded={handleUserAdded} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <UsersList key={refreshUsers} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending-accounts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Tài khoản chờ duyệt
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount} tài khoản
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Quản lý các tài khoản đang chờ duyệt</CardDescription>
          </CardHeader>
          <CardContent>
            <PendingAccounts />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="password-requests" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu đặt lại mật khẩu</CardTitle>
            <CardDescription>Xử lý các yêu cầu đặt lại mật khẩu từ người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordResetRequests />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo hoạt động</CardTitle>
            <CardDescription>Báo cáo về hoạt động quản lý tài khoản</CardDescription>
          </CardHeader>
          <CardContent>
            <UserReports />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
