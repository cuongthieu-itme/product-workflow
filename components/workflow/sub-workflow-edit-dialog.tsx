'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useSubWorkflow } from './sub-workflow-context-firebase'
import { Loader2, Save, X } from 'lucide-react'

// Schema validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Tên quy trình phải có ít nhất 2 ký tự'
  }),
  description: z.string().optional(),
  isActive: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

interface SubWorkflowEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow: any
  onSuccess?: () => void
}

export function SubWorkflowEditDialog({
  open,
  onOpenChange,
  workflow,
  onSuccess
}: SubWorkflowEditDialogProps) {
  const { toast } = useToast()
  const { updateSubWorkflow } = useSubWorkflow()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true
    }
  })

  // Reset form when workflow changes
  useEffect(() => {
    if (workflow) {
      form.reset({
        name: workflow.name || '',
        description: workflow.description || '',
        isActive: workflow.isActive !== false // Default to true if not specified
      })
    }
  }, [workflow, form])

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)

      // Update the sub-workflow
      await updateSubWorkflow(workflow.id, {
        name: values.name,
        description: values.description || '',
        isActive: values.isActive
      })

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật quy trình con'
      })

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description:
          error.message || 'Đã xảy ra lỗi khi cập nhật quy trình con',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!workflow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa quy trình con</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cơ bản của quy trình con.
          </DialogDescription>
        </DialogHeader>

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
                  <FormDescription>
                    Tên ngắn gọn mô tả quy trình con này.
                  </FormDescription>
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
                    <Textarea
                      placeholder="Mô tả chi tiết về quy trình con này"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả chi tiết giúp người dùng hiểu rõ hơn về quy trình.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Trạng thái hoạt động
                    </FormLabel>
                    <FormDescription>
                      Khi tắt, quy trình con này sẽ không hiển thị trong danh
                      sách lựa chọn khi tạo yêu cầu mới.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
