"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStandardWorkflow } from "./standard-workflow-context-firebase"
import { useSubWorkflow, type SubWorkflow } from "./sub-workflow-context-firebase"
import { toast } from "@/components/ui/use-toast"
import { FolderSyncIcon as Sync, Plus, Edit, ArrowUpDown, Info } from "lucide-react"

interface SyncChange {
  type: "new_step" | "updated_step" | "new_field" | "updated_field" | "reorder_steps"
  stepId?: string
  fieldId?: string
  stepName?: string
  fieldName?: string
  oldValue?: any
  newValue?: any
  description: string
}

interface SubWorkflowSyncDialogProps {
  subWorkflow: SubWorkflow
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubWorkflowSyncDialog({ subWorkflow, open, onOpenChange }: SubWorkflowSyncDialogProps) {
  const { standardWorkflow } = useStandardWorkflow()
  const { updateSubWorkflow } = useSubWorkflow()
  const [changes, setChanges] = useState<SyncChange[]>([])
  const [selectedChanges, setSelectedChanges] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Phân tích sự khác biệt giữa standardWorkflow và subWorkflow
  useEffect(() => {
    if (!standardWorkflow || !open) return

    const detectedChanges: SyncChange[] = []

    // So sánh version
    if (standardWorkflow.version > subWorkflow.createdFromWorkflowVersion) {
      // Tạo map của các bước hiện tại trong subWorkflow
      const subWorkflowStepsMap = new Map(subWorkflow.workflowSteps.map((step) => [step.id, step]))

      // Kiểm tra các bước mới hoặc đã cập nhật
      standardWorkflow.steps.forEach((standardStep) => {
        const subStep = subWorkflowStepsMap.get(standardStep.id)

        if (!subStep) {
          // Bước mới trong standardWorkflow
          detectedChanges.push({
            type: "new_step",
            stepId: standardStep.id,
            stepName: standardStep.name,
            description: `Bước mới: "${standardStep.name}" - ${standardStep.description}`,
          })
        } else {
          // Kiểm tra thay đổi trong bước
          if (standardStep.name !== subStep.name) {
            detectedChanges.push({
              type: "updated_step",
              stepId: standardStep.id,
              stepName: standardStep.name,
              oldValue: subStep.name,
              newValue: standardStep.name,
              description: `Đổi tên bước: "${subStep.name}" → "${standardStep.name}"`,
            })
          }

          if (standardStep.description !== subStep.description) {
            detectedChanges.push({
              type: "updated_step",
              stepId: standardStep.id,
              stepName: standardStep.name,
              oldValue: subStep.description,
              newValue: standardStep.description,
              description: `Cập nhật mô tả bước "${standardStep.name}"`,
            })
          }

          if (standardStep.estimatedDays !== subStep.estimatedDays) {
            detectedChanges.push({
              type: "updated_step",
              stepId: standardStep.id,
              stepName: standardStep.name,
              oldValue: subStep.estimatedDays,
              newValue: standardStep.estimatedDays,
              description: `Thay đổi thời gian ước tính bước "${standardStep.name}": ${subStep.estimatedDays} → ${standardStep.estimatedDays} ngày`,
            })
          }

          // Kiểm tra thay đổi thứ tự
          if (standardStep.order !== subStep.order) {
            detectedChanges.push({
              type: "reorder_steps",
              stepId: standardStep.id,
              stepName: standardStep.name,
              oldValue: subStep.order,
              newValue: standardStep.order,
              description: `Thay đổi thứ tự bước "${standardStep.name}": vị trí ${subStep.order + 1} → ${standardStep.order + 1}`,
            })
          }

          // Kiểm tra các trường dữ liệu
          const subFieldsMap = new Map(subStep.fields.map((field) => [field.id, field]))

          standardStep.fields.forEach((standardField) => {
            const subField = subFieldsMap.get(standardField.id)

            if (!subField) {
              // Trường mới
              detectedChanges.push({
                type: "new_field",
                stepId: standardStep.id,
                fieldId: standardField.id,
                stepName: standardStep.name,
                fieldName: standardField.name,
                description: `Trường mới trong bước "${standardStep.name}": "${standardField.name}" (${standardField.type})`,
              })
            } else {
              // Kiểm tra thay đổi trong trường
              if (standardField.name !== subField.name) {
                detectedChanges.push({
                  type: "updated_field",
                  stepId: standardStep.id,
                  fieldId: standardField.id,
                  stepName: standardStep.name,
                  fieldName: standardField.name,
                  oldValue: subField.name,
                  newValue: standardField.name,
                  description: `Đổi tên trường trong bước "${standardStep.name}": "${subField.name}" → "${standardField.name}"`,
                })
              }

              if (standardField.type !== subField.type) {
                detectedChanges.push({
                  type: "updated_field",
                  stepId: standardStep.id,
                  fieldId: standardField.id,
                  stepName: standardStep.name,
                  fieldName: standardField.name,
                  oldValue: subField.type,
                  newValue: standardField.type,
                  description: `Thay đổi loại trường "${standardField.name}" trong bước "${standardStep.name}": ${subField.type} → ${standardField.type}`,
                })
              }

              if (standardField.required !== subField.required) {
                detectedChanges.push({
                  type: "updated_field",
                  stepId: standardStep.id,
                  fieldId: standardField.id,
                  stepName: standardStep.name,
                  fieldName: standardField.name,
                  oldValue: subField.required,
                  newValue: standardField.required,
                  description: `Thay đổi tính bắt buộc của trường "${standardField.name}": ${subField.required ? "Bắt buộc" : "Không bắt buộc"} → ${standardField.required ? "Bắt buộc" : "Không bắt buộc"}`,
                })
              }
            }
          })
        }
      })
    }

    setChanges(detectedChanges)
    setSelectedChanges([]) // Reset selection
  }, [standardWorkflow, subWorkflow, open])

  const handleSelectChange = (changeIndex: number, checked: boolean) => {
    const changeId = `${changes[changeIndex].type}_${changes[changeIndex].stepId}_${changes[changeIndex].fieldId || ""}`

    if (checked) {
      setSelectedChanges((prev) => [...prev, changeId])
    } else {
      setSelectedChanges((prev) => prev.filter((id) => id !== changeId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allChangeIds = changes.map((change, index) => `${change.type}_${change.stepId}_${change.fieldId || ""}`)
      setSelectedChanges(allChangeIds)
    } else {
      setSelectedChanges([])
    }
  }

  const handleSync = async () => {
    if (!standardWorkflow || selectedChanges.length === 0) return

    setIsSyncing(true)
    try {
      // Tạo bản sao của workflowSteps hiện tại
      const updatedSteps = [...subWorkflow.workflowSteps]

      // Áp dụng các thay đổi được chọn
      selectedChanges.forEach((changeId) => {
        const changeIndex = changes.findIndex(
          (change, index) => `${change.type}_${change.stepId}_${change.fieldId || ""}` === changeId,
        )

        if (changeIndex === -1) return

        const change = changes[changeIndex]
        const standardStep = standardWorkflow.steps.find((s) => s.id === change.stepId)
        if (!standardStep) return

        switch (change.type) {
          case "new_step":
            // Thêm bước mới (mặc định không hiển thị)
            updatedSteps.push({
              ...standardStep,
              fields: standardStep.fields.map((field) => ({ ...field })),
              isVisible: false,
            })
            break

          case "updated_step":
            // Cập nhật thông tin bước
            const stepIndex = updatedSteps.findIndex((s) => s.id === change.stepId)
            if (stepIndex !== -1) {
              updatedSteps[stepIndex] = {
                ...updatedSteps[stepIndex],
                name: standardStep.name,
                description: standardStep.description,
                estimatedDays: standardStep.estimatedDays,
                estimatedHours: standardStep.estimatedHours,
                timeUnit: standardStep.timeUnit,
                order: standardStep.order,
                assigneeRole: standardStep.assigneeRole,
                hasCost: standardStep.hasCost,
                notifyBeforeDeadline: standardStep.notifyBeforeDeadline,
              }
            }
            break

          case "new_field":
            // Thêm trường mới vào bước
            const stepForNewField = updatedSteps.find((s) => s.id === change.stepId)
            const standardField = standardStep.fields.find((f) => f.id === change.fieldId)
            if (stepForNewField && standardField) {
              stepForNewField.fields.push({ ...standardField })
            }
            break

          case "updated_field":
            // Cập nhật trường hiện có
            const stepForUpdatedField = updatedSteps.find((s) => s.id === change.stepId)
            const updatedStandardField = standardStep.fields.find((f) => f.id === change.fieldId)
            if (stepForUpdatedField && updatedStandardField) {
              const fieldIndex = stepForUpdatedField.fields.findIndex((f) => f.id === change.fieldId)
              if (fieldIndex !== -1) {
                stepForUpdatedField.fields[fieldIndex] = { ...updatedStandardField }
              }
            }
            break

          case "reorder_steps":
            // Cập nhật thứ tự bước
            const stepForReorder = updatedSteps.find((s) => s.id === change.stepId)
            if (stepForReorder) {
              stepForReorder.order = standardStep.order
            }
            break
        }
      })

      // Sắp xếp lại các bước theo thứ tự mới
      updatedSteps.sort((a, b) => a.order - b.order)

      // Cập nhật subWorkflow
      await updateSubWorkflow(subWorkflow.id, {
        workflowSteps: updatedSteps,
        parentWorkflowVersion: standardWorkflow.version,
      })

      toast({
        title: "Đồng bộ thành công",
        description: `Đã áp dụng ${selectedChanges.length} thay đổi từ quy trình chuẩn.`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error syncing sub-workflow:", error)
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể đồng bộ quy trình con. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "new_step":
      case "new_field":
        return <Plus className="h-4 w-4 text-green-500" />
      case "updated_step":
      case "updated_field":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "reorder_steps":
        return <ArrowUpDown className="h-4 w-4 text-orange-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case "new_step":
      case "new_field":
        return "bg-green-50 border-green-200"
      case "updated_step":
      case "updated_field":
        return "bg-blue-50 border-blue-200"
      case "reorder_steps":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sync className="h-5 w-5" />
            Đồng bộ quy trình con
          </DialogTitle>
          <DialogDescription>
            So sánh và đồng bộ các thay đổi từ quy trình chuẩn (v{standardWorkflow?.version}) vào quy trình con "
            {subWorkflow.name}" (được tạo từ v{subWorkflow.createdFromWorkflowVersion})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {changes.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Quy trình con đã được cập nhật. Không có thay đổi nào từ quy trình chuẩn.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox checked={selectedChanges.length === changes.length} onCheckedChange={handleSelectAll} />
                  <span className="text-sm font-medium">Chọn tất cả ({changes.length} thay đổi)</span>
                </div>
                <Badge variant="outline">{selectedChanges.length} đã chọn</Badge>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {changes.map((change, index) => {
                    const changeId = `${change.type}_${change.stepId}_${change.fieldId || ""}`
                    const isSelected = selectedChanges.includes(changeId)

                    return (
                      <Card
                        key={index}
                        className={`${getChangeColor(change.type)} ${isSelected ? "ring-2 ring-primary" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectChange(index, !!checked)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getChangeIcon(change.type)}
                                <Badge variant="outline" className="text-xs">
                                  {change.type === "new_step" && "Bước mới"}
                                  {change.type === "updated_step" && "Cập nhật bước"}
                                  {change.type === "new_field" && "Trường mới"}
                                  {change.type === "updated_field" && "Cập nhật trường"}
                                  {change.type === "reorder_steps" && "Thay đổi thứ tự"}
                                </Badge>
                                {change.stepName && (
                                  <Badge variant="secondary" className="text-xs">
                                    {change.stepName}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{change.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSync} disabled={selectedChanges.length === 0 || isSyncing}>
            {isSyncing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Đang đồng bộ...
              </>
            ) : (
              <>
                <Sync className="h-4 w-4 mr-2" />
                Đồng bộ ({selectedChanges.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
