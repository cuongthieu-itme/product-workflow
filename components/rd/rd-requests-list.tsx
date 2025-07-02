"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, FileEdit } from "lucide-react"
import Link from "next/link"

// Dữ liệu mẫu cho yêu cầu R&D
const rdRequests = {
  pending: [
    {
      id: "REQ-001",
      title: "Thiết kế bao bì sản phẩm mới",
      department: "mkt",
      requestedBy: "Nguyễn Văn A",
      createdAt: new Date(2023, 5, 15),
      priority: "high",
    },
    {
      id: "REQ-005",
      title: "Thiết kế logo mới cho sản phẩm GHI",
      department: "mkt",
      requestedBy: "Hoàng Văn E",
      createdAt: new Date(2023, 5, 25),
      priority: "medium",
    },
    {
      id: "REQ-008",
      title: "Nghiên cứu vật liệu mới cho sản phẩm PQR",
      department: "bod",
      requestedBy: "Lý Thị H",
      createdAt: new Date(2023, 6, 5),
      priority: "high",
    },
  ],
  processing: [
    {
      id: "REQ-002",
      title: "Điều chỉnh kích thước sản phẩm XYZ",
      department: "sales",
      requestedBy: "Trần Thị B",
      createdAt: new Date(2023, 5, 18),
      status: "template",
      assignedTo: "Lê Văn C",
      dueDate: new Date(2023, 6, 10),
    },
    {
      id: "REQ-007",
      title: "Phát triển phiên bản mới của sản phẩm MNO",
      department: "rd",
      requestedBy: "Đỗ Văn G",
      createdAt: new Date(2023, 5, 30),
      status: "new_design",
      assignedTo: "Lê Văn C",
      dueDate: new Date(2023, 7, 15),
    },
  ],
  completed: [
    {
      id: "REQ-006",
      title: "Điều chỉnh màu sắc sản phẩm JKL",
      department: "sales",
      requestedBy: "Ngô Thị F",
      createdAt: new Date(2023, 5, 28),
      status: "template",
      assignedTo: "Lê Văn C",
      completedAt: new Date(2023, 6, 5),
    },
  ],
  denied: [
    {
      id: "REQ-003",
      title: "Phát triển tính năng mới cho sản phẩm ABC",
      department: "rd",
      requestedBy: "Lê Văn C",
      createdAt: new Date(2023, 5, 20),
      status: "hold",
      reason: "Cần thêm thông tin về yêu cầu kỹ thuật",
      decidedBy: "Trần Văn D",
      decidedAt: new Date(2023, 5, 22),
    },
    {
      id: "REQ-004",
      title: "Thay đổi chất liệu sản phẩm DEF",
      department: "bod",
      requestedBy: "Phạm Thị D",
      createdAt: new Date(2023, 5, 22),
      status: "deny",
      reason: "Không khả thi về mặt kỹ thuật",
      decidedBy: "Trần Văn D",
      decidedAt: new Date(2023, 5, 24),
    },
  ],
}

// Cấu hình hiển thị cho các trạng thái
const statusConfig: Record<string, { label: string; color: string }> = {
  new_design: { label: "Thiết kế mới", color: "bg-blue-500" },
  template: { label: "Có sẵn template", color: "bg-green-500" },
  hold: { label: "Tạm hoãn", color: "bg-yellow-500" },
  deny: { label: "Từ chối", color: "bg-red-500" },
}

// Cấu hình hiển thị cho các phòng ban
const departmentConfig: Record<string, string> = {
  mkt: "Marketing",
  rd: "R&D",
  sales: "Sales",
  bod: "Ban Giám Đốc",
}

// Cấu hình hiển thị cho các mức độ ưu tiên
const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "Cao", color: "bg-red-500" },
  medium: { label: "Trung bình", color: "bg-yellow-500" },
  low: { label: "Thấp", color: "bg-green-500" },
}

export function RDRequestsList({ status }: { status: "pending" | "processing" | "completed" | "denied" }) {
  // Hàm định dạng ngày tháng
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Lấy danh sách yêu cầu theo trạng thái
  const requests = rdRequests[status]

  // Render table theo trạng thái
  if (status === "pending") {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Mã yêu cầu</TableHead>
              <TableHead className="w-[250px]">Tiêu đề</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Người yêu cầu</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Mức độ ưu tiên</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không có yêu cầu nào
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
                const priority = priorityConfig[request.priority]
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{departmentConfig[request.department]}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={`${priority.color} text-white`}>{priority.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/requests/${request.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem
                          </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/dashboard/rd-management/classify/${request.id}`}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Phân loại
                          </Link>
                        </Button>
                      </div>
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

  if (status === "processing") {
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
              <TableHead>Người xử lý</TableHead>
              <TableHead>Hạn xử lý</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không có yêu cầu nào
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
                const status = statusConfig[request.status]
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{departmentConfig[request.department]}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>{request.assignedTo}</TableCell>
                    <TableCell>{formatDate(request.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/requests/${request.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem
                          </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/dashboard/rd-management/update/${request.id}`}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Cập nhật
                          </Link>
                        </Button>
                      </div>
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

  if (status === "completed") {
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
              <TableHead>Người xử lý</TableHead>
              <TableHead>Ngày hoàn thành</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không có yêu cầu nào
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
                const status = statusConfig[request.status]
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{departmentConfig[request.department]}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>{request.assignedTo}</TableCell>
                    <TableCell>{formatDate(request.completedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/requests/${request.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
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

  // Denied/Hold requests
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
            <TableHead>Lý do</TableHead>
            <TableHead>Người quyết định</TableHead>
            <TableHead>Ngày quyết định</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Không có yêu cầu nào
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => {
              const status = statusConfig[request.status]
              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>
                    <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{departmentConfig[request.department]}</TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>{request.decidedBy}</TableCell>
                  <TableCell>{formatDate(request.decidedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/requests/${request.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem
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
