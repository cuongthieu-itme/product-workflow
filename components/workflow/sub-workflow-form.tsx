"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useStandardWorkflow } from "./standard-workflow-context-firebase"
import { useSubWorkflow, type SubWorkflow } from "./sub-workflow-context-firebase"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Schema validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Tên quy trình phải có ít nhất 2 ký tự",
  }),
  description: z.string().optional(),
  statusId: z.string().min(1, {
    message: "Vui lòng chọn trạng thái sản phẩm",
  }),
  visibleSteps: z.array(z.string()).min(1, {
    message: "Vui lòng chọn ít nhất một bước",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface SubWorkflowFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (workflow: SubWorkflow) => void
  initialData?: Partial<SubWorkflow>
}

export function SubWorkflowForm({ open, onOpenChange, onSuccess, initialData }: SubWorkflowFormProps) {
  const { toast } = useToast()
  const { standardWorkflow, loading: loadingStandard } = useStandardWorkflow()
  const { addSubWorkflow, updateSubWorkflow, loading: loadingSubWorkflow } = useSubWorkflow()
  const [productStatuses, setProductStatuses] = useState<{ id: string; name: string; color: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Khởi tạo form với giá trị mặc định
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      statusId: initialData?.statusId || "",
      visibleSteps: initialData?.visibleSteps || [],
    },
  })

  // Lấy danh sách trạng thái sản phẩm
  useEffect(() => {
    // Mock data cho trạng thái sản phẩm
    const mockStatuses = [
      { id: "status1", name: "Mới", color: "#4f46e5" },
      { id: "status2", name: "Đang phát triển", color: "#f59e0b" },
      { id: "status3", name: "Hoàn thành", color: "#10b981" },
    ]
    setProductStatuses(mockStatuses)
  }, [])

  // Xử lý submit form
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)

      if (initialData?.id) {
        // Cập nhật quy trình con
        await updateSubWorkflow(initialData.id, values)
        toast({
          title: "Thành công",
          description: "Đã cập nhật quy trình con",
        })
      } else {
        // Tạo quy trình con mới
        const newSubWorkflow = await addSubWorkflow(values)
        if (onSuccess) {
          onSuccess(newSubWorkflow)
        }
        toast({
          title: "Thành công",
          description: "Đã tạo quy trình con mới",
        })
      }

      // Đóng form
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi lưu quy trình con",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Lấy danh sách các bước đã chọn
  const selectedStepIds = form.watch("visibleSteps")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Cập nhật quy trình con" : "Tạo quy trình con mới"}</DialogTitle>
          <DialogDescription>
            Quy trình con được tạo dựa trên quy trình chuẩn, cho phép bạn tùy chỉnh các bước hiển thị cho từng trạng
            thái sản phẩm.
          </DialogDescription>
        </DialogHeader>

        {loadingStandard ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Đang tải quy trình chuẩn...</span>
          </div>
        ) : !standardWorkflow || !standardWorkflow.steps || standardWorkflow.steps.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 my-4">
            <h3 className="text-yellow-800 font-medium">Quy trình chuẩn chưa được thiết lập</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Vui lòng thiết lập quy trình chuẩn trước khi tạo quy trình con.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên quy trình con</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên quy trình con" {...field} />
                    </FormControl>
                    <FormDescription>Tên ngắn gọn mô tả quy trình con này.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả chi tiết về quy trình con này" {...field} />
                    </FormControl>
                    <FormDescription>Mô tả chi tiết giúp người dùng hiểu rõ hơn về quy trình.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái sản phẩm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái sản phẩm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productStatuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: status.color }}
                              ></div>
                              {status.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Quy trình con này sẽ được áp dụng cho trạng thái sản phẩm đã chọn.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibleSteps"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Các bước trong quy trình</FormLabel>
                      <FormDescription>
                        Chọn các bước từ quy trình chuẩn sẽ được hiển thị trong quy trình con này.
                      </FormDescription>
                    </div>

                    <div className="space-y-4">
                      {standardWorkflow?.steps?.map((step) => {
                        // Kiểm tra xem bước này đã được chọn chưa
                        const isSelected = selectedStepIds.includes(step.id)

                        return (
                          <Card key={step.id} className={isSelected ? "border-primary" : ""}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FormField
                                    control={form.control}
                                    name="visibleSteps"
                                    render={({ field }) => {
                                      return (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(step.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, step.id])
                                                  : field.onChange(field.value?.filter((value) => value !== step.id))
                                              }}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <CardTitle className="text-base font-medium">{step.name}</CardTitle>
                                          </div>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  {step.isRequired && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      Bắt buộc
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {step.estimatedDays || 0} ngày
                                  </Badge>
                                  {step.fields && step.fields.length > 0 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge
                                            variant="outline"
                                            className="bg-green-50 text-green-700 border-green-200"
                                          >
                                            {step.fields.length} trường
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="p-2">
                                            <h4 className="font-medium mb-1">Các trường dữ liệu:</h4>
                                            <ul className="text-xs space-y-1">
                                              {step.fields.map((field) => (
                                                <li key={field.id}>
                                                  • {field.name} ({field.type})
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            {step.description && (
                              <CardContent className="pt-0 pb-2">
                                <CardDescription>{step.description}</CardDescription>
                              </CardContent>
                            )}
                          </Card>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting || loadingSubWorkflow}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {initialData?.id ? "Cập nhật" : "Tạo quy trình con"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
