"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { useSubWorkflow } from "./sub-workflow-context-firebase"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, AlertTriangle, ArrowRight } from "lucide-react"

interface SubWorkflowDeleteDialogProps {
  subWorkflow: {
    id: string
    name: string
    statusName: string
  }
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function SubWorkflowDeleteDialog({ subWorkflow, trigger, onSuccess }: SubWorkflowDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"check" | "confirm" | "migrate">("check")
  const [requestsInUse, setRequestsInUse] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { deleteSubWorkflow, checkRequestsUsingSubWorkflow, migrateRequestsToStandardWorkflow } = useSubWorkflow()
  const { toast } = useToast()

  const handleOpenDialog = async () => {
    setOpen(true)
    setIsLoading(true)
    setStep("check")

    try {
      // Kiểm tra xem có request nào đang sử dụng không
      const { count, requests } = await checkRequestsUsingSubWorkflow(subWorkflow.id)

      if (count > 0) {
        setRequestsInUse(requests)
        setStep("migrate")
      } else {
        setStep("confirm")
      }
    } catch (error) {
      console.error("Error checking requests:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra yêu cầu đang sử dụng quy trình này.",
        variant: "destructive",
      })
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectDelete = async () => {
    setIsLoading(true)
    try {
      await deleteSubWorkflow(subWorkflow.id, false)
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error deleting sub-workflow:", error)
      // Lỗi đã được xử lý trong deleteSubWorkflow
    } finally {
      setIsLoading(false)
    }
  }

  const handleMigrateAndDelete = async () => {
    setIsLoading(true)
    try {
      // Chuyển tất cả request về standard workflow
      await migrateRequestsToStandardWorkflow(subWorkflow.id)

      // Sau đó xóa subWorkflow
      await deleteSubWorkflow(subWorkflow.id, true)

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error migrating and deleting:", error)
      // Lỗi đã được xử lý trong các hàm con
    } finally {
      setIsLoading(false)
    }
  }

  const handleMigrateOnly = async () => {
    setIsLoading(true)
    try {
      await migrateRequestsToStandardWorkflow(subWorkflow.id)
      setStep("confirm")
    } catch (error) {
      console.error("Error migrating requests:", error)
      // Lỗi đã được xử lý trong migrateRequestsToStandardWorkflow
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div onClick={handleOpenDialog}>
        {trigger || (
          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {step === "migrate" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {step === "migrate" ? "Có yêu cầu đang sử dụng" : "Xác nhận xóa quy trình con"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {isLoading && step === "check" && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Đang kiểm tra yêu cầu...</p>
                </div>
              )}

              {step === "confirm" && (
                <div>
                  <p>Bạn có chắc chắn muốn xóa quy trình con:</p>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="font-medium">{subWorkflow.name}</p>
                    <p className="text-sm text-muted-foreground">Trạng thái: {subWorkflow.statusName}</p>
                  </div>
                  <p className="mt-2 text-sm text-red-600">Hành động này không thể hoàn tác.</p>
                </div>
              )}

              {step === "migrate" && (
                <div>
                  <p className="text-amber-700">
                    Có <strong>{requestsInUse.length} yêu cầu</strong> đang sử dụng quy trình này:
                  </p>
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    <ul className="space-y-1 text-sm">
                      {requestsInUse.slice(0, 5).map((request) => (
                        <li key={request.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <span className="font-mono text-xs">{request.code}</span>
                          <span className="truncate">{request.title}</span>
                        </li>
                      ))}
                      {requestsInUse.length > 5 && (
                        <li className="text-muted-foreground text-center">
                          ... và {requestsInUse.length - 5} yêu cầu khác
                        </li>
                      )}
                    </ul>
                  </div>
                  <p className="mt-3 text-sm">Bạn cần chuyển các yêu cầu này về quy trình chuẩn trước khi xóa.</p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {step === "confirm" && (
            <>
              <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDirectDelete}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {isLoading ? "Đang xóa..." : "Xóa"}
              </AlertDialogAction>
            </>
          )}

          {step === "migrate" && (
            <>
              <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
              <Button
                variant="outline"
                onClick={handleMigrateOnly}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                {isLoading ? "Đang chuyển..." : "Chỉ chuyển yêu cầu"}
              </Button>
              <AlertDialogAction
                onClick={handleMigrateAndDelete}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isLoading ? "Đang xử lý..." : "Chuyển & Xóa"}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
