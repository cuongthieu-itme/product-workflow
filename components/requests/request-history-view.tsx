"use client"

import { useState, useEffect } from "react"
import { historyService } from "@/lib/history-service"
import type { HistoryEntry } from "@/models/history"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Info, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface RequestHistoryViewProps {
  requestId: string
  departments: Record<string, string>
}

export function RequestHistoryView({ requestId, departments }: RequestHistoryViewProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [historyTab, setHistoryTab] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterEntity, setFilterEntity] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      setError(null)
      try {
        const historyData = await historyService.getHistoryByRequestId(requestId)
        setHistory(historyData)
      } catch (error) {
        console.error("Error fetching history:", error)
        setError("Không thể tải lịch sử yêu cầu. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [requestId])

  // Hàm lấy tên phòng ban từ ID
  const getDepartmentName = (departmentId: string): string => {
    if (!departmentId) return ""
    return departments[departmentId] || departmentId
  }

  // Kiểm tra xem một giá trị có phải là ngày hợp lệ không
  const isValidDate = (value: any): boolean => {
    if (!value) return false

    try {
      const date = new Date(value)
      return !isNaN(date.getTime())
    } catch (error) {
      return false
    }
  }

  // Hiển thị giá trị trường dữ liệu
  const renderFieldValue = (field: any, value: any) => {
    if (value === undefined || value === null || value === "") {
      return "Chưa có dữ liệu"
    }

    switch (field) {
      case "date":
        return isValidDate(value) ? format(new Date(value), "PPP", { locale: vi }) : value
      case "checkbox":
        return value ? "Có" : "Không"
      case "currency":
        return `${value.toLocaleString()} ${field.currencySymbol || "VND"}`
      case "user":
        // Giả lập hiển thị tên người dùng
        const userMap: Record<string, string> = {
          user1: "Nguyễn Văn A",
          user2: "Trần Thị B",
          user3: "Lê Văn C",
        }
        return userMap[value] || value
      default:
        return value
    }
  }

  // Hàm lấy tên hiển thị cho trường
  const getFieldDisplayName = (field: string): string => {
    const fieldDisplayNames: Record<string, string> = {
      status: "Trạng thái",
      title: "Tiêu đề",
      description: "Mô tả",
      dataSource: "Nguồn dữ liệu",
      referenceLink: "Link tham khảo",
      images: "Ảnh",
      assignee: "Người xử lý",
      currentStepId: "Bước hiện tại",
      currentStepStatus: "Trạng thái bước",
      workflowProcess: "Quy trình",
      productStatus: "Trạng thái sản phẩm",
      materials: "Nguyên vật liệu",
      completedDate: "Ngày hoàn thành",
      startDate: "Ngày bắt đầu",
    }

    return fieldDisplayNames[field] || field
  }

  // Lọc lịch sử theo tab đang chọn
  const filteredHistory = history.filter((history) => {
    if (activeTab === "all") return true
    if (historyTab === "status" && history.action === "update" && history.changes?.some((c) => c.field === "status"))
      return true
    if (
      historyTab === "assignee" &&
      history.action === "update" &&
      history.changes?.some((c) => c.field === "assignee")
    )
      return true
    if (historyTab === "workflow" && (history.entityType === "workflow" || history.entityType === "step")) return true
    if (historyTab === "revert" && history.action === "revert") return true
    return false
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-full bg-muted animate-pulse rounded"></div>
        <div className="h-64 w-full bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lịch sử thay đổi</CardTitle>
            <CardDescription>Xem lịch sử thay đổi của yêu cầu theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
              <p>{error}</p>
              <p className="text-sm mt-2">
                Lỗi này có thể do thiếu chỉ mục Firebase. Nếu bạn là quản trị viên, vui lòng tạo chỉ mục theo hướng dẫn
                trong bảng điều khiển Firebase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử chỉnh sửa</CardTitle>
          <CardDescription>Xem lịch sử thay đổi của quy trình, bước và trường</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Tìm kiếm theo tên, người thực hiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                    <option value="all">Tất cả</option>
                    <option value="create">Tạo mới</option>
                    <option value="update">Cập nhật</option>
                    <option value="delete">Xóa</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value as any)}>
                    <option value="all">Tất cả</option>
                    <option value="workflow">Quy trình</option>
                    <option value="step">Bước</option>
                    <option value="field">Trường</option>
                  </select>
                </div>
                <button onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {sortOrder === "newest" ? "Mới nhất trước" : "Cũ nhất trước"}
                </button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="standard">Quy trình chuẩn</TabsTrigger>
                <TabsTrigger value="sub">Quy trình con</TabsTrigger>
                <TabsTrigger value="step">Bước</TabsTrigger>
                <TabsTrigger value="field">Trường</TabsTrigger>
              </TabsList>

              <TabsTrigger value={activeTab}>
                <Card>
                  <CardContent className="p-0">
                    <div className="h-[500px]">
                      {filteredHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-muted-foreground">Không có lịch sử thay đổi nào phù hợp.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 p-4">
                          {filteredHistory.map((history) => (
                            <div key={history.id} className="border rounded-md p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Badge
                                    variant={
                                      history.changeType === "create"
                                        ? "default"
                                        : history.changeType === "update"
                                          ? "outline"
                                          : "destructive"
                                    }
                                    className="mb-2"
                                  >
                                    {history.changeType === "create"
                                      ? "Tạo mới"
                                      : history.changeType === "update"
                                        ? "Cập nhật"
                                        : "Xóa"}
                                  </Badge>
                                  <h3 className="text-sm font-medium">
                                    {history.entityType === "workflow"
                                      ? "Quy trình"
                                      : history.entityType === "step"
                                        ? "Bước"
                                        : "Trường"}
                                    : {history.entityId}
                                  </h3>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">
                                    {history.changedAt
                                      ? format(new Date(history.changedAt), "PPP", { locale: vi })
                                      : "Không có thời gian"}
                                  </p>
                                  <p className="text-sm font-medium">{history.changedBy}</p>
                                </div>
                              </div>
                              <div className="mt-3 space-y-2">
                                {history.changes.map((change, index) => (
                                  <div key={index} className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="font-medium">{getFieldDisplayName(change.field)}</div>
                                    <div className="text-muted-foreground">
                                      {change.oldValue !== undefined ? (
                                        change.oldValue === null ? (
                                          <span className="italic">Không có giá trị</span>
                                        ) : (
                                          change.oldValue
                                        )
                                      ) : (
                                        <span className="italic">Không có giá trị cũ</span>
                                      )}
                                    </div>
                                    <div>
                                      {change.newValue !== undefined ? (
                                        change.newValue === null ? (
                                          <span className="italic">Đã xóa</span>
                                        ) : (
                                          change.newValue
                                        )
                                      ) : (
                                        <span className="italic">Không có giá trị mới</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsTrigger>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
