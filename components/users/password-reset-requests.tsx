"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/components/ui/use-toast"

interface PasswordResetRequest {
  id: string
  username: string
  requestedAt: string
  status: string
}

export function PasswordResetRequests() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null)
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    // Lấy danh sách yêu cầu đặt lại mật khẩu từ localStorage
    const storedRequests = JSON.parse(localStorage.getItem("forgotRequests") || "[]")
    setRequests(storedRequests)
  }, [])

  const handleResetPassword = (request: PasswordResetRequest) => {
    setSelectedRequest(request)
    setNewPassword("")
  }

  const handleSaveNewPassword = () => {
    if (!selectedRequest || !newPassword) return

    // Cập nhật mật khẩu người dùng
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedUsers = users.map((user: any) =>
      user.username === selectedRequest.username ? { ...user, password: newPassword } : user,
    )
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Cập nhật trạng thái yêu cầu
    const updatedRequests = requests.map((req) =>
      req.id === selectedRequest.id ? { ...req, status: "completed" } : req,
    )
    localStorage.setItem("forgotRequests", JSON.stringify(updatedRequests))
    setRequests(updatedRequests)

    // Lưu lịch sử đặt lại mật khẩu
    const passwordHistory = JSON.parse(localStorage.getItem("passwordHistory") || "[]")
    passwordHistory.push({
      username: selectedRequest.username,
      changedBy: localStorage.getItem("username") || "admin",
      changedAt: new Date().toISOString(),
    })
    localStorage.setItem("passwordHistory", JSON.stringify(passwordHistory))

    // Thêm thông báo cho người dùng
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    notifications.push({
      id: Date.now().toString(),
      title: "Mật khẩu đã được đặt lại",
      message: `Mật khẩu của bạn đã được đặt lại bởi quản trị viên.`,
      type: "password_reset",
      createdAt: new Date().toISOString(),
      read: false,
      forUser: selectedRequest.username,
    })
    localStorage.setItem("notifications", JSON.stringify(notifications))

    setSelectedRequest(null)
    setNewPassword("")

    toast({
      title: "Đặt lại mật khẩu thành công",
      description: `Mật khẩu của người dùng ${selectedRequest.username} đã được đặt lại.`,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div>
      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Không có yêu cầu đặt lại mật khẩu nào.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Thời gian yêu cầu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.username}</TableCell>
                <TableCell>{formatDate(request.requestedAt)}</TableCell>
                <TableCell>
                  <Badge variant={request.status === "pending" ? "outline" : "default"}>
                    {request.status === "pending" ? "Đang chờ" : "Đã xử lý"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === "pending" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => handleResetPassword(request)}>
                          Đặt lại mật khẩu
                        </Button>
                      </DialogTrigger>
                      {selectedRequest && (
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
                            <DialogDescription>
                              Đặt lại mật khẩu cho người dùng {selectedRequest.username}
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
                            <Button type="submit" onClick={handleSaveNewPassword}>
                              Đặt lại mật khẩu
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
