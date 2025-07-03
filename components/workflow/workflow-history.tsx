'use client'

import { useState } from 'react'
import { useStandardWorkflow } from './standard-workflow-context-firebase'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter, ArrowUpDown } from 'lucide-react'

export function WorkflowHistory() {
  const { changeHistory, standardWorkflow, subWorkflows } =
    useStandardWorkflow()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<
    'all' | 'create' | 'update' | 'delete'
  >('all')
  const [filterEntity, setFilterEntity] = useState<
    'all' | 'workflow' | 'step' | 'field'
  >('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [activeTab, setActiveTab] = useState('all')

  // Lọc lịch sử thay đổi
  const filteredHistory = changeHistory
    .filter((history) => {
      // Lọc theo tab
      if (activeTab === 'standard' && history.entityId !== standardWorkflow?.id)
        return false
      if (
        activeTab === 'sub' &&
        !subWorkflows.some((sw) => sw.id === history.entityId)
      )
        return false
      if (activeTab === 'step' && history.entityType !== 'step') return false
      if (activeTab === 'field' && history.entityType !== 'field') return false

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const entityName = getEntityName(history.entityType, history.entityId)
        const changesText = history.changes
          .map(
            (change) =>
              `${change.field} ${change.oldValue || ''} ${change.newValue || ''}`
          )
          .join(' ')

        return (
          entityName.toLowerCase().includes(searchLower) ||
          changesText.toLowerCase().includes(searchLower) ||
          history.changedBy.toLowerCase().includes(searchLower)
        )
      }

      // Lọc theo loại thay đổi
      if (filterType !== 'all' && history.changeType !== filterType)
        return false

      // Lọc theo loại đối tượng
      if (filterEntity !== 'all' && history.entityType !== filterEntity)
        return false

      return true
    })
    .sort((a, b) => {
      // Sắp xếp theo thời gian
      if (sortOrder === 'newest') {
        return new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
      } else {
        return new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
      }
    })

  // Lấy tên đối tượng
  const getEntityName = (entityType: string, entityId: string) => {
    if (entityType === 'workflow') {
      if (entityId === standardWorkflow?.id) {
        return standardWorkflow.name
      } else {
        const subWorkflow = subWorkflows.find((sw) => sw.id === entityId)
        return subWorkflow ? subWorkflow.name : 'Quy trình không xác định'
      }
    } else if (entityType === 'step') {
      const step = standardWorkflow?.steps.find((s) => s.id === entityId)
      return step ? step.name : 'Bước không xác định'
    } else if (entityType === 'field') {
      // Tìm trường trong tất cả các bước
      for (const step of standardWorkflow?.steps || []) {
        const field = step.fields.find((f) => f.id === entityId)
        if (field) {
          return `${field.name} (trong bước ${step.name})`
        }
      }
      return 'Trường không xác định'
    }
    return 'Không xác định'
  }

  // Format thời gian
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  // Format tên người dùng
  const formatUserDisplay = (user: string) => {
    if (user === 'system') return 'Hệ thống'
    return user
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử chỉnh sửa</CardTitle>
          <CardDescription>
            Xem lịch sử thay đổi của quy trình, bước và trường
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, người thực hiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Select
                    value={filterType}
                    onValueChange={(value) => setFilterType(value as any)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Loại thay đổi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="create">Tạo mới</SelectItem>
                      <SelectItem value="update">Cập nhật</SelectItem>
                      <SelectItem value="delete">Xóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center">
                  <Select
                    value={filterEntity}
                    onValueChange={(value) => setFilterEntity(value as any)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Loại đối tượng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="workflow">Quy trình</SelectItem>
                      <SelectItem value="step">Bước</SelectItem>
                      <SelectItem value="field">Trường</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
                  }
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === 'newest' ? 'Mới nhất trước' : 'Cũ nhất trước'}
                </Button>
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

              <TabsContent value={activeTab}>
                <Card>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      {filteredHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-muted-foreground">
                            Không có lịch sử thay đổi nào phù hợp.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 p-4">
                          {filteredHistory.map((history) => (
                            <div
                              key={history.id}
                              className="border rounded-md p-4"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Badge
                                    variant={
                                      history.changeType === 'create'
                                        ? 'default'
                                        : history.changeType === 'update'
                                          ? 'outline'
                                          : 'destructive'
                                    }
                                    className="mb-2"
                                  >
                                    {history.changeType === 'create'
                                      ? 'Tạo mới'
                                      : history.changeType === 'update'
                                        ? 'Cập nhật'
                                        : 'Xóa'}
                                  </Badge>
                                  <h3 className="text-sm font-medium">
                                    {history.entityType === 'workflow'
                                      ? 'Quy trình'
                                      : history.entityType === 'step'
                                        ? 'Bước'
                                        : 'Trường'}
                                    :{' '}
                                    {getEntityName(
                                      history.entityType,
                                      history.entityId
                                    )}
                                  </h3>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">
                                    {history.changedAt
                                      ? formatDate(history.changedAt)
                                      : 'Không có thời gian'}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {formatUserDisplay(history.changedBy)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 space-y-2">
                                {history.changes.map((change, index) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-3 gap-2 text-sm"
                                  >
                                    <div className="font-medium">
                                      {change.field}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {change.oldValue !== undefined ? (
                                        change.oldValue === null ? (
                                          <span className="italic">
                                            Không có giá trị
                                          </span>
                                        ) : (
                                          change.oldValue
                                        )
                                      ) : (
                                        <span className="italic">
                                          Không có giá trị cũ
                                        </span>
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
                                        <span className="italic">
                                          Không có giá trị mới
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
