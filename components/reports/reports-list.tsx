"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, BarChart3, FileText } from "lucide-react"

// Dữ liệu mẫu cho báo cáo
const reports = [
  {
    id: "1",
    title: "Báo cáo tiến độ phát triển sản phẩm Q2/2023",
    type: "product",
    createdAt: new Date(2023, 5, 30),
    createdBy: "Nguyễn Văn A",
    department: "product",
  },
  {
    id: "2",
    title: "Báo cáo hiệu quả marketing Q2/2023",
    type: "marketing",
    createdAt: new Date(2023, 5, 30),
    createdBy: "Lê Văn C",
    department: "marketing",
  },
  {
    id: "3",
    title: "Báo cáo hiệu suất sản phẩm Q2/2023",
    type: "product",
    createdAt: new Date(2023, 5, 30),
    createdBy: "Nguyễn Văn A",
    department: "product",
  },
  {
    id: "4",
    title: "Báo cáo phân tích thị trường Q2/2023",
    type: "marketing",
    createdAt: new Date(2023, 5, 28),
    createdBy: "Lê Văn C",
    department: "marketing",
  },
  {
    id: "5",
    title: "Báo cáo tổng hợp doanh số Q2/2023",
    type: "sales",
    createdAt: new Date(2023, 5, 29),
    createdBy: "Phạm Thị D",
    department: "sales",
  },
]

// Lọc báo cáo theo loại
const filterReportsByType = (reports: typeof reports, type?: string) => {
  if (!type) return reports
  return reports.filter((report) => report.type === type)
}

export function ReportsList({ type }: { type?: string }) {
  // Lọc báo cáo theo loại
  const filteredReports = filterReportsByType(reports, type)

  // Hàm định dạng ngày tháng
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Cấu hình hiển thị cho các loại báo cáo
  const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    product: {
      label: "Sản Phẩm",
      color: "bg-blue-500",
      icon: <FileText className="h-4 w-4" />,
    },
    marketing: {
      label: "Marketing",
      color: "bg-pink-500",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    sales: {
      label: "Doanh Số",
      color: "bg-green-500",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    custom: {
      label: "Tùy Chỉnh",
      color: "bg-purple-500",
      icon: <FileText className="h-4 w-4" />,
    },
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Tiêu Đề</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Người Tạo</TableHead>
            <TableHead>Ngày Tạo</TableHead>
            <TableHead className="text-right">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Không có báo cáo nào
              </TableCell>
            </TableRow>
          ) : (
            filteredReports.map((report) => {
              const typeInfo = typeConfig[report.type] || typeConfig.custom
              return (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>
                    <Badge className={`${typeInfo.color} text-white flex gap-1 items-center w-fit`}>
                      {typeInfo.icon}
                      {typeInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.createdBy}</TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Tải Xuống
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
