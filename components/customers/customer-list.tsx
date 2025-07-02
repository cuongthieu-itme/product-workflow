"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useCustomers } from "./customer-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export function CustomerList() {
  const { customers, loading, error, refreshData, deleteCustomer } = useCustomers()
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("vi-VN")
    } catch {
      return "N/A"
    }
  }

  const handleDeleteCustomer = async (id: string, name: string) => {
    try {
      setDeletingId(id)
      console.log(`🗑️ Deleting customer: ${name} (${id})`)
      await deleteCustomer(id)
      toast({
        title: "Xóa thành công",
        description: `Đã xóa khách hàng ${name}`,
      })
      await refreshData()
    } catch (error) {
      console.error("❌ Error deleting customer:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa khách hàng. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setDeletingId("")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Danh sách khách hàng</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin khách hàng từ Firebase ({customers.length} khách hàng)
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Link>
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="ml-2" onClick={refreshData} disabled={loading}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Đang tải dữ liệu khách hàng...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-red-500 mb-2">{error}</div>
          <Button onClick={refreshData} variant="outline">
            Thử lại
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Tên khách hàng</th>
                <th className="text-left p-3">Liên hệ</th>
                <th className="text-left p-3">Nguồn</th>
                <th className="text-left p-3">Giới tính</th>
                <th className="text-left p-3">Ngày sinh</th>
                <th className="text-left p-3">Ngày tạo</th>
                <th className="text-right p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8">
                    {searchTerm ? "Không tìm thấy khách hàng nào" : "Chưa có khách hàng nào"}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{customer.name || "N/A"}</div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {customer.phone && <div className="flex items-center text-sm">{customer.phone}</div>}
                        {customer.email && (
                          <div className="flex items-center text-sm text-muted-foreground">{customer.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{customer.source || "N/A"}</td>
                    <td className="p-3">
                      {customer.gender === "male"
                        ? "Nam"
                        : customer.gender === "female"
                          ? "Nữ"
                          : customer.gender === "other"
                            ? "Khác"
                            : "Không xác định"}
                    </td>
                    <td className="p-3">{formatDate(customer.birthDate)}</td>
                    <td className="p-3">{formatDate(customer.createdAt)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/customers/${customer.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Xem</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/customers/${customer.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Sửa</span>
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={deletingId === customer.id}>
                              {deletingId === customer.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">Xóa</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa khách hàng <strong>{customer.name}</strong>? Hành động này
                                không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCustomer(customer.id, customer.name || "")}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
