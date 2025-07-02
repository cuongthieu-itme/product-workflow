"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useWorkflowProcess, type WorkflowProcess } from "./workflow-process-context"
import { PlusCircle, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { AddWorkflowProcessForm } from "./add-workflow-process-form"
import { WorkflowStepsList } from "./workflow-steps-list"
import { ScrollArea } from "@/components/ui/scroll-area"

export function WorkflowProcessList() {
  const { toast } = useToast()
  const { workflowProcesses, deleteWorkflowProcess } = useWorkflowProcess()
  const [isAddProcessOpen, setIsAddProcessOpen] = useState(false)
  const [editingProcess, setEditingProcess] = useState<WorkflowProcess | null>(null)
  const [processToDelete, setProcessToDelete] = useState<WorkflowProcess | null>(null)
  const [expandedProcessId, setExpandedProcessId] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<WorkflowProcess | null>(null)
  const [isStepsDialogOpen, setIsStepsDialogOpen] = useState(false)

  const handleAddProcess = useCallback(() => {
    setEditingProcess(null)
    setIsAddProcessOpen(true)
  }, [])

  const handleEditProcess = useCallback((process: WorkflowProcess) => {
    setEditingProcess(process)
    setIsAddProcessOpen(true)
  }, [])

  const handleDeleteProcess = useCallback((process: WorkflowProcess) => {
    setProcessToDelete(process)
  }, [])

  const confirmDeleteProcess = useCallback(() => {
    if (processToDelete) {
      deleteWorkflowProcess(processToDelete.id)
      toast({
        title: "Xóa thành công",
        description: `Quy trình "${processToDelete.name}" đã được xóa.`,
        variant: "success",
      })
      setProcessToDelete(null)
    }
  }, [processToDelete, deleteWorkflowProcess, toast])

  const toggleExpandProcess = useCallback((processId: string) => {
    setExpandedProcessId((prev) => (prev === processId ? null : processId))
  }, [])

  const handleViewSteps = useCallback((process: WorkflowProcess) => {
    setSelectedProcess(process)
    setIsStepsDialogOpen(true)
  }, [])

  const handleProcessUpdated = useCallback(() => {
    // Cập nhật lại UI khi có thay đổi về quy trình
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Danh sách quy trình làm việc</h3>
        <Button onClick={handleAddProcess} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm quy trình
        </Button>
      </div>

      {workflowProcesses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Chưa có quy trình làm việc nào.</p>
            <Button onClick={handleAddProcess} variant="outline" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm quy trình đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workflowProcesses.map((process) => (
            <Card key={process.id} className={expandedProcessId === process.id ? "border-primary" : ""}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{process.name}</CardTitle>
                    <CardDescription className="text-sm">{process.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="mr-2">
                      {process.steps?.length || 0} bước
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewSteps(process)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditProcess(process)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteProcess(process)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleExpandProcess(process.id)}
                    >
                      {expandedProcessId === process.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedProcessId === process.id && (
                <CardContent className="p-4 pt-0">
                  <div className="border-t mt-2 pt-4">
                    <WorkflowStepsList process={process} onStepsUpdated={handleProcessUpdated} />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Dialog thêm/sửa quy trình */}
      <AddWorkflowProcessForm
        isOpen={isAddProcessOpen}
        onClose={() => setIsAddProcessOpen(false)}
        onProcessAdded={handleProcessUpdated}
        editingProcess={editingProcess}
      />

      {/* Dialog xem chi tiết các bước */}
      <Dialog open={isStepsDialogOpen} onOpenChange={setIsStepsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Các bước trong quy trình</DialogTitle>
            <DialogDescription>
              Quy trình: {selectedProcess?.name} - Áp dụng cho trạng thái: {selectedProcess?.statusName}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-grow overflow-auto">
            <div className="p-6 pt-2">
              {selectedProcess && <WorkflowStepsList process={selectedProcess} onStepsUpdated={handleProcessUpdated} />}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={!!processToDelete} onOpenChange={(open) => !open && setProcessToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Quy trình "{processToDelete?.name}" và tất cả các bước trong quy trình sẽ bị xóa. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProcess} className="bg-destructive text-destructive-foreground">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
