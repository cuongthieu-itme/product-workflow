"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"
import Link from "next/link"
import { useRequest } from "@/components/requests/request-context-firebase"

// Cấu hình hiển thị cho các trạng thái
const getStatusDisplay = (request: any) => {
  // Kiểm tra trạng thái trực tiếp từ request nếu có
  if (request.status) {
    switch (request.status) {
      case "pending":
        return { label: "Chờ xử lý", color: "bg-yellow-500" }
      case "in_progress":
        return { label: "Đang xử lý", color: "bg-blue-500" }
      case "completed":
        return { label: "Hoàn thành", color: "bg-green-500" }
      case "rejected":
        return { label: "Từ chối", color: "bg-red-500" }
      case "on_hold":
        return { label: "Tạm hoãn", color: "bg-orange-500" }
      default:
        return { label: "Không xác định", color: "bg-gray-500" }
    }
  }

  // Nếu có workflow steps, tính toán dựa trên workflow
  if (request.workflowSteps && request.workflowSteps.length > 0) {
    const completedSteps = request.workflowSteps.filter((step: any) => step.status === "completed").length
    const totalSteps = request.workflowSteps.length
    const hasSkippedStep = request.workflowSteps.some((step: any) => step.status === "skipped")
    const hasInProgressStep = request.workflowSteps.some((step: any) => step.status === "in_progress")

    if (hasSkippedStep) {
      return { label: "Từ chối/Tạm hoãn", color: "bg-red-500" }
    }

    if (completedSteps === totalSteps) {
      return { label: "Hoàn thành", color: "bg-green-500" }
    }

    if (hasInProgressStep || completedSteps > 0) {
      return { label: "Đang xử lý", color: "bg-blue-500" }
    }

    return { label: "Chờ xử lý", color: "bg-yellow-500" }
  }

  // Fallback: dựa trên currentStepOrder và totalSteps
  if (request.currentStepOrder && request.totalSteps) {
    if (request.currentStepOrder >= request.totalSteps) {
      return { label: "Hoàn thành", color: "bg-green-500" }
    } else if (request.currentStepOrder > 1) {
      return { label: "Đang xử lý", color: "bg-blue-500" }
    } else {
      return { label: "Chờ xử lý", color: "bg-yellow-500" }
    }
  }

  // Mặc định
  return { label: "Chờ xử lý", color: "bg-yellow-500" }
}

// Cấu hình hiển thị cho các phòng ban
const departmentConfig: Record<string, string> = {
  mkt: "Marketing",
  rd: "R&D",
  sales: "Sales",
  bod: "Ban Giám Đốc",
  marketing: "Marketing",
  "r&d": "R&D",
  "ban giám đốc": "Ban Giám Đốc",
}

export function RecentRequests() {
  const { requests, loading } = useRequest()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userDepartment, setUserDepartment] = useState<string | null>(null)
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole"))
      setUserDepartment(localStorage.getItem("userDepartment"))
    }
  }, [])

  useEffect(() => {
    if (!requests || requests.length === 0) {
      setFilteredRequests([])
      return
    }

    let filtered = [...requests]

    // Lọc yêu cầu theo phòng ban nếu không phải admin
    if (userRole !== "admin" && userDepartment) {
      filtered = requests.filter((req) => {
        // Kiểm tra phòng ban của người tạo yêu cầu
        const creatorDept = req.creator?.department?.toLowerCase()
        const requestDept = req.department?.toLowerCase()
        const userDept = userDepartment.toLowerCase()

        // Nếu là R&D thì có thể xem tất cả yêu cầu (trừ những yêu cầu bị từ chối hoặc tạm hoãn)
        if (userDept === "rd" || userDept === "r&d") {
          const hasSkippedStep = req.workflowSteps?.some((step: any) => step.status === "skipped")
          return !hasSkippedStep
        }

        // Các phòng ban khác chỉ xem yêu cầu của phòng ban mình
        return creatorDept === userDept || requestDept === userDept
      })
    }

    // Sắp xếp theo ngày tạo mới nhất
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })

    // Lấy 10 yêu cầu gần nhất
    setFilteredRequests(filtered.slice(0, 10))
  }, [requests, userRole, userDepartment])

  // Hàm định dạng ngày tháng
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj)
  }

  // Hàm định dạng ngày giờ chi tiết
  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  // Hàm lấy tên phòng ban
  const getDepartmentName = (request: any) => {
    const creatorDept = request.creator?.department
    const requestDept = request.department

    if (creatorDept) {
      return departmentConfig[creatorDept.toLowerCase()] || creatorDept
    }

    if (requestDept) {
      return departmentConfig[requestDept.toLowerCase()] || requestDept
    }

    // Fallback: dựa vào dataSource
    if (request.dataSource?.type === "department") {
      return request.dataSource.name
    }

    return "Không xác định"
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="h-24 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Mã yêu cầu</TableHead>
            <TableHead className="w-[250px]">Tiêu đề</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Người yêu cầu</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Không có yêu cầu nào
              </TableCell>
            </TableRow>
          ) : (
            filteredRequests.map((request) => {
              const status = getStatusDisplay(request)
              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.code}</TableCell>
                  <TableCell className="max-w-[250px] truncate" title={request.title}>
                    {request.title}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{getDepartmentName(request)}</TableCell>
                  <TableCell>{request.creator?.name || "Không xác định"}</TableCell>
                  <TableCell title={formatDateTime(request.createdAt)}>{formatDate(request.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/requests/${request.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
