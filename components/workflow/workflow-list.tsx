"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSubWorkflow } from "./sub-workflow-context-firebase"
import { useProductStatus } from "../product-status/product-status-context"
import { AddWorkflowForm } from "./add-workflow-form"
import { PlusCircle, Edit, Trash2, ChevronRight, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowStepsList } from "./workflow-steps-list"

export function WorkflowList() {
  const { toast } = useToast()
  const { subWorkflows, deleteSubWorkflow, loading } = useSubWorkflow() // Thay thế useWorkflow bằng useSubWorkflow
  const { productStatuses } = useProductStatus()
  const [isAddWorkflowOpen, setIsAddWorkflowOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState(null)
  const [workflowToDelete, setWorkflowToDelete] = useState(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [activeTab, setActiveTab] = useState("list")

  const handleAddWorkflow = useCallback(() => {
    setEditingWorkflow(null)
    setIsAddWorkflowOpen(true)
  }, [])

  const handleEditWorkflow = useCallback((workflow) => {
    setEditingWorkflow(workflow)
    setIsAddWorkflowOpen(true)
  }, [])

  const handleDeleteWorkflow = useCallback((workflow) => {
    setWorkflowToDelete(workflow)
  }, [])

  const confirmDeleteWorkflow = useCallback(() => {
    if (workflowToDelete) {
      deleteSubWorkflow(workflowToDelete.id) // Thay thế deleteWorkflow bằng deleteSubWorkflow
      toast({
        title: "Xóa thành công",
        description: `Quy trình "${workflowToDelete.name}" đã được xóa.`,
        variant: "success",
      })

      // Nếu đang xem quy trình bị xóa, đóng tab chi tiết
      if (selectedWorkflow && selectedWorkflow.id === workflowToDelete.id) {
        setSelectedWorkflow(null)
        setActiveTab("list")
      }

      setWorkflowToDelete(null)
    }
  }, [workflowToDelete, deleteSubWorkflow, toast, selectedWorkflow])

  const handleSelectWorkflow = useCallback((workflow) => {
    setSelectedWorkflow(workflow)
    setActiveTab("detail")
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedWorkflow(null)
    setActiveTab("list")
  }, [])

  const handleWorkflowAdded = useCallback(() => {
    // Nếu đang thêm mới, không làm gì
    // Nếu đang sửa và đang xem chi tiết quy trình đó, cập nhật lại selectedWorkflow
    if (editingWorkflow && selectedWorkflow && selectedWorkflow.id === editingWorkflow.id) {
      const updatedWorkflow = subWorkflows.find((w) => w.id === editingWorkflow.id) // Thay thế workflows bằng subWorkflows
      if (updatedWorkflow) {
        setSelectedWorkflow(updatedWorkflow)
      }
    }
    setIsAddWorkflowOpen(false)
  }, [editingWorkflow, selectedWorkflow, subWorkflows]) // Thay thế workflows bằng subWorkflows

  // Hàm lấy tên trạng thái từ ID
  const getStatusName = useCallback(
    (statusId) => {
      const status = productStatuses.find((s) => s.id === statusId)
      return status ? status.name : "Không xác định"
    },
    [productStatuses],
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Danh sách quy trình làm việc</h2>
        <Button onClick={handleAddWorkflow}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm quy trình mới
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Danh sách quy trình</TabsTrigger>
          {selectedWorkflow && (
            <TabsTrigger value="detail">
              Chi tiết: {selectedWorkflow.name}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCloseDetail()
                }}
              >
                &times;
              </Button>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {subWorkflows.length === 0 ? ( // Thay thế workflows bằng subWorkflows
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Chưa có quy trình làm việc nào được tạo.</p>
                <Button onClick={handleAddWorkflow} variant="outline" className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo quy trình đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subWorkflows.map(
                (
                  workflow, // Thay thế workflows bằng subWorkflows
                ) => (
                  <Card key={workflow.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold">{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description || "Không có mô tả"}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">Trạng thái:</span>
                          <Badge variant="outline" className="bg-primary/10">
                            {getStatusName(workflow.statusId)}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {workflow.visibleSteps?.length || 0} bước
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditWorkflow(workflow)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteWorkflow(workflow)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => handleSelectWorkflow(workflow)}
                      >
                        Chi tiết
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ),
              )}
            </div>
          )}
        </TabsContent>

        {selectedWorkflow && (
          <TabsContent value="detail">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{selectedWorkflow.name}</CardTitle>
                    <CardDescription>{selectedWorkflow.description || "Không có mô tả"}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditWorkflow(selectedWorkflow)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa quy trình
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <WorkflowStepsList workflow={selectedWorkflow} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Form thêm/sửa quy trình */}
      <AddWorkflowForm
        isOpen={isAddWorkflowOpen}
        onClose={() => setIsAddWorkflowOpen(false)}
        editingWorkflow={editingWorkflow}
        onWorkflowAdded={handleWorkflowAdded}
      />

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Quy trình "{workflowToDelete?.name}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWorkflow} className="bg-destructive text-destructive-foreground">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
