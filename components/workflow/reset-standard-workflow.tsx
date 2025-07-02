"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { doc, deleteDoc } from "firebase/firestore"
import { useStandardWorkflow } from "@/components/workflow/standard-workflow-context-firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ResetStandardWorkflow() {
  const { toast } = useToast()
  const { initializeStandardWorkflow } = useStandardWorkflow()
  const [isResetting, setIsResetting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleReset = async () => {
    try {
      setIsResetting(true)

      // Xóa quy trình chuẩn hiện tại
      await deleteDoc(doc(db, "standardWorkflows", "standard-workflow"))

      // Khởi tạo lại quy trình chuẩn
      await initializeStandardWorkflow()

      setResetSuccess(true)
      setShowConfirmation(false)

      toast({
        title: "Thành công",
        description: "Đã khởi tạo lại quy trình chuẩn thành công!",
      })
    } catch (error) {
      console.error("Lỗi khi khởi tạo lại quy trình chuẩn:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi khởi tạo lại quy trình chuẩn!",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-4">
      {resetSuccess ? (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Thành công</AlertTitle>
          <AlertDescription>
            Quy trình chuẩn đã được khởi tạo lại thành công. Vui lòng làm mới trang để xem các thay đổi.
          </AlertDescription>
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Làm mới trang
            </Button>
          </div>
        </Alert>
      ) : showConfirmation ? (
        <Card>
          <CardHeader>
            <CardTitle>Xác nhận khởi tạo lại</CardTitle>
            <CardDescription>
              Bạn có chắc chắn muốn khởi tạo lại quy trình chuẩn? Hành động này sẽ xóa quy trình chuẩn hiện tại và tạo
              lại với các bước mặc định.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cảnh báo</AlertTitle>
              <AlertDescription>
                Hành động này không thể hoàn tác. Tất cả các thay đổi bạn đã thực hiện với quy trình chuẩn sẽ bị mất.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleReset} disabled={isResetting}>
              {isResetting ? "Đang khởi tạo lại..." : "Xác nhận khởi tạo lại"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button variant="destructive" onClick={() => setShowConfirmation(true)} className="w-full">
          Khởi tạo lại quy trình chuẩn
        </Button>
      )}
    </div>
  )
}
