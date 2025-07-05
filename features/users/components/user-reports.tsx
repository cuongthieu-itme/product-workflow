'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PasswordHistory {
  username: string
  changedBy: string
  changedAt: string
}

interface UserActivity {
  action: string
  username: string
  performedBy: string
  timestamp: string
}

export function UserReports() {
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])

  useEffect(() => {
    // Lấy lịch sử đặt lại mật khẩu
    const storedPasswordHistory = JSON.parse(
      localStorage.getItem('passwordHistory') || '[]'
    )
    setPasswordHistory(storedPasswordHistory)

    // Lấy lịch sử hoạt động người dùng
    const storedUserActivity = JSON.parse(
      localStorage.getItem('userActivity') || '[]'
    )
    setUserActivity(storedUserActivity)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getActionName = (action: string) => {
    switch (action) {
      case 'create':
        return 'Tạo tài khoản'
      case 'update':
        return 'Cập nhật tài khoản'
      case 'delete':
        return 'Xóa tài khoản'
      default:
        return action
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    // Chuyển đổi dữ liệu thành CSV
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map((item) => Object.values(item).join(','))
    const csv = [headers, ...rows].join('\n')

    // Tạo file CSV và tải xuống
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Tabs defaultValue="password-history" className="space-y-4">
      <TabsList>
        <TabsTrigger value="password-history">
          Lịch sử đặt lại mật khẩu
        </TabsTrigger>
        <TabsTrigger value="user-activity">Hoạt động người dùng</TabsTrigger>
      </TabsList>

      <TabsContent value="password-history" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lịch sử đặt lại mật khẩu</CardTitle>
              <CardDescription>
                Danh sách các hoạt động đặt lại mật khẩu
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCSV(passwordHistory, 'password-history.csv')
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          </CardHeader>
          <CardContent>
            {passwordHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Không có lịch sử đặt lại mật khẩu nào.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passwordHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.username}
                      </TableCell>
                      <TableCell>{item.changedBy}</TableCell>
                      <TableCell>{formatDate(item.changedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="user-activity" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hoạt động người dùng</CardTitle>
              <CardDescription>
                Danh sách các hoạt động quản lý tài khoản
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(userActivity, 'user-activity.csv')}
            >
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          </CardHeader>
          <CardContent>
            {userActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Không có hoạt động người dùng nào.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hành động</TableHead>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivity.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{getActionName(item.action)}</TableCell>
                      <TableCell className="font-medium">
                        {item.username}
                      </TableCell>
                      <TableCell>{item.performedBy}</TableCell>
                      <TableCell>{formatDate(item.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
