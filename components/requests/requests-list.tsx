'use client'
import { useRequest } from './request-context'
import { useSubWorkflow } from '../workflow/sub-workflow-context-firebase'
import { useStandardWorkflow } from '../workflow/standard-workflow-context-firebase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Eye,
  Edit,
  PlusCircle,
  Trash2,
  Filter,
  BarChart3,
  Calendar,
  User,
  FileText,
  Settings,
  ChevronDown
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { RequestDialog } from './request-dialog'
import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { useUsers } from '@/hooks/use-users'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

const RequestsList = () => {
  const { requests, loading, deleteRequest } = useRequest()
  const { subWorkflows } = useSubWorkflow()
  const { standardWorkflow } = useStandardWorkflow()
  const { users } = useUsers()
  const router = useRouter()
  const [userId] = useState('user1') // Giả định ID người dùng đăng nhập
  const [userName] = useState('Nguyễn Văn A') // Giả định tên người dùng đăng nhập
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedStepFilter, setSelectedStepFilter] = useState<string[]>([])
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<
    string[]
  >([])
  const [activeTab, setActiveTab] = useState<string>('all') // Thay đổi từ "pending" thành "all"
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'title' | 'code'>('title')

  // Hooks must be called at the top level
  console.log('🔍 Debug standardWorkflow:', standardWorkflow)
  console.log('🔍 Debug standardWorkflow steps:', standardWorkflow?.steps)

  // Tạo danh sách các bước và trạng thái để filter
  const allStepsAndStatuses = useMemo(() => {
    console.log('🔄 Computing allStepsAndStatuses...')

    const steps = []

    // Thêm các bước workflow
    if (standardWorkflow?.steps) {
      const workflowSteps = standardWorkflow.steps
        .map((step) => ({
          id: step.id,
          name: step.name,
          order: step.order,
          type: 'step' as const
        }))
        .sort((a, b) => a.order - b.order)

      steps.push(...workflowSteps)
    }

    // Thêm các trạng thái đặc biệt
    const specialStatuses = [
      {
        id: 'status_completed',
        name: 'Đã hoàn thành',
        type: 'status' as const,
        order: 9999
      },
      {
        id: 'status_rejected',
        name: 'Đã từ chối',
        type: 'status' as const,
        order: 9998
      },
      {
        id: 'status_on_hold',
        name: 'Tạm dừng',
        type: 'status' as const,
        order: 9997
      }
    ]

    steps.push(...specialStatuses)

    console.log('✅ Final allStepsAndStatuses:', steps)
    return steps
  }, [standardWorkflow])

  const allAssignees = useMemo(() => {
    console.log('🔄 Computing allAssignees...')
    console.log('users:', users)

    if (!users) {
      console.log('❌ No users found')
      return []
    }

    const assignees = users.map((user) => ({
      id: user.id,
      name: user.name
    }))

    console.log('✅ Final allAssignees:', assignees)
    return assignees
  }, [users])

  const getCurrentStepAssignee = (request: any) => {
    // Ưu tiên kiểm tra trường assignee trực tiếp trước
    if (request.assignee) {
      if (typeof request.assignee === 'object' && request.assignee.name) {
        return {
          id: request.assignee.id,
          name: request.assignee.name
        }
      } else if (typeof request.assignee === 'string') {
        return {
          id: null,
          name: request.assignee
        }
      }
    }

    if (!request.currentStepId) {
      return {
        id: null,
        name: 'Chưa phân công'
      }
    }

    try {
      // Kiểm tra trong workflowStepData.fieldValues
      if (request.workflowStepData && request.workflowStepData.fieldValues) {
        const fieldValues = request.workflowStepData.fieldValues

        // Tìm trường step_{stepId}_assignee trong fieldValues
        const stepAssigneeKey = `step_${request.currentStepId}_assignee`

        if (fieldValues[stepAssigneeKey]) {
          const assignee = fieldValues[stepAssigneeKey]
          if (assignee && assignee.name) {
            return {
              id: assignee.id,
              name: assignee.name
            }
          }
        }

        // Nếu không tìm thấy với pattern trên, tìm bất kỳ field nào có chứa "assignee"
        for (const [key, value] of Object.entries(fieldValues)) {
          if (
            key.includes('assignee') &&
            value &&
            typeof value === 'object' &&
            (value as any).name
          ) {
            return {
              id: (value as any).id,
              name: (value as any).name
            }
          }
        }
      }

      // Fallback: Kiểm tra các nguồn khác
      if (request.currentStepAssignee) {
        if (
          typeof request.currentStepAssignee === 'object' &&
          request.currentStepAssignee.name
        ) {
          return {
            id: request.currentStepAssignee.id,
            name: request.currentStepAssignee.name
          }
        } else if (typeof request.currentStepAssignee === 'string') {
          return {
            id: null,
            name: request.currentStepAssignee
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người được phân công:', error)
    }

    // Kiểm tra trong stepHistory
    if (request.stepHistory && request.stepHistory.length > 0) {
      const currentStepHistory = request.stepHistory.find(
        (history: any) => history.stepId === request.currentStepId
      )
      if (currentStepHistory && currentStepHistory.assignedTo) {
        if (
          typeof currentStepHistory.assignedTo === 'object' &&
          currentStepHistory.assignedTo.name
        ) {
          return {
            id: currentStepHistory.assignedTo.id,
            name: currentStepHistory.assignedTo.name
          }
        } else if (typeof currentStepHistory.assignedTo === 'string') {
          return {
            id: null,
            name: currentStepHistory.assignedTo
          }
        }
      }
    }

    return {
      id: null,
      name: 'Chưa phân công'
    }
  }

  const getCurrentStepName = (request: any) => {
    // Nếu request đã hoàn thành
    if (
      request.status === 'completed' ||
      request.currentStepStatus === 'completed'
    ) {
      return 'Đã hoàn thành'
    }

    if (!request.currentStepId) {
      return 'Chưa bắt đầu'
    }

    // Ưu tiên lấy từ standardWorkflow trước
    if (standardWorkflow?.steps) {
      const currentStep = standardWorkflow.steps.find(
        (step) => step.id === request.currentStepId
      )
      if (currentStep) {
        return currentStep.name
      }
    }

    // Fallback: Tìm trong subWorkflow nếu không tìm thấy trong standardWorkflow
    if (request.workflowProcessId) {
      const subWorkflow = subWorkflows?.find(
        (sw) => sw.id === request.workflowProcessId
      )
      if (subWorkflow?.workflowSteps) {
        const currentStep = subWorkflow.workflowSteps.find(
          (step) => step.id === request.currentStepId && step.isVisible
        )
        if (currentStep) {
          return currentStep.name
        }
      }
    }

    return 'Bước không xác định'
  }

  const getWorkflowProgress = (request: any) => {
    const completedSteps = request.workflowStepData?.completedSteps || []

    if (!request.currentStepId || !request.workflowProcessId) {
      return {
        current: 0,
        total: 0,
        percentage: 0,
        completedCount: completedSteps.length
      }
    }

    const subWorkflow = subWorkflows?.find(
      (sw) => sw.id === request.workflowProcessId
    )

    if (!subWorkflow) {
      return {
        current: 0,
        total: 0,
        percentage: 0,
        completedCount: completedSteps.length
      }
    }

    // Lấy các bước hiển thị từ snapshot
    const visibleSteps =
      subWorkflow.workflowSteps?.filter((step) => step.isVisible) || []
    const totalSteps = visibleSteps.length

    if (totalSteps === 0) {
      return {
        current: 0,
        total: 0,
        percentage: 0,
        completedCount: completedSteps.length
      }
    }

    // Tìm vị trí bước hiện tại
    const currentStepIndex = visibleSteps.findIndex(
      (step) => step.id === request.currentStepId
    )
    const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 0

    const completedCount = completedSteps.length
    const percentage =
      totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

    return {
      current: currentStep,
      total: totalSteps,
      percentage,
      completedCount
    }
  }

  const getActualRequestStatus = (request: any) => {
    // Nếu request có status manual được set (rejected, on_hold), ưu tiên status đó
    if (request.status === 'rejected' || request.status === 'on_hold') {
      return request.status
    }

    // Kiểm tra nếu request có status = "completed" hoặc currentStepStatus = "completed"
    if (
      request.status === 'completed' ||
      request.currentStepStatus === 'completed'
    ) {
      return 'completed'
    }

    // Lấy completedStepsHistory từ request
    const completedStepsHistory =
      request.completedStepsHistory ||
      request.workflowStepData?.completedSteps ||
      []

    // Kiểm tra nếu tất cả các bước đã hoàn thành dựa trên workflow
    if (request.workflowProcessId && subWorkflows) {
      const subWorkflow = subWorkflows.find(
        (sw) => sw.id === request.workflowProcessId
      )
      if (subWorkflow?.workflowSteps) {
        const visibleSteps = subWorkflow.workflowSteps.filter(
          (step) => step.isVisible
        )
        if (
          visibleSteps.length > 0 &&
          completedStepsHistory.length >= visibleSteps.length
        ) {
          return 'completed'
        }
      }
    }

    // Kiểm tra với standardWorkflow
    if (
      standardWorkflow?.steps &&
      completedStepsHistory.length >= standardWorkflow.steps.length
    ) {
      return 'completed'
    }

    // Nếu completedStepsHistory không tồn tại hoặc rỗng => Chờ xử lý
    if (!completedStepsHistory || completedStepsHistory.length === 0) {
      return 'pending'
    }

    // Nếu có ít nhất 1 bước trong completedStepsHistory => Đang xử lý
    return 'in_progress'
  }

  const requestsByStatus = useMemo(() => {
    const all = requests || []

    // Tạo requests với trạng thái thực tế
    const requestsWithActualStatus = all.map((request) => ({
      ...request,
      actualStatus: getActualRequestStatus(request)
    }))

    return {
      pending: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'pending'
      ),
      in_progress: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'in_progress'
      ),
      completed: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'completed'
      ),
      rejected: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'rejected'
      ),
      on_hold: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'on_hold'
      )
    }
  }, [requests, subWorkflows, standardWorkflow])

  // Hàm kiểm tra request có match với filter step/status không
  const matchesStepFilter = (request: any, filterId: string) => {
    if (filterId.startsWith('status_')) {
      const actualStatus = getActualRequestStatus(request)
      switch (filterId) {
        case 'status_completed':
          return actualStatus === 'completed'
        case 'status_rejected':
          return actualStatus === 'rejected'
        case 'status_on_hold':
          return actualStatus === 'on_hold'
        default:
          return false
      }
    } else {
      // Đây là workflow step
      return request.currentStepId === filterId
    }
  }

  const filteredRequests = useMemo(() => {
    let currentTabRequests =
      activeTab === 'all'
        ? requests || []
        : requestsByStatus[activeTab as keyof typeof requestsByStatus] || []

    // Áp dụng search filter
    if (appliedSearchTerm) {
      const searchLower = appliedSearchTerm.toLowerCase()
      currentTabRequests = currentTabRequests.filter((request) => {
        if (searchType === 'title') {
          return request.title.toLowerCase().includes(searchLower)
        } else if (searchType === 'code') {
          return request.code.toLowerCase().includes(searchLower)
        }
        return false
      })
    }

    // Filter theo bước/trạng thái (multi-select)
    if (selectedStepFilter.length > 0) {
      currentTabRequests = currentTabRequests.filter((request) => {
        return selectedStepFilter.some((filterId) =>
          matchesStepFilter(request, filterId)
        )
      })
    }

    // Filter theo assignee (multi-select)
    if (selectedAssigneeFilter.length > 0) {
      currentTabRequests = currentTabRequests.filter((request) => {
        const assignee = getCurrentStepAssignee(request)
        return assignee.id && selectedAssigneeFilter.includes(assignee.id)
      })
    }

    return currentTabRequests
  }, [
    requests,
    requestsByStatus,
    activeTab,
    selectedStepFilter,
    selectedAssigneeFilter,
    appliedSearchTerm,
    searchType
  ])

  const columnStats = useMemo(() => {
    const currentRequests = filteredRequests

    // Thống kê theo nhân sự
    const assigneeStats = new Map<string, number>()
    currentRequests.forEach((request) => {
      const assignee = getCurrentStepAssignee(request)
      assigneeStats.set(
        assignee.name,
        (assigneeStats.get(assignee.name) || 0) + 1
      )
    })

    // Thống kê theo bước hiện tại
    const stepStats = new Map<string, number>()
    currentRequests.forEach((request) => {
      const stepName = getCurrentStepName(request)
      stepStats.set(stepName, (stepStats.get(stepName) || 0) + 1)
    })

    // Thống kê theo ngày tạo (theo tháng)
    const dateStats = new Map<string, number>()
    currentRequests.forEach((request) => {
      if (request.createdAt) {
        const monthYear = format(new Date(request.createdAt), 'MM/yyyy')
        dateStats.set(
          monthYear,
          dateStats.get(dateStats.get(monthYear) || 0) + 1
        )
      }
    })

    return {
      total: currentRequests.length,
      uniqueAssignees: assigneeStats.size,
      uniqueSteps: stepStats.size,
      uniqueMonths: dateStats.size,
      assigneeStats,
      stepStats,
      dateStats
    }
  }, [filteredRequests])

  const handleDeleteRequest = (id: string) => {
    setRequestToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!requestToDelete) return

    try {
      setIsDeleting(true)
      await deleteRequest(requestToDelete)
      toast({
        title: 'Xóa thành công',
        description: 'Yêu cầu đã được xóa thành công'
      })
    } catch (error) {
      console.error('Lỗi khi xóa yêu cầu:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa yêu cầu. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setRequestToDelete(null)
    }
  }

  const DeleteConfirmationDialog = () => (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể hoàn
            tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const handleViewRequest = (id: string) => {
    // Logic to handle view request
    router.push(`/dashboard/requests/${id}`)
  }

  const handleEditRequest = (id: string) => {
    // Logic to handle edit request
    router.push(`/dashboard/requests/${id}/edit`)
  }

  const RequestsTable = ({ requests: tableRequests }: { requests: any[] }) => {
    if (tableRequests.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-40">
          <p className="mb-4">Không có yêu cầu nào</p>
          <RequestDialog
            trigger={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tạo yêu cầu mới
              </Button>
            }
            userId={userId}
            userName={userName}
          />
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã yêu cầu</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Nhân sự</TableHead>
              <TableHead>Bước hiện tại</TableHead>
              <TableHead>Thời gian bắt đầu</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRequests.map((request) => {
              const progress = getWorkflowProgress(request)
              const currentStepName = getCurrentStepName(request)
              const currentAssignee = getCurrentStepAssignee(request)

              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.code}</TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{currentAssignee.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {/* Hiển thị tên bước hiện tại */}
                      <div className="font-medium text-sm">
                        {currentStepName}
                      </div>
                      {/* Hiển thị tiến độ */}
                      {progress.total > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <span>
                            {progress.completedCount}/{progress.total}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getCurrentStepTransitionTime(request)
                        ? format(
                            new Date(getCurrentStepTransitionTime(request)),
                            'dd/MM/yyyy HH:mm'
                          )
                        : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.createdAt
                      ? format(new Date(request.createdAt), 'dd/MM/yyyy')
                      : 'N/A'}
                  </TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  const getCurrentStepTransitionTime = (request: any) => {
    if (!request.currentStepId || !request.stepHistory) {
      return request.createdAt // Nếu chưa có lịch sử bước, trả về thời gian tạo
    }

    // Tìm thời gian chuyển đến bước hiện tại từ stepHistory
    const currentStepHistory = request.stepHistory.find(
      (history: any) => history.stepId === request.currentStepId
    )

    return currentStepHistory?.startedAt || request.createdAt
  }

  const filteredRequestsByStatus = useMemo(() => {
    const filtered = filteredRequests || []

    // Tạo requests với trạng thái thực tế từ filteredRequests
    const requestsWithActualStatus = filtered.map((request) => ({
      ...request,
      actualStatus: getActualRequestStatus(request)
    }))

    return {
      pending: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'pending'
      ),
      in_progress: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'in_progress'
      ),
      completed: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'completed'
      ),
      rejected: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'rejected'
      ),
      on_hold: requestsWithActualStatus.filter(
        (r) => r.actualStatus === 'on_hold'
      )
    }
  }, [filteredRequests])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <p>Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col justify-center items-center h-40">
            <p className="mb-4">Chưa có yêu cầu nào</p>
            <RequestDialog
              trigger={
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo yêu cầu mới
                </Button>
              }
              userId={userId}
              userName={userName}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Tổng số: {filteredRequests.length} yêu cầu
              {(selectedStepFilter.length > 0 ||
                selectedAssigneeFilter.length > 0 ||
                appliedSearchTerm) &&
                ` (đã lọc từ ${requestsByStatus[activeTab as keyof typeof requestsByStatus]?.length || 0} yêu cầu)`}
            </span>

            {/* Unified Filter System */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Bộ lọc
                    {(selectedStepFilter.length > 0 ||
                      selectedAssigneeFilter.length > 0 ||
                      appliedSearchTerm) && (
                      <Badge variant="secondary" className="ml-1">
                        {[
                          selectedStepFilter.length > 0
                            ? selectedStepFilter.length
                            : 0,
                          selectedAssigneeFilter.length > 0
                            ? selectedAssigneeFilter.length
                            : 0,
                          appliedSearchTerm ? 1 : 0
                        ]
                          .filter((n) => n > 0)
                          .reduce((a, b) => a + b, 0)}
                      </Badge>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0">
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Bộ lọc nâng cao</h4>
                      {(selectedStepFilter.length > 0 ||
                        selectedAssigneeFilter.length > 0 ||
                        appliedSearchTerm) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSelectedStepFilter([])
                            setSelectedAssigneeFilter([])
                            setAppliedSearchTerm('')
                            setSearchTerm('')
                          }}
                        >
                          Xóa tất cả
                        </Button>
                      )}
                    </div>

                    {/* Filter by Steps/Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Bước/Trạng thái
                        </label>
                        {selectedStepFilter.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedStepFilter.length} đã chọn
                          </Badge>
                        )}
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-sm"
                          >
                            {selectedStepFilter.length === 0
                              ? 'Chọn bước/trạng thái'
                              : selectedStepFilter.length === 1
                                ? allStepsAndStatuses.find(
                                    (s) => s.id === selectedStepFilter[0]
                                  )?.name
                                : `${selectedStepFilter.length} mục đã chọn`}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0" side="right">
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Chọn bước/trạng thái
                              </span>
                              {selectedStepFilter.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={() => setSelectedStepFilter([])}
                                >
                                  Xóa
                                </Button>
                              )}
                            </div>
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                              {/* Workflow Steps */}
                              {allStepsAndStatuses.filter(
                                (item) => item.type === 'step'
                              ).length > 0 && (
                                <>
                                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                                    Bước quy trình
                                  </div>
                                  {allStepsAndStatuses
                                    .filter((item) => item.type === 'step')
                                    .map((step) => (
                                      <div
                                        key={step.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={step.id}
                                          checked={selectedStepFilter.includes(
                                            step.id
                                          )}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedStepFilter([
                                                ...selectedStepFilter,
                                                step.id
                                              ])
                                            } else {
                                              setSelectedStepFilter(
                                                selectedStepFilter.filter(
                                                  (id) => id !== step.id
                                                )
                                              )
                                            }
                                          }}
                                        />
                                        <label
                                          htmlFor={step.id}
                                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                          {step.name}
                                        </label>
                                      </div>
                                    ))}
                                </>
                              )}

                              {/* Status Filters */}
                              {allStepsAndStatuses.filter(
                                (item) => item.type === 'status'
                              ).length > 0 && (
                                <>
                                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted/50 rounded mt-2">
                                    Trạng thái
                                  </div>
                                  {allStepsAndStatuses
                                    .filter((item) => item.type === 'status')
                                    .map((status) => (
                                      <div
                                        key={status.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={status.id}
                                          checked={selectedStepFilter.includes(
                                            status.id
                                          )}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedStepFilter([
                                                ...selectedStepFilter,
                                                status.id
                                              ])
                                            } else {
                                              setSelectedStepFilter(
                                                selectedStepFilter.filter(
                                                  (id) => id !== status.id
                                                )
                                              )
                                            }
                                          }}
                                        />
                                        <label
                                          htmlFor={status.id}
                                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                          {status.name}
                                        </label>
                                      </div>
                                    ))}
                                </>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Filter by Assignee */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Nhân sự</label>
                        {selectedAssigneeFilter.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedAssigneeFilter.length} đã chọn
                          </Badge>
                        )}
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-sm"
                          >
                            {selectedAssigneeFilter.length === 0
                              ? 'Chọn nhân sự'
                              : selectedAssigneeFilter.length === 1
                                ? allAssignees.find(
                                    (a) => a.id === selectedAssigneeFilter[0]
                                  )?.name
                                : `${selectedAssigneeFilter.length} nhân sự đã chọn`}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0" side="right">
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Chọn nhân sự
                              </span>
                              {selectedAssigneeFilter.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={() => setSelectedAssigneeFilter([])}
                                >
                                  Xóa
                                </Button>
                              )}
                            </div>
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                              {allAssignees.map((assignee) => (
                                <div
                                  key={assignee.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`assignee-${assignee.id}`}
                                    checked={selectedAssigneeFilter.includes(
                                      assignee.id
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedAssigneeFilter([
                                          ...selectedAssigneeFilter,
                                          assignee.id
                                        ])
                                      } else {
                                        setSelectedAssigneeFilter(
                                          selectedAssigneeFilter.filter(
                                            (id) => id !== assignee.id
                                          )
                                        )
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`assignee-${assignee.id}`}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {assignee.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Search Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Tìm kiếm</label>
                        {appliedSearchTerm && (
                          <Badge variant="secondary" className="text-xs">
                            Đang tìm
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Select
                          value={searchType}
                          onValueChange={(value: 'title' | 'code') =>
                            setSearchType(value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="title">
                              Theo tên yêu cầu
                            </SelectItem>
                            <SelectItem value="code">
                              Theo mã yêu cầu
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Input
                            placeholder={
                              searchType === 'title'
                                ? 'Nhập tên yêu cầu...'
                                : 'Nhập mã yêu cầu...'
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                setAppliedSearchTerm(searchTerm.trim())
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              setAppliedSearchTerm(searchTerm.trim())
                            }
                            disabled={!searchTerm.trim()}
                          >
                            Tìm
                          </Button>
                        </div>
                        {appliedSearchTerm && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Đang tìm: "{appliedSearchTerm}"</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => {
                                setAppliedSearchTerm('')
                                setSearchTerm('')
                              }}
                            >
                              Xóa
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Active Filters Display */}
              {(selectedStepFilter.length > 0 ||
                selectedAssigneeFilter.length > 0 ||
                appliedSearchTerm) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedStepFilter.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      Bước: {selectedStepFilter.length}
                      <button
                        onClick={() => setSelectedStepFilter([])}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedAssigneeFilter.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      Nhân sự: {selectedAssigneeFilter.length}
                      <button
                        onClick={() => setSelectedAssigneeFilter([])}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {appliedSearchTerm && (
                    <Badge variant="outline" className="gap-1">
                      Tìm: {appliedSearchTerm}
                      <button
                        onClick={() => {
                          setAppliedSearchTerm('')
                          setSearchTerm('')
                        }}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <RequestDialog
            trigger={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tạo yêu cầu mới
              </Button>
            }
            userId={userId}
            userName={userName}
          />
        </div>

        {/* Thống kê theo trạng thái */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-700">
              Thống kê theo trạng thái
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chờ xử lý */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {filteredRequestsByStatus.pending.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Yêu cầu chưa được xử lý
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Đang xử lý */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Đang xử lý
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {filteredRequestsByStatus.in_progress.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Yêu cầu đang được thực hiện
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Hoàn thành */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Hoàn thành
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {filteredRequestsByStatus.completed.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Yêu cầu đã hoàn thành
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Từ chối/Tạm dừng */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Từ chối/Tạm dừng
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {filteredRequestsByStatus.rejected.length +
                      filteredRequestsByStatus.on_hold.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredRequestsByStatus.rejected.length} từ chối,{' '}
                    {filteredRequestsByStatus.on_hold.length} tạm dừng
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hiển thị thông tin bước được chọn */}
        {selectedStepFilter.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border">
            <div className="text-sm font-medium text-blue-900">
              Đang hiển thị yêu cầu ở bước/trạng thái:{' '}
              {selectedStepFilter.length === 1
                ? allStepsAndStatuses.find(
                    (s) => s.id === selectedStepFilter[0]
                  )?.name
                : selectedStepFilter
                    .map(
                      (id) => allStepsAndStatuses.find((s) => s.id === id)?.name
                    )
                    .join(', ')}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {filteredRequests.length} yêu cầu đang ở{' '}
              {selectedStepFilter.length === 1
                ? 'bước/trạng thái này'
                : 'các bước/trạng thái này'}
            </div>
          </div>
        )}

        {/* Hiển thị thông tin assignee được chọn */}
        {selectedAssigneeFilter.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-md border">
            <div className="text-sm font-medium text-green-900">
              Đang hiển thị yêu cầu của nhân sự:{' '}
              {selectedAssigneeFilter.length === 1
                ? allAssignees.find((a) => a.id === selectedAssigneeFilter[0])
                    ?.name
                : selectedAssigneeFilter
                    .map((id) => allAssignees.find((a) => a.id === id)?.name)
                    .join(', ')}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {filteredRequests.length} yêu cầu được phân công cho{' '}
              {selectedAssigneeFilter.length === 1
                ? 'nhân sự này'
                : 'các nhân sự này'}
            </div>
          </div>
        )}

        {/* Hiển thị thông tin tìm kiếm */}
        {appliedSearchTerm && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-md border">
            <div className="text-sm font-medium text-yellow-900">
              Kết quả tìm kiếm {searchType === 'title' ? 'theo tên' : 'theo mã'}
              : "{appliedSearchTerm}"
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              {filteredRequests.length} yêu cầu được tìm thấy
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 text-xs text-yellow-600 hover:text-yellow-800"
                onClick={() => {
                  setAppliedSearchTerm('')
                  setSearchTerm('')
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        )}

        {/* Tabs theo trạng thái với logic mới */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="relative">
              Tất cả
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Chờ xử lý
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredRequestsByStatus.pending.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="relative">
              Đang xử lý
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredRequestsByStatus.in_progress.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Hoàn thành
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredRequestsByStatus.completed.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="relative">
              Đã từ chối
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredRequestsByStatus.rejected.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="on_hold" className="relative">
              Tạm dừng
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredRequestsByStatus.on_hold.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <RequestsTable requests={filteredRequests} />
          </TabsContent>
          <TabsContent value="pending">
            <RequestsTable requests={filteredRequestsByStatus.pending} />
          </TabsContent>
          <TabsContent value="in_progress">
            <RequestsTable requests={filteredRequestsByStatus.in_progress} />
          </TabsContent>
          <TabsContent value="completed">
            <RequestsTable requests={filteredRequestsByStatus.completed} />
          </TabsContent>
          <TabsContent value="rejected">
            <RequestsTable requests={filteredRequestsByStatus.rejected} />
          </TabsContent>
          <TabsContent value="on_hold">
            <RequestsTable requests={filteredRequestsByStatus.on_hold} />
          </TabsContent>
        </Tabs>

        <DeleteConfirmationDialog />
      </CardContent>
    </Card>
  )
}

export default RequestsList
