"use client"

import { useState, useEffect } from "react"
import { historyService } from "@/lib/history-service"
import type { HistoryEntry } from "@/models/history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Clock, CheckCircle, XCircle, AlertCircle, Search } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useRequest } from "@/components/requests/request-context-firebase"
import { useSubWorkflow } from "@/components/workflow/sub-workflow-context-firebase"
import { useStandardWorkflow } from "@/components/workflow/standard-workflow-context-firebase"

export function ActivityHistory() {
  const [allHistory, setAllHistory] = useState<HistoryEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("current")

  const { requests } = useRequest()
  const { subWorkflows } = useSubWorkflow()
  const { standardWorkflow } = useStandardWorkflow()

  useEffect(() => {
    fetchAllHistory()
  }, [])

  useEffect(() => {
    filterHistory()
  }, [allHistory, searchTerm, statusFilter, actionFilter, activeTab, requests])

  const fetchAllHistory = async () => {
    try {
      setLoading(true)
      const history = await historyService.getAllHistory()
      setAllHistory(history)
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = [...allHistory]

    if (activeTab === "current") {
      filtered = filtered.filter(
        (entry) =>
          entry.action === "start_step" &&
          !allHistory.some(
            (h) => h.requestId === entry.requestId && h.entityId === entry.entityId && h.action === "complete_step",
          ),
      )
    } else if (activeTab === "completed") {
      filtered = filtered.filter((entry) => entry.action === "complete_step")
    } else if (activeTab === "all") {
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.details?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((entry) => {
        const status = entry.metadata?.status || "unknown"
        return status === statusFilter
      })
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((entry) => entry.action === actionFilter)
    }

    filtered.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0
      return timeB - timeA
    })

    setFilteredHistory(filtered)
  }

  const getStatusIcon = (entry: HistoryEntry) => {
    const status = entry.metadata?.status
    switch (status) {
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "skipped":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (entry: HistoryEntry) => {
    const status = entry.metadata?.status || entry.action

    if (status === "in_progress" || entry.action === "start_step") {
      const isOverdue = checkIfOverdue(entry)
      if (isOverdue) {
        return <Badge variant="destructive">Trễ giờ</Badge>
      } else {
        return <Badge variant="default">Đang làm</Badge>
      }
    }

    const statusMap = {
      completed: { label: "Đã hoàn thành", variant: "secondary" as const },
      skipped: { label: "Đã bỏ qua", variant: "destructive" as const },
      complete_step: { label: "Hoàn thành", variant: "secondary" as const },
      revert: { label: "Quay lại", variant: "destructive" as const },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: "Đang làm", variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const checkIfOverdue = (entry: HistoryEntry) => {
    const estimatedTime = entry.metadata?.estimatedTime
    const estimatedTimeUnit = entry.metadata?.estimatedTimeUnit || "hours"
    const startTime = entry.metadata?.startedAt || entry.timestamp

    if (!estimatedTime || !startTime) return false

    const startDate = startTime instanceof Date ? startTime : new Date(startTime)
    const now = new Date()

    let estimatedMs = 0
    switch (estimatedTimeUnit) {
      case "minutes":
        estimatedMs = estimatedTime * 60 * 1000
        break
      case "hours":
        estimatedMs = estimatedTime * 60 * 60 * 1000
        break
      case "days":
        estimatedMs = estimatedTime * 24 * 60 * 60 * 1000
        break
      default:
        estimatedMs = estimatedTime * 60 * 60 * 1000
    }

    const expectedEndTime = new Date(startDate.getTime() + estimatedMs)
    return now > expectedEndTime
  }

  const getRequestName = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId)
    return request?.title || requestId
  }

  const getEstimatedEndTime = (entry: HistoryEntry) => {
    if (entry.metadata?.fieldValues?.deadline) {
      try {
        const deadlineStr = entry.metadata.fieldValues.deadline
        const deadlineDate =
          typeof deadlineStr === "string"
            ? new Date(deadlineStr)
            : deadlineStr instanceof Date
              ? deadlineStr
              : new Date(deadlineStr)

        if (!isNaN(deadlineDate.getTime())) {
          return deadlineDate
        }
      } catch (error) {
        console.warn("Error parsing deadline from fieldValues:", error)
      }
    }

    const estimatedTime = entry.metadata?.estimatedTime
    const estimatedTimeUnit = entry.metadata?.estimatedTimeUnit || "hours"
    const startTime = entry.metadata?.startedAt || entry.timestamp

    if (!estimatedTime || !startTime) return null

    const startDate = startTime instanceof Date ? startTime : new Date(startTime)

    let estimatedMs = 0
    switch (estimatedTimeUnit) {
      case "minutes":
        estimatedMs = estimatedTime * 60 * 1000
        break
      case "hours":
        estimatedMs = estimatedTime * 60 * 60 * 1000
        break
      case "days":
        estimatedMs = estimatedTime * 24 * 60 * 60 * 1000
        break
      default:
        estimatedMs = estimatedTime * 60 * 60 * 1000
    }

    return new Date(startDate.getTime() + estimatedMs)
  }

  const getCurrentWorkSummary = () => {
    const currentWork = allHistory.filter(
      (entry) =>
        entry.action === "start_step" &&
        !allHistory.some(
          (h) => h.requestId === entry.requestId && h.entityId === entry.entityId && h.action === "complete_step",
        ),
    )

    const workByUser = currentWork.reduce(
      (acc, entry) => {
        const userName = entry.userName || "Không xác định"
        if (!acc[userName]) {
          acc[userName] = []
        }
        acc[userName].push(entry)
        return acc
      },
      {} as Record<string, HistoryEntry[]>,
    )

    return workByUser
  }

  const getPerformanceStatistics = () => {
    const completedSteps = allHistory
      .filter((entry) => entry.action === "complete_step")
      .map((completeEntry) => {
        const startEntry = allHistory.find(
          (startEntry) =>
            startEntry.action === "start_step" &&
            startEntry.requestId === completeEntry.requestId &&
            startEntry.entityId === completeEntry.entityId &&
            startEntry.userId === completeEntry.userId,
        )

        if (!startEntry) return null

        const startTime = startEntry.timestamp instanceof Date ? startEntry.timestamp : new Date(startEntry.timestamp)
        const endTime =
          completeEntry.timestamp instanceof Date ? completeEntry.timestamp : new Date(completeEntry.timestamp)
        const duration = endTime.getTime() - startTime.getTime()

        return {
          userId: completeEntry.userId,
          userName: completeEntry.userName,
          stepId: completeEntry.entityId,
          stepName: getStepName(completeEntry),
          duration: duration,
          startTime,
          endTime,
        }
      })
      .filter(Boolean)

    const groupedByStep = completedSteps.reduce(
      (acc, step) => {
        const key = step.stepId
        if (!acc[key]) {
          acc[key] = {
            stepId: step.stepId,
            stepName: step.stepName,
            durations: [],
            count: 0,
            users: new Set(),
          }
        }
        acc[key].durations.push(step.duration)
        acc[key].count++
        acc[key].users.add(step.userName)
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(groupedByStep).map((stat: any) => {
      const averageDuration = stat.durations.reduce((sum: number, d: number) => sum + d, 0) / stat.durations.length

      let standardDuration = null
      let standardTimeUnit = "hours"

      if (standardWorkflow?.steps) {
        const step = standardWorkflow.steps.find((s) => s.id === stat.stepId)
        if (step && step.estimatedTime) {
          standardTimeUnit = step.estimatedTimeUnit || "hours"
          switch (standardTimeUnit) {
            case "minutes":
              standardDuration = step.estimatedTime * 60 * 1000
              break
            case "hours":
              standardDuration = step.estimatedTime * 60 * 60 * 1000
              break
            case "days":
              standardDuration = step.estimatedTime * 24 * 60 * 60 * 1000
              break
            default:
              standardDuration = step.estimatedTime * 60 * 60 * 1000
          }
        }
      }

      let variance = null
      let variancePercentage = null
      if (standardDuration) {
        variance = averageDuration - standardDuration
        variancePercentage = ((averageDuration - standardDuration) / standardDuration) * 100
      }

      return {
        ...stat,
        averageDuration,
        minDuration: Math.min(...stat.durations),
        maxDuration: Math.max(...stat.durations),
        standardDuration,
        standardTimeUnit,
        variance,
        variancePercentage,
        userCount: stat.users.size,
      }
    })
  }

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getStepName = (entry: HistoryEntry) => {
    if (entry.metadata?.stepName) {
      return entry.metadata.stepName
    }

    if (standardWorkflow?.steps) {
      const step = standardWorkflow.steps.find((s) => s.id === entry.entityId)
      if (step) {
        return step.name
      }
    }

    const subWorkflow = subWorkflows.find((sw) => sw.id === entry.entityId)
    if (subWorkflow) {
      return subWorkflow.name
    }

    return entry.entityId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Đang tải lịch sử hoạt động...</p>
        </div>
      </div>
    )
  }

  const currentWorkSummary = getCurrentWorkSummary()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(currentWorkSummary).map(([userName, entries]) => (
          <Card key={userName}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                {userName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
              <p className="text-xs text-muted-foreground">công việc đang thực hiện</p>
              <div className="mt-2 space-y-1">
                {entries.slice(0, 2).map((entry, index) => (
                  <div key={index} className="text-xs truncate">
                    {entry.requestId}: {entry.metadata?.stepName || entry.details}
                  </div>
                ))}
                {entries.length > 2 && (
                  <div className="text-xs text-muted-foreground">+{entries.length - 2} công việc khác</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, mã yêu cầu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
            <SelectItem value="skipped">Đã bỏ qua</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo hành động" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hành động</SelectItem>
            <SelectItem value="start_step">Bắt đầu bước</SelectItem>
            <SelectItem value="complete_step">Hoàn thành bước</SelectItem>
            <SelectItem value="revert">Quay lại</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">Đang thực hiện ({Object.values(currentWorkSummary).flat().length})</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          <TabsTrigger value="performance">Thống kê hiệu suất</TabsTrigger>
          <TabsTrigger value="all">Tất cả hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Tên yêu cầu</TableHead>
                    <TableHead>Hoạt động</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian bắt đầu</TableHead>
                    <TableHead>Dự kiến hoàn thành</TableHead>
                    <TableHead>Thời gian hoàn thành</TableHead>
                    <TableHead>Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {loading ? "Đang tải..." : "Không có hoạt động nào phù hợp"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((entry) => (
                      <TableRow key={entry.id || entry.firebaseId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{entry.userName || "Không xác định"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{getRequestName(entry.requestId)}</div>
                            <code className="text-xs text-muted-foreground">{entry.requestId}</code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(entry)}
                            <span className="text-sm">{getStepName(entry)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(entry)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.timestamp instanceof Date
                              ? format(entry.timestamp, "dd/MM/yyyy HH:mm", { locale: vi })
                              : "Không xác định"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const estimatedEnd = getEstimatedEndTime(entry)
                              if (!estimatedEnd) return "Chưa xác định"

                              try {
                                return format(estimatedEnd, "dd/MM/yyyy HH:mm", { locale: vi })
                              } catch (error) {
                                console.warn("Error formatting estimated end time:", error)
                                return "Lỗi định dạng"
                              }
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.metadata?.completedAt instanceof Date
                              ? format(entry.metadata.completedAt, "dd/MM/yyyy HH:mm", { locale: vi })
                              : entry.action === "complete_step"
                                ? format(
                                    entry.timestamp instanceof Date ? entry.timestamp : new Date(),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: vi },
                                  )
                                : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate" title={entry.details}>
                            {entry.details}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê hiệu suất theo bước công việc</CardTitle>
              <p className="text-sm text-muted-foreground">
                So sánh thời gian thực tế với thời gian chuẩn của từng bước
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bước công việc</TableHead>
                    <TableHead>Số lần hoàn thành</TableHead>
                    <TableHead>Số nhân viên</TableHead>
                    <TableHead>Thời gian chuẩn</TableHead>
                    <TableHead>Thời gian thực tế TB</TableHead>
                    <TableHead>Chênh lệch</TableHead>
                    <TableHead>Hiệu suất</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const performanceStats = getPerformanceStatistics()
                    return performanceStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">Chưa có dữ liệu thống kê hiệu suất</div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      performanceStats
                        .sort((a, b) => a.stepName.localeCompare(b.stepName))
                        .map((stat, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <span className="font-medium">{stat.stepName}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{stat.count} lần</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{stat.userCount} người</Badge>
                            </TableCell>
                            <TableCell>
                              {stat.standardDuration ? (
                                <span className="text-blue-600">{formatDuration(stat.standardDuration)}</span>
                              ) : (
                                <span className="text-muted-foreground">Chưa thiết lập</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{formatDuration(stat.averageDuration)}</span>
                            </TableCell>
                            <TableCell>
                              {stat.variance !== null ? (
                                <div className="flex items-center gap-1">
                                  <span className={stat.variance > 0 ? "text-red-600" : "text-green-600"}>
                                    {stat.variance > 0 ? "+" : ""}
                                    {formatDuration(Math.abs(stat.variance))}
                                  </span>
                                  <span className={`text-xs ${stat.variance > 0 ? "text-red-600" : "text-green-600"}`}>
                                    ({stat.variancePercentage > 0 ? "+" : ""}
                                    {stat.variancePercentage.toFixed(1)}%)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {stat.variancePercentage !== null ? (
                                <Badge
                                  variant={
                                    stat.variancePercentage <= -10
                                      ? "default"
                                      : stat.variancePercentage <= 10
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {stat.variancePercentage <= -10
                                    ? "Xuất sắc"
                                    : stat.variancePercentage <= 10
                                      ? "Tốt"
                                      : "Cần cải thiện"}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Chưa đánh giá</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    )
                  })()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
