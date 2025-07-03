'use client'

import { useState, useEffect } from 'react'
import { useSubWorkflow } from './sub-workflow-context-firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Database, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function DebugSubWorkflows() {
  const {
    subWorkflows,
    loading,
    error,
    fetchSubWorkflows,
    syncAllSubWorkflows
  } = useSubWorkflow()
  const { toast } = useToast()
  const [refreshing, setRefreshing] = useState(false)

  // Lấy tất cả quy trình con khi component được mount
  useEffect(() => {
    fetchSubWorkflows()
  }, [fetchSubWorkflows])

  // Xử lý làm mới danh sách
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchSubWorkflows()
      toast({
        title: 'Thành công',
        description:
          'Đã làm mới danh sách quy trình con từ collection subWorkflows.'
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Xử lý đồng bộ
  const handleSync = async () => {
    setRefreshing(true)
    try {
      await syncAllSubWorkflows()
      toast({
        title: 'Thành công',
        description:
          'Đã đồng bộ tất cả quy trình con từ collection subWorkflows.'
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Hiển thị skeleton khi đang tải
  if (loading && !refreshing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debug Quy Trình Con (Collection: subWorkflows)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4 gap-2">
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 mr-1" /> Làm mới
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Database className="h-4 w-4 mr-1" /> Đồng bộ DB
            </Button>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Hiển thị thông báo lỗi
  if (error && !refreshing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debug Quy Trình Con (Collection: subWorkflows)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`}
              />{' '}
              Làm mới
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={refreshing}
            >
              <Database
                className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`}
              />{' '}
              Đồng bộ DB
            </Button>
          </div>
          <Card className="bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug Quy Trình Con (Collection: subWorkflows)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <p className="text-muted-foreground">
            Tổng số quy trình con trong collection subWorkflows:{' '}
            <Badge variant="outline">{subWorkflows.length}</Badge>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`}
              />{' '}
              Làm mới
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={refreshing}
            >
              <Database
                className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`}
              />{' '}
              Đồng bộ DB
            </Button>
          </div>
        </div>

        {subWorkflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground">
                Không có quy trình con nào trong collection subWorkflows
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Quy trình cha</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Số bước</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-mono text-xs">
                      {workflow.id}
                    </TableCell>
                    <TableCell>{workflow.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {workflow.parentWorkflowId}
                    </TableCell>
                    <TableCell>{workflow.statusName}</TableCell>
                    <TableCell>{workflow.visibleSteps?.length || 0}</TableCell>
                    <TableCell>
                      {workflow.createdAt
                        ? new Date(workflow.createdAt).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
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
