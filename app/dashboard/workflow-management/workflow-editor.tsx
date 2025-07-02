"use client"

import { useState } from "react"
import {
  useStandardWorkflow,
  type StandardWorkflowStep,
} from "@/components/workflow/standard-workflow-context-firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StandardWorkflowStepForm } from "@/components/workflow/standard-workflow-step-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { StandardWorkflowForm } from "@/components/workflow/standard-workflow-form"
import { SubWorkflowList } from "@/components/workflow/sub-workflow-list"

// Thay đổi từ default export sang named export
export function WorkflowEditor() {
  const { toast } = useToast()
  const {
    standardWorkflow,
    updateStandardWorkflow,
    addStandardWorkflowStep,
    updateStandardWorkflowStep,
    deleteStandardWorkflowStep,
    reorderStandardWorkflowSteps,
  } = useStandardWorkflow()

  const [activeTab, setActiveTab] = useState("workflow")
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [showAddStepDialog, setShowAddStepDialog] = useState(false)
  const [showEditStepDialog, setShowEditStepDialog] = useState(false)
  const [showDeleteStepDialog, setShowDeleteStepDialog] = useState(false)
  const [newStep, setNewStep] = useState<Omit<StandardWorkflowStep, "id" | "order" | "fields">>({
    name: "",
    description: "",
    estimatedDays: 1,
    isRequired: false,
    notifyBeforeDeadline: 1,
    assigneeRole: "",
    hasCost: false,
  })

  // Lấy bước được chọn
  const getSelectedStep = () => {
    if (!standardWorkflow || !selectedStepId) return null
    return standardWorkflow.steps.find((step) => step.id === selectedStepId) || null
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

    // Thêm bước mới với các trường mặc định
    const stepId = addStandardWorkflowStep({
      ...newStep,
      fields: [
        {
          id: "assignee",
          name: "Người đảm nhận",
          type: "user",
          required: true,
          description: "Người chịu trách nhiệm thực hiện bước này",
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

    // Reset form và đóng dialog
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

    // Chuyển đến tab quản lý trường dữ liệu của bước mới
    setSelectedStepId(stepId)
    setActiveTab("fields")
  }

  // Xử lý cập nhật bước
  const handleUpdateStep = () => {
    const step = getSelectedStep()
    if (!step) return

    if (!step.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên bước",
        variant: "destructive",
      })
      return
    }

    updateStandardWorkflowStep(step.id, {
      name: step.name,
      description: step.description,
      estimatedDays: step.estimatedDays,
      isRequired: step.isRequired,
      notifyBeforeDeadline: step.notifyBeforeDeadline,
      assigneeRole: step.assigneeRole,
      hasCost: step.hasCost,
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
      setActiveTab("general")
    }
  }

  // Xử lý kéo thả để sắp xếp lại các bước
  const handleDragEnd = (result: any) => {
    if (!result.destination || !standardWorkflow) return

    const steps = Array.from(standardWorkflow.steps)
    const [removed] = steps.splice(result.source.index, 1)
    steps.splice(result.destination.index, 0, removed)

    reorderStandardWorkflowSteps(steps)
  }

  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflowId(workflowId)
    setActiveTab("steps")
  }

  if (!standardWorkflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải quy trình chuẩn...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý quy trình chuẩn</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="workflow">Quy trình</TabsTrigger>
              <TabsTrigger value="steps">Các bước quy trình</TabsTrigger>
              <TabsTrigger value="subworkflows">Quy trình con</TabsTrigger>
            </TabsList>

            <TabsContent value="workflow">
              <StandardWorkflowForm onSelect={handleWorkflowSelect} />
            </TabsContent>

            <TabsContent value="steps">
              {standardWorkflow && <StandardWorkflowStepForm workflowId={standardWorkflow.id} />}
            </TabsContent>

            <TabsContent value="subworkflows">
              {selectedWorkflowId && <SubWorkflowList parentWorkflowId={selectedWorkflowId} />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog thêm bước mới */}
      <Dialog open={showAddStepDialog} onOpenChange={setShowAddStepDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm bước mới</DialogTitle>
            <DialogDescription>Thêm một bước mới vào quy trình chuẩn.</DialogDescription>
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
                placeholder="Nhập mô tả bước"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-days">
                Số ngày ước tính <span className="text-red-500">*</span>
              </Label>
              <Input
                id="step-days"
                type="number"
                min={1}
                value={newStep.estimatedDays}
                onChange={(e) =>
                  setNewStep({ ...newStep, estimatedDays: Math.max(1, Number.parseInt(e.target.value) || 1) })
                }
                placeholder="Nhập số ngày ước tính"
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
                  setNewStep({
                    ...newStep,
                    notifyBeforeDeadline: Math.max(0, Number.parseInt(e.target.value) || 0),
                  })
                }
                placeholder="Nhập số ngày thông báo trước deadline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-role">Vai trò người đảm nhiệm</Label>
              <Input
                id="step-role"
                value={newStep.assigneeRole || ""}
                onChange={(e) => setNewStep({ ...newStep, assigneeRole: e.target.value })}
                placeholder="Nhập vai trò người đảm nhiệm"
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
                  placeholder="Nhập mô tả bước"
                  rows={3}
                />
              </div>
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
                      updateStandardWorkflowStep(step.id, {
                        estimatedDays: Math.max(1, Number.parseInt(e.target.value) || 1),
                      })
                    }
                  }}
                  placeholder="Nhập số ngày ước tính"
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
                        notifyBeforeDeadline: Math.max(0, Number.parseInt(e.target.value) || 0),
                      })
                    }
                  }}
                  placeholder="Nhập số ngày thông báo trước deadline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-step-role">Vai trò người đảm nhiệm</Label>
                <Input
                  id="edit-step-role"
                  value={getSelectedStep()?.assigneeRole || ""}
                  onChange={(e) => {
                    const step = getSelectedStep()
                    if (step) {
                      updateStandardWorkflowStep(step.id, { assigneeRole: e.target.value })
                    }
                  }}
                  placeholder="Nhập vai trò người đảm nhiệm"
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
            <DialogDescription>Bạn có chắc chắn muốn xóa bước này? Hành động này không thể hoàn tác.</DialogDescription>
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
