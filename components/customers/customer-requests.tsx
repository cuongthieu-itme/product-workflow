'use client'

import { useEffect, useState } from 'react'
import { useRequest } from '@/components/requests/request-context-firebase'
import { useStandardWorkflow } from '@/components/workflow/standard-workflow-context-firebase'
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
import { Button } from '@/components/ui/button'
import { Eye, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface CustomerRequestsProps {
  customerId: string
}

export function CustomerRequests({ customerId }: CustomerRequestsProps) {
  const { requests, loading } = useRequest()
  const { standardWorkflow } = useStandardWorkflow()
  const router = useRouter()
  const [customerRequests, setCustomerRequests] = useState<any[]>([])

  useEffect(() => {
    if (requests && customerId) {
      // Lọc các yêu cầu của khách hàng này
      const filteredRequests = requests.filter((request) => {
        // Kiểm tra nếu request có thông tin khách hàng
        return (
          request.customerId === customerId ||
          request.customerInfo?.id === customerId ||
          request.customerInfo?.customerId === customerId
        )
      })
      setCustomerRequests(filteredRequests)
    }
  }, [requests, customerId])

  // Hàm lấy trạng thái hiển thị dựa trên status
  const getStatusDisplay = (request: any) => {
    if (!request.status) {
      return 'Chưa bắt đầu'
    }

    // Ánh xạ trạng thái
    const statusMap: Record<string, string> = {
      completed: 'Hoàn thành',
      on_hold: 'Tạm dừng',
      in_progress: 'Đang xử lý',
      pending: 'Chờ xử lý',
      rejected: 'Đã từ chối',
      cancelled: 'Đã hủy'
    }

    return statusMap[request.status] || request.status
  }

  // Hàm lấy tiến độ
  const getProgress = (request: any) => {
    if (!request.currentStepId || !standardWorkflow?.steps) {
      return { current: 0, total: 0, percentage: 0 }
    }

    const steps = standardWorkflow.steps.sort((a, b) => a.order - b.order)
    const currentStepIndex = steps.findIndex(
      (step) => step.id === request.currentStepId
    )
    const current = currentStepIndex >= 0 ? currentStepIndex + 1 : 0
    const total = steps.length
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0

    return { current, total, percentage }
  }

  const handleViewRequest = (id: string) => {
    router.push(`/dashboard/requests/${id}`)
  }

  const handleEditRequest = (id: string) => {
    router.push(`/dashboard/requests/${id}/edit`)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách yêu cầu ({customerRequests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {customerRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Khách hàng này chưa có yêu cầu nào
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã yêu cầu</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerRequests.map((request) => {
                  const progress = getProgress(request)
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          {request.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {request.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getStatusDisplay(request)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex-1 bg-muted rounded-full h-1.5 min-w-[60px]">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            <span className="min-w-[40px]">
                              {progress.current}/{progress.total}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {progress.percentage}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewRequest(request.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRequest(request.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
