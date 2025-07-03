'use client'

import { useState } from 'react'
import {
  useStandardWorkflow,
  type StandardWorkflowStep,
  type StepField
} from './standard-workflow-context-firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  Plus,
  Trash2,
  DollarSign,
  GripVertical,
  Edit,
  FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Calendar, User } from 'lucide-react' // Import Calendar and User icons
import { useAvailableVariables } from '../variables/available-variables-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { useUsers } from '@/hooks/use-users'
import { ScrollArea } from '@/components/ui/scroll-area'
interface StandardWorkflowStepFormProps {
  workflowId: string
  onSelect?: (id: string) => void // Declare onSelect prop
}

export function StandardWorkflowStepForm({
  workflowId,
  onSelect
}: StandardWorkflowStepFormProps) {
  const { toast } = useToast()
  const {
    standardWorkflow,
    addStandardWorkflowStep,
    updateStandardWorkflowStep,
    deleteStandardWorkflowStep,
    reorderStandardWorkflowSteps,
    addStepField,
    updateStepField,
    deleteStepField
  } = useStandardWorkflow()

  const { variables: availableVariables } = useAvailableVariables()
  const { users } = useUsers()

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('steps')
  const [showAddStepDialog, setShowAddStepDialog] = useState(false)
  const [showEditStepDialog, setShowEditStepDialog] = useState(false)
  const [showDeleteStepDialog, setShowDeleteStepDialog] = useState(false)
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false)
  const [showEditFieldDialog, setShowEditFieldDialog] = useState(false)
  const [showDeleteFieldDialog, setShowDeleteFieldDialog] = useState(false)

  const [newStep, setNewStep] = useState<
    Omit<StandardWorkflowStep, 'id' | 'order' | 'fields'>
  >({
    name: '',
    description: '',
    estimatedTime: 1,
    estimatedTimeUnit: 'days',
    isRequired: false,
    notifyBeforeDeadline: 1,
    hasCost: false
  })

  const [newField, setNewField] = useState<Omit<StepField, 'id'>>({
    name: '',
    type: 'text',
    required: false,
    description: '',
    options: [],
    isSystem: false
  })

  // Lấy bước được chọn
  const getSelectedStep = () => {
    if (!standardWorkflow || !selectedStepId) return null
    return (
      standardWorkflow.steps.find((step) => step.id === selectedStepId) || null
    )
  }

  // Lấy trường được chọn
  const getSelectedField = () => {
    const step = getSelectedStep()
    if (!step || !selectedFieldId) return null
    return step.fields.find((field) => field.id === selectedFieldId) || null
  }

  // Xử lý thêm biến từ availableVariables
  const handleAddVariableField = (variable: any) => {
    if (!selectedStepId) return

    // Kiểm tra xem biến đã tồn tại trong bước chưa
    const step = getSelectedStep()
    if (!step) return

    const existingField = step.fields.find(
      (field) =>
        field.type === 'variable' && field.variableSource === variable.id
    )

    if (existingField) {
      toast({
        title: 'Thông báo',
        description: `Biến "${variable.name}" đã tồn tại trong bước này`
      })
      return
    }

    // Thêm trường từ biến có sẵn
    addStepField(selectedStepId, {
      id: `var_${Date.now()}`,
      name: variable.name,
      type: 'variable',
      required: variable.isRequired || false,
      description: variable.description,
      isSystem: false,
      variableSource: variable.id
    })

    toast({
      title: 'Thành công',
      description: `Đã thêm biến "${variable.name}" vào bước`
    })
  }

  // Xử lý thêm bước mới
  const handleAddStep = () => {
    if (!newStep.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên bước',
        variant: 'destructive'
      })
      return
    }

    // Thêm bước mới với các trường mặc định
    const stepId = addStandardWorkflowStep({
      ...newStep,
      fields: [
        {
          id: 'assignee',
          name: 'Người đảm nhận',
          type: 'user',
          required: true,
          description: 'Người chịu trách nhiệm cho bước này',
          isSystem: true
        },
        {
          id: 'receiveDate',
          name: 'Thời gian tiếp nhận',
          type: 'date',
          required: true,
          description: 'Ngày tiếp nhận yêu cầu',
          isSystem: true
        },
        {
          id: 'deadline',
          name: 'Ngày deadline',
          type: 'date',
          required: true,
          description: 'Ngày dự kiến hoàn thành công việc',
          isSystem: true
        },
        {
          id: 'status',
          name: 'Trạng thái',
          type: 'select',
          required: true,
          description: 'Trạng thái hiện tại của bước',
          options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
          isSystem: true
        }
      ]
    })

    // Reset form và đóng dialog
    setNewStep({
      name: '',
      description: '',
      estimatedTime: 1,
      estimatedTimeUnit: 'days',
      isRequired: false,
      notifyBeforeDeadline: 1,
      hasCost: false
    })
    setShowAddStepDialog(false)

    // Chọn bước mới tạo
    setSelectedStepId(stepId)
    setActiveTab('fields')
  }

  // Xử lý cập nhật bước
  const handleUpdateStep = () => {
    const selectedStep = getSelectedStep()
    if (!selectedStep) return

    if (!selectedStep.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên bước',
        variant: 'destructive'
      })
      return
    }

    // Tạo object cập nhật chỉ với các giá trị đã được định nghĩa
    const updateData: Partial<Omit<StandardWorkflowStep, 'id'>> = {}

    if (selectedStep.name !== undefined) updateData.name = selectedStep.name
    if (selectedStep.description !== undefined)
      updateData.description = selectedStep.description
    if (selectedStep.estimatedTime !== undefined)
      updateData.estimatedTime = selectedStep.estimatedTime
    if (selectedStep.isRequired !== undefined)
      updateData.isRequired = selectedStep.isRequired
    if (selectedStep.notifyBeforeDeadline !== undefined)
      updateData.notifyBeforeDeadline = selectedStep.notifyBeforeDeadline
    if (selectedStep.hasCost !== undefined)
      updateData.hasCost = selectedStep.hasCost
    if (selectedStep.allowedUsers !== undefined)
      updateData.allowedUsers = selectedStep.allowedUsers

    updateStandardWorkflowStep(selectedStep.id, updateData)

    setShowEditStepDialog(false)
  }

  // Xử lý xóa bước
  const handleDeleteStep = () => {
    if (!selectedStepId) return

    const success = deleteStandardWorkflowStep(selectedStepId)
    if (success) {
      setSelectedStepId(null)
      setShowDeleteStepDialog(false)
    }
  }

  // Xử lý kéo thả để sắp xếp lại các bước
  const handleDragEnd = (result: any) => {
    if (!result.destination || !standardWorkflow) return

    const steps = Array.from(standardWorkflow.steps)
    const [removed] = steps.splice(result.source.index, 1)
    steps.splice(result.destination.index, 0, removed)

    const reorderedSteps = steps.map((step, index) => ({
      ...step,
      order: index
    }))
    reorderStandardWorkflowSteps(reorderedSteps)
  }

  // Xử lý mở dialog chỉnh sửa
  const handleOpenEditDialog = (workflow: any) => {
    setSelectedStepId(workflow.id)
    setShowEditStepDialog(true)
  }

  // Xử lý chọn quy trình
  const handleSelectWorkflow = (id: string) => {
    if (onSelect) {
      onSelect(id)
    }
  }

  // Xử lý chọn bước
  const handleSelectStep = (id: string) => {
    setSelectedStepId(id)
    setActiveTab('fields')
  }

  // Xử lý thêm trường
  const handleAddField = () => {
    if (!newField.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên trường',
        variant: 'destructive'
      })
      return
    }

    if (!selectedStepId) return

    addStepField(selectedStepId, {
      ...newField,
      id: Date.now().toString() // Generate a unique ID for the new field
    })

    setNewField({
      name: '',
      type: 'text',
      required: false,
      description: '',
      options: [],
      isSystem: false
    })
    setShowAddFieldDialog(false)
  }

  // Xử lý cập nhật trường
  const handleUpdateField = () => {
    const selectedField = getSelectedField()
    if (!selectedField || !selectedStepId) return

    updateStepField(selectedStepId, selectedField.id, {
      name: selectedField.name,
      type: selectedField.type,
      required: selectedField.required,
      description: selectedField.description,
      options: selectedField.options,
      currencySymbol: selectedField.currencySymbol,
      variableSource: selectedField.variableSource
    })

    setShowEditFieldDialog(false)
  }

  // Xử lý xóa trường
  const handleDeleteField = () => {
    if (!selectedFieldId || !selectedStepId) return

    const success = deleteStepField(selectedStepId, selectedFieldId)
    if (success) {
      setSelectedFieldId(null)
      setShowDeleteFieldDialog(false)
    }
  }

  // Hàm hỗ trợ hiển thị tên loại trường
  const getFieldTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      text: 'Văn bản',
      date: 'Ngày tháng',
      datetime: 'Ngày giờ',
      select: 'Lựa chọn đơn',
      multiselect: 'Lựa chọn nhiều',
      user: 'Người dùng',
      checkbox: 'Hộp kiểm',
      number: 'Số',
      currency: 'Tiền tệ',
      variable: 'Biến'
    }
    return typeMap[type] || type
  }

  // Hàm hỗ trợ hiển thị tên biến
  const getVariableName = (id: string): string => {
    const variable = availableVariables.find((v) => v.id === id)
    return variable ? variable.name : 'Không xác định'
  }

  // Nhóm biến theo nguồn
  const groupedVariables = availableVariables.reduce(
    (acc: Record<string, any[]>, variable) => {
      if (!acc[variable.source]) {
        acc[variable.source] = []
      }
      acc[variable.source].push(variable)
      return acc
    },
    {}
  )

  if (!standardWorkflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải quy trình chuẩn...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý các bước quy trình</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddStepDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> Thêm bước mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="steps">Danh sách bước</TabsTrigger>
              <TabsTrigger value="fields" disabled={!selectedStepId}>
                Trường dữ liệu
              </TabsTrigger>
            </TabsList>

            <TabsContent value="steps">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="steps">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {standardWorkflow.steps.length === 0 ? (
                        <div className="text-center py-10 border rounded-md bg-muted/30">
                          <p className="text-muted-foreground">
                            Chưa có bước nào trong quy trình
                          </p>
                        </div>
                      ) : (
                        standardWorkflow.steps.map((step, index) => (
                          <Draggable
                            key={step.id}
                            draggableId={step.id}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${step.isRequired ? 'border-primary/50' : ''} ${
                                  selectedStepId === step.id
                                    ? 'ring-2 ring-primary'
                                    : ''
                                }`}
                              >
                                <CardHeader className="flex flex-row items-center justify-between py-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
                                      title="Kéo để sắp xếp lại"
                                    >
                                      <GripVertical className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-full w-8 h-8">
                                      <span className="text-sm font-medium">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <CardTitle className="text-base flex items-center gap-2">
                                        {step.name}
                                        {step.isRequired && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs font-normal"
                                          >
                                            Bắt buộc
                                          </Badge>
                                        )}
                                        {step.hasCost && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs font-normal bg-green-50"
                                          >
                                            <DollarSign className="h-3 w-3 mr-1" />{' '}
                                            Chi phí
                                          </Badge>
                                        )}
                                      </CardTitle>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSelectStep(step.id)}
                                    >
                                      <FileText className="h-4 w-4 mr-1" />{' '}
                                      Trường dữ liệu ({step.fields.length})
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedStepId(step.id)
                                        setShowEditStepDialog(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive"
                                      onClick={() => {
                                        setSelectedStepId(step.id)
                                        setShowDeleteStepDialog(true)
                                      }}
                                      disabled={step.isRequired}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-2">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">
                                        Mô tả
                                      </p>
                                      <p className="text-sm">
                                        {step.description || 'Không có mô tả'}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />{' '}
                                        Thời gian ước tính
                                      </p>
                                      <p className="text-sm">
                                        {step.estimatedTime}{' '}
                                        {step.estimatedTimeUnit === 'hours'
                                          ? 'giờ'
                                          : 'ngày'}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground flex items-center">
                                        <User className="h-3 w-3 mr-1" /> Người
                                        đảm nhiệm
                                      </p>
                                      <p className="text-sm">
                                        {step.assigneeRole || 'Chưa xác định'}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </TabsContent>

            <TabsContent value="fields">
              {selectedStepId ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Trường dữ liệu cho bước:{' '}
                      {getSelectedStep()?.name || 'Không xác định'}
                    </h3>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowAddFieldDialog(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Thêm trường
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            Chọn biến có sẵn để thêm
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto">
                          {Object.entries(groupedVariables).map(
                            ([source, variables]) => (
                              <div key={source} className="p-2">
                                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                  {source === 'request'
                                    ? 'Biến yêu cầu'
                                    : source === 'system'
                                      ? 'Biến hệ thống'
                                      : 'Biến tùy chỉnh'}
                                </h4>
                                <div className="space-y-1">
                                  {variables.map((variable) => (
                                    <DropdownMenuItem
                                      key={variable.id}
                                      onClick={() =>
                                        handleAddVariableField(variable)
                                      }
                                      className="flex items-center justify-between cursor-pointer"
                                    >
                                      <span>{variable.name}</span>
                                      <Badge
                                        variant="outline"
                                        className="ml-2 text-xs"
                                      >
                                        {variable.source}
                                      </Badge>
                                    </DropdownMenuItem>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {getSelectedStep()?.fields.length === 0 ? (
                    <div className="text-center py-10 border rounded-md bg-muted/30">
                      <p className="text-muted-foreground">
                        Chưa có trường dữ liệu nào trong bước này
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getSelectedStep()?.fields.map((field) => (
                        <Card
                          key={field.id}
                          className={field.isSystem ? 'border-blue-200' : ''}
                        >
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                  {field.name}
                                  {field.required && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal text-red-500"
                                    >
                                      Bắt buộc
                                    </Badge>
                                  )}
                                  {field.isSystem && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal bg-blue-50"
                                    >
                                      Hệ thống
                                    </Badge>
                                  )}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Loại: {getFieldTypeName(field.type)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedFieldId(field.id)
                                    setShowEditFieldDialog(true)
                                  }}
                                  disabled={field.isSystem}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedFieldId(field.id)
                                    setShowDeleteFieldDialog(true)
                                  }}
                                  disabled={field.isSystem}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">
                                Mô tả
                              </p>
                              <p className="text-sm">
                                {field.description || 'Không có mô tả'}
                              </p>

                              {field.type === 'select' &&
                                field.options &&
                                field.options.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      Tùy chọn
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {field.options.map((option, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {option}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {field.type === 'variable' &&
                                field.variableSource && (
                                  <div className="mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      Nguồn biến
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1"
                                    >
                                      {getVariableName(field.variableSource)}
                                    </Badge>
                                  </div>
                                )}

                              {field.type === 'currency' &&
                                field.currencySymbol && (
                                  <div className="mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      Đơn vị tiền tệ
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1"
                                    >
                                      {field.currencySymbol}
                                    </Badge>
                                  </div>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md bg-muted/30">
                  <p className="text-muted-foreground">
                    Vui lòng chọn một bước để xem trường dữ liệu
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog thêm bước mới */}
      <Dialog open={showAddStepDialog} onOpenChange={setShowAddStepDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Thêm bước mới</DialogTitle>
            <DialogDescription>
              Thêm một bước mới vào quy trình.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="step-name">
                  Tên bước <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="step-name"
                  value={newStep.name}
                  onChange={(e) =>
                    setNewStep({ ...newStep, name: e.target.value })
                  }
                  placeholder="Nhập tên bước"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-description">Mô tả</Label>
                <Textarea
                  id="step-description"
                  value={newStep.description || ''}
                  onChange={(e) =>
                    setNewStep({ ...newStep, description: e.target.value })
                  }
                  placeholder="Nhập mô tả bước"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-estimated-time">Thời gian ước tính</Label>
                <div className="flex gap-2">
                  <Input
                    id="step-estimated-time"
                    type="number"
                    value={newStep.estimatedTime.toString()}
                    onChange={(e) =>
                      setNewStep({
                        ...newStep,
                        estimatedTime: Number.parseInt(e.target.value, 10)
                      })
                    }
                    placeholder="Nhập thời gian"
                    className="flex-1"
                  />
                  <Select
                    value={newStep.estimatedTimeUnit}
                    onValueChange={(value: 'days' | 'hours') =>
                      setNewStep({ ...newStep, estimatedTimeUnit: value })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Ngày</SelectItem>
                      <SelectItem value="hours">Giờ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-notify-before-deadline">
                  Thông báo trước hạn (ngày)
                </Label>
                <Input
                  id="step-notify-before-deadline"
                  type="number"
                  value={newStep.notifyBeforeDeadline.toString()}
                  onChange={(e) =>
                    setNewStep({
                      ...newStep,
                      notifyBeforeDeadline: Number.parseInt(e.target.value, 10)
                    })
                  }
                  placeholder="Nhập số ngày"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="step-required"
                  checked={newStep.isRequired}
                  onCheckedChange={(checked) =>
                    setNewStep({ ...newStep, isRequired: !!checked })
                  }
                />
                <Label htmlFor="step-required" className="text-sm">
                  Bước bắt buộc
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="step-has-cost"
                  checked={newStep.hasCost}
                  onCheckedChange={(checked) =>
                    setNewStep({ ...newStep, hasCost: !!checked })
                  }
                />
                <Label htmlFor="step-has-cost" className="text-sm">
                  Có chi phí
                </Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddStepDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleAddStep}>Thêm bước</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa bước */}
      <Dialog open={showEditStepDialog} onOpenChange={setShowEditStepDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bước</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin của bước.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {getSelectedStep() && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-step-name">
                    Tên bước <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-step-name"
                    value={getSelectedStep()?.name || ''}
                    onChange={(e) => {
                      const step = getSelectedStep()
                      if (step && selectedStepId) {
                        updateStandardWorkflowStep(selectedStepId, {
                          name: e.target.value
                        })
                      }
                    }}
                    placeholder="Nhập tên bước"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-step-description">Mô tả</Label>
                  <Textarea
                    id="edit-step-description"
                    value={getSelectedStep()?.description || ''}
                    onChange={(e) => {
                      const step = getSelectedStep()
                      if (step && selectedStepId) {
                        updateStandardWorkflowStep(selectedStepId, {
                          description: e.target.value
                        })
                      }
                    }}
                    placeholder="Nhập mô tả bước"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-step-estimated-time">
                    Thời gian ước tính
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-step-estimated-time"
                      type="number"
                      value={
                        getSelectedStep()?.estimatedTime?.toString() || '1'
                      }
                      onChange={(e) => {
                        const step = getSelectedStep()
                        if (step && selectedStepId) {
                          updateStandardWorkflowStep(selectedStepId, {
                            estimatedTime: Number.parseInt(e.target.value, 10)
                          })
                        }
                      }}
                      placeholder="Nhập thời gian"
                      className="flex-1"
                    />
                    <Select
                      value={getSelectedStep()?.estimatedTimeUnit || 'days'}
                      onValueChange={(value: 'days' | 'hours') => {
                        const step = getSelectedStep()
                        if (step && selectedStepId) {
                          updateStandardWorkflowStep(selectedStepId, {
                            estimatedTimeUnit: value
                          })
                        }
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Ngày</SelectItem>
                        <SelectItem value="hours">Giờ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-step-notify-before-deadline">
                    Thông báo trước hạn (ngày)
                  </Label>
                  <Input
                    id="edit-step-notify-before-deadline"
                    type="number"
                    value={
                      getSelectedStep()?.notifyBeforeDeadline.toString() || '1'
                    }
                    onChange={(e) => {
                      const step = getSelectedStep()
                      if (step && selectedStepId) {
                        updateStandardWorkflowStep(selectedStepId, {
                          notifyBeforeDeadline: Number.parseInt(
                            e.target.value,
                            10
                          )
                        })
                      }
                    }}
                    placeholder="Nhập số ngày"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-step-required"
                    checked={getSelectedStep()?.isRequired || false}
                    onCheckedChange={(checked) => {
                      const step = getSelectedStep()
                      if (step && selectedStepId) {
                        updateStandardWorkflowStep(selectedStepId, {
                          isRequired: !!checked
                        })
                      }
                    }}
                  />
                  <Label htmlFor="edit-step-required" className="text-sm">
                    Bước bắt buộc
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-step-has-cost"
                    checked={getSelectedStep()?.hasCost || false}
                    onCheckedChange={(checked) => {
                      const step = getSelectedStep()
                      if (step && selectedStepId) {
                        updateStandardWorkflowStep(selectedStepId, {
                          hasCost: !!checked
                        })
                      }
                    }}
                  />
                  <Label htmlFor="edit-step-has-cost" className="text-sm">
                    Có chi phí
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-step-allowed-users">
                    Nhân sự được thao tác
                  </Label>
                  <div className="space-y-2">
                    <Select
                      value=""
                      onValueChange={(userId) => {
                        const step = getSelectedStep()
                        if (step && selectedStepId && userId) {
                          const currentAllowedUsers = step.allowedUsers || []
                          if (!currentAllowedUsers.includes(userId)) {
                            updateStandardWorkflowStep(selectedStepId, {
                              allowedUsers: [...currentAllowedUsers, userId]
                            })
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhân sự để thêm" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {users
                          .filter(
                            (user) =>
                              !(getSelectedStep()?.allowedUsers || []).includes(
                                user.id
                              )
                          )
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                  {user.name.charAt(0)}
                                </div>
                                {user.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {/* Hiển thị danh sách users đã chọn */}
                    <div className="flex flex-wrap gap-2">
                      {(getSelectedStep()?.allowedUsers || []).map((userId) => {
                        const user = users.find((u) => u.id === userId)
                        if (!user) return null
                        return (
                          <Badge
                            key={userId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                              {user.name.charAt(0)}
                            </div>
                            {user.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => {
                                const step = getSelectedStep()
                                if (step && selectedStepId) {
                                  updateStandardWorkflowStep(selectedStepId, {
                                    allowedUsers: (
                                      step.allowedUsers || []
                                    ).filter((id) => id !== userId)
                                  })
                                }
                              }}
                            >
                              ×
                            </Button>
                          </Badge>
                        )
                      })}
                    </div>

                    {(getSelectedStep()?.allowedUsers || []).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Chưa có nhân sự nào được chọn. Hệ thống sẽ sử dụng vai
                        trò người đảm nhiệm.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditStepDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateStep}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa bước */}
      <Dialog
        open={showDeleteStepDialog}
        onOpenChange={setShowDeleteStepDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa bước</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bước này? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteStepDialog(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteStep}>
              Xóa bước
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm trường */}
      <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Thêm trường dữ liệu</DialogTitle>
            <DialogDescription>
              Thêm một trường dữ liệu mới vào bước.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">
                  Tên trường <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="field-name"
                  value={newField.name}
                  onChange={(e) =>
                    setNewField({ ...newField, name: e.target.value })
                  }
                  placeholder="Nhập tên trường"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-type">
                  Loại trường <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newField.type}
                  onValueChange={(value: any) => {
                    setNewField({
                      ...newField,
                      type: value,
                      options:
                        value === 'select' || value === 'multiselect'
                          ? ['Tùy chọn 1', 'Tùy chọn 2', 'Tùy chọn 3']
                          : undefined,
                      currencySymbol: value === 'currency' ? 'VND' : undefined
                    })
                  }}
                >
                  <SelectTrigger id="field-type">
                    <SelectValue placeholder="Chọn loại trường" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Văn bản</SelectItem>
                    <SelectItem value="date">Ngày tháng</SelectItem>
                    <SelectItem value="datetime">Ngày giờ</SelectItem>
                    <SelectItem value="select">Lựa chọn đơn</SelectItem>
                    <SelectItem value="multiselect">Lựa chọn nhiều</SelectItem>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="checkbox">Hộp kiểm</SelectItem>
                    <SelectItem value="number">Số</SelectItem>
                    <SelectItem value="currency">Tiền tệ</SelectItem>
                    <SelectItem value="variable">Biến</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-description">Mô tả</Label>
                <Textarea
                  id="field-description"
                  value={newField.description || ''}
                  onChange={(e) =>
                    setNewField({ ...newField, description: e.target.value })
                  }
                  placeholder="Nhập mô tả trường"
                  rows={2}
                />
              </div>

              {(newField.type === 'select' ||
                newField.type === 'multiselect') && (
                <div className="space-y-2">
                  <Label htmlFor="field-options">
                    Tùy chọn (mỗi dòng một tùy chọn)
                  </Label>
                  <Textarea
                    id="field-options"
                    value={(newField.options || []).join('\n')}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        options: e.target.value
                          .split('\n')
                          .filter((option) => option.trim() !== '')
                      })
                    }
                    placeholder="Nhập các tùy chọn, mỗi dòng một tùy chọn"
                    rows={3}
                  />
                </div>
              )}

              {newField.type === 'currency' && (
                <div className="space-y-2">
                  <Label htmlFor="field-currency">Đơn vị tiền tệ</Label>
                  <Input
                    id="field-currency"
                    value={newField.currencySymbol || 'VND'}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        currencySymbol: e.target.value
                      })
                    }
                    placeholder="Nhập đơn vị tiền tệ (VND, USD, ...)"
                  />
                </div>
              )}

              {newField.type === 'variable' && (
                <div className="space-y-2">
                  <Label htmlFor="field-variable">Nguồn biến</Label>
                  <Select
                    value={newField.variableSource || ''}
                    onValueChange={(value) =>
                      setNewField({ ...newField, variableSource: value })
                    }
                  >
                    <SelectTrigger id="field-variable">
                      <SelectValue placeholder="Chọn nguồn biến" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVariables.map((variable) => (
                        <SelectItem key={variable.id} value={variable.id}>
                          {variable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-required"
                  checked={newField.required}
                  onCheckedChange={(checked) =>
                    setNewField({ ...newField, required: !!checked })
                  }
                />
                <Label htmlFor="field-required" className="text-sm">
                  Trường bắt buộc
                </Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddFieldDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleAddField}>Thêm trường</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa trường */}
      <Dialog open={showEditFieldDialog} onOpenChange={setShowEditFieldDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa trường dữ liệu</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin của trường dữ liệu.
            </DialogDescription>
          </DialogHeader>
          {getSelectedField() && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-field-name">
                  Tên trường <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-field-name"
                  value={getSelectedField()?.name || ''}
                  onChange={(e) => {
                    const field = getSelectedField()
                    if (field && selectedStepId) {
                      updateStepField(selectedStepId, field.id, {
                        name: e.target.value
                      })
                    }
                  }}
                  placeholder="Nhập tên trường"
                  disabled={getSelectedField()?.isSystem}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-field-type">
                  Loại trường <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={getSelectedField()?.type || 'text'}
                  onValueChange={(value: any) => {
                    const field = getSelectedField()
                    if (field && selectedStepId) {
                      updateStepField(selectedStepId, field.id, {
                        type: value,
                        options:
                          value === 'select' || value === 'multiselect'
                            ? field.options || [
                                'Tùy chọn 1',
                                'Tùy chọn 2',
                                'Tùy chọn 3'
                              ]
                            : undefined,
                        currencySymbol:
                          value === 'currency'
                            ? field.currencySymbol || 'VND'
                            : undefined
                      })
                    }
                  }}
                  disabled={getSelectedField()?.isSystem}
                >
                  <SelectTrigger id="edit-field-type">
                    <SelectValue placeholder="Chọn loại trường" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Văn bản</SelectItem>
                    <SelectItem value="date">Ngày tháng</SelectItem>
                    <SelectItem value="datetime">Ngày giờ</SelectItem>
                    <SelectItem value="select">Lựa chọn đơn</SelectItem>
                    <SelectItem value="multiselect">Lựa chọn nhiều</SelectItem>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="checkbox">Hộp kiểm</SelectItem>
                    <SelectItem value="number">Số</SelectItem>
                    <SelectItem value="currency">Tiền tệ</SelectItem>
                    <SelectItem value="variable">Biến</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-field-description">Mô tả</Label>
                <Textarea
                  id="edit-field-description"
                  value={getSelectedField()?.description || ''}
                  onChange={(e) => {
                    const field = getSelectedField()
                    if (field && selectedStepId) {
                      updateStepField(selectedStepId, field.id, {
                        description: e.target.value
                      })
                    }
                  }}
                  placeholder="Nhập mô tả trường"
                  rows={2}
                  disabled={getSelectedField()?.isSystem}
                />
              </div>

              {(getSelectedField()?.type === 'select' ||
                getSelectedField()?.type === 'multiselect') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-field-options">
                    Tùy chọn (mỗi dòng một tùy chọn)
                  </Label>
                  <Textarea
                    id="edit-field-options"
                    value={(getSelectedField()?.options || []).join('\n')}
                    onChange={(e) => {
                      const field = getSelectedField()
                      if (field && selectedStepId) {
                        updateStepField(selectedStepId, field.id, {
                          options: e.target.value
                            .split('\n')
                            .filter((option) => option.trim() !== '')
                        })
                      }
                    }}
                    placeholder="Nhập các tùy chọn, mỗi dòng một tùy chọn"
                    rows={3}
                    disabled={getSelectedField()?.isSystem}
                  />
                </div>
              )}

              {getSelectedField()?.type === 'currency' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-field-currency">Đơn vị tiền tệ</Label>
                  <Input
                    id="edit-field-currency"
                    value={getSelectedField()?.currencySymbol || 'VND'}
                    onChange={(e) => {
                      const field = getSelectedField()
                      if (field && selectedStepId) {
                        updateStepField(selectedStepId, field.id, {
                          currencySymbol: e.target.value
                        })
                      }
                    }}
                    placeholder="Nhập đơn vị tiền tệ (VND, USD, ...)"
                    disabled={getSelectedField()?.isSystem}
                  />
                </div>
              )}

              {getSelectedField()?.type === 'variable' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-field-variable">Nguồn biến</Label>
                  <Select
                    value={getSelectedField()?.variableSource || ''}
                    onValueChange={(value) => {
                      const field = getSelectedField()
                      if (field && selectedStepId) {
                        updateStepField(selectedStepId, field.id, {
                          variableSource: value
                        })
                      }
                    }}
                    disabled={getSelectedField()?.isSystem}
                  >
                    <SelectTrigger id="edit-field-variable">
                      <SelectValue placeholder="Chọn nguồn biến" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVariables.map((variable) => (
                        <SelectItem key={variable.id} value={variable.id}>
                          {variable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-field-required"
                  checked={getSelectedField()?.required || false}
                  onCheckedChange={(checked) => {
                    const field = getSelectedField()
                    if (field && selectedStepId) {
                      updateStepField(selectedStepId, field.id, {
                        required: !!checked
                      })
                    }
                  }}
                  disabled={getSelectedField()?.isSystem}
                />
                <Label htmlFor="edit-field-required" className="text-sm">
                  Trường bắt buộc
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditFieldDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateField}
              disabled={getSelectedField()?.isSystem}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa trường */}
      <Dialog
        open={showDeleteFieldDialog}
        onOpenChange={setShowDeleteFieldDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa trường dữ liệu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa trường này? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteFieldDialog(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteField}>
              Xóa trường
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
