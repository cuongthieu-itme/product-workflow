"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface WorkflowStepPerformance {
  stepName: string
  completedCount: number
  staffCount: number
  totalExpectedHours: number
  totalActualHours: number
  efficiency: number // percentage
  deviation: number // hours difference
}

export function WorkPerformance() {
  const [performanceData, setPerformanceData] = useState<WorkflowStepPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)

      // Get all history entries
      const historyQuery = query(collection(db, "requestHistory"), where("entityType", "==", "step"))

      const historySnapshot = await getDocs(historyQuery)
      const historyEntries = historySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Group entries by step and request
      const stepTaskMap: { [key: string]: { start?: any; complete?: any } } = {}

      historyEntries.forEach((entry) => {
        const stepName =
          entry.metadata?.stepName || entry.details?.replace("Bắt đầu bước: ", "").replace("Hoàn thành bước: ", "")

        if (!stepName || stepName.includes("collection") || stepName.includes("Khởi tạo")) {
          return
        }

        const taskKey = `${entry.requestId}-${entry.entityId}-${stepName}`

        if (!stepTaskMap[taskKey]) {
          stepTaskMap[taskKey] = {}
        }

        if (entry.action === "start_step") {
          stepTaskMap[taskKey].start = entry
        } else if (entry.action === "complete_step") {
          stepTaskMap[taskKey].complete = entry
        }
      })

      // Calculate performance for each step
      const stepStats: { [stepName: string]: WorkflowStepPerformance } = {}

      Object.values(stepTaskMap).forEach((task) => {
        if (!task.start || !task.complete) return

        const stepName = task.start.metadata?.stepName || task.start.details?.replace("Bắt đầu bước: ", "")

        if (!stepName) return

        // Initialize step stats if not exists
        if (!stepStats[stepName]) {
          stepStats[stepName] = {
            stepName,
            completedCount: 0,
            staffCount: 0,
            totalExpectedHours: 0,
            totalActualHours: 0,
            efficiency: 0,
            deviation: 0,
          }
        }

        // Calculate expected hours from deadline
        let expectedHours = 0
        if (task.start.metadata?.fieldValues?.deadline) {
          const deadline = new Date(task.start.metadata.fieldValues.deadline)
          const startTime = task.start.timestamp?.toDate
            ? task.start.timestamp.toDate()
            : new Date(task.start.timestamp)
          expectedHours = (deadline.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        } else if (task.start.metadata?.estimatedTime) {
          expectedHours = task.start.metadata.estimatedTime
        }

        // Calculate actual hours
        const startTime = task.start.timestamp?.toDate ? task.start.timestamp.toDate() : new Date(task.start.timestamp)
        const completeTime = task.complete.timestamp?.toDate
          ? task.complete.timestamp.toDate()
          : new Date(task.complete.timestamp)
        const actualHours = (completeTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

        // Add to totals
        stepStats[stepName].completedCount++
        stepStats[stepName].totalExpectedHours += expectedHours
        stepStats[stepName].totalActualHours += actualHours

        // Track unique staff
        const staffSet = new Set()
        if (task.start.userId) staffSet.add(task.start.userId)
        if (task.complete.userId) staffSet.add(task.complete.userId)
      })

      // Calculate final metrics for each step
      const performanceStats: WorkflowStepPerformance[] = Object.values(stepStats).map((step) => {
        // Count unique staff for this step
        const uniqueStaff = new Set()
        Object.values(stepTaskMap).forEach((task) => {
          if (task.start && task.complete) {
            const taskStepName = task.start.metadata?.stepName || task.start.details?.replace("Bắt đầu bước: ", "")
            if (taskStepName === step.stepName) {
              if (task.start.userId) uniqueStaff.add(task.start.userId)
              if (task.complete.userId) uniqueStaff.add(task.complete.userId)
            }
          }
        })

        step.staffCount = uniqueStaff.size

        // Calculate efficiency: Expected / Actual * 100%
        if (step.totalActualHours > 0) {
          step.efficiency = (step.totalExpectedHours / step.totalActualHours) * 100
        } else {
          step.efficiency = 0
        }

        // Calculate deviation: Actual - Expected
        step.deviation = step.totalActualHours - step.totalExpectedHours

        return step
      })

      // Sort by completion count descending
      performanceStats.sort((a, b) => b.completedCount - a.completedCount)

      setPerformanceData(performanceStats)
    } catch (error) {
      console.error("Error fetching performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} phút`
    } else if (hours < 24) {
      return `${hours.toFixed(1)} giờ`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days} ngày ${remainingHours.toFixed(1)} giờ`
    }
  }

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 100) {
      return <Badge className="bg-green-500 text-white">Hiệu quả</Badge>
    } else if (efficiency >= 80) {
      return <Badge className="bg-yellow-500 text-white">Bình thường</Badge>
    } else {
      return <Badge className="bg-red-500 text-white">Cần cải thiện</Badge>
    }
  }

  const getDeviationColor = (deviation: number) => {
    if (deviation <= 0) return "text-green-600" // Ahead of schedule
    if (deviation <= 2) return "text-yellow-600" // Slightly behind
    return "text-red-600" // Significantly behind
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê hiệu suất theo bước công việc</CardTitle>
          <CardDescription>So sánh thời gian thực tế với thời gian chuẩn của từng bước</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground ml-2">Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê hiệu suất theo bước công việc</CardTitle>
        <CardDescription>So sánh thời gian thực tế với thời gian chuẩn của từng bước</CardDescription>
      </CardHeader>
      <CardContent>
        {performanceData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chưa có dữ liệu thống kê hiệu suất</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bước công việc</TableHead>
                  <TableHead className="text-center">Số lần hoàn thành</TableHead>
                  <TableHead className="text-center">Số nhân viên</TableHead>
                  <TableHead className="text-center">Thời gian chuẩn</TableHead>
                  <TableHead className="text-center">Thời gian thực tế TB</TableHead>
                  <TableHead className="text-center">Chênh lệch</TableHead>
                  <TableHead className="text-center">Hiệu suất</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.map((step, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{step.stepName}</TableCell>
                    <TableCell className="text-center">{step.completedCount}</TableCell>
                    <TableCell className="text-center">{step.staffCount}</TableCell>
                    <TableCell className="text-center">{formatTime(step.totalExpectedHours)}</TableCell>
                    <TableCell className="text-center">{formatTime(step.totalActualHours)}</TableCell>
                    <TableCell className={`text-center ${getDeviationColor(step.deviation)}`}>
                      {step.deviation > 0 ? "+" : ""}
                      {formatTime(Math.abs(step.deviation))}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span>{step.efficiency.toFixed(1)}%</span>
                        {getEfficiencyBadge(step.efficiency)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
