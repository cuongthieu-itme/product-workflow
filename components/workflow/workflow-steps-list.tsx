'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  useWorkflowProcess,
  type WorkflowStep
} from './workflow-process-context'
import {
  PlusCircle,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Clock,
  AlertCircle,
  MoveUp,
  MoveDown
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { StepFieldsManager } from './step-fields-manager'

// Thêm đoạn code sau vào đầu file để đảm bảo component nhận đúng props
interface WorkflowStepsListProps {
  process: any // Sử dụng kiểu WorkflowProcess từ context
  onStepsUpdated?: () => void
}

export function WorkflowStepsList({
  process,
  onStepsUpdated
}: WorkflowStepsListProps) {
  const { toast } = useToast()
  const {
    addWorkflowStep,
    updateWorkflowStep,
    deleteWorkflowStep,
    reorderWorkflowSteps
  } = useWorkflowProcess()
  const [isAddStepOpen, setIsAddStepOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)
  const [stepToDelete, setStepToDelete] = useState<WorkflowStep | null>(null)
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'fields'>('info')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedDays: 1
  })
  const [nameError, setNameError] = useState('')
  const [lastAddedStepId, setLastAddedStepId] = useState<string | null>(null)

  // Ref cho container danh sách các bước
  const stepsContainerRef = useRef<HTMLDivElement>(null)
  const lastStepRef = useRef<HTMLDivElement>(null)

  // Thêm style cho thanh cuộn
  const scrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`

  // Cuộn xuống bước mới được thêm vào
  useEffect(() => {
    if (lastAddedStepId && stepsContainerRef.current && lastStepRef.current) {
      lastStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })

      // Tự động mở rộng bước mới thêm
      setExpandedStepId(lastAddedStepId)

      // Reset lastAddedStepId sau khi đã cuộn
      setTimeout(() => {
        setLastAddedStepId(null)
      }, 1000)
    }
  }, [lastAddedStepId, process.steps.length])

  // Thay đổi tất cả các tham chiếu từ workflow sang process
  const handleAddStep = useCallback(() => {
    setEditingStep(null)
    setFormData({
      name: '',
      description: '',
      estimatedDays: 1
    })
    setNameError('')
    setIsAddStepOpen(true)
  }, [])

  const handleEditStep = useCallback((step: WorkflowStep) => {
    setEditingStep(step)
    setFormData({
      name: step.name,
      description: step.description,
      estimatedDays: step.estimatedDays
    })
    setNameError('')
    setIsAddStepOpen(true)
  }, [])

  const handleDeleteStep = useCallback((step: WorkflowStep) => {
    setStepToDelete(step)
  }, [])

  const confirmDeleteStep = useCallback(() => {
    if (stepToDelete) {
      const success = deleteWorkflowStep(process.id, stepToDelete.id)
      if (success) {
        toast({
          title: 'Xóa thành công',
          description: `Bước "${stepToDelete.name}" đã được xóa khỏi quy trình.`,
          variant: 'success'
        })
        if (onStepsUpdated) onStepsUpdated()
      } else {
        toast({
          title: 'Không thể xóa',
          description: `Bước "${stepToDelete.name}" là bước quan trọng và không thể xóa.`,
          variant: 'destructive'
        })
      }
      setStepToDelete(null)
    }
  }, [stepToDelete, process.id, deleteWorkflowStep, toast, onStepsUpdated])

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Xóa thông báo lỗi khi người dùng thay đổi giá trị
    if (field === 'name') {
      setNameError('')
    }
  }, [])

  const validateForm = useCallback(() => {
    let isValid = true

    if (!formData.name.trim()) {
      setNameError('Vui lòng nhập tên bước')
      isValid = false
    }

    return isValid
  }, [formData])

  const handleSubmitStep = useCallback(() => {
    if (!validateForm()) {
      return
    }

    try {
      if (editingStep) {
        // Cập nhật bước hiện có
        updateWorkflowStep(process.id, editingStep.id, {
          name: formData.name,
          description: formData.description,
          estimatedDays: Number(formData.estimatedDays)
        })

        toast({
          title: 'Cập nhật thành công',
          description: `Bước "${formData.name}" đã được cập nhật.`,
          variant: 'success'
        })
      } else {
        // Thêm bước mới
        const newStep = addWorkflowStep(process.id, {
          name: formData.name,
          description: formData.description,
          estimatedDays: Number(formData.estimatedDays)
        })

        // Lưu ID của bước mới để cuộn đến
        if (newStep && newStep.id) {
          setLastAddedStepId(newStep.id)
        }

        toast({
          title: 'Thêm bước thành công',
          description: (
            <div>
              <p>Bước "{formData.name}" đã được thêm vào quy trình.</p>
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => {
                  if (stepsContainerRef.current) {
                    stepsContainerRef.current.scrollTop =
                      stepsContainerRef.current.scrollHeight
                  }
                }}
              >
                Cuộn xuống để xem
              </Button>
            </div>
          ),
          variant: 'success'
        })
      }

      // Đóng dialog
      setIsAddStepOpen(false)

      // Gọi callback để cập nhật UI
      if (onStepsUpdated) {
        onStepsUpdated()
      }
    } catch (error) {
      console.error('Lỗi khi thêm/cập nhật bước:', error)
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Không thể lưu bước quy trình. Vui lòng thử lại sau.',
        variant: 'destructive'
      })
    }
  }, [
    validateForm,
    formData,
    editingStep,
    process.id,
    updateWorkflowStep,
    addWorkflowStep,
    toast,
    onStepsUpdated
  ])

  const handleMoveStep = useCallback(
    (stepId: string, direction: 'up' | 'down') => {
      const stepIndex = process.steps.findIndex((step) => step.id === stepId)
      if (stepIndex === -1) return

      const newSteps = [...process.steps]
      const step = newSteps[stepIndex]

      if (direction === 'up' && stepIndex > 0) {
        newSteps.splice(stepIndex, 1)
        newSteps.splice(stepIndex - 1, 0, step)
      } else if (direction === 'down' && stepIndex < newSteps.length - 1) {
        newSteps.splice(stepIndex, 1)
        newSteps.splice(stepIndex + 1, 0, step)
      } else {
        return
      }

      reorderWorkflowSteps(process.id, newSteps)
      if (onStepsUpdated) onStepsUpdated()
    },
    [process.id, process.steps, reorderWorkflowSteps, onStepsUpdated]
  )

  const toggleExpandStep = useCallback((stepId: string) => {
    setExpandedStepId((prev) => (prev === stepId ? null : stepId))
    setActiveTab('info') // Reset to info tab when expanding
  }, [])

  const handleFieldsUpdated = useCallback(() => {
    // Cập nhật lại UI khi có thay đổi về trường dữ liệu
    toast({
      title: 'Cập nhật thành công',
      description: 'Danh sách trường dữ liệu đã được cập nhật.',
      variant: 'success'
    })
    if (onStepsUpdated) onStepsUpdated()
  }, [toast, onStepsUpdated])

  const scrollToBottom = useCallback(() => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTop =
        stepsContainerRef.current.scrollHeight
    }
  }, [])

  return (
    <div className="space-y-6">
      <style jsx>{scrollbarStyle}</style>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Các bước trong quy trình</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={scrollToBottom}>
            Cuộn xuống cuối
          </Button>
          <Button onClick={handleAddStep} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm bước
          </Button>
        </div>
      </div>

      {process.steps.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Chưa có bước nào trong quy trình này.
            </p>
            <Button onClick={handleAddStep} variant="outline" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm bước đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div ref={stepsContainerRef} className="space-y-4 custom-scrollbar">
          {process.steps.map((step, index) => (
            <div
              key={step.id}
              ref={step.id === lastAddedStepId ? lastStepRef : null}
              className={step.id === lastAddedStepId ? 'animate-pulse' : ''}
            >
              <Card
                className={expandedStepId === step.id ? 'border-primary' : ''}
              >
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{step.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center text-muted-foreground text-sm mr-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{step.estimatedDays} ngày</span>
                      </div>
                      <Badge variant="outline" className="mr-2">
                        {step.fields?.length || 0} trường dữ liệu
                      </Badge>
                      {step.isRequired && (
                        <Badge variant="secondary" className="mr-2">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Bắt buộc
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveStep(step.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveStep(step.id, 'down')}
                        disabled={index === process.steps.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditStep(step)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteStep(step)}
                        disabled={step.isRequired}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleExpandStep(step.id)}
                      >
                        {expandedStepId === step.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedStepId === step.id && (
                  <CardContent className="p-4 pt-4">
                    <div className="border-t mt-2 pt-4">
                      <div className="flex border-b mb-4">
                        <button
                          className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'info'
                              ? 'border-b-2 border-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                          onClick={() => setActiveTab('info')}
                        >
                          Thông tin cơ bản
                        </button>
                        <button
                          className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'fields'
                              ? 'border-b-2 border-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                          onClick={() => setActiveTab('fields')}
                        >
                          Trường dữ liệu ({step.fields?.length || 0})
                        </button>
                      </div>

                      {activeTab === 'info' && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Tên bước
                            </Label>
                            <div className="mt-1 text-sm">{step.name}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Mô tả</Label>
                            <div className="mt-1 text-sm">
                              {step.description}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Thời gian dự kiến
                            </Label>
                            <div className="mt-1 text-sm">
                              {step.estimatedDays} ngày
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleEditStep(step)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa thông tin
                            </Button>
                          </div>
                        </div>
                      )}

                      {activeTab === 'fields' && (
                        <div className="max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                          <StepFieldsManager
                            processId={process.id}
                            stepId={step.id}
                            fields={step.fields || []}
                            onFieldsUpdated={handleFieldsUpdated}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Dialog thêm/sửa bước */}
      <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? 'Chỉnh sửa bước' : 'Thêm bước mới'}
            </DialogTitle>
            <DialogDescription>
              {editingStep
                ? 'Chỉnh sửa thông tin của bước trong quy trình'
                : 'Nhập thông tin chi tiết về bước mới trong quy trình'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">
                Tên bước <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên bước"
                className={nameError ? 'border-red-500' : ''}
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Nhập mô tả chi tiết về bước này"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDays" className="text-right">
                Thời gian dự kiến (ngày)
              </Label>
              <Input
                id="estimatedDays"
                type="number"
                min="1"
                value={formData.estimatedDays}
                onChange={(e) =>
                  handleInputChange(
                    'estimatedDays',
                    Number.parseInt(e.target.value) || 1
                  )
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStepOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" onClick={handleSubmitStep}>
              {editingStep ? 'Cập nhật' : 'Thêm bước'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <AlertDialog
        open={!!stepToDelete}
        onOpenChange={(open) => !open && setStepToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Bước "{stepToDelete?.name}" sẽ bị xóa khỏi quy trình. Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStep}
              className="bg-destructive text-destructive-foreground"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
