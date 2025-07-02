"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useStandardWorkflow } from "@/components/workflow/standard-workflow-context-firebase"
import { useProductStatus } from "@/components/product-status/product-status-context-firebase"
import { useSubWorkflow } from "@/components/workflow/sub-workflow-context-firebase"
import { CheckCircle, Clock, Info, AlertCircle, FileText, Workflow, LinkIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ProductStatusDetailProps {
  statusId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductStatusDetail({ statusId, open, onOpenChange }: ProductStatusDetailProps) {
  const { standardWorkflow, loading: workflowLoading } = useStandardWorkflow()
  const { subWorkflows, getSubWorkflowById, loading: subWorkflowLoading } = useSubWorkflow()
  const { productStatuses, assignWorkflowToStatus, getStandardWorkflowId } = useProductStatus()
  const [status, setStatus] = useState<any>(null)
  const [subWorkflow, setSubWorkflow] = useState<any>(null)
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("info")
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("")
  const [isAssigningWorkflow, setIsAssigningWorkflow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<number>(0)

  // Lọc danh sách quy trình con có sẵn (chưa được gán cho trạng thái nào khác)
  const availableSubWorkflows = useMemo(() => {
    if (!productStatuses || !subWorkflows) return []

    // Lấy danh sách ID của các quy trình con đã được gán cho các trạng thái khác
    const assignedWorkflowIds = productStatuses
      .filter((s) => s.id !== statusId && s.workflowId && s.workflowId !== getStandardWorkflowId())
      .map((s) => s.workflowId)

    // Lọc ra các quy trình con chưa được gán hoặc đã được gán cho trạng thái hiện tại
    return subWorkflows.filter((workflow) => {
      // Nếu quy trình đã được gán cho trạng thái hiện tại, vẫn hiển thị
      if (status?.workflowId === workflow.id) {
        return true
      }
      // Nếu quy trình chưa được gán cho trạng thái nào khác, hiển thị
      return !assignedWorkflowIds.includes(workflow.id)
    })
  }, [productStatuses, subWorkflows, statusId, status, getStandardWorkflowId])

  useEffect(() => {
    if (statusId && productStatuses) {
      const foundStatus = productStatuses.find((s) => s.id === statusId)
      setStatus(foundStatus)

      if (foundStatus?.workflowId) {
        setSelectedWorkflowId(foundStatus.workflowId)

        // Kiểm tra xem workflowId có phải là quy trình chuẩn không
        if (foundStatus.workflowId !== getStandardWorkflowId()) {
          // Nếu không phải quy trình chuẩn, tìm quy trình con tương ứng
          loadSubWorkflow(foundStatus.workflowId)
        } else {
          setSubWorkflow(null)
          // Nếu là quy trình chuẩn, hiển thị tất cả các bước từ quy trình chuẩn
          if (standardWorkflow) {
            setWorkflowSteps(standardWorkflow.steps.sort((a, b) => a.order - b.order))
            // Giả lập 3 bước đã hoàn thành
            setCompletedSteps(3)
          }
        }
      } else {
        setSelectedWorkflowId(getStandardWorkflowId())
        setSubWorkflow(null)
        if (standardWorkflow) {
          setWorkflowSteps(standardWorkflow.steps.sort((a, b) => a.order - b.order))
          // Giả lập 3 bước đã hoàn thành
          setCompletedSteps(3)
        }
      }
    }
  }, [statusId, productStatuses, standardWorkflow, getStandardWorkflowId])

  // Hàm tải quy trình con theo ID
  const loadSubWorkflow = async (workflowId: string) => {
    try {
      setError(null)
      const foundSubWorkflow = await getSubWorkflowById(workflowId)

      if (foundSubWorkflow) {
        setSubWorkflow(foundSubWorkflow)

        // Nếu có quy trình con, lấy các bước từ quy trình chuẩn dựa trên visibleSteps
        if (standardWorkflow) {
          const steps = foundSubWorkflow.visibleSteps
            .map((stepId: string) => {
              const step = standardWorkflow.steps.find((s) => s.id === stepId)
              return step
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.order - b.order)

          setWorkflowSteps(steps)

          // Giả lập số bước đã hoàn thành (ví dụ: 1/3 bước)
          setCompletedSteps(Math.min(1, steps.length))
        }
      } else {
        setError(`Không tìm thấy quy trình con với ID: ${workflowId}`)
        setSubWorkflow(null)
        // Fallback về quy trình chuẩn
        setSelectedWorkflowId(getStandardWorkflowId())
        if (standardWorkflow) {
          setWorkflowSteps(standardWorkflow.steps.sort((a, b) => a.order - b.order))
          setCompletedSteps(3)
        }
      }
    } catch (err) {
      console.error("Error loading sub-workflow:", err)
      setError("Đã xảy ra lỗi khi tải thông tin quy trình con")
      setSubWorkflow(null)
    }
  }

  // Cập nhật hàm handleAssignWorkflow để hiển thị thông tin mới sau khi gán
  const handleAssignWorkflow = async () => {
    if (!status || !selectedWorkflowId) return

    setIsAssigningWorkflow(true)
    setError(null)

    try {
      await assignWorkflowToStatus(status.id, selectedWorkflowId)

      // Cập nhật lại subWorkflow sau khi gán
      if (selectedWorkflowId === getStandardWorkflowId()) {
        setSubWorkflow(null)
        // Nếu chọn quy trình chuẩn, hiển thị tất cả các bước từ quy trình chuẩn
        if (standardWorkflow) {
          setWorkflowSteps(standardWorkflow.steps.sort((a, b) => a.order - b.order))
          setCompletedSteps(3)
        }
      } else {
        // Nếu chọn quy trình con, tải quy trình con và cập nhật các bước
        await loadSubWorkflow(selectedWorkflowId)
      }

      // Cập nhật status với workflowId mới
      setStatus({
        ...status,
        workflowId: selectedWorkflowId,
      })
    } catch (error: any) {
      console.error("Error assigning workflow:", error)
      setError(error.message || "Đã xảy ra lỗi khi gán quy trình")
    } finally {
      setIsAssigningWorkflow(false)
    }
  }

  if (!open) return null

  const loading = workflowLoading || subWorkflowLoading

  // Tính toán tiến độ quy trình
  const progressPercentage = workflowSteps.length > 0 ? (completedSteps / workflowSteps.length) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status?.name || "Chi tiết trạng thái"}
            {status?.color && (
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }} aria-hidden="true"></div>
            )}
          </DialogTitle>
          <DialogDescription>
            {status?.description || "Thông tin chi tiết về trạng thái sản phẩm và quy trình liên quan"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="info"
          className="flex-1 overflow-hidden flex flex-col"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              Thông tin cơ bản
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-1">
              <Workflow className="h-4 w-4" />
              Quy trình
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-4">
            <TabsContent value="info" className="h-full overflow-auto">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4 p-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Thông tin trạng thái</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {status ? (
                        <>
                          <div className="grid grid-cols-[100px_1fr] gap-2">
                            <div className="font-medium">Tên:</div>
                            <div>{status.name}</div>
                          </div>
                          <div className="grid grid-cols-[100px_1fr] gap-2">
                            <div className="font-medium">Mô tả:</div>
                            <div>{status.description || "Không có mô tả"}</div>
                          </div>
                          <div className="grid grid-cols-[100px_1fr] gap-2">
                            <div className="font-medium">Màu sắc:</div>
                            <div className="flex items-center gap-2">
                              {status.color ? (
                                <>
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }}></div>
                                  <span>{status.color}</span>
                                </>
                              ) : (
                                "Không có màu"
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-[100px_1fr] gap-2">
                            <div className="font-medium">Mặc định:</div>
                            <div>{status.isDefault ? "Có" : "Không"}</div>
                          </div>
                          <div className="grid grid-cols-[100px_1fr] gap-2">
                            <div className="font-medium">Quy trình:</div>
                            <div className="flex items-center gap-2">
                              {status.workflowId === getStandardWorkflowId() ? (
                                <span>Quy trình chuẩn</span>
                              ) : subWorkflow ? (
                                <span>Quy trình tùy chỉnh: {subWorkflow.name}</span>
                              ) : (
                                <span>Quy trình tùy chỉnh (ID: {status.workflowId})</span>
                              )}
                              <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Không tìm thấy thông tin trạng thái
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Thống kê sử dụng</CardTitle>
                      <CardDescription>Thông tin về việc sử dụng trạng thái này</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-[1fr_1fr] gap-4">
                        <div className="border rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold">12</div>
                          <div className="text-sm text-muted-foreground">Sản phẩm đang sử dụng</div>
                        </div>
                        <div className="border rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold">5</div>
                          <div className="text-sm text-muted-foreground">Yêu cầu đang xử lý</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="workflow" className="h-full overflow-auto">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4 p-1">
                  {loading ? (
                    <Card>
                      <CardContent className="py-6">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                          <div className="mt-2">Đang tải thông tin quy trình...</div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {error && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Lỗi</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Quy trình được gán</CardTitle>
                            <Badge variant={status?.workflowId !== getStandardWorkflowId() ? "default" : "outline"}>
                              {status?.workflowId !== getStandardWorkflowId() ? "Tùy chỉnh" : "Mặc định"}
                            </Badge>
                          </div>
                          <CardDescription>Chọn quy trình áp dụng cho trạng thái này</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Select
                                value={selectedWorkflowId}
                                onValueChange={setSelectedWorkflowId}
                                disabled={isAssigningWorkflow}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn quy trình" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={getStandardWorkflowId()}>Quy trình chuẩn</SelectItem>
                                  {availableSubWorkflows.map((workflow) => (
                                    <SelectItem key={workflow.id} value={workflow.id}>
                                      {workflow.name}
                                      {status?.workflowId === workflow.id && " (đang sử dụng)"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={handleAssignWorkflow}
                              disabled={isAssigningWorkflow || selectedWorkflowId === status?.workflowId}
                            >
                              {isAssigningWorkflow ? (
                                <>
                                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                  Đang gán...
                                </>
                              ) : (
                                "Gán quy trình"
                              )}
                            </Button>
                          </div>

                          {availableSubWorkflows.length === 0 && subWorkflows.length > 0 && (
                            <Alert className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Lưu ý</AlertTitle>
                              <AlertDescription>
                                Tất cả các quy trình con đã được gán cho các trạng thái khác. Bạn có thể sử dụng quy
                                trình chuẩn hoặc tạo quy trình con mới.
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">Tiến độ quy trình</div>
                              <div className="text-sm text-muted-foreground">
                                {completedSteps}/{workflowSteps.length} bước
                              </div>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Thông tin quy trình</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  Thời gian ước tính:{" "}
                                  <strong>
                                    {workflowSteps.reduce((acc, step) => acc + (step.estimatedDays || 0), 0)} ngày
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  Số bước: <strong>{workflowSteps.length}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Các bước trong quy trình</CardTitle>
                          <CardDescription>
                            {subWorkflow
                              ? `Danh sách các bước được chọn cho quy trình "${subWorkflow.name}"`
                              : "Tất cả các bước trong quy trình chuẩn"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {workflowSteps.length > 0 ? (
                              workflowSteps.map((step, index) => {
                                // Giả lập trạng thái hoàn thành cho một số bước
                                const isCompleted = index < completedSteps

                                return (
                                  <div key={step.id} className="relative pl-8 pb-4">
                                    {/* Đường kẻ dọc kết nối các bước */}
                                    {index < workflowSteps.length - 1 && (
                                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-muted-foreground/20"></div>
                                    )}

                                    {/* Biểu tượng trạng thái */}
                                    <div className="absolute left-0 top-0">
                                      {isCompleted ? (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                      ) : (
                                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/40 flex items-center justify-center">
                                          <span className="text-xs font-medium">{index + 1}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Nội dung bước */}
                                    <div className={`border rounded-lg p-3 ${isCompleted ? "bg-muted/30" : ""}`}>
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium">{step.name}</h4>
                                        <Badge variant={isCompleted ? "success" : "outline"}>
                                          {isCompleted ? "Hoàn thành" : "Chưa hoàn thành"}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{step.description}</p>

                                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{step.estimatedDays || 1} ngày</span>
                                        </div>
                                        {step.assigneeRole && (
                                          <div className="flex items-center gap-1">
                                            <span>Vai trò: {step.assigneeRole}</span>
                                          </div>
                                        )}
                                        {step.hasCost && (
                                          <div className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>Có chi phí</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                Không có bước nào trong quy trình
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
