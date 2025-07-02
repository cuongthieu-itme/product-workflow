"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStandardWorkflow } from "./standard-workflow-context-firebase"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Save, X, Trash2, Calendar, DollarSign, User, GripVertical, Edit } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface StandardWorkflowFormProps {
  onSelect?: (workflowId: string) => void
}

export function StandardWorkflowForm({ onSelect }: StandardWorkflowFormProps) {
  const { toast } = useToast()
  const {
    standardWorkflow,
    updateStandardWorkflow,
    addStandardWorkflowStep,
    updateStandardWorkflowStep,
    deleteStandardWorkflowStep,
    reorderStandardWorkflowSteps,
    availableVariables,
    loading,
  } = useStandardWorkflow()

  const [isEditing, setIsEditing] = useState(false)
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [showAddStepDialog, setShowAddStepDialog] = useState(false)
  const [showEditStepDialog, setShowEditStepDialog] = useState(false)
  const [showDeleteStepDialog, setShowDeleteStepDialog] = useState(false)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [newStep, setNewStep] = useState<Omit<any, "id" | "order" | "fields">>({
    name: "",
    description: "",
    estimatedDays: 1,
    isRequired: false,
    notifyBeforeDeadline: 1,
    assigneeRole: "",
    hasCost: false,
  })

  // Khởi tạo state từ quy trình chuẩn
  useEffect(() => {
    if (standardWorkflow) {
      setWorkflowName(standardWorkflow.name)
      setWorkflowDescription(standardWorkflow.description)
    }
  }, [standardWorkflow])

  // Lấy bước được chọn
  const getSelectedStep = () => {
    if (!standardWorkflow || !selectedStepId) return null
    return standardWorkflow.steps.find((step) => step.id === selectedStepId) || null
  }

  // Xử lý lưu chỉnh sửa quy trình chuẩn
  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên quy trình chuẩn",
        variant: "destructive",
      })
      return
    }

    updateStandardWorkflow({
      name: workflowName,
      description: workflowDescription,
    })

    setIsEditing(false)
    toast({
      title: "Thành công",
      description: "Đã cập nhật thông tin quy trình chuẩn",
    })
  }

  // Xử lý thêm bước mới
  const handleAddStep = () => {
    if (!newStep.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên bước",
        variant: "destructive",
      })
      return
    }

    if (newStep.estimatedDays < 1) {
      toast({
        title: "Lỗi",
        description: "Số ngày ước tính phải lớn hơn hoặc bằng 1",
        variant: "destructive",
      })
      return
    }

    addStandardWorkflowStep({
      name: newStep.name,
      description: newStep.description,
      estimatedDays: newStep.estimatedDays,
      isRequired: newStep.isRequired,
      notifyBeforeDeadline: newStep.notifyBeforeDeadline,
      assigneeRole: newStep.assigneeRole,
      hasCost: newStep.hasCost,
      fields: [
        {
          id: "assignee",
          name: "Người đảm nhận",
          type: "user",
          required: true,
          description: "Người chịu trách nhiệm cho bước này",
          isSystem: true,
        },
        {
          id: "receiveDate",
          name: "Thời gian tiếp nhận",
          type: "date",
          required: true,
          description: "Ngày tiếp nhận yêu cầu",
          isSystem: true,
        },
        {
          id: "deadline",
          name: "Thời gian deadline",
          type: "date",
          required: true,
          description: "Ngày dự kiến hoàn thành công việc",
          isSystem: true,
        },
        {
          id: "status",
          name: "Trạng thái",
          type: "select",
          required: true,
          description: "Trạng thái hiện tại của bước",
          options: ["Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Quá hạn"],
          isSystem: true,
        },
      ],
    })

    // Reset form
    setNewStep({
      name: "",
      description: "",
      estimatedDays: 1,
      isRequired: false,
      notifyBeforeDeadline: 1,
      assigneeRole: "",
      hasCost: false,
    })
    setShowAddStepDialog(false)
  }

  // Xử lý cập nhật bước
  const handleUpdateStep = () => {
    const selectedStep = getSelectedStep()
    if (!selectedStep) return

    if (!selectedStep.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên bước",
        variant: "destructive",
      })
      return
    }

    if (selectedStep.estimatedDays < 1) {
      toast({
        title: "Lỗi",
        description: "Số ngày ước tính phải lớn hơn hoặc bằng 1",
        variant: "destructive",
      })
      return
    }

    updateStandardWorkflowStep(selectedStep.id, {
      name: selectedStep.name,
      description: selectedStep.description,
      estimatedDays: selectedStep.estimatedDays,
      isRequired: selectedStep.isRequired,
      notifyBeforeDeadline: selectedStep.notifyBeforeDeadline,
      assigneeRole: selectedStep.assigneeRole,
      hasCost: selectedStep.hasCost,
    })

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

    // Cập nhật lại thứ tự (order) cho mỗi bước
    const reorderedSteps = steps.map((step, index) => ({
      ...step,
      order: index,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải quy trình chuẩn...</p>
      </div>
    )
  }

  if (!standardWorkflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Không tìm thấy quy trình chuẩn</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quy trình chuẩn</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Phiên bản: {standardWorkflow.version} | Cập nhật lần cuối: {standardWorkflow.updatedAt.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </Button>
                <Button onClick={() => handleSelectWorkflow(standardWorkflow.id)}>Quản lý bước</Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-1" /> Hủy
                </Button>
                <Button onClick={handleSaveWorkflow}>
                  <Save className="h-4 w-4 mr-1" /> Lưu
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Tên quy trình</Label>
            {isEditing ? (
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Nhập tên quy trình chuẩn"
              />
            ) : (
              <div className="p-2 border rounded-md bg-muted/30">{standardWorkflow.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow-description">Mô tả</Label>
            {isEditing ? (
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Nhập mô tả quy trình chuẩn"
                rows={3}
              />
            ) : (
              <div className="p-2 border rounded-md bg-muted/30 min-h-[80px] whitespace-pre-line">
                {standardWorkflow.description || "Không có mô tả"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Các bước trong quy trình</h2>
        <Button onClick={() => setShowAddStepDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Thêm bước mới
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {standardWorkflow.steps.length === 0 ? (
                <div className="text-center py-10 border rounded-md bg-muted/30">
                  <p className="text-muted-foreground">Chưa có bước nào trong quy trình</p>
                </div>
              ) : (
                standardWorkflow.steps.map((step, index) => (
                  <Draggable key={step.id} draggableId={step.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={step.isRequired ? "border-primary/50" : ""}
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
                              <span className="text-sm font-medium">{index + 1}</span>
                            </div>
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                {step.name}
                                {step.isRequired && (
                                  <Badge variant="outline" className="text-xs font-normal">
                                    Bắt buộc
                                  </Badge>
                                )}
                                {step.hasCost && (
                                  <Badge variant="outline" className="text-xs font-normal bg-green-50">
                                    <DollarSign className="h-3 w-3 mr-1" /> Chi phí
                                  </Badge>
                                )}
                              </CardTitle>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
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
                              <p className="text-xs text-muted-foreground">Mô tả</p>
                              <p className="text-sm">{step.description || "Không có mô tả"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-1" /> Thời gian ước tính
                              </p>
                              <p className="text-sm">{step.estimatedDays} ngày</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center">
                                <User className="h-3 w-3 mr-1" /> Người đảm nhiệm
                              </p>
                              <p className="text-sm">{step.assigneeRole || "Chưa xác định"}</p>
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

      {/* Dialog thêm bước mới */}
      <Dialog open={showAddStepDialog} onOpenChange={setShowAddStepDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm bước mới vào quy trình</DialogTitle>
            <DialogDescription>
              Thêm một bước mới vào quy trình chuẩn. Các bước sẽ được thực hiện theo thứ tự.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="step-name">
                Tên bước <span className="text-red-500">*</span>
              </Label>
              <Input
                id="step-name"
                value={newStep.name}
                onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                placeholder="Nhập tên bước"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-description">Mô tả</Label>
              <Textarea
                id="step-description"
                value={newStep.description}
                onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                placeholder="Nhập mô tả chi tiết về bước này"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="step-days">
                  Số ngày ước tính <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="step-days"
                  type="number"
                  min={1}
                  value={newStep.estimatedDays}
                  onChange={(e) => setNewStep({ ...newStep, estimatedDays: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-notify">Thông báo trước deadline (ngày)</Label>
                <Input
                  id="step-notify"
                  type="number"
                  min={0}
                  value={newStep.notifyBeforeDeadline}
                  onChange={(e) =>
                    setNewStep({ ...newStep, notifyBeforeDeadline: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-assignee">Vai trò người đảm nhiệm</Label>
              <Input
                id="step-assignee"
                value={newStep.assigneeRole}
                onChange={(e) => setNewStep({ ...newStep, assigneeRole: e.target.value })}
                placeholder="Nhập vai trò người đảm nhiệm (ví dụ: Nhân viên kỹ thuật)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="step-required"
                checked={newStep.isRequired}
                onCheckedChange={(checked) => setNewStep({ ...newStep, isRequired: !!checked })}
              />
              <Label htmlFor="step-required" className="text-sm">
                Bước bắt buộc (không thể xóa)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="step-cost"
                checked={newStep.hasCost}
                onCheckedChange={(checked) => setNewStep({ ...newStep, hasCost: !!checked })}
              />
              <Label htmlFor="step-cost" className="text-sm">
                Bước có chi phí
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStepDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddStep}>Thêm bước</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa bước */}
      <Dialog open={showEditStepDialog} onOpenChange={setShowEditStepDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bước</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin của bước trong quy trình chuẩn.</DialogDescription>
          </DialogHeader>
          {getSelectedStep() && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-step-name">
                  Tên bước <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-step-name"
                  value={getSelectedStep()?.name || ""}
                  onChange={(e) => {
                    const step = getSelectedStep()
                    if (step) {
                      updateStandardWorkflowStep(step.id, { name: e.target.value })
                    }
                  }}
                  placeholder="Nhập tên bước"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-step-description">Mô tả</Label>
                <Textarea
                  id="edit-step-description"
                  value={getSelectedStep()?.description || ""}
                  onChange={(e) => {
                    const step = getSelectedStep()
                    if (step) {
                      updateStandardWorkflowStep(step.id, { description: e.target.value })
                    }
                  }}
                  placeholder="Nhập mô tả chi tiết về bước này"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-step-days">
                    Số ngày ước tính <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-step-days"
                    type="number"
                    min={1}
                    value={getSelectedStep()?.estimatedDays || 1}
                    onChange={(e) => {
                      const step = getSelectedStep()
                      if (step) {
                        updateStandardWorkflowStep(step.id, { estimatedDays: Number.parseInt(e.target.value) || 1 })
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-step-notify">Thông báo trước deadline (ngày)</Label>
                  <Input
                    id="edit-step-notify"
                    type="number"
                    min={0}
                    value={getSelectedStep()?.notifyBeforeDeadline || 0}
                    onChange={(e) => {
                      const step = getSelectedStep()
                      if (step) {
                        updateStandardWorkflowStep(step.id, {
                          notifyBeforeDeadline: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-step-assignee">Vai trò người đảm nhiệm</Label>
                <Input
                  id="edit-step-assignee"
                  value={getSelectedStep()?.assigneeRole || ""}
                  onChange={(e) => {
                    const step = getSelectedStep()
                    if (step) {
                      updateStandardWorkflowStep(step.id, { assigneeRole: e.target.value })
                    }
                  }}
                  placeholder="Nhập vai trò người đảm nhiệm (ví dụ: Nhân viên kỹ thuật)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-step-required"
                  checked={getSelectedStep()?.isRequired || false}
                  onCheckedChange={(checked) => {
                    const step = getSelectedStep()
                    if (step) {
                      updateStandardWorkflowStep(step.id, { isRequired: !!checked })
                    }
                  }}
                />
                <Label htmlFor="edit-step-required" className="text-sm">
                  Bước bắt buộc (không thể xóa)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-step-cost"
                  checked={getSelectedStep()?.hasCost || false}
                  onCheckedChange={(checked) => {
                    const step = getSelectedStep()
                    if (step) {
                      updateStandardWorkflowStep(step.id, { hasCost: !!checked })
                    }
                  }}
                />
                <Label htmlFor="edit-step-cost" className="text-sm">
                  Bước có chi phí
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditStepDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateStep}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa bước */}
      <Dialog open={showDeleteStepDialog} onOpenChange={setShowDeleteStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa bước</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bước này khỏi quy trình chuẩn? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteStepDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteStep}>
              Xóa bước
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
